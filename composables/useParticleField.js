import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";
import { whenIdle, whenNearViewport } from "@/utils/defer";

/**
 * A field of light points laid out as a grid on a slowly breathing surface,
 * seen in perspective - a dotted landscape behind the contact form.
 *
 * The pointer is a presence on that surface rather than a force against it:
 * the ground swells gently under the cursor, the points around it catch the
 * light, and moving it sends rings out across the field like a finger drawn
 * through water. The whole plane leans a little towards the cursor, so the
 * depth reads. With no mouse - a phone - rings rise on their own every few
 * seconds, and a tap starts one.
 *
 * When a message is sent the grid gathers into hearts, each point leaving at
 * its own moment so the shape pours in rather than snapping.
 *
 * Everything moves in the vertex shader. The earlier version ran 34,000
 * points through a JavaScript loop on every frame; here the CPU only updates
 * a handful of uniforms, whatever the number of points.
 */

/* --------------------------------------------------------------- tuning */

/** Points on the grid, by viewport width. Wider screens see more of it. */
function budgetedGrid() {
  const width = typeof window === "undefined" ? 1440 : window.innerWidth;
  if (width < 768) return { cols: 96, rows: 84 }; // ~8k
  if (width < 1200) return { cols: 150, rows: 100 }; // ~15k
  return { cols: 210, rows: 120 }; // ~25k
}

/** World size of the surface. It runs past the frame on every side, so its
 *  edges are never seen - they fade out first. */
const FIELD = { width: 2400, depth: 1500 };

/** Rings alive at once. A new one replaces the oldest. */
const RIPPLES = 10;
/** How far the pointer has to travel on the surface before it drops a ring. */
const RIPPLE_STEP = 90;
/** Seconds without a pointer before rings start rising on their own. */
const IDLE_AFTER = 2.5;

/**
 * Where the hearts sit and how big each one is: x and y as fractions of the
 * half-frame, then a size multiplier. Several small hearts rather than one
 * large one: a single heart holding every point packs into a solid blob.
 */
const HEART_LAYOUT = [
  [0.0, 0.1, 1.35],
  [-0.56, -0.3, 0.85],
  [0.54, -0.24, 0.95],
  [-0.31, 0.54, 0.75],
  [0.36, 0.57, 0.8],
  [-0.74, 0.2, 0.62],
  [0.76, 0.31, 0.68],
  [-0.16, -0.62, 0.7],
  [0.2, -0.66, 0.6],
];
/** On-screen height of the base heart, in CSS pixels. */
const HEART_HEIGHT_PX = 64;
/** Height of the unit heart produced by heartPoint(). */
const HEART_UNIT_HEIGHT = 28.9;
/** How far in front of the camera the hearts form. */
const HEART_DEPTH = 600;

/**
 * A point inside the classic parametric heart. The curve only draws the
 * outline, so each point goes a random way out along its own spoke; sqrt
 * spreads them evenly by area instead of bunching them at the centre.
 */
function heartPoint() {
  const t = Math.random() * Math.PI * 2;
  const reach = Math.sqrt(Math.random());
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [x * reach, y * reach + 2.5, (Math.random() - 0.5) * 3];
}

/* -------------------------------------------------------------- shaders */

