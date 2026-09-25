import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";
import { whenIdle, whenNearViewport } from "@/utils/defer";

/**
 * A sculpture of molten gold behind the contact form, raymarched in a
 * fragment shader: a handful of liquid blobs that drift on their own orbits,
 * swell and shrink, and melt into one another where they meet, with a skin
 * that ripples, mirrors a studio of soft lights, and runs to the colours of
 * a soap film where it turns away from the eye.
 *
 * The pointer carries a small drop of its own. Brought close, it is drawn
 * out of the cursor and melts into the mass; the whole piece leans toward
 * it. On a phone the drop wanders by itself. When a message is sent, every
 * blob flows into the shape of a heart, and the gold turns to ruby.
 *
 * Nothing here is geometry in the usual sense: one quad covers the section
 * and the shader finds the surface per pixel. Rays that cannot reach the
 * sculpture are dropped by a bounding-sphere test before any marching, the
 * frame is drawn at a fraction of the screen's resolution, and phones are
 * held to 30 frames a second.
 */

/* --------------------------------------------------------------- the piece */

/** The liquid blobs, plus the pointer's drop as the last one. */
const BLOBS = 7;
const CURSOR = BLOBS - 1;

/**
 * Each blob's orbit: radii of an elliptical Lissajous path, the speed along
 * each axis, a phase, and its own size. Speeds are mutually irrational, so
 * the arrangement never repeats.
 */
const ORBITS = [
  { r: [0.2, 0.16, 0.14], s: [0.23, 0.31, 0.19], phase: 0.0, size: 0.5 },
  { r: [0.82, 0.62, 0.5], s: [0.29, 0.21, 0.27], phase: 1.9, size: 0.4 },
  { r: [0.98, 0.5, 0.6], s: [0.17, 0.37, 0.23], phase: 3.4, size: 0.34 },
  { r: [0.6, 0.86, 0.5], s: [0.33, 0.19, 0.31], phase: 4.7, size: 0.31 },
  { r: [0.92, 0.66, 0.46], s: [0.21, 0.27, 0.35], phase: 2.6, size: 0.26 },
  { r: [0.52, 0.52, 0.72], s: [0.37, 0.29, 0.17], phase: 5.5, size: 0.22 },
  // The pointer's drop, when there is no pointer: a wide, slow wander.
  { r: [1.3, 0.85, 0.5], s: [0.13, 0.17, 0.11], phase: 0.8, size: 0.2 },
];

/**
 * Where each blob goes to make the heart, and its size there: two lobes, a
 * body that narrows, and a small point at the bottom. Melted together they
 * read as one smooth heart.
 */
const HEART = [
  [-0.5, 0.38, 0, 0.58],
  [0.5, 0.38, 0, 0.58],
  [-0.3, -0.1, 0, 0.5],
  [0.3, -0.1, 0, 0.5],
  [0.0, -0.5, 0, 0.36],
  [0.0, -0.82, 0, 0.17],
  [0.0, 0.15, 0, 0.45],
];

/** Radius of the whole piece in its own units, used to size it on screen. */
const PIECE_RADIUS = 1.5;
/** The drop never strays further than this from the centre. */
const CURSOR_REACH = 1.9;
/** Distance from the camera to the plane the piece sits on. */
const CAMERA_Z = 4;

/* ------------------------------------------------------------------ shaders */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;

#define BLOBS ${BLOBS}
#define STEPS 72

uniform float uTime;
uniform vec2 uResolution;
uniform vec4 uBlobs[BLOBS];   // centre and radius
uniform float uBlend;         // how readily blobs melt together
uniform float uMorph;         // 0 sculpture, 1 heart
uniform vec2 uOffset;         // where the piece sits, in world units
uniform float uTanHalf;       // sets its size on screen
uniform vec2 uTilt;           // the lean toward the pointer
uniform float uBound;         // bounding sphere of everything
uniform float uPixel;         // one drawn pixel's angle, for edge smoothing
varying vec2 vUv;

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float map(vec3 p) {
  p.xz = rot(uTilt.x) * p.xz;
  p.yz = rot(uTilt.y) * p.yz;

  float d = 1e5;
  for (int i = 0; i < BLOBS; i++) {
    vec4 b = uBlobs[i];
    d = smin(d, length(p - b.xyz) - b.w, uBlend);
  }

  // The skin is never still: slow standing ripples across the surface,
  // calmer once the heart has formed so its outline stays clean.
  float t = uTime;
  float ripple = sin(p.x * 5.1 + t * 1.1) * sin(p.y * 4.3 - t * 0.9) * sin(p.z * 5.7 + t * 0.7);
  return d + ripple * 0.035 * (1.0 - uMorph * 0.75);
}

