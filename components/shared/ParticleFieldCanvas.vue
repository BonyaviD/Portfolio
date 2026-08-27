<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  particleCount: { type: Number, default: 4000 },
  // "repel" -> particles flee from the cursor | "attract" -> they gather & swirl around it
  mode: { type: String, default: "repel" },
  radius: { type: Number, default: 150 }, // mouse influence radius in CSS px
  strength: { type: Number, default: 260 }, // push/pull acceleration (CSS px /s²)
});

const canvasEl = ref(null);
let sceneApi = null;

function createScene(canvas, surface) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) throw new Error("WebGL unavailable");

  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return null;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = canvas.clientWidth || surface.clientWidth || 800;
  let H = canvas.clientHeight || surface.clientHeight || 400;

  // Scale particle count with viewport area (lighter on phones)
  const areaFactor = Math.min(1, Math.max(0.35, (W * H) / (1440 * 900)));
  const count = Math.max(250, Math.round(props.particleCount * areaFactor));

  // --- GPU resources --------------------------------------------------------
  const vs =
    "attribute vec2 aPos;attribute vec2 aData;" +
    "uniform vec2 uRes;uniform float uDpr;uniform float uSizeScale;" +
    "varying float vTint;" +
    "void main(){" +
    "vTint=aData.y;" +
    "gl_Position=vec4((aPos.x/uRes.x)*2.0-1.0,1.0-(aPos.y/uRes.y)*2.0,0.0,1.0);" +
    "gl_PointSize=aData.x*uSizeScale*uDpr;}";

  const fs =
    "precision mediump float;varying float vTint;uniform float uIntensity;" +
    "void main(){" +
    "vec2 c=gl_PointCoord*2.0-1.0;" +
    "float d=dot(c,c);" +
    "if(d>1.0){discard;}" +
    "float alpha=exp(-d*3.5)*uIntensity;" +
    "vec3 lightGold=vec3(0.902,0.714,0.424);" +
    "vec3 deepGold=vec3(0.545,0.392,0.176);" +
    "vec3 col=mix(deepGold,lightGold,vTint);" +
    "col+=vec3(1.0)*alpha*alpha*0.35;" + // white-hot core => bloom feel
    "gl_FragColor=vec4(col,alpha);}";

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

  // --- Particle state -------------------------------------------------------
  const pos = new Float32Array(count * 2); // CSS px
  const home = new Float32Array(count * 2); // resting position -> spring back
  const vel = new Float32Array(count * 2);
  const data = new Float32Array(count * 2); // [size, tintMix]
  const phase = new Float32Array(count);

  const MARGIN = 40;
  for (let i = 0; i < count; i++) {
    pos[i * 2] = Math.random() * (W + MARGIN * 2) - MARGIN;
    pos[i * 2 + 1] = Math.random() * (H + MARGIN * 2) - MARGIN;
    home[i * 2] = pos[i * 2];
    home[i * 2 + 1] = pos[i * 2 + 1];
    // Mostly tiny sparks, some bigger stars
    const big = Math.random() < 0.08;
    data[i * 2] = big ? 3.0 + Math.random() * 1.8 : 1.1 + Math.random() * 1.9;
    data[i * 2 + 1] = Math.random(); // gold <-> ice gradient
    phase[i] = Math.random() * Math.PI * 2;
  }
  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
  const aPos = gl.getAttribLocation(pg, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const dataBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, dataBuf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const aData = gl.getAttribLocation(pg, "aData");
  gl.enableVertexAttribArray(aData);
  gl.vertexAttribPointer(aData, 2, gl.FLOAT, false, 0, 0);

  // Duplicate attribute binding for the second draw pass (same buffers)
  const uRes = gl.getUniformLocation(pg, "uRes");
  const uDpr = gl.getUniformLocation(pg, "uDpr");
  const uSizeScale = gl.getUniformLocation(pg, "uSizeScale");
  const uIntensity = gl.getUniformLocation(pg, "uIntensity");

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive => glow/bloom

  let rafId = 0;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  let lastW = W;
  let lastH = H;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const oldW = lastW;
    const oldH = lastH;
    W = canvas.clientWidth || W;
    H = canvas.clientHeight || H;
    // Rescale positions & homes proportionally so springs never pull off-canvas
    if (oldW > 0 && oldH > 0 && (oldW !== W || oldH !== H)) {
      const kx = W / oldW;
      const ky = H / oldH;
      for (let i = 0; i < count * 2; i += 2) {
        home[i] *= kx;
        home[i + 1] *= ky;
        pos[i] *= kx;
        pos[i + 1] *= ky;
      }
    }
    lastW = W;
    lastH = H;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, W, H);
    gl.uniform1f(uDpr, dpr);
  }

  function update(dt, t) {
    const R = props.radius;
    const F = props.strength;
    const repel = props.mode !== "attract";
    const damp = Math.pow(0.32, dt); // gentle global damping
    for (let i = 0; i < count; i++) {
      const ix = i * 2;
      const iy = ix + 1;

      // Idle float: smooth per-particle noise drift
      vel[ix] += Math.sin(t * 0.7 + phase[i]) * 6.0 * dt;
      vel[iy] += Math.cos(t * 0.55 + phase[i] * 1.3) * 6.0 * dt;

      // Spring back home: particles return to their resting spot after being pushed
      const hx = home[ix] - pos[ix];
      const hy = home[iy] - pos[iy];
      vel[ix] += hx * 4.0 * dt;
      vel[iy] += hy * 4.0 * dt;

      // Mouse interaction
      const dx = pos[ix] - mouse.x;
      const dy = pos[iy] - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < R * R && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const fall = 1 - d / R;
        if (repel) {
          const f = fall * fall * F * dt / d;
          vel[ix] += dx * f;
          vel[iy] += dy * f;
        } else if (d > 34) {
          const f = -fall * fall * F * dt / d; // pull toward cursor
          vel[ix] += dx * f;
          vel[iy] += dy * f;
        } else {
          // Very close: orbit instead of collapsing
          const s = 120 * fall * dt;
          vel[ix] += (-dy / d) * s;
          vel[iy] += (dx / d) * s;
        }
      }

      vel[ix] *= damp;
      vel[iy] *= damp;

      // Speed clamp
      const sp2 = vel[ix] * vel[ix] + vel[iy] * vel[iy];
      if (sp2 > 320 * 320) {
        const k = 320 / Math.sqrt(sp2);
        vel[ix] *= k;
        vel[iy] *= k;
      }

      pos[ix] += vel[ix] * dt;
      pos[iy] += vel[iy] * dt;

      // Soft bounce at edges (spring needs a fixed frame of reference, no wrap)
      if (pos[ix] < -MARGIN) {
        pos[ix] = -MARGIN;
        vel[ix] *= -0.5;
      } else if (pos[ix] > W + MARGIN) {
        pos[ix] = W + MARGIN;
        vel[ix] *= -0.5;
      }
      if (pos[iy] < -MARGIN) {
        pos[iy] = -MARGIN;
        vel[iy] *= -0.5;
      } else if (pos[iy] > H + MARGIN) {
        pos[iy] = H + MARGIN;
        vel[iy] *= -0.5;
      }
    }
  }

  function draw() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uSizeScale, 1.0);
    gl.uniform1f(uIntensity, 0.95);
    gl.drawArrays(gl.POINTS, 0, count);

    // Big soft halo pass => bloom
    gl.uniform1f(uSizeScale, 4.2);
    gl.uniform1f(uIntensity, 0.10);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  let last = performance.now();
  function frame(now) {
    const t = now * 0.001;
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    // Smooth cursor follow for organic motion
    mouse.x += (mouse.tx - mouse.x) * 0.18;
    mouse.y += (mouse.ty - mouse.y) * 0.18;

    update(dt, t);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
    draw();
    rafId = requestAnimationFrame(frame);
  }
  // --- Events ---------------------------------------------------------------
  function toLocal(e) {
    const r = surface.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function onPointerMove(e) {
    const [x, y] = toLocal(e);
    mouse.tx = x;
    mouse.ty = y;
    // Snap when the cursor re-enters from far away (prevents streak across screen)
    if (mouse.x < -9000) {
      mouse.x = x;
      mouse.y = y;
    }
  }

  function onPointerLeave() {
    mouse.tx = -9999;
    mouse.ty = -9999;
  }

  surface.addEventListener("pointermove", onPointerMove, { passive: true });
  surface.addEventListener("pointerleave", onPointerLeave);

  const onWinResize = () => resize();
  window.addEventListener("resize", onWinResize);
  const ro = new ResizeObserver(onWinResize);
  ro.observe(surface);

  resize();
  rafId = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onWinResize);
      ro.disconnect();
      surface.removeEventListener("pointermove", onPointerMove);
      surface.removeEventListener("pointerleave", onPointerLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

onMounted(() => {
  try {
    sceneApi = createScene(canvasEl.value, canvasEl.value.parentElement);
  } catch (err) {
    console.warn("Particle field disabled:", err.message);
  }
});

onBeforeUnmount(() => {
  sceneApi?.destroy();
  sceneApi = null;
});
</script>

<template>
  <canvas ref="canvasEl" class="particle-field-canvas" aria-hidden="true"></canvas>
</template>

<style scoped>
.particle-field-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
</style>