/** 3D simplex noise, Ashima Arts / Stefan Gustavson (MIT). */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const VERTEX = /* glsl */ `
#define RIPPLES ${RIPPLES}
#define HEARTS ${HEART_LAYOUT.length}

uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform vec2 uPointer;            // on the surface, smoothed
uniform float uPresence;          // 0 with no pointer, 1 with one
uniform vec4 uRipples[RIPPLES];   // x, z, start time, strength
uniform float uMorph;             // 0 surface, 1 hearts
uniform vec3 uHearts[HEARTS];     // view-space centre x, y and scale
uniform vec2 uHalfField;

attribute vec3 aHeart;
attribute float aHeartIndex;
attribute float aSeed;

varying float vLight;   // how lit the point is: crest, cursor, ring
varying float vHeight;  // 0 trough .. 1 crest
varying float vFade;    // edges and distance
varying float vMorph;
varying float vSeed;

${NOISE}

void main() {
  vec3 p = position;
  float t = uTime;

  // The breathing surface: two octaves of noise and a long, slow swell.
  float h = snoise(vec3(p.x * 0.0024, p.z * 0.0024, t * 0.09)) * 42.0
          + snoise(vec3(p.x * 0.0065 + 11.0, p.z * 0.0065, t * 0.16)) * 12.0
          + sin(p.x * 0.0045 + p.z * 0.002 + t * 0.35) * 10.0;

  // The cursor: a soft rise, and the points around it catching light.
  float d = distance(p.xz, uPointer);
  float swell = exp(-(d * d) / (2.0 * 150.0 * 150.0)) * uPresence;
  float halo = exp(-(d * d) / (2.0 * 260.0 * 260.0)) * uPresence;
  h += swell * 70.0;

  // Rings: each a travelling crest that thins and fades as it widens.
  float ring = 0.0;
  for (int i = 0; i < RIPPLES; i++) {
    vec4 r = uRipples[i];
    float age = t - r.z;
    if (age < 0.0 || age > 3.2) continue;
    float radius = age * 330.0;
    float band = (distance(p.xz, r.xy) - radius) / (26.0 + age * 22.0);
    // A crest with a trough behind it, rather than a bare bump.
    float wave = exp(-band * band) * cos(band * 1.6);
    ring += wave * r.w * (1.0 - age / 3.2) * (1.0 - age / 3.2);
  }
  h += ring * 34.0;

  vec4 surface = modelViewMatrix * vec4(p.x, h, p.z, 1.0);

  // Out to the hearts: each point leaves at its own moment, and bows up on
  // the way so the stream curves instead of flying in straight lines.
  vec3 heart = uHearts[int(aHeartIndex)];
  vec4 target = vec4(heart.xy + aHeart.xy * heart.z, -${HEART_DEPTH.toFixed(1)} + aHeart.z * heart.z, 1.0);
  float m = smoothstep(aSeed * 0.5, aSeed * 0.5 + 0.5, uMorph);
  vec4 mv = mix(surface, target, m);
  mv.y += sin(m * 3.14159) * (aSeed - 0.3) * 120.0;

  gl_Position = projectionMatrix * mv;

  vHeight = clamp(h / 70.0 + 0.5, 0.0, 1.0);
  // A slow band of light sweeping across the field, corner to corner, so
  // the surface reads as something being scanned rather than wallpaper.
  float sweep = p.x * 0.82 + p.z * 0.57;
  float scanAt = mod(t * 240.0, 4200.0) - 2100.0;
  float scan = exp(-pow((sweep - scanAt) / 70.0, 2.0)) * 0.5;

  vLight = clamp(halo * 0.55 + swell * 0.35 + max(ring, 0.0) * 0.9 + scan, 0.0, 1.0);
  vMorph = m;
  vSeed = aSeed;

  // Dissolve toward the edges of the field and into the distance, so there
  // is never a border - just a surface that runs out of light.
  vec2 edge = abs(p.xz) / uHalfField;
  float edgeFade = (1.0 - smoothstep(0.55, 1.0, edge.x)) * (1.0 - smoothstep(0.45, 1.0, edge.y));
  // Far rows crowd together in perspective, and additive light piles up
  // into a solid band there - so the distance goes dark before that.
  float depthFade = smoothstep(1900.0, 820.0, -surface.z);
  vFade = mix(edgeFade * depthFade, 1.0, m);

  float size = uSize * (0.8 + vHeight * 0.45 + vLight * 0.75) * mix(1.0, 0.6, m);
  gl_PointSize = size * uPixelRatio * (560.0 / -mv.z);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uCrest;
uniform vec3 uHot;
uniform vec3 uHeartA;
uniform vec3 uHeartB;
uniform float uOpacity;
uniform float uMorph;

varying float vLight;
varying float vHeight;
varying float vFade;
varying float vMorph;
varying float vSeed;

void main() {
#ifdef LINES
  // The contour lines: the surface's rows drawn as hairlines. They carry the
  // shape between the points and are gone before the hearts form, which
  // their segments would otherwise slash straight across.
  float dotShape = 0.42 * (1.0 - smoothstep(0.0, 0.2, uMorph));
  if (dotShape < 0.01) discard;
#else
  // A round point with a bright core and a soft rim.
  float r = length(gl_PointCoord - 0.5);
  float dotShape = smoothstep(0.5, 0.08, r);
  if (dotShape < 0.01) discard;
#endif

  vec3 color = mix(uDeep, uCrest, smoothstep(0.35, 0.95, vHeight));
  color = mix(color, uHot, vLight * 0.85);
  color = mix(color, mix(uHeartA, uHeartB, step(0.6, vSeed)), vMorph);

  // Troughs sit back in the dark; crests and anything near the cursor lift.
  float presence = 0.5 + 0.5 * max(smoothstep(0.3, 1.0, vHeight), vLight);
  float alpha = dotShape * uOpacity * vFade * mix(presence, 0.95, vMorph);

  gl_FragColor = vec4(color * alpha, alpha);
}
`;

