import { onBeforeUnmount, onMounted, ref } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";

/**
 * A draggable 3D photo wall.
 *
 * Photos are laid out along one horizontal strip at varying scales and depths
 * inside a single group. Because the camera is a perspective one, translating
 * that group gives real parallax for free: the near, larger photos sweep past
 * faster than the small ones set further back.
 *
 * Corners are rounded in the shader rather than with an alpha texture, so the
 * plates match the CSS radii used everywhere else on the page.
 */

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAGMENT_SHADER = `
varying vec2 vUv;
uniform sampler2D uMap;
uniform vec2 uSize;
uniform float uRadius;
uniform float uFocus;

/** Signed distance to a rounded rectangle. */
float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = roundedBox(p, uSize * 0.5, uRadius);
  float alpha = 1.0 - smoothstep(-1.5, 1.5, d);

  vec4 color = texture2D(uMap, vUv);
  // Unfocused photos sit back into the page; the focused one comes up clean.
  color.rgb *= mix(0.62, 1.0, uFocus);

  gl_FragColor = vec4(color.rgb, color.a * alpha);
  #include <colorspace_fragment>
}`;

/** Per-photo scale and depth, cycled across the strip so no two neighbours match. */
const SIZE_PATTERN = [1, 0.66, 0.88, 1.15, 0.72, 1.02, 0.8];
const DEPTH_PATTERN = [30, -130, -50, 90, -160, -15, -95];
const VERTICAL_PATTERN = [0, 46, -38, 16, 54, -26, 34];

const BASE_HEIGHT = 420;
const GAP = 46;

/**
 * @param {object} containerRef Vue ref holding the host element.
 * @param {object} options
 * @param {Array<{src: string}>} options.photos Ordered photos to render.
 * @returns {{ isActive: object, activeIndex: object, focus: (i: number) => void }}
 */
export function usePhotoWall(containerRef, options = {}) {
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
    camera.position.z = 750;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    threeScene.add(group);

    const geometry = new THREE.PlaneGeometry(1, 1);
    const meshes = [];
    let cursor = 0;

    textures.forEach((texture, i) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const image = texture.image;
      const aspect = image.width / image.height;

      const scale = SIZE_PATTERN[i % SIZE_PATTERN.length];
      const height = BASE_HEIGHT * scale;
      const width = height * aspect;

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMap: { value: texture },
          uSize: { value: new THREE.Vector2(width, height) },
          uRadius: { value: Math.min(width, height) * 0.07 },
          uFocus: { value: 0 },
        },
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(width, height, 1);
      mesh.position.set(
        cursor + width / 2,
        VERTICAL_PATTERN[i % VERTICAL_PATTERN.length],
        DEPTH_PATTERN[i % DEPTH_PATTERN.length]
      );
      mesh.userData = { index: i, baseX: cursor + width / 2, baseScale: { width, height }, focus: 0 };

      group.add(mesh);
      meshes.push(mesh);
      cursor += width + GAP;
    });

    const stripWidth = cursor - GAP;

    /**
     * The strip wraps: each photo is placed modulo the strip's total width
     * around the camera, so the wall is endless and never shows an empty edge.
     * That also removes any need to clamp the drag.
     */
    const wrapWidth = stripWidth + GAP;

    let offset = 0;
    let target = 0;
    let velocity = 0;
    let dragging = false;
    let lastPointerX = 0;

    function layout() {
      for (const mesh of meshes) {
        const x = mesh.userData.baseX + offset + wrapWidth / 2;
        mesh.position.x = ((x % wrapWidth) + wrapWidth) % wrapWidth - wrapWidth / 2;
      }
    }

    // ------------------------------------------------------------ pointer
    const pointer = new THREE.Vector2(-9999, -9999);
    const raycaster = new THREE.Raycaster();

    function setPointerFromEvent(event) {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    }

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
        setPointerFromEvent(event);
        if (!dragging) return;
        const delta = event.clientX - lastPointerX;
        lastPointerX = event.clientX;
        // Screen pixels to world units at the plane the photos sit on.
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
      },
      { signal }
    );

    container.addEventListener(
      "wheel",
      (event) => {
        // Horizontal intent (trackpad swipe) scrolls the wall; vertical intent
        // is left to the page so the wall never traps the scroll.
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        target -= event.deltaX * 2;
      },
      { signal, passive: false }
    );

    /** Bring one photo to the middle of the viewport, the short way round. */
    function focus(index) {
      const mesh = meshes[index];
      if (!mesh) return;
      const wanted = -mesh.userData.baseX;
      const delta = ((wanted - target) % wrapWidth + wrapWidth * 1.5) % wrapWidth - wrapWidth / 2;
      target += delta;
    }

    container.style.cursor = "grab";

    // ------------------------------------------------------------- render
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
    resize();
    layout();

    let rafId = 0;
    let running = false;

    function animate() {
      rafId = requestAnimationFrame(animate);

      if (!dragging) {
        // Inertia, then settle. With no bounds the wall drifts to a stop.
        target += velocity;
        velocity *= 0.92;
        if (Math.abs(velocity) < 0.05) velocity = 0;
      }

      offset += (target - offset) * 0.09;
      layout();

      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      const hoveredIndex = hit ? hit.object.userData.index : -1;
      if (hoveredIndex !== activeIndex.value) activeIndex.value = hoveredIndex;

      for (const mesh of meshes) {
        const wanted = mesh.userData.index === hoveredIndex ? 1 : 0;
        mesh.userData.focus += (wanted - mesh.userData.focus) * 0.12;
        mesh.material.uniforms.uFocus.value = mesh.userData.focus;

        const { width, height } = mesh.userData.baseScale;
        const lift = 1 + mesh.userData.focus * 0.07;
        mesh.scale.set(width * lift, height * lift, 1);
      }

      renderer.render(threeScene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      animate();
    }

    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    }

    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    visibility.observe(container);

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
        for (const mesh of meshes) {
          mesh.material.uniforms.uMap.value.dispose();
          mesh.material.dispose();
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

      // The component may have unmounted while textures were decoding.
      if (!containerRef.value) {
        for (const texture of textures) texture.dispose();
        return;
      }

      scene = createScene(THREE, containerRef.value, textures);
      isActive.value = true;
    } catch (error) {
      // The DOM grid stays visible as the fallback.
      console.warn("Photo wall disabled:", error.message);
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
