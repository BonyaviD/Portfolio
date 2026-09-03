import { onBeforeUnmount, onMounted, ref } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";

/**
 * Photos as instant-camera prints pegged to a washing line.
 *
 * Each print hangs from its own peg and swings a little, and the picture
 * inside starts undeveloped: flat, dark, almost blank. Pointing at a print
 * develops it from the bottom up into a high-contrast image, the way a real
 * instant photo comes in.
 *
 * The strip wraps, so dragging never runs out of line.
 */

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/** Signed distance to a rounded rectangle, shared by every plate below. */
const SDF = `
float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}`;

const PRINT_FRAGMENT = `
varying vec2 vUv;

uniform sampler2D uMap;
uniform float uImageAspect;
uniform float uDevelop;
uniform vec2 uCard;
/** Photo window insets as fractions of the card: left, right, top, bottom. */
uniform vec4 uMargins;
uniform float uRadius;
${SDF}

void main() {
  vec2 p = (vUv - 0.5) * uCard;
  float cardAlpha = 1.0 - smoothstep(-1.0, 1.0, roundedBox(p, uCard * 0.5, uRadius));
  if (cardAlpha <= 0.002) discard;

  // The paper: warm white, very slightly shaded towards the thick bottom edge.
  vec3 color = mix(
    vec3(0.86, 0.855, 0.835),
    vec3(0.955, 0.95, 0.935),
    smoothstep(0.0, 0.75, vUv.y)
  );

  float x0 = uMargins.x;
  float x1 = 1.0 - uMargins.y;
  float y0 = uMargins.w;
  float y1 = 1.0 - uMargins.z;
  vec2 window = vec2(x1 - x0, y1 - y0);
  vec2 puv = (vUv - vec2(x0, y0)) / window;

  if (puv.x > 0.0 && puv.x < 1.0 && puv.y > 0.0 && puv.y < 1.0) {
    // Cover-fit the photo into its window whatever the source aspect is.
    float boxAspect = (window.x * uCard.x) / (window.y * uCard.y);
    vec2 fit = uImageAspect > boxAspect
      ? vec2(boxAspect / uImageAspect, 1.0)
      : vec2(1.0, uImageAspect / boxAspect);
    vec3 image = texture2D(uMap, (puv - 0.5) * fit + 0.5).rgb;

    // Developed: punchy contrast, a touch more saturation.
    vec3 developed = clamp((image - 0.5) * 1.42 + 0.5, 0.0, 1.0);
    float luma = dot(developed, vec3(0.2126, 0.7152, 0.0722));
    developed = clamp(mix(vec3(luma), developed, 1.15), 0.0, 1.0);

    // Undeveloped: the milky, near-flat emulsion before it comes in.
    // Not named "flat": that is a reserved word in GLSL.
    float rawLuma = dot(image, vec3(0.299, 0.587, 0.114));
    vec3 undeveloped = mix(vec3(0.105, 0.115, 0.125), vec3(rawLuma), 0.16);

    // The developing front sweeps from the bottom edge upwards.
    float front = uDevelop * 1.4 - 0.2;
    float reveal = 1.0 - smoothstep(front - 0.25, front, puv.y);
    vec3 photo = mix(undeveloped, developed, reveal);

    // A faint warm bloom riding the front while it is still moving.
    photo += vec3(0.10, 0.07, 0.03)
      * exp(-abs(puv.y - front) * 13.0)
      * (1.0 - smoothstep(0.85, 1.0, uDevelop));

    // Corners sit slightly darker, as prints do.
    float vignette = smoothstep(1.15, 0.35, length(puv - 0.5) * 1.35);
    color = photo * mix(0.88, 1.0, vignette);
  }

  gl_FragColor = vec4(color, cardAlpha);
  #include <colorspace_fragment>
}`;

/** Flat rounded plate, used for the pegs and the prints' soft shadows. */
const PLATE_FRAGMENT = `
varying vec2 vUv;
uniform vec2 uCard;
uniform float uRadius;
uniform float uSoftness;
uniform float uOpacity;
uniform vec3 uColor;
${SDF}

void main() {
  vec2 p = (vUv - 0.5) * uCard;
  float d = roundedBox(p, uCard * 0.5, uRadius);
  float alpha = 1.0 - smoothstep(-uSoftness, uSoftness, d);
  gl_FragColor = vec4(uColor, alpha * uOpacity);
  #include <colorspace_fragment>
}`;

/** Print size and depth, cycled so neighbours never match. */
const SIZE_PATTERN = [1, 0.74, 0.9, 1.1, 0.78, 1.02, 0.84];
const DEPTH_PATTERN = [30, -120, -40, 80, -150, -10, -85];