vec3 normalAt(vec3 p) {
  const vec2 e = vec2(0.0015, -0.0015);
  return normalize(
    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx)
  );
}

/**
 * The studio the metal reflects: a deep navy room, a warm key light above
 * and to one side, a cool rim light, and a faint warm band at the horizon.
 * A mirror surface is only as good as what it has to mirror.
 */
vec3 studio(vec3 r) {
  float y = r.y * 0.5 + 0.5;
  // A dark floor under a warm, bright ceiling: most of what a polished
  // surface faces is lit, which is what makes it read as metal and not glass.
  vec3 col = mix(vec3(0.012, 0.025, 0.05), vec3(0.62, 0.46, 0.28), smoothstep(0.42, 1.0, y));
  // A broad softbox and a sharp hotspot in it, above and to one side.
  col += vec3(1.0, 0.84, 0.58) * pow(max(dot(r, normalize(vec3(-0.55, 0.7, 0.6))), 0.0), 6.0) * 1.1;
  col += vec3(1.0, 0.97, 0.9) * pow(max(dot(r, normalize(vec3(-0.4, 0.8, 0.45))), 0.0), 90.0) * 5.0;
  // A cool rim light from the other side, and a warm band along the horizon.
  col += vec3(0.32, 0.58, 1.0) * pow(max(dot(r, normalize(vec3(0.85, 0.1, 0.35))), 0.0), 8.0) * 1.2;
  col += vec3(1.0, 0.6, 0.28) * exp(-abs(r.y + 0.02) * 10.0) * 0.5;
  return col;
}

