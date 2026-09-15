import { onBeforeUnmount, onMounted, ref } from "vue";
import { prefersReducedMotion } from "@/utils/loadThree";
import { whenInteracted } from "@/utils/defer";

/**
 * A full-bleed animated gradient, in the spirit of an iOS dynamic wallpaper:
 * slow drifting light through layered noise, warmed by a glow that follows the
 * pointer and shifted gently by page scroll.
 *
 * Plain WebGL, one full-screen triangle. It used to go through Three.js, which
 * meant a 700 KB download and parse arriving in the middle of the visitor's
 * first scroll - the page stalled for most of a second right as the halos
 * appeared. Nothing here needs a scene graph.
 */

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * 2D simplex noise (Ashima / Stefan Gustavson), layered into fbm. Two fields
 * drift against each other so the light never visibly loops.
 *
 * Colour maths runs in linear space (the colours are converted on the way in)
 * and is encoded back to sRGB on the way out.
 */
const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform float uTime;
uniform float uScroll;
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

vec3 linearToSrgb(vec3 c) {
  vec3 low = c * 12.92;
  vec3 high = pow(c, vec3(1.0 / 2.4)) * 1.055 - 0.055;
  return mix(high, low, step(c, vec3(0.0031308)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  // Scroll slides the noise field, so the backdrop reads as one tall surface
  // the page travels across rather than a loop pinned to the viewport.
  p.y += uScroll;

  float t = uTime * 0.045;

  float n1 = fbm(p * 1.5 + vec2(t, t * 0.62));
  float n2 = fbm(p * 2.3 - vec2(t * 0.74, t * 0.41) + n1 * 0.45);

  float glow = exp(-distance(p - vec2(0.0, uScroll), uPointer) * 2.4) * uPointerStrength;

  float band = n1 + n2 * 0.5 + glow * 0.9;

  vec3 color = mix(uColorBase, uColorMid, smoothstep(-0.05, 1.0, band));
  color = mix(color, uColorHot, smoothstep(0.9, 1.6, band + glow * 0.6));

  // Soften the outer edges so the surface never shows a hard frame.
  float vignette = smoothstep(1.35, 0.15, length(vUv - 0.5) * 1.4);
  color = mix(uColorBase, color, vignette * uIntensity);

  // Dithering: kills the banding that large, low-frequency gradients show.
  float grain = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.007;

  gl_FragColor = vec4(linearToSrgb(clamp(color, 0.0, 1.0)), 1.0);
}`;

/**
 * The drawing buffer is half the canvas's CSS size, stretched back up by the
 * browser. The field has no detail finer than a few hundred pixels, so nobody
 * can see the difference - but the GPU shades a quarter of the pixels, which
 * is what keeps frames steady on a phone while the page scrolls over it.
 */
const RENDER_SCALE = 0.5;
const MAX_BUFFER_SIDE = 960;

/** sRGB hex to linear RGB, the space the shader mixes in. */
function hexToLinear(hex) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [16, 8, 0].map((shift) => {
    const channel = ((value >> shift) & 255) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * @param {object} containerRef Vue ref holding the host element.
 * @param {object} options
 * @param {string} [options.baseColor] Colour the edges fade to.
 * @param {string} [options.midColor] Mid-tone of the drifting light.
 * @param {string} [options.hotColor] Brightest highlight colour.
 * @param {number} [options.intensity] 0-1 overall strength of the effect.
 * @param {boolean} [options.followScroll] Shift the field as the page scrolls.
 * @returns {{ isActive: object }}
 */
export function useAuroraField(containerRef, options = {}) {
  const {
    baseColor = "#0d1b2a",
    midColor = "#123a5c",
    hotColor = "#e6b66c",
    intensity = 1,
    followScroll = false,
  } = options;

  const isActive = ref(false);
  let scene = null;

  function createScene(container, animated) {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL unavailable");

    const listeners = new AbortController();
    const { signal } = listeners;
    let destroyed = false;
    let rafId = 0;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    // Where supported, the link finishes on a background thread. Asking for
    // its status too early would force it back onto this one.
    const parallelCompile = gl.getExtension("KHR_parallel_shader_compile");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    container.appendChild(canvas);

    let uniforms = null;

    function prepareProgram() {
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(
          gl.getShaderInfoLog(fragment) || gl.getProgramInfoLog(program) || "shader link failed"
        );
      }

      gl.useProgram(program);
      const position = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const locate = (name) => gl.getUniformLocation(program, name);
      uniforms = {
        time: locate("uTime"),
        scroll: locate("uScroll"),
        resolution: locate("uResolution"),
        pointer: locate("uPointer"),
        pointerStrength: locate("uPointerStrength"),
      };

      gl.uniform3fv(locate("uColorBase"), hexToLinear(baseColor));
      gl.uniform3fv(locate("uColorMid"), hexToLinear(midColor));
      gl.uniform3fv(locate("uColorHot"), hexToLinear(hotColor));
      gl.uniform1f(locate("uIntensity"), intensity);
    }

    // ------------------------------------------------------------- pointer
    // Tracked on the window so the canvas can stay pointer-events: none and
    // never steal clicks from the content sitting on top of it.
    const target = { x: 0, y: 0, strength: 0 };
    const current = { x: 0, y: 0, strength: 0 };

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;

        target.x = (event.clientX / width - 0.5) * (width / height);
        target.y = 0.5 - event.clientY / height;
        target.strength = 0.55;
      },
      { passive: true, signal }
    );

    // ---------------------------------------------------------------- size
    let cssWidth = 0;
    let cssHeight = 0;
    let settleTimer = 0;

    function applySize(width, height) {
      if (!width || !height) return;
      const scale = Math.min(
        RENDER_SCALE * Math.min(window.devicePixelRatio || 1, 2),
        MAX_BUFFER_SIDE / Math.max(width, height)
      );
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      cssWidth = width;
      cssHeight = height;
      // Resizing clears the buffer; a paused or static field must repaint.
      if (uniforms && !running) draw(0);
    }

    /**
     * A width change is a real layout change and is honoured at once. A
     * height-only change - a phone's URL bar sliding - waits until it has
     * stopped moving; until then CSS stretches the canvas, which nothing can
     * see on a soft gradient.
     */
    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      if (width !== cssWidth || !cssHeight) {
        clearTimeout(settleTimer);
        applySize(width, height);
        return;
      }
      if (height === cssHeight) return;

      clearTimeout(settleTimer);
      settleTimer = setTimeout(
        () => applySize(container.clientWidth, container.clientHeight),
        250
      );
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // -------------------------------------------------------------- scroll
    // Touch screens keep the field still. There the page scrolls on the
    // compositor at the display's full rate while this redraws at 30, and a
    // backdrop moving at a different pace from the content is exactly what
    // reads as the halos lagging behind the finger.
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches === true;
    const scrollFollows = followScroll && animated && !coarsePointer;
    let scrollTarget = 0;
    let scrollValue = 0;

    if (scrollFollows) {
      const scrollUnit = Math.max(window.innerHeight, 1);
      const readScroll = () => {
        // Normalised against viewport height, then damped: a full page of
        // scrolling should nudge the field, not race through it.
        scrollTarget = (window.scrollY / scrollUnit) * 0.18;
      };
      readScroll();
      scrollValue = scrollTarget;
      window.addEventListener("scroll", readScroll, { passive: true, signal });
    }

    // ---------------------------------------------------------------- draw
    let elapsed = 0;
    let shown = false;

    /**
     * Easing is time-based, not per-frame. A per-frame factor moves further
     * when frames arrive fast and stalls when they drop, so a busy moment made
     * the glow and the scroll offset lurch; this covers the same ground per
     * second at any frame rate.
     */
    function draw(dt) {
      const ease = (rate) => 1 - Math.exp(-rate * dt);

      current.strength += (target.strength - current.strength) * ease(3.1);
      current.x += (target.x - current.x) * ease(2.8);
      current.y += (target.y - current.y) * ease(2.8);
      scrollValue += (scrollTarget - scrollValue) * ease(5);

      const idle = elapsed * 0.12;
      const idleX = Math.cos(idle) * 0.32;
      const idleY = Math.sin(idle * 0.8) * 0.22;
      const blend = current.strength / 0.55;

      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.scroll, scrollValue);
      gl.uniform2f(uniforms.resolution, cssWidth, cssHeight);
      gl.uniform2f(
        uniforms.pointer,
        idleX + (current.x - idleX) * blend,
        idleY + (current.y - idleY) * blend
      );
      gl.uniform1f(uniforms.pointerStrength, 0.35 + current.strength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!shown) {
        shown = true;
        // Fades in over the CSS gradient rather than popping in on top of it.
        canvas.classList.add("is-ready");
      }
    }

    // Phones get 30 frames a second: the drift is slow enough that nobody can
    // tell, and it halves what the GPU does while the page is being scrolled.
    const frameInterval = coarsePointer ? 1000 / 30 : 0;
    let running = false;
    let lastFrame = 0;

    function frame(now) {
      rafId = requestAnimationFrame(frame);
      if (lastFrame && frameInterval && now - lastFrame < frameInterval - 4) return;

      // Clamped so a long stall (a background tab, a busy main thread) moves
      // the field on by a moment, not by however long the stall lasted.
      const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
      lastFrame = now;
      elapsed += dt;
      draw(dt);
    }

    function run() {
      if (running || destroyed) return;
      running = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(frame);
    }

    function pause() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        // The CSS gradient underneath takes over.
        event.preventDefault();
        pause();
        canvas.classList.remove("is-ready");
      },
      { signal }
    );

    const ready = new Promise((resolve, reject) => {
      const whenLinked = () => {
        if (destroyed) return resolve();
        if (parallelCompile && !gl.getProgramParameter(program, parallelCompile.COMPLETION_STATUS_KHR)) {
          rafId = requestAnimationFrame(whenLinked);
          return;
        }

        try {
          prepareProgram();
        } catch (error) {
          reject(error);
          return;
        }

        resize();

        if (animated) {
          run();
          document.addEventListener("visibilitychange", () => (document.hidden ? pause() : run()), {
            signal,
          });
        } else {
          // Reduced motion: one still frame, repainted only on resize.
          elapsed = 12;
          target.x = current.x = 0.2;
          target.y = current.y = 0.1;
          draw(0);
        }
        resolve();
      };
      whenLinked();
    });

    return {
      ready,
      destroy() {
        destroyed = true;
        pause();
        clearTimeout(settleTimer);
        listeners.abort();
        resizeObserver.disconnect();
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      },
    };
  }

  let cancelDefer = () => {};

  async function start() {
    const container = containerRef.value;
    if (!container) return;

    try {
      scene = createScene(container, !prefersReducedMotion());
      await scene.ready;
      if (scene) isActive.value = true;
    } catch (error) {
      // Decorative: the CSS gradient fallback stays visible.
      scene?.destroy();
      scene = null;
      console.warn("Aurora field disabled:", error.message);
      isActive.value = false;
    }
  }

  onMounted(() => {
    // On screen from the first paint, but the CSS gradient underneath is a
    // close match and the canvas fades in over it. Waiting for the first
    // interaction keeps the shader compile off the load path.
    cancelDefer = whenInteracted(start);
  });

  onBeforeUnmount(() => {
    cancelDefer();
    scene?.destroy();
    scene = null;
    isActive.value = false;
  });

  return { isActive };
}
