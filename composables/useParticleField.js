import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";
import { whenIdle, whenNearViewport } from "@/utils/defer";

/**
 * A drifting 3D particle field that reacts to the pointer.
 *
 * Renders on a transparent canvas so it layers over the page-wide aurora
 * instead of painting its own background. Owns its whole lifecycle: every
 * RAF, listener, geometry, material and context is released on unmount.
 */

/** Cheap device budget: far fewer points on narrow viewports. */
function budgetedCount(requested) {
  if (typeof window === "undefined") return requested;
  if (window.innerWidth < 768) return Math.min(requested, 2500);
  if (window.innerWidth < 1200) return Math.min(requested, 5000);
  return requested;
}

/**
 * Fills a heart with points.
 *
 * The classic parametric heart draws only the outline, so each point is put
 * at a random fraction of the way out along its own spoke. The curve is
 * star-shaped about the origin, which is what makes that fill the whole
 * shape rather than leaving a hole; sqrt spreads the points evenly by area
 * instead of bunching them in the middle.
 */
function heartPoint() {
  const t = Math.random() * Math.PI * 2;
  const reach = Math.sqrt(Math.random());

  const x = 16 * Math.sin(t) ** 3;
  const y =
    13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

  return [
    x * reach,
    // The curve sits low around the origin; lift it back to centre.
    y * reach + 2.5,
    (Math.random() - 0.5) * 3,
  ];
}

/** Height of the unit heart above, measured from the point cloud it makes. */
const HEART_UNIT_HEIGHT = 28.9;

/**
 * How tall a heart stands on screen, in CSS pixels. Small on purpose: the
 * shape only reads as a heart when the whole of it is in one glance.
 */
const HEART_HEIGHT_PX = 62;

/**
 * Where the hearts sit and how big each one is: x and y as fractions of the
 * half-viewport, then a size multiplier. Spreading the field over several
 * small hearts is what keeps them legible - all of it poured into one would
 * pack thousands of sprites per pixel and read as a solid blob.
 */
const HEART_LAYOUT = [
  [0.0, 0.08, 1.35],
  [-0.56, -0.32, 0.85],
  [0.54, -0.24, 0.95],
  [-0.31, 0.54, 0.75],
  [0.36, 0.57, 0.8],
  [-0.74, 0.2, 0.62],
  [0.76, 0.31, 0.68],
  [-0.16, -0.62, 0.7],
  [0.2, -0.66, 0.6],
];

/** Soft radial sprite used for both the core points and their glow. */
function createSpriteTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

/**
 * @param {object} containerRef Vue ref holding the host element.
 * @param {object} options
 * @param {number} [options.particleCount] Requested points, subject to device budget.
 * @param {string} [options.baseColor] First particle colour.
 * @param {string} [options.secondaryColor] Second particle colour.
 * @param {'attract'|'repel'} [options.interaction] How the pointer affects particles.
 * @param {number} [options.pointerRadius] Influence radius in world units.
 * @param {number} [options.forceStrength] Pointer force multiplier.
 * @param {number} [options.particleSize] Core point size.
 * @param {number} [options.opacity] Overall opacity of the field.
 * @returns {{ isActive: object }}
 */