vec3 shade(vec3 p, vec3 rd, vec3 tint) {
  vec3 n = normalAt(p);
  vec3 v = -rd;
  float facing = max(dot(n, v), 0.0);
  float fresnel = pow(1.0 - facing, 3.0);

  // Polished metal: what it reflects, tinted by the metal, whitening toward
  // the edges where any mirror turns silver.
  vec3 reflected = studio(reflect(rd, n));
  vec3 col = reflected * mix(tint, vec3(1.0), fresnel * 0.4);

  // A thin film on the surface: the colours of oil on water, strongest at
  // grazing angles, drifting slowly.
  vec3 film = 0.5 + 0.5 * cos(6.2831 * (fresnel * 1.4 + vec3(0.0, 0.33, 0.67) + uTime * 0.04));
  col = mix(col, col * film * 1.7, fresnel * 0.6);

  // The body of the liquid under the key light, and light carried into it,
  // so even the side turned away from the softbox still reads as gold.
  float key = max(dot(n, normalize(vec3(-0.5, 0.7, 0.55))), 0.0);
  col += tint * tint * (0.05 + key * 0.16);
  col += tint * pow(1.0 - facing, 1.5) * 0.1;
  col = col / (1.0 + col);
  return pow(col, vec3(1.0 / 2.2));
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 ro = vec3(-uOffset, ${CAMERA_Z.toFixed(1)});
  vec3 rd = normalize(vec3(uv * uTanHalf, -1.0));

  vec3 gold = vec3(1.0, 0.66, 0.24);
  vec3 ruby = vec3(0.95, 0.1, 0.22);
  vec3 tint = mix(gold, ruby, uMorph);

  // Rays that pass wide of everything never march at all.
  float b = dot(ro, rd);
  float c = dot(ro, ro) - uBound * uBound;
  float disc = b * b - c;
  if (disc < 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float root = sqrt(disc);
  float t = max(-b - root, 0.0);
  float tFar = -b + root;

  float nearest = 1e5;
  float tNearest = t;
  bool hit = false;
  for (int i = 0; i < STEPS; i++) {
    float d = map(ro + rd * t);
    if (d < nearest) { nearest = d; tNearest = t; }
    if (d < 0.0015) { hit = true; break; }
    t += d * 0.9;
    if (t > tFar) break;
  }

  if (hit) {
    gl_FragColor = vec4(shade(ro + rd * t, rd, tint), 1.0);
    return;
  }

  // A soft aura where rays passed close: the metal lights the air.
  float glow = exp(-nearest * 7.0) * 0.28;
  vec4 aura = vec4(tint * glow, glow);

  // Rays that just grazed the surface are the silhouette. Drawn as a hit or
  // a miss, the edge is a staircase at this resolution; shaded where they
  // came closest and blended by how close, it is a clean line.
  float footprint = tNearest * uPixel * 1.5;
  float coverage = 1.0 - smoothstep(0.0, footprint, nearest);
  if (coverage > 0.0) {
    vec3 edge = shade(ro + rd * tNearest, rd, tint);
    aura = mix(aura, vec4(edge, 1.0), coverage);
  }
  gl_FragColor = aura;
}
`;

/* -------------------------------------------------------------- composable */

/**
 * @param {object} containerRef Vue ref holding the host element.
 * @param {object} options
 * @param {boolean} [options.celebrate] Flow into a heart (reactive).
 * @param {string} [options.stage] Selector, within the same section, of the
 *   box the piece sits in. It takes that box's centre and fits inside it;
 *   without one it centres itself in the section.
 * @returns {{ isActive: object }}
 */
export function useLiquidSculpture(containerRef, options = {}) {
  const isActive = ref(false);
  let scene = null;

  function createScene(THREE, container) {
    const listeners = new AbortController();
    const { signal } = listeners;

    const coarse = window.matchMedia?.("(pointer: coarse)").matches === true;
    // Drawn small and scaled up: soft liquid survives it, and it is what
    // keeps a per-pixel raymarch affordable.
    const renderScale = Math.min(window.devicePixelRatio || 1, 1.5) * (coarse ? 0.42 : 0.6);
    const frameInterval = coarse ? 1000 / 30 : 0;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uBlobs: { value: Array.from({ length: BLOBS }, () => new THREE.Vector4()) },
      uBlend: { value: 0.55 },
      uMorph: { value: 0 },
      uOffset: { value: new THREE.Vector2() },
      uTanHalf: { value: 0.4 },
      uTilt: { value: new THREE.Vector2() },
      uBound: { value: 2.7 },
      uPixel: { value: 0.001 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      // The shader writes premultiplied colour, glow included.
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    const threeScene = new THREE.Scene();
    threeScene.add(quad);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ------------------------------------------------------------- layout
    /** World units per CSS pixel on the plane the piece sits on. */
    let worldPerPx = 0.01;
    let size = { width: 1, height: 1 };

    /** The box the piece belongs in, laid out by the page itself. */
    const stage = options.stage
      ? container.closest("section")?.querySelector(options.stage) ?? null
      : null;

    /**
     * The canvas covers the whole section, so the glow and the pointer's
     * drop can go anywhere in it; the piece itself is centred on its stage
     * and sized to fit inside it. Taking both from the page's own layout is
     * what keeps it out from behind the form and inside the section at every
     * width - positions worked out from the section's size alone got both
     * wrong wherever the layout changed shape.
     */
    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      size = { width, height };
      const bufferHeight = Math.round(height * renderScale);
      renderer.setSize(Math.round(width * renderScale), bufferHeight, false);
      uniforms.uResolution.value.set(width, height);

      const frame = container.getBoundingClientRect();
      const box = stage?.getBoundingClientRect();
      const fits = box && box.width > 0 && box.height > 0;
      const centre = fits
        ? { x: box.left + box.width / 2 - frame.left, y: box.top + box.height / 2 - frame.top }
        : { x: width / 2, y: height / 2 };
      // The blobs wander a little past the piece's nominal radius, so it is
      // fitted with a margin rather than edge to edge.
      const radiusPx = fits
        ? Math.min(box.width * 0.4, box.height * 0.5, 240)
        : Math.min(width, height) * 0.3;

      const halfHeight = height / 2;
      uniforms.uTanHalf.value = (PIECE_RADIUS * halfHeight) / (CAMERA_Z * radiusPx);
      worldPerPx = (CAMERA_Z * uniforms.uTanHalf.value) / halfHeight;
      uniforms.uPixel.value = (2 * uniforms.uTanHalf.value) / bufferHeight;
      uniforms.uOffset.value.set(
        (centre.x - width / 2) * worldPerPx,
        -(centre.y - height / 2) * worldPerPx
      );
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    if (stage) resizeObserver.observe(stage);
    resize();

    /**
     * A resize observer hears when the stage changes size, but not when it
     * moves - and it moves without resizing whenever something above it
     * reflows: a web font arriving, a section finishing hydration. Twice a
     * second the piece checks where its stage is now and follows it.
     */
    let lastStage = "";
    let nextCheck = 0;
    function followStage(now) {
      if (!stage || now < nextCheck) return;
      nextCheck = now + 500;
      const frame = container.getBoundingClientRect();
      const box = stage.getBoundingClientRect();
      const key = [box.left - frame.left, box.top - frame.top, box.width, box.height, frame.width, frame.height]
        .map(Math.round)
        .join(",");
      if (key !== lastStage) {
        lastStage = key;
        resize();
      }
    }

    // ------------------------------------------------------------ pointer
    /** Pointer on the piece's plane, in its own units; null when absent. */
    let pointer = null;
    let lastPointerAt = -Infinity;
    let clientX = -1;
    let clientY = -1;

    function mapPointer() {
      const rect = container.getBoundingClientRect();
      const inside =
        clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      if (!inside) {
        pointer = null;
        return;
      }
      const x = (clientX - rect.left - rect.width / 2) * worldPerPx - uniforms.uOffset.value.x;
      const y = -(clientY - rect.top - rect.height / 2) * worldPerPx - uniforms.uOffset.value.y;
      pointer = { x, y };
      lastPointerAt = time;
    }

    // The host is pointer-events:none so the form stays usable; listen on
    // the window and map the pointer in.
    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        clientX = event.clientX;
        clientY = event.clientY;
        mapPointer();
      },
      { passive: true, signal }
    );
    // Scrolling moves the section under a mouse that has not moved itself.
    window.addEventListener("scroll", () => clientX >= 0 && mapPointer(), { passive: true, signal });

    // ------------------------------------------------------------- motion
    const blobs = ORBITS.map(() => ({ x: 0, y: 0, z: 0, r: 0 }));
    const drop = { x: 0, y: 0, z: 0 };
    let presence = 0;
    const tilt = { x: 0, y: 0 };
    let morph = 0;
    let morphTarget = 0;
    let time = 0;

    const ease = (rate, dt) => 1 - Math.exp(-rate * dt);
    const smooth = (x) => x * x * (3 - 2 * x);

    function step(dt) {
      time += dt;
      uniforms.uTime.value = time;

      // Gathers with intent and lets go gently.
      morph += (morphTarget - morph) * ease(morphTarget > morph ? 1.6 : 1.1, dt);

      const here = pointer && time - lastPointerAt < 5;
      presence += ((here ? 1 : 0) - presence) * ease(2.5, dt);

      // The drop: pulled toward the pointer on a spring, clamped to reach.
      if (here) {
        const len = Math.hypot(pointer.x, pointer.y);
        const k = len > CURSOR_REACH ? CURSOR_REACH / len : 1;
        const pull = ease(5, dt);
        drop.x += (pointer.x * k - drop.x) * pull;
        drop.y += (pointer.y * k - drop.y) * pull;
        drop.z += (0.25 - drop.z) * pull;
      }

      ORBITS.forEach((orbit, i) => {
        const a = time + orbit.phase * 3;
        let x = orbit.r[0] * Math.sin(a * orbit.s[0] * 2 + orbit.phase);
        let y = orbit.r[1] * Math.sin(a * orbit.s[1] * 2 + orbit.phase * 1.7);
        let z = orbit.r[2] * Math.cos(a * orbit.s[2] * 2 + orbit.phase * 0.6);
        // Each blob breathes at its own pace.
        let r = orbit.size * (1 + 0.1 * Math.sin(time * (0.9 + i * 0.13) + orbit.phase));

        if (i === CURSOR) {
          // With a pointer, the drop follows it; without, it wanders.
          x += (drop.x - x) * presence;
          y += (drop.y - y) * presence;
          z += (drop.z - z) * presence;
          r *= 1 + presence * 0.15;
        }

        // Into the heart: each blob leaves at its own moment.
        const [hx, hy, hz, hr] = HEART[i];
        const m = smooth(Math.min(Math.max((morph - i * 0.05) / 0.7, 0), 1));
        const blob = blobs[i];
        blob.x = x + (hx - x) * m;
        blob.y = y + (hy - y) * m;
        blob.z = z + (hz - z) * m;
        blob.r = r + (hr - r) * m;
        uniforms.uBlobs.value[i].set(blob.x, blob.y, blob.z, blob.r);
      });

      // Tighter melting in the heart, so its notch and point stay sharp.
      uniforms.uBlend.value = 0.55 - morph * 0.25;

      // Lean toward the pointer, and turn slowly on its own; face the viewer
      // squarely while it is a heart.
      const settle = 1 - morph;
      const wantX = (here ? pointer.x * 0.28 : Math.sin(time * 0.21) * 0.35) * settle;
      const wantY = (here ? -pointer.y * 0.22 : Math.sin(time * 0.17) * 0.15) * settle;
      tilt.x += (wantX - tilt.x) * ease(2, dt);
      tilt.y += (wantY - tilt.y) * ease(2, dt);
      uniforms.uTilt.value.set(tilt.x, tilt.y);
      uniforms.uMorph.value = morph;
    }

    // --------------------------------------------------------------- loop
    let rafId = 0;
    let running = false;
    let last = 0;
    let lastDrawn = 0;

    function frame(now) {
      rafId = requestAnimationFrame(frame);
      if (frameInterval && now - lastDrawn < frameInterval - 1) return;
      lastDrawn = now;
      // Clamped, so a tab coming back from the background does not lurch.
      const dt = Math.min((now - (last || now)) / 1000, 0.1);
      last = now;
      followStage(now);
      step(dt);
      renderer.render(threeScene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      last = 0;
      rafId = requestAnimationFrame(frame);
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
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()), {
      signal,
    });

    /**
     * A raymarching shader takes a while to compile, and compiled on the
     * first frame it froze the page for most of a second - just as the
     * visitor scrolled into the section. compileAsync hands it to the
     * driver's background compiler where there is one; the piece starts
     * drawing once it is ready.
     */
    let destroyed = false;
    const compiled = renderer.compileAsync
      ? renderer.compileAsync(threeScene, camera).catch(() => {})
      : Promise.resolve();
    compiled.then(() => {
      if (destroyed) return;
      visibility.observe(container);
      // Start straight away and let the observer only pause: if it never
      // reports, the piece must still render.
      start();
    });

    return {
      celebrate(on) {
        morphTarget = on ? 1 : 0;
        start();
      },
      relayout: resize,
      ready: compiled,
      destroy() {
        destroyed = true;
        stop();
        listeners.abort();
        visibility.disconnect();
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  // `options` stays reactive on purpose: this follows the component's prop.
  watch(
    () => options.celebrate,
    (on) => scene?.celebrate(Boolean(on))
  );

  let cancelDefer = () => {};
  let cancelWarmup = () => {};

  onMounted(() => {
    if (prefersReducedMotion() || !containerRef.value) return;
    // A decoration a long way down the page: built only as it comes near,
    // with Three.js fetched in idle time a couple of screens earlier.
    cancelDefer = whenNearViewport(containerRef.value, start);
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
      if (!containerRef.value) return;
      scene = createScene(THREE, containerRef.value);
      if (options.celebrate) scene.celebrate(true);
      await scene.ready;
      if (scene) isActive.value = true;
    } catch (error) {
      // Decorative only: failing to start is never fatal for the page.
      console.warn("Liquid sculpture disabled:", error.message);
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

  return { isActive, relayout: () => scene?.relayout() };
}