/* ----------------------------------------------------------- composable */

/**
 * @param {object} containerRef Vue ref holding the host element.
 * @param {object} options
 * @param {string} [options.deepColor] Troughs.
 * @param {string} [options.crestColor] Crests.
 * @param {string} [options.hotColor] Points caught by the cursor and rings.
 * @param {number} [options.particleSize] Base point size.
 * @param {number} [options.opacity] Overall opacity of the field.
 * @param {boolean} [options.celebrate] Gather into hearts (reactive).
 * @returns {{ isActive: object }}
 */
export function useParticleField(containerRef, options = {}) {
  const {
    deepColor = "#4a9fd4",
    crestColor = "#e6b66c",
    hotColor = "#fff1d6",
    particleSize = 3.2,
    opacity = 0.9,
  } = options;

  const isActive = ref(false);
  let scene = null;

  function createScene(THREE, container) {
    const listeners = new AbortController();
    const { signal } = listeners;

    const threeScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 4000);

    // alpha + zero clear: the page backdrop behind stays visible.
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ------------------------------------------------------------ geometry
    const { cols, rows } = budgetedGrid();
    const count = cols * rows;
    const positions = new Float32Array(count * 3);
    const hearts = new Float32Array(count * 3);
    const heartIndex = new Float32Array(count);
    const seeds = new Float32Array(count);

    const stepX = FIELD.width / (cols - 1);
    const stepZ = FIELD.depth / (rows - 1);

    for (let row = 0, i = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++, i++) {
        const o = i * 3;
        positions[o] = -FIELD.width / 2 + col * stepX;
        positions[o + 1] = 0;
        positions[o + 2] = -FIELD.depth / 2 + row * stepZ;

        const [hx, hy, hz] = heartPoint();
        hearts[o] = hx;
        hearts[o + 1] = hy;
        hearts[o + 2] = hz;
        // Round-robin, so every heart gets the same share of points.
        heartIndex[i] = i % HEART_LAYOUT.length;
        seeds[i] = Math.random();
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aHeart", new THREE.BufferAttribute(hearts, 3));
    geometry.setAttribute("aHeartIndex", new THREE.BufferAttribute(heartIndex, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    // The vertex shader moves every point far from where the CPU placed it,
    // so the precomputed bounds would cull the field off-screen.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);

    const uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: particleSize },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPresence: { value: 0 },
      uRipples: {
        value: Array.from({ length: RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)),
      },
      uMorph: { value: 0 },
      uHearts: { value: HEART_LAYOUT.map(() => new THREE.Vector3()) },
      uHalfField: { value: new THREE.Vector2(FIELD.width / 2, FIELD.depth / 2) },
      uDeep: { value: new THREE.Color(deepColor) },
      uCrest: { value: new THREE.Color(crestColor) },
      uHot: { value: new THREE.Color(hotColor) },
      uHeartA: { value: new THREE.Color("#ff2f55") },
      uHeartB: { value: new THREE.Color("#ff9bb0") },
      uOpacity: { value: opacity },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      // Premultiplied additive: overlapping light adds up, dark stays clear.
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    });

    const points = new THREE.Points(geometry, material);

    // Every other row as a line, sharing the points' attributes and uniforms
    // - one surface, drawn twice. Every row would crowd the distance.
    const segments = [];
    for (let row = 0; row < rows; row += 2) {
      for (let col = 0; col < cols - 1; col++) {
        const i = row * cols + col;
        segments.push(i, i + 1);
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    for (const name of ["position", "aHeart", "aHeartIndex", "aSeed"]) {
      lineGeometry.setAttribute(name, geometry.getAttribute(name));
    }
    lineGeometry.setIndex(segments);
    lineGeometry.boundingSphere = geometry.boundingSphere;
    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      // The same object, not a copy, so one update drives both layers.
      uniforms,
      defines: { LINES: "" },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    const tilt = new THREE.Group();
    tilt.add(lines);
    tilt.add(points);
    threeScene.add(tilt);

    // ---------------------------------------------------------- the camera
    /** Pitch of the view: shallow on wide screens, steeper on tall ones, so
     *  the surface fills a narrow phone instead of showing mostly sky. */
    let basePitch = 0.5;

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      const tall = Math.min(Math.max((1.4 - camera.aspect) / 1.1, 0), 1);
      basePitch = 0.36 + tall * 0.5;
      camera.fov = 48 + tall * 12;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      // Hearts in view space, sized in CSS pixels so they never grow with
      // the section.
      const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * HEART_DEPTH;
      const pixelsPerUnit = height / visibleHeight;
      const base = HEART_HEIGHT_PX / pixelsPerUnit / HEART_UNIT_HEIGHT;
      HEART_LAYOUT.forEach(([fx, fy, size], i) => {
        uniforms.uHearts.value[i].set(
          fx * ((visibleHeight * camera.aspect) / 2) * 0.92,
          fy * (visibleHeight / 2) * 0.86,
          base * size
        );
      });
    }

    function placeCamera(pitch, yaw) {
      const radius = 640;
      camera.position.set(
        Math.sin(yaw) * radius * Math.cos(pitch),
        Math.sin(pitch) * radius,
        Math.cos(yaw) * radius * Math.cos(pitch)
      );
      camera.lookAt(0, 0, -260);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // --------------------------------------------------------- the pointer
    const ndc = new THREE.Vector2();
    const ndcSmoothed = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const surface = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const target = new THREE.Vector2();
    const lastRipple = new THREE.Vector2(1e6, 1e6);
    const inverse = new THREE.Matrix4();

    let pointerInside = false;
    /** Last mouse position in the window, to re-map when the page scrolls. */
    let clientX = -1;
    let clientY = -1;
    let lastPointerAt = -Infinity;
    let rippleCursor = 0;
    let nextIdleRipple = 0;
    let time = 0;

    function toNdc(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
      if (inside) {
        ndc.set(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -(((clientY - rect.top) / rect.height) * 2 - 1)
        );
      }
      return inside;
    }

    /** Where the pointer lands on the surface, in the field's own space. */
    function projectPointer() {
      raycaster.setFromCamera(ndc, camera);
      inverse.copy(points.matrixWorld).invert();
      raycaster.ray.applyMatrix4(inverse);
      if (!raycaster.ray.intersectPlane(surface, hit)) return false;
      target.set(hit.x, hit.z);
      return true;
    }

    function dropRipple(x, z, strength) {
      uniforms.uRipples.value[rippleCursor].set(x, z, time, strength);
      rippleCursor = (rippleCursor + 1) % RIPPLES;
    }

    // The host is pointer-events:none so the form stays usable; listen on the
    // window and map the pointer in.
    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        clientX = event.clientX;
        clientY = event.clientY;
        pointerInside = toNdc(clientX, clientY);
        if (pointerInside) lastPointerAt = time;
      },
      { passive: true, signal }
    );

    // Touch has no hover, so a tap is what starts a ring.
    window.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse") return;
        if (!toNdc(event.clientX, event.clientY) || !projectPointer()) return;
        dropRipple(target.x, target.y, 1);
        lastPointerAt = time;
      },
      { passive: true, signal }
    );

    // Scrolling moves the field under a mouse that has not moved itself.
    window.addEventListener(
      "scroll",
      () => {
        if (clientX < 0) return;
        pointerInside = toNdc(clientX, clientY);
        if (pointerInside) lastPointerAt = time;
      },
      { passive: true, signal }
    );

    // ------------------------------------------------------------ the loop
    let rafId = 0;
    let running = false;
    let lastFrame = 0;
    let morphTarget = 0;
    const smoothed = new THREE.Vector2();
    const CENTRE = new THREE.Vector2(0, 0);
    const ease = (rate, dt) => 1 - Math.exp(-rate * dt);

    function frame(now) {
      rafId = requestAnimationFrame(frame);
      // Clamped, so a tab coming back from the background does not jump.
      const dt = Math.min((now - (lastFrame || now)) / 1000, 0.1);
      lastFrame = now;
      time += dt;
      uniforms.uTime.value = time;

      // Pointer: follow it with a little lag, so the swell glides.
      const present = pointerInside && time - lastPointerAt < 4;
      if (present && projectPointer()) {
        smoothed.lerp(target, ease(7, dt));
        // Rings trail the cursor: one each time it has moved far enough.
        const travelled = smoothed.distanceTo(lastRipple);
        if (travelled > RIPPLE_STEP) {
          dropRipple(smoothed.x, smoothed.y, Math.min(0.45 + travelled / 400, 1));
          lastRipple.copy(smoothed);
        }
      }
      uniforms.uPointer.value.copy(smoothed);
      uniforms.uPresence.value += ((present ? 1 : 0) - uniforms.uPresence.value) * ease(3, dt);

      // Nobody there: let the water move on its own now and then.
      if (time - lastPointerAt > IDLE_AFTER && time > nextIdleRipple) {
        dropRipple(
          (Math.random() - 0.5) * FIELD.width * 0.5,
          (Math.random() - 0.5) * FIELD.depth * 0.4,
          0.55
        );
        nextIdleRipple = time + 2.2 + Math.random() * 1.8;
      }

      // The plane leans toward the cursor; the drift keeps it turning even
      // without one. Both settle out while the hearts are showing.
      ndcSmoothed.lerp(present ? ndc : CENTRE, ease(2.5, dt));
      const settle = 1 - uniforms.uMorph.value;
      placeCamera(
        basePitch + ndcSmoothed.y * 0.06 * settle,
        (ndcSmoothed.x * 0.12 + Math.sin(time * 0.05) * 0.05) * settle
      );

      // Gathers faster than it lets go: the shape should arrive with some
      // intent and then dissolve gently.
      const morph = uniforms.uMorph.value;
      const rate = morphTarget > morph ? 0.9 : 0.55;
      uniforms.uMorph.value += (morphTarget - morph) * ease(rate * 3, dt);

      renderer.render(threeScene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      lastFrame = 0;
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
    visibility.observe(container);
    // Start straight away and let the observer only pause: if it never
    // reports (throttled or unavailable), the effect must still render.
    start();

    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()), {
      signal,
    });

    return {
      /** Gather into hearts, or let them fall back into the surface. */
      celebrate(on) {
        morphTarget = on ? 1 : 0;
        start();
      },
      destroy() {
        stop();
        listeners.abort();
        visibility.disconnect();
        resizeObserver.disconnect();
        tilt.remove(points);
        tilt.remove(lines);
        lineGeometry.dispose();
        lineMaterial.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  // `options` stays reactive on purpose: everything else is read once at
  // setup, but this one follows the component's prop.
  watch(
    () => options.celebrate,
    (on) => scene?.celebrate(Boolean(on))
  );

  let cancelDefer = () => {};
  let cancelWarmup = () => {};

  onMounted(() => {
    if (prefersReducedMotion() || !containerRef.value) return;

    // A decoration a long way down the page: build it only as it comes near,
    // and fetch Three.js in idle time a couple of screens earlier so the
    // download never lands while the visitor is scrolling into the section.
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
      // The component may have unmounted while the chunk was in flight.
      if (!containerRef.value) return;
      scene = createScene(THREE, containerRef.value);
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