export function useParticleField(containerRef, options = {}) {
  const {
    particleCount = 7000,
    baseColor = "#e6b66c",
    secondaryColor = "#4a9fd4",
    interaction = "repel",
    pointerRadius = 300,
    forceStrength = 1.5,
    particleSize = 3,
    opacity = 0.75,
  } = options;

  const isActive = ref(false);
  let scene = null;

  function createScene(THREE, container) {
    const count = budgetedCount(particleCount);
    const listeners = new AbortController();
    const { signal } = listeners;
    const sign = interaction === "attract" ? -1 : 1;

    const threeScene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / Math.max(container.clientHeight, 1),
      1,
      3000
    );
    camera.position.z = 600;

    // alpha + zero clear alpha: the aurora behind stays fully visible.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const texture = createSpriteTexture(THREE);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const home = new Float32Array(count * 3);

    const colorA = new THREE.Color(baseColor);
    const colorB = new THREE.Color(secondaryColor);
    const range = { x: 1600, y: 1000, z: 700 };

    // Where every particle goes when a message is sent, and the colour it
    // turns. Built once, up front, so the celebration costs nothing to start.
    // Held at unit scale; the on-screen size is worked out per resize, so a
    // heart is the same number of pixels tall whatever the viewport.
    const heart = new Float32Array(count * 3);
    const heartOf = new Uint8Array(count);
    const heartCentres = new Float32Array(HEART_LAYOUT.length * 2);
    const heartScales = new Float32Array(HEART_LAYOUT.length);
    const restColors = new Float32Array(count * 3);
    const heartColor = new THREE.Color("#ff2f55");
    const heartGlow = new THREE.Color("#ff9bb0");

    for (let i = 0; i < count; i++) {
      const offset = i * 3;
      const x = (Math.random() - 0.5) * range.x;
      const y = (Math.random() - 0.5) * range.y;
      const z = (Math.random() - 0.5) * range.z;

      positions[offset] = home[offset] = x;
      positions[offset + 1] = home[offset + 1] = y;
      positions[offset + 2] = home[offset + 2] = z;

      velocities[offset] = (Math.random() - 0.5) * 0.4;
      velocities[offset + 1] = (Math.random() - 0.5) * 0.4;
      velocities[offset + 2] = (Math.random() - 0.5) * 0.2;

      const color = Math.random() > 0.35 ? colorA : colorB;
      colors[offset] = restColors[offset] = color.r;
      colors[offset + 1] = restColors[offset + 1] = color.g;
      colors[offset + 2] = restColors[offset + 2] = color.b;

      const [hx, hy, hz] = heartPoint();
      heart[offset] = hx;
      heart[offset + 1] = hy;
      heart[offset + 2] = hz;
      // Round-robin rather than random, so every heart gets the same share.
      heartOf[i] = i % HEART_LAYOUT.length;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: particleSize,
      map: texture,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    threeScene.add(points);

    const OFFSCREEN = -9999;
    const pointer = new THREE.Vector2(OFFSCREEN, OFFSCREEN);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointerWorld = new THREE.Vector3();
    const direction = new THREE.Vector3();

    function updatePointer(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    }

    function resetPointer() {
      pointer.set(OFFSCREEN, OFFSCREEN);
    }

    // The host is pointer-events:none, so listen on the window and map in.
    window.addEventListener(
      "pointermove",
      (event) => {
        const rect = container.getBoundingClientRect();
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        if (inside) updatePointer(event.clientX, event.clientY);
        else resetPointer();
      },
      { passive: true, signal }
    );

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Lay the hearts out for this viewport. Their size is set in CSS pixels
      // and converted here, so they never grow with the canvas.
      const visibleHeight =
        2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const pixelsPerUnit = height / visibleHeight;
      const base = HEART_HEIGHT_PX / pixelsPerUnit / HEART_UNIT_HEIGHT;

      HEART_LAYOUT.forEach(([fx, fy, size], i) => {
        heartCentres[i * 2] = fx * ((visibleHeight * camera.aspect) / 2);
        heartCentres[i * 2 + 1] = fy * (visibleHeight / 2);
        heartScales[i] = base * size;
      });
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const radiusSquared = pointerRadius * pointerRadius;
    let rafId = 0;
    let running = false;

    /** 0 = drifting field, 1 = fully gathered into the heart. */
    let morph = 0;
    let morphTarget = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);

      // Clamp dt so a backgrounded tab does not resume with a huge jump.
      const dt = Math.min(clock.getDelta(), 0.05) * 60;

      // Gathers faster than it lets go: the shape should snap into being and
      // then dissolve gently.
      const wasMoving = Math.abs(morphTarget - morph) > 0.0005;
      if (wasMoving) {
        morph += (morphTarget - morph) * (morphTarget > morph ? 0.035 : 0.02) * dt;
        morph = Math.min(Math.max(morph, 0), 1);

        const color = geometry.attributes.color.array;
        for (let i = 0; i < count; i++) {
          const ix = i * 3;
          // Two reds, split the same way the two rest colours are, so the
          // heart keeps some depth instead of reading as one flat shape.
          const target = restColors[ix] === colorA.r ? heartColor : heartGlow;
          color[ix] = restColors[ix] + (target.r - restColors[ix]) * morph;
          color[ix + 1] = restColors[ix + 1] + (target.g - restColors[ix + 1]) * morph;
          color[ix + 2] = restColors[ix + 2] + (target.b - restColors[ix + 2]) * morph;
        }
        geometry.attributes.color.needsUpdate = true;

        // Sprites shrink as the hearts close up. At full size, thousands of
        // them inside a 60-pixel shape overlap into a solid disc and the
        // notch and point are lost.
        material.size = particleSize * (1 - morph * 0.62);
      }

      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(plane, pointerWorld);

      const position = geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        // Drift, then ease back toward the particle's home position - which
        // is its place in the heart while a message is being celebrated. The
        // pull tightens as the shape forms, or the drift would blur it.
        const h = heartOf[i];
        const scale = heartScales[h];
        const heartX = heartCentres[h * 2] + heart[ix] * scale;
        const heartY = heartCentres[h * 2 + 1] + heart[iy] * scale;
        const heartZ = heart[iz] * scale;

        const targetX = home[ix] + (heartX - home[ix]) * morph;
        const targetY = home[iy] + (heartY - home[iy]) * morph;
        const targetZ = home[iz] + (heartZ - home[iz]) * morph;
        const pull = 0.008 + morph * 0.09;
        const drift = 1 - morph * 0.85;

        position[ix] += velocities[ix] * drift * dt + (targetX - position[ix]) * pull * dt;
        position[iy] += velocities[iy] * drift * dt + (targetY - position[iy]) * pull * dt;
        position[iz] += velocities[iz] * drift * dt + (targetZ - position[iz]) * pull * dt;

        const dx = position[ix] - pointerWorld.x;
        const dy = position[iy] - pointerWorld.y;
        const dz = position[iz] - pointerWorld.z;
        const distanceSquared = dx * dx + dy * dy + dz * dz;

        // The pointer stops pushing once the heart is formed, or it would
        // punch a hole straight through it.
        if (morph < 0.98 && distanceSquared < radiusSquared && distanceSquared > 0.01) {
          const distance = Math.sqrt(distanceSquared);
          const force =
            (1 - distance / pointerRadius) * forceStrength * 6 * dt * sign * (1 - morph);
          direction.set(dx / distance, dy / distance, dz / distance);
          position[ix] += direction.x * force;
          position[iy] += direction.y * force;
          position[iz] += direction.z * force;
        }
      }

      geometry.attributes.position.needsUpdate = true;

      // The slow turn is what keeps the field alive, but the heart lies in
      // the XY plane: left turning, it is seen edge on and collapses to a
      // line. It unwinds to face the camera while the shape is held.
      points.rotation.y += 0.0003 * (1 - morph);
      if (morph > 0.001) {
        points.rotation.y -= points.rotation.y * Math.min(0.08 * morph * dt, 1);
      }

      renderer.render(threeScene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      clock.start();
      animate();
    }

    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
      clock.stop();
    }

    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    visibility.observe(container);
    // Start straight away and let the observer only pause: if
    // IntersectionObserver never reports (throttled or unavailable), the
    // effect must still render rather than silently showing nothing.
    start();

    document.addEventListener(
      "visibilitychange",
      () => (document.hidden ? stop() : start()),
      { signal }
    );

    resize();

    return {
      /** Gather into the heart, or let it fall back to a drifting field. */
      celebrate(on) {
        morphTarget = on ? 1 : 0;
        // A held tab has no frames to animate with; make sure there are some.
        start();
      },
      destroy() {
        stop();
        listeners.abort();
        visibility.disconnect();
        resizeObserver.disconnect();
        threeScene.remove(points);
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  // `options` stays reactive here on purpose: everything else is read once at
  // setup, but this one has to follow the component's prop.
  watch(
    () => options.celebrate,
    (on) => scene?.celebrate(Boolean(on))
  );

  let cancelDefer = () => {};
  let cancelWarmup = () => {};

  onMounted(() => {
    if (prefersReducedMotion() || !containerRef.value) return;

    // Nothing here is content, and the section is a long way down the page:
    // building the scene on mount put the whole Three.js chunk on the
    // critical path for a decoration nobody has scrolled to yet.
    cancelDefer = whenNearViewport(containerRef.value, start);

    // Starting the download only at 400px meant the chunk arrived and parsed
    // while the visitor was scrolling into the section - a stall of half a
    // second on a phone. A couple of screens out, fetch it in idle time.
    cancelWarmup = whenNearViewport(
      containerRef.value,
      () => {
        cancelWarmup = whenIdle(() => loadThree().catch(() => {}));
      },
      "2000px"
    );
  });

  async function start() {
    try {
      const THREE = await loadThree();
      // The component may have unmounted while the chunk was in flight.
      if (!containerRef.value) return;
      scene = createScene(THREE, containerRef.value);
      // Mounted mid-celebration: honour whatever the prop already says.
      if (options.celebrate) scene.celebrate(true);
      isActive.value = true;
    } catch (error) {
      // Decorative only: failing to start is never fatal for the page.
      console.warn("Particle field disabled:", error.message);
      isActive.value = false;
    }
  }

  onBeforeUnmount(() => {
    cancelDefer();
    cancelWarmup();
    scene?.destroy();
    scene = null;
    isActive.value = false;
  });

  return { isActive };
}