const CARD_WIDTH = 300;
/** Instant prints are a touch taller than wide, with a heavy bottom border. */
const CARD_RATIO = 1.19;
const MARGINS = { left: 0.07, right: 0.07, top: 0.06, bottom: 0.2 };
const GAP = 90;

/** The line the prints hang from, and how far it dips between pegs. */
const LINE_Y = 250;
const SAG = 26;

export function usePhotoLine(containerRef, options = {}) {
  const { photos = [] } = options;

  const isActive = ref(false);
  const activeIndex = ref(-1);
  let scene = null;

  function createScene(THREE, container, textures) {
    const listeners = new AbortController();
    const { signal } = listeners;

    const threeScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / Math.max(container.clientHeight, 1),
      1,
      3000
    );
    camera.position.z = 780;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(1, 1);
    const items = [];
    let cursor = 0;

    function makePlate(color, opacity, softness) {
      return new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: PLATE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uCard: { value: new THREE.Vector2(1, 1) },
          uRadius: { value: 4 },
          uSoftness: { value: softness },
          uOpacity: { value: opacity },
          uColor: { value: new THREE.Color(color) },
        },
      });
    }

    textures.forEach((texture, i) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const scale = SIZE_PATTERN[i % SIZE_PATTERN.length];
      const width = CARD_WIDTH * scale;
      const height = width * CARD_RATIO;

      // The group's origin is the peg, so rotating it swings the print.
      const group = new THREE.Group();
      group.position.z = DEPTH_PATTERN[i % DEPTH_PATTERN.length];

      const shadowMaterial = makePlate("#000000", 0.34, 16);
      shadowMaterial.uniforms.uCard.value.set(width, height);
      shadowMaterial.uniforms.uRadius.value = 10;
      const shadow = new THREE.Mesh(geometry, shadowMaterial);
      shadow.scale.set(width * 1.03, height * 1.03, 1);
      shadow.position.set(width * 0.02, -height / 2 - height * 0.02, -2);
      group.add(shadow);

      const printMaterial = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: PRINT_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMap: { value: texture },
          uImageAspect: { value: texture.image.width / texture.image.height },
          uDevelop: { value: 0 },
          uCard: { value: new THREE.Vector2(width, height) },
          uMargins: {
            value: new THREE.Vector4(
              MARGINS.left,
              MARGINS.right,
              MARGINS.top,
              MARGINS.bottom
            ),
          },
          uRadius: { value: 6 },
        },
      });
      const print = new THREE.Mesh(geometry, printMaterial);
      print.scale.set(width, height, 1);
      print.position.y = -height / 2;
      print.userData.index = i;
      group.add(print);

      const pegMaterial = makePlate("#e6b66c", 1, 1.5);
      const pegWidth = width * 0.075;
      const pegHeight = height * 0.075;
      pegMaterial.uniforms.uCard.value.set(pegWidth, pegHeight);
      pegMaterial.uniforms.uRadius.value = pegWidth * 0.35;
      const peg = new THREE.Mesh(geometry, pegMaterial);
      peg.scale.set(pegWidth, pegHeight, 1);
      peg.position.set(0, pegHeight * 0.15, 4);
      group.add(peg);

      threeScene.add(group);
      items.push({
        group,
        print,
        printMaterial,
        shadowMaterial,
        pegMaterial,
        index: i,
        baseX: cursor + width / 2,
        develop: 0,
        phase: (i * 1.7) % (Math.PI * 2),
      });

      cursor += width + GAP;
    });

    const wrapWidth = cursor - GAP + GAP;

    /** A gentle periodic dip, so the sag stays continuous across the wrap. */
    function lineY(x) {
      return LINE_Y - SAG * Math.cos((x / wrapWidth) * Math.PI * 2);
    }

    // ------------------------------------------------------------- the line
    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#8fa3b8"),
      transparent: true,
      opacity: 0.4,
    });
    const lineGeometry = new THREE.BufferGeometry();
    const line = new THREE.Line(lineGeometry, lineMaterial);
    threeScene.add(line);

    function visibleWidth() {
      return 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    }

    function rebuildLine() {
      const half = visibleWidth() / 2 + 200;
      const steps = 160;
      const points = new Float32Array((steps + 1) * 3);
      for (let i = 0; i <= steps; i++) {
        const x = -half + (i / steps) * half * 2;
        points[i * 3] = x;
        points[i * 3 + 1] = lineY(x - offset);
        points[i * 3 + 2] = 0;
      }
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
      lineGeometry.attributes.position.needsUpdate = true;
    }

    // ---------------------------------------------------------------- input
    let offset = 0;
    let target = 0;
    let velocity = 0;
    let dragging = false;
    let lastPointerX = 0;
    let pointerInside = false;

    const coarsePointer = window.matchMedia?.("(hover: none)").matches === true;

    const pointer = new THREE.Vector2(-9999, -9999);
    const raycaster = new THREE.Raycaster();

    container.addEventListener(
      "pointerdown",
      (event) => {
        dragging = true;
        lastPointerX = event.clientX;
        velocity = 0;
        container.setPointerCapture?.(event.pointerId);
        container.style.cursor = "grabbing";
      },
      { signal }
    );

    container.addEventListener(
      "pointermove",
      (event) => {
        const rect = container.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        pointerInside = true;

        if (!dragging) return;
        const delta = event.clientX - lastPointerX;
        lastPointerX = event.clientX;
        target += delta * 1.6;
        velocity = delta * 1.6;
      },
      { signal }
    );

    function endDrag(event) {
      if (!dragging) return;
      dragging = false;
      container.releasePointerCapture?.(event.pointerId);
      container.style.cursor = "grab";
    }

    container.addEventListener("pointerup", endDrag, { signal });
    container.addEventListener("pointercancel", endDrag, { signal });
    container.addEventListener(
      "pointerleave",
      (event) => {
        endDrag(event);
        pointer.set(-9999, -9999);
        pointerInside = false;
      },
      { signal }
    );

    container.addEventListener(
      "wheel",
      (event) => {
        // Vertical intent belongs to the page; the line never traps the scroll.
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        target -= event.deltaX * 2;
      },
      { signal, passive: false }
    );

    function focus(index) {
      const item = items[index];
      if (!item) return;
      const wanted = -item.baseX;
      const delta =
        (((wanted - target) % wrapWidth) + wrapWidth * 1.5) % wrapWidth - wrapWidth / 2;
      target += delta;
    }

    container.style.cursor = "grab";

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      rebuildLine();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const clock = new THREE.Clock();
    let rafId = 0;
    let running = false;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (!dragging) {
        target += velocity;
        velocity *= 0.92;
        if (Math.abs(velocity) < 0.05) velocity = 0;
      }
      offset += (target - offset) * 0.09;

      // Place every print along the wrapped line.
      for (const item of items) {
        const x =
          ((item.baseX + offset + wrapWidth / 2) % wrapWidth + wrapWidth) % wrapWidth -
          wrapWidth / 2;
        item.group.position.x = x;
        item.group.position.y = lineY(x - offset);
        // A slow swing, faster while the line is actually moving.
        const energy = 1 + Math.min(Math.abs(velocity) * 0.05, 2.5);
        item.group.rotation.z =
          Math.sin(time * 0.8 + item.phase) * 0.035 * energy;
      }
      rebuildLine();

      // Which print is being looked at.
      let wanted = -1;
      if (coarsePointer) {
        // No hover on touch: develop whichever print sits nearest the middle.
        let best = Infinity;
        for (const item of items) {
          const distance = Math.abs(item.group.position.x);
          if (distance < best) {
            best = distance;
            wanted = item.index;
          }
        }
      } else if (pointerInside) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(
          items.map((item) => item.print),
          false
        )[0];
        wanted = hit ? hit.object.userData.index : -1;
      }

      if (wanted !== activeIndex.value) activeIndex.value = wanted;

      for (const item of items) {
        const goal = item.index === wanted ? 1 : 0;
        item.develop += (goal - item.develop) * 0.07;
        item.printMaterial.uniforms.uDevelop.value = item.develop;
        item.shadowMaterial.uniforms.uOpacity.value = 0.34 + item.develop * 0.22;
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

    return {
      focus,
      destroy() {
        stop();
        listeners.abort();
        visibility.disconnect();
        resizeObserver.disconnect();
        geometry.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        for (const item of items) {
          item.printMaterial.uniforms.uMap.value.dispose();
          item.printMaterial.dispose();
          item.shadowMaterial.dispose();
          item.pegMaterial.dispose();
        }
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  onMounted(async () => {
    if (prefersReducedMotion() || !photos.length) return;

    try {
      const THREE = await loadThree();
      const loader = new THREE.TextureLoader();
      const textures = await Promise.all(photos.map((photo) => loader.loadAsync(photo.src)));

      if (!containerRef.value) {
        for (const texture of textures) texture.dispose();
        return;
      }

      scene = createScene(THREE, containerRef.value, textures);
      isActive.value = true;
    } catch (error) {
      // The DOM grid stays visible as the fallback.
      console.warn("Photo line disabled:", error.message);
      isActive.value = false;
    }
  });

  onBeforeUnmount(() => {
    scene?.destroy();
    scene = null;
    isActive.value = false;
  });

  return {
    isActive,
    activeIndex,
    focus: (index) => scene?.focus(index),
  };
}
