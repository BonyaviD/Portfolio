<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import TehranPeople from "~/assets/img/photography/tehran-people.jpg";
import HeroIconsDance from "@/components/sections/TheHeroSection/HeroIconsDance.vue";

const rippleCanvas = ref(null);
const heroSection = ref(null);
const webglActive = ref(false);

let sceneApi = null;

/**
 * Creates the WebGL water ripple scene on the given canvas.
 * Returns an API object with addRippleFromEvent / destroy.
 * Throws when WebGL is unavailable (caller falls back to plain <img>).
 */
function createRippleScene(canvas) {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) throw new Error("WebGL unavailable");

  const maxRipples = Math.max(6, Math.min(32, parseInt("18", 10)));
  const strength = Math.max(0.002, Math.min(0.08, parseFloat("0.022")));

  let ripples = [];
  let rafId = 0;
  let W = 0;
  let H = 0;

  // Ambient ripples: random position, random interval (only when the user is not clicking)
  let lastRippleTime = performance.now() * 0.001;
  let nextAmbientDelay = getRandomAmbientDelay();

  function getRandomAmbientDelay() {
    // Random gap between 4 and 11 seconds
    return 4 + Math.random() * 7;
  }

  function resize() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * d;
    canvas.height = H * d;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function addRipple(x, y, power) {
    ripples.unshift([x, y, performance.now() * 0.001, power || 1]);
    if (ripples.length > maxRipples) ripples.pop();
    // Any ripple (user click or ambient) resets the ambient countdown
    lastRippleTime = performance.now() * 0.001;
  }

  // Ripple originating from a UI event (click / tap anywhere in the hero section)
  function addRippleFromEvent(event) {
    const r = canvas.getBoundingClientRect();
    addRipple((event.clientX - r.left) / r.width, 1 - ((event.clientY - r.top) / r.height), 1);
  }

  const vs =
    "attribute vec2 p;varying vec2 uv;void main(){uv=(p+1.)*.5;gl_Position=vec4(p,0.,1.);}";
  const fs =
    "precision mediump float;varying vec2 uv;uniform sampler2D tex;uniform float time;uniform float power;uniform vec4 r[32];uniform int count;uniform vec2 tsc;void main(){vec2 q=uv;for(int i=0;i<32;i++){if(i>=count)break;vec2 c=r[i].xy;float age=time-r[i].z;float d=distance(q,c);float wave=sin((d-age*.30)*92.)*exp(-d*10.)*exp(-age*.58);vec2 dir=normalize(q-c+vec2(.0001));q+=dir*wave*power*r[i].w;}vec4 col=texture2D(tex,vec2(.5)+(q-.5)*tsc);float glow=0.;for(int i=0;i<32;i++){if(i>=count)break;float age=time-r[i].z;float d=distance(uv,r[i].xy);glow+=exp(-d*18.)*exp(-age*.85)*.16;}col.rgb+=vec3(.16,.42,.72)*glow;gl_FragColor=vec4(col.rgb,1.);}";

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  const pg = gl.createProgram();
  gl.attachShader(pg, compileShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(pg, compileShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pg);
  gl.useProgram(pg);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const pos = gl.getAttribLocation(pg, "p");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  const ut = gl.getUniformLocation(pg, "time");
  const up = gl.getUniformLocation(pg, "power");
  const ur = gl.getUniformLocation(pg, "r");
  const uc = gl.getUniformLocation(pg, "count");
  const uts = gl.getUniformLocation(pg, "tsc");

  // Aspect ratio of the loaded image (defaults to canvas ratio until the image loads)
  let imgAspect = W / H;

  function draw() {
    const now = performance.now() * 0.001;
    while (ripples.length && now - ripples[ripples.length - 1][2] > 4) ripples.pop();
    // Ambient ripple at a random position after a random idle gap (4-11s)
    if (now - lastRippleTime >= nextAmbientDelay) {
      addRipple(
        0.15 + Math.random() * 0.7, // x: random, keeps off the very edges
        0.2 + Math.random() * 0.6, // y: random
        0.65 + Math.random() * 0.35 // slightly varied power
      );
      nextAmbientDelay = getRandomAmbientDelay();
    }

    // object-fit: cover equivalent — center-crop UVs so the image is never stretched
    let sx = 1;
    let sy = 1;
    if (H > 0) {
      const canvasAspect = W / H;
      if (imgAspect > canvasAspect) {
        sx = canvasAspect / imgAspect; // image wider -> crop left/right
      } else {
        sy = imgAspect / canvasAspect; // image taller -> crop top/bottom
      }
    }

    const data = new Float32Array(32 * 4);
    ripples.forEach((v, i) => data.set(v, i * 4));

    gl.clearColor(0.02, 0.05, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(ut, now);
    gl.uniform1f(up, strength);
    gl.uniform4fv(ur, data);
    gl.uniform1i(uc, ripples.length);
    gl.uniform2f(uts, sx, sy);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    rafId = requestAnimationFrame(draw);
  }

  // Load the hero image into the texture, then start rendering
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    imgAspect = img.width / img.height;
    resize();
    rafId = requestAnimationFrame(draw);
  };
  img.src = TehranPeople;

  const onResize = () => resize();
  window.addEventListener("resize", onResize);

  return {
    addRippleFromEvent,
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    },
  };
}


onMounted(() => {
  try {
    sceneApi = createRippleScene(rippleCanvas.value);
    webglActive.value = !!sceneApi;
  } catch (err) {
    console.warn("Water ripple effect disabled:", err.message);
    webglActive.value = false;
  }
});

onBeforeUnmount(() => {
  sceneApi?.destroy();
  sceneApi = null;
});

function handlePointerDown(event) {
  sceneApi?.addRippleFromEvent(event);
}
</script>

<template>
  <div class="custom-section">
    <div ref="heroSection" class="hero-section" @pointerdown="handlePointerDown">
    <!-- Plain <img> kept as a graceful fallback when WebGL is unavailable -->
    <img class="hero-background" :src="TehranPeople" alt="People walking at night in Tehran" />
    <canvas v-show="webglActive" ref="rippleCanvas" class="ripple-canvas"></canvas>
    <HeroIconsDance />
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  height: 700px;
}

.hero-section .hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  filter: blur(2px);
}

.hero-section .ripple-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>