import { onBeforeUnmount, onMounted, ref } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";

/**
 * A full-bleed animated gradient, in the spirit of an iOS dynamic wallpaper:
 * slow drifting light through layered noise, warmed by a glow that follows the
 * pointer.
 *
 * It is a single full-screen quad, so the cost is one fragment pass rather than
 * the per-particle CPU loop the old field ran every frame.
 */

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

/**
 * 2D simplex noise (Ashima / Stefan Gustavson), layered into fbm. Two fields
 * drift against each other so the light never visibly loops.
 */
const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec3 uColorBase;
uniform vec3 uColorMid;
uniform vec3 uColorHot;
uniform float uIntensity;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float t = uTime * 0.045;

  float n1 = fbm(p * 1.5 + vec2(t, t * 0.62));
  float n2 = fbm(p * 2.3 - vec2(t * 0.74, t * 0.41) + n1 * 0.45);

  // Soft light that trails the pointer.
  float glow = exp(-distance(p, uPointer) * 2.4) * uPointerStrength;

  float band = n1 + n2 * 0.5 + glow * 0.9;

  vec3 color = mix(uColorBase, uColorMid, smoothstep(-0.15, 0.8, band));
  color = mix(color, uColorHot, smoothstep(0.6, 1.25, band + glow * 0.7));

  // Melt the edges into the page so the section has no hard seam.
  float vignette = smoothstep(1.2, 0.2, length(vUv - 0.5) * 1.55);
  color = mix(uColorBase, color, vignette * uIntensity);

  // Dithering: kills the banding that large, low-frequency gradients show.
  float grain = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.016;

  gl_FragColor = vec4(color, 1.0);
}`;

/**
 * @param {object} containerRef Vue ref holding the host element.
 * @param {object} options
 * @param {string} [options.baseColor] Colour the edges fade to; match the section background.
 * @param {string} [options.midColor] Mid-tone of the drifting light.
 * @param {string} [options.hotColor] Brightest highlight colour.
 * @param {number} [options.intensity] 0-1 overall strength of the effect.
 * @returns {{ isActive: object }}
 */
export function useAuroraField(containerRef, options = {}) {
  const {
    baseColor = "#0d1b2a",
    midColor = "#123a5c",
    hotColor = "#e6b66c",
    intensity = 1,
  } = options;

  const isActive = ref(false);
  let scene = null;

  function createScene(THREE, container, animated) {
    const listeners = new AbortController();
    const { signal } = listeners;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    // A low-frequency gradient needs no more than this, and it keeps the
    // fragment cost sane on high-DPI phones.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(baseColor, 1);
    container.appendChild(renderer.domElement);

    const threeScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uColorBase: { value: new THREE.Color(baseColor) },
      uColorMid: { value: new THREE.Color(midColor) },
      uColorHot: { value: new THREE.Color(hotColor) },
      uIntensity: { value: intensity },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    threeScene.add(new THREE.Mesh(geometry, material));

    // Pointer is tracked on the window so the canvas can stay pointer-events:
    // none and never steal clicks from the content sitting on top of it.
    const target = { x: 0, y: 0, strength: 0 };
    const current = { x: 0, y: 0, strength: 0 };

    function onPointerMove(event) {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        target.strength = 0;
        return;
      }

      const aspect = rect.width / rect.height;
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * aspect;
      target.y = 0.5 - (event.clientY - rect.top) / rect.height;
      target.strength = 0.55;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true, signal });

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    }

    // The section grows as content reflows, so observe the box, not the window.
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const clock = new THREE.Clock();
    let rafId = 0;
    let running = false;

    function renderFrame() {
      // Idle drift: without a pointer the highlight still wanders slowly.
      const idle = clock.elapsedTime * 0.12;
      const idleX = Math.cos(idle) * 0.32;
      const idleY = Math.sin(idle * 0.8) * 0.22;

      current.strength += (target.strength - current.strength) * 0.05;
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;

      const blend = current.strength / 0.55;
      uniforms.uPointer.value.set(
        idleX + (current.x - idleX) * blend,
        idleY + (current.y - idleY) * blend
      );
      uniforms.uPointerStrength.value = 0.35 + current.strength;
      uniforms.uTime.value = clock.getElapsedTime();

      renderer.render(threeScene, camera);
    }

    function animate() {
      rafId = requestAnimationFrame(animate);
      renderFrame();
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

    // Only burn frames while the section is actually on screen. Skipped
    // entirely under reduced motion, where a single static frame is painted.
    let visibility = null;

    if (animated) {
      visibility = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0 }
      );
      visibility.observe(container);

      document.addEventListener(
        "visibilitychange",
        () => (document.hidden ? stop() : start()),
        { signal }
      );
    } else {
      uniforms.uTime.value = 12;
      uniforms.uPointer.value.set(0.2, 0.1);
      uniforms.uPointerStrength.value = 0.4;
      renderer.render(threeScene, camera);
    }

    return {
      destroy() {
        stop();
        listeners.abort();
        visibility?.disconnect();
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  onMounted(async () => {
    try {
      const THREE = await loadThree();
      if (!containerRef.value) return;

      scene = createScene(THREE, containerRef.value, !prefersReducedMotion());
      isActive.value = true;
    } catch (error) {
      // Decorative: the section keeps its CSS gradient fallback.
      console.warn("Aurora field disabled:", error.message);
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
