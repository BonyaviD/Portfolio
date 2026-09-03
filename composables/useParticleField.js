import { onBeforeUnmount, onMounted, ref } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";

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
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
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
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const radiusSquared = pointerRadius * pointerRadius;
    let rafId = 0;
    let running = false;

    function animate() {
      rafId = requestAnimationFrame(animate);

      // Clamp dt so a backgrounded tab does not resume with a huge jump.
      const dt = Math.min(clock.getDelta(), 0.05) * 60;

      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(plane, pointerWorld);

      const position = geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        // Drift, then ease back toward the particle's home position.
        position[ix] += velocities[ix] * dt + (home[ix] - position[ix]) * 0.008 * dt;
        position[iy] += velocities[iy] * dt + (home[iy] - position[iy]) * 0.008 * dt;
        position[iz] += velocities[iz] * dt + (home[iz] - position[iz]) * 0.008 * dt;

        const dx = position[ix] - pointerWorld.x;
        const dy = position[iy] - pointerWorld.y;
        const dz = position[iz] - pointerWorld.z;
        const distanceSquared = dx * dx + dy * dy + dz * dz;

        if (distanceSquared < radiusSquared && distanceSquared > 0.01) {
          const distance = Math.sqrt(distanceSquared);
          const force = (1 - distance / pointerRadius) * forceStrength * 6 * dt * sign;
          direction.set(dx / distance, dy / distance, dz / distance);
          position[ix] += direction.x * force;
          position[iy] += direction.y * force;
          position[iz] += direction.z * force;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.0003;
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

  onMounted(async () => {
    if (prefersReducedMotion()) return;

    try {
      const THREE = await loadThree();
      // The component may have unmounted while the chunk was in flight.
      if (!containerRef.value) return;
      scene = createScene(THREE, containerRef.value);
      isActive.value = true;
    } catch (error) {
      // Decorative only: failing to start is never fatal for the page.
      console.warn("Particle field disabled:", error.message);
      isActive.value = false;
    }
  });

  onBeforeUnmount(() => {
    scene?.destroy();
    scene = null;
    isActive.value = false;
  });

  return { isActive };
}
