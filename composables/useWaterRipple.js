import { onBeforeUnmount, onMounted, ref } from "vue";

/** Size of the shader's ripple uniform array. Must match the GLSL loop bound. */
const MAX_RIPPLES = 32;

/** Ripples older than this (seconds) are dropped from the queue. */
const RIPPLE_LIFETIME = 4;

const VERTEX_SHADER = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = (p + 1.0) * 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

/**
 * Each ripple is a vec4: xy = origin in UV space, z = birth time, w = power.
 * The image is sampled through a center-crop (tsc) so it is never stretched.
 */
const FRAGMENT_SHADER = `
precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform float time;
uniform float power;
uniform vec4 r[${MAX_RIPPLES}];
uniform int count;
uniform vec2 tsc;

void main() {
  vec2 q = uv;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (i >= count) break;
    vec2 origin = r[i].xy;
    float age = time - r[i].z;
    float dist = distance(q, origin);
    float wave = sin((dist - age * 0.30) * 92.0) * exp(-dist * 10.0) * exp(-age * 0.58);
    vec2 dir = normalize(q - origin + vec2(0.0001));
    q += dir * wave * power * r[i].w;
  }

  vec4 color = texture2D(tex, vec2(0.5) + (q - 0.5) * tsc);

  float glow = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    if (i >= count) break;
    float age = time - r[i].z;
    float dist = distance(uv, r[i].xy);
    glow += exp(-dist * 18.0) * exp(-age * 0.85) * 0.16;
  }
  color.rgb += vec3(0.16, 0.42, 0.72) * glow;

  gl_FragColor = vec4(color.rgb, 1.0);
}`;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * Renders an image into a WebGL canvas and distorts it with expanding water
 * ripples - one per pointer press, plus ambient ripples while idle.
 *
 * Lifecycle is owned by the composable: it starts on mount and fully tears
 * down (RAF, listeners, GL resources) on unmount. When WebGL is unavailable
 * isActive stays false so the caller can keep showing a plain img fallback.
 *
 * @param {object} canvasRef Vue ref holding the target canvas element.
 * @param {object} options
 * @param {string} options.imageSrc Image to distort.
 * @param {number} [options.strength] Displacement amount, clamped 0.002-0.08.
 * @param {number} [options.trackedRipples] Concurrent ripples to keep.
 * @param {boolean} [options.ambient] Emit idle ripples automatically.
 * @param {number[]} [options.ambientDelayRange] Idle gap in seconds, [min, max].
 * @returns {{ isActive: object, addRippleFromEvent: (event: PointerEvent) => void }}
 */
export function useWaterRipple(canvasRef, options) {
  const {
    imageSrc,
    strength = 0.022,
    trackedRipples = 18,
    ambient = true,
    ambientDelayRange = [4, 11],
  } = options;

  const isActive = ref(false);
  let scene = null;

  function createScene(canvas) {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) throw new Error("WebGL unavailable");

    const rippleLimit = Math.max(6, Math.min(MAX_RIPPLES, trackedRipples));
    const displacement = Math.max(0.002, Math.min(0.08, strength));
    const emitAmbient = ambient && !prefersReducedMotion();
    const [ambientMin, ambientMax] = ambientDelayRange;

    // Newest ripple first; each entry is [x, y, birthTime, power].
    let ripples = [];
    let rafId = 0;
    let width = 0;
    let height = 0;
    let imageAspect = 1;

    function now() {
      return performance.now() * 0.001;
    }

    function randomAmbientDelay() {
      return ambientMin + Math.random() * (ambientMax - ambientMin);
    }

    let lastRippleTime = now();
    let ambientDelay = randomAmbientDelay();

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const positionAttribute = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    const uniforms = {
      time: gl.getUniformLocation(program, "time"),
      power: gl.getUniformLocation(program, "power"),
      ripples: gl.getUniformLocation(program, "r"),
      count: gl.getUniformLocation(program, "count"),
      textureScale: gl.getUniformLocation(program, "tsc"),
    };
    const rippleBuffer = new Float32Array(MAX_RIPPLES * 4);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function addRipple(x, y, power = 1) {
      ripples.unshift([x, y, now(), power]);
      if (ripples.length > rippleLimit) ripples.pop();
      // Any ripple, user-driven or ambient, restarts the idle countdown.
      lastRippleTime = now();
    }

    function addRippleFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      addRipple(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height
      );
    }

    // Center-crop UV scale: the shader equivalent of CSS object-fit: cover.
    function coverScale() {
      if (height <= 0) return [1, 1];
      const canvasAspect = width / height;
      return imageAspect > canvasAspect
        ? [canvasAspect / imageAspect, 1]
        : [1, imageAspect / canvasAspect];
    }

    function draw() {
      const time = now();

      while (ripples.length && time - ripples[ripples.length - 1][2] > RIPPLE_LIFETIME) {
        ripples.pop();
      }

      if (emitAmbient && time - lastRippleTime >= ambientDelay) {
        // Random position kept off the very edges, with slightly varied power.
        addRipple(
          0.15 + Math.random() * 0.7,
          0.2 + Math.random() * 0.6,
          0.65 + Math.random() * 0.35
        );
        ambientDelay = randomAmbientDelay();
      }

      rippleBuffer.fill(0);
      ripples.forEach((ripple, index) => rippleBuffer.set(ripple, index * 4));

      const [scaleX, scaleY] = coverScale();

      gl.clearColor(0.02, 0.05, 0.12, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uniforms.time, time);
      gl.uniform1f(uniforms.power, displacement);
      gl.uniform4fv(uniforms.ripples, rippleBuffer);
      gl.uniform1i(uniforms.count, ripples.length);
      gl.uniform2f(uniforms.textureScale, scaleX, scaleY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(draw);
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      imageAspect = image.width / image.height;
      resize();
      rafId = requestAnimationFrame(draw);
    };
    image.src = imageSrc;

    window.addEventListener("resize", resize);

    return {
      addRippleFromEvent,
      destroy() {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
        image.onload = null;
        gl.deleteTexture(texture);
        gl.deleteBuffer(quad);
        gl.deleteProgram(program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      },
    };
  }

  onMounted(() => {
    if (!canvasRef.value) return;
    try {
      scene = createScene(canvasRef.value);
      isActive.value = true;
    } catch (error) {
      // Not fatal: the caller's static image fallback stays visible.
      console.warn("Water ripple effect disabled:", error.message);
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
    addRippleFromEvent: (event) => scene?.addRippleFromEvent(event),
  };
}
