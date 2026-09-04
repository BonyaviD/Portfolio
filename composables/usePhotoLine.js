import { onBeforeUnmount, onMounted, ref } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";
import { formatPhotoDate } from "@/composables/usePhotoFeed";

/**
 * Photos as instant-camera prints pegged to a washing line, with a string of
 * warm fairy lights running along the same line.
 *
 * Each print hangs from its own peg and swings a little, and the picture
 * inside starts undeveloped: flat, dark, almost blank. Pointing at a print
 * develops it from the bottom up into the photo exactly as it was shot - no
 * contrast push, no grade - the way a real instant photo comes in.
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

/** Value noise, summed over four octaves: the ragged edge of the burn. */
const NOISE = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += valueNoise(p) * amp;
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}`;

const PRINT_FRAGMENT = `
varying vec2 vUv;

uniform sampler2D uMap;
/** Caption written on the paper: transparent everywhere but the ink. */
uniform sampler2D uLabel;
uniform float uImageAspect;
uniform float uDevelop;
uniform vec2 uCard;
/** Photo window insets as fractions of the card: left, right, top, bottom. */
uniform vec4 uMargins;
uniform float uRadius;
/** Per-print offset into the noise, so no two burn the same way. */
uniform float uSeed;
${SDF}
${NOISE}

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

    // Developed: the photo as it was shot. Nothing is graded on top of it,
    // so a finished print reads as the true image.
    vec3 developed = image;

    // Undeveloped: the milky, near-flat emulsion before it comes in.
    // Not named "flat": that is a reserved word in GLSL.
    float rawLuma = dot(image, vec3(0.299, 0.587, 0.114));
    vec3 undeveloped = mix(vec3(0.105, 0.115, 0.125), vec3(rawLuma), 0.16);

    // The picture comes in the way paper takes fire: a hole opens in the
    // middle and eats outwards in rings, its edge chewed up by noise so it
    // never reads as a circle, with the ember riding that edge.
    vec2 rel = (puv - 0.5) * vec2(boxAspect, 1.0);
    float burn = length(rel)
      - (fbm(puv * 3.6 + uSeed) - 0.5) * 0.42
      - (fbm(puv * 11.0 + uSeed * 1.7) - 0.5) * 0.11;

    // Runs past the far corner so the last scraps of paper always catch.
    float front = mix(-0.22, 1.15, uDevelop);
    float reveal = 1.0 - smoothstep(front - 0.05, front + 0.05, burn);
    vec3 photo = mix(undeveloped, developed, reveal);

    // The ember: a narrow orange line on the edge with a white-hot core,
    // burning out once the whole print has caught.
    float ember = exp(-abs(burn - front) * 24.0);
    float alive = 1.0 - smoothstep(0.82, 1.0, uDevelop);
    photo += (vec3(1.0, 0.36, 0.06) * ember
      + vec3(1.0, 0.82, 0.45) * pow(ember, 4.0)) * alive * 0.85;

    // Scorch: the paper just ahead of the ember browns before it goes.
    float scorch = exp(-max(burn - front, 0.0) * 16.0) * alive;
    photo = mix(photo, photo * vec3(1.35, 0.72, 0.42), scorch * 0.5);

    // Corners sit slightly darker, as prints do - but that shading lifts as
    // the print finishes, so a developed photo is not tinted by anything.
    float vignette = smoothstep(1.15, 0.35, length(puv - 0.5) * 1.35);
    color = photo * mix(mix(0.88, 1.0, vignette), 1.0, uDevelop);
  }

  // The caption is marker on paper, not part of the emulsion, so it is there
  // before the picture is and never develops with it.
  vec4 ink = texture2D(uLabel, vUv);
  color = mix(color, ink.rgb, ink.a);

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

/**
 * One bulb of the fairy lights. Drawn as a point sprite: a wide warm halo
 * with a hot little filament in the middle, each on its own slow flicker.
 */
const BULB_VERTEX = `
attribute float aPhase;
attribute float aSize;
varying float vGlow;

uniform float uTime;
/** World units to framebuffer pixels, so bulbs keep their size on resize. */
uniform float uScale;

void main() {
  vGlow = 0.78 + 0.22 * sin(uTime * 1.5 + aPhase);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale;
  gl_Position = projectionMatrix * mv;
}`;

const BULB_FRAGMENT = `
varying float vGlow;

uniform vec3 uHalo;
uniform vec3 uCore;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;

  // Three falloffs stacked: the wide spill on the wall, the warm ball of
  // light around the glass, and the filament itself.
  float bloom = pow(1.0 - d, 1.5);
  float halo = pow(1.0 - d, 4.5);
  float core = smoothstep(0.19, 0.03, d);

  vec3 color = uHalo * (bloom * 0.8 + halo * 1.5) + uCore * core * 1.9;
  float alpha = clamp(bloom * 0.58 + halo + core, 0.0, 1.0);

  gl_FragColor = vec4(color * vGlow, alpha * vGlow);
  #include <colorspace_fragment>
}`;

/** Print size and depth, cycled so neighbours never match. */
const SIZE_PATTERN = [1, 0.82, 0.93, 1.08, 0.86, 1.02, 0.9];
const DEPTH_PATTERN = [30, -120, -40, 80, -150, -10, -85];

const CARD_WIDTH = 380;
/** Phones read the same world units on a third of the width, so they get a
    smaller print - at 380 a single card runs past both edges of the screen. */
const CARD_WIDTH_NARROW = 300;
const NARROW_VIEWPORT = 768;
/** Instant prints are a touch taller than wide, with a heavy bottom border. */
const CARD_RATIO = 1.19;
const MARGINS = { left: 0.07, right: 0.07, top: 0.06, bottom: 0.2 };
const GAP = 96;

/** How far the line dips between pegs. Its height is derived per scene. */
const SAG = 26;

/** Clothespins, in world units. Fixed, so every print clips on identically. */
const PEG_WIDTH = 24;
const PEG_HEIGHT = 46;
/** Peg centre relative to the line, so it straddles cord and paper. */
const PEG_Y = 4;

/** Fairy lights: spacing between bulbs, and how finely the cord is drawn. */
const BULB_GAP = 40;
const CORD_STEPS = 200;
/** Sprite sizes in world units, cycled so the string is not uniform. */
const BULB_SIZES = [54, 62, 70];

/* ------------------------------------------------------- written captions */

/** Marker handwriting, mirroring --font-family-marker in tokens.css. */
const MARKER_FONT = '"Permanent Marker", "Vazirmatn", "Segoe Script", cursive';
/** Arabic script, so a Persian caption is laid out right to left. */
const RTL = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const INK = "#1b1c20";
/** Degrees of tilt per print, so no two captions are written the same. */
const TILT_PATTERN = [-1.7, 1.2, -0.9, 1.9, -1.4, 0.7, -2.1];
/** Canvas pixels per world unit for the caption texture. */
const LABEL_SCALE = 2;

/** 1200 -> "1.2K": the counters are a detail, not a figure to read exactly. */
function compactCount(value) {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

/**
 * Telegram captions are whole posts; the paper gets the opening line.
 *
 * Plenty of posts carry no caption at all, and those prints are left blank
 * rather than captioned with a stand-in: a row of identical placeholders
 * reads far worse than a print with only its date on it.
 */
function captionOf(photo) {
  return (
    (photo.description ?? "")
      .split("\n")
      .map((part) => part.trim())
      .find(Boolean) ?? ""
  );
}

/**
 * Writes the caption onto a transparent, card-shaped canvas so the print
 * shader can composite it as ink. Only the thick bottom border is written on:
 * everything above it is the photo window and must stay clear.
 */
function drawLabel(photo, width, height, tilt) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * LABEL_SCALE));
  canvas.height = Math.max(1, Math.round(height * LABEL_SCALE));

  const caption = captionOf(photo);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const bandTop = canvas.height * (1 - MARGINS.bottom);
  const band = canvas.height - bandTop;
  const maxWidth = canvas.width * 0.82;

  // Date and the channel's own counters, written the way you would note them
  // on the back of a print. Any of them may be missing.
  const footnote = [
    formatPhotoDate(photo.date),
    photo.views ? `${compactCount(photo.views)} views` : "",
    photo.reactions ? `${compactCount(photo.reactions)} likes` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  if (!caption && !footnote) return canvas;

  // With no caption the footnote takes the middle of the band on its own.
  const captionY = caption ? (footnote ? 0.4 : 0.5) : 0;
  ctx.translate(canvas.width / 2, bandTop + band * (caption ? captionY : 0.5));
  ctx.rotate((tilt * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;

  let size = Math.round(band * 0.34);

  if (caption) {
    // Persian captions have to be laid out right to left, or the trailing
    // punctuation ends up on the wrong side of the line. They are also set
    // heavier: Permanent Marker is a very bold face, and Vazirmatn beside it
    // at a normal weight reads as a different, thinner voice.
    const persian = RTL.test(caption);
    ctx.direction = persian ? "rtl" : "ltr";
    const face = persian ? "600 " : "";

    // Shrink to fit first, and only clip once the type is as small as it
    // should go - a caption reads better small than truncated.
    const floor = Math.round(band * 0.21);
    ctx.font = `${face}${size}px ${MARKER_FONT}`;
    while (size > floor && ctx.measureText(caption).width > maxWidth) {
      size -= 1;
      ctx.font = `${face}${size}px ${MARKER_FONT}`;
    }

    let text = caption;
    while (text.length > 1 && ctx.measureText(text).width > maxWidth) {
      text = `${text.slice(0, -2)}…`;
    }
    ctx.fillText(text, 0, 0);
  }

  if (footnote) {
    // The footnote gets whatever room is left: shrink it rather than let it
    // run past the paper.
    ctx.direction = "ltr";
    let noteSize = Math.round(size * (caption ? 0.66 : 0.78));
    ctx.font = `${noteSize}px ${MARKER_FONT}`;
    while (noteSize > 8 && ctx.measureText(footnote).width > maxWidth) {
      noteSize -= 1;
      ctx.font = `${noteSize}px ${MARKER_FONT}`;
    }
    // Held back from the caption, but only just: at 0.55 it was not readable
    // against the paper at the size these prints are drawn.
    ctx.globalAlpha = 0.85;
    ctx.fillText(footnote, 0, caption ? band * 0.31 : 0);
  }

  return canvas;
}

/**
 * The caption is drawn into a canvas, so the webfont has to be resident
 * before anything is measured or the labels are set in the fallback face.
 */
async function waitForMarkerFont() {
  if (!document.fonts) return;
  try {
    await Promise.race([
      Promise.all([
        // Both, explicitly: the captions are a mix of Latin and Persian and
        // the two faces cover one script each.
        document.fonts.load('48px "Permanent Marker"'),
        document.fonts.load('48px "Vazirmatn"'),
      ]).then(() => document.fonts.ready),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // Falls back to the next face in the stack.
  }
}

export function usePhotoLine(containerRef, options = {}) {
  const { photos = [] } = options;

  const isActive = ref(false);
  const activeIndex = ref(-1);
  let scene = null;

  function createScene(THREE, container, placeholder) {
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

    // The container is display:none until the scene reports itself live, so
    // its own width is not readable yet; the wall is full-bleed, so the
    // viewport stands in for it.
    const cardBase =
      window.innerWidth < NARROW_VIEWPORT ? CARD_WIDTH_NARROW : CARD_WIDTH;

    // Prints hang below the line, so the line sits half an average card above
    // centre; otherwise the whole wall rides high with dead space under it.
    const lineTop = Math.round((cardBase * 0.95 * CARD_RATIO) / 2);

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

    photos.forEach((photo, i) => {
      const scale = SIZE_PATTERN[i % SIZE_PATTERN.length];
      const width = cardBase * scale;
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

      const labelTexture = new THREE.CanvasTexture(
        drawLabel(photo, width, height, TILT_PATTERN[i % TILT_PATTERN.length])
      );
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      labelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const printMaterial = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: PRINT_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMap: { value: placeholder },
          uLabel: { value: labelTexture },
          uImageAspect: { value: 1 },
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
          uSeed: { value: i * 7.31 },
        },
      });
      const print = new THREE.Mesh(geometry, printMaterial);
      print.scale.set(width, height, 1);
      print.position.y = -height / 2;
      print.userData.index = i;
      group.add(print);

      // A peg is a real object: one size, whatever it is holding, clipped at
      // the same height on every print. Sizing it off the card is what made
      // the small and large prints hang differently.
      const pegMaterial = makePlate("#e6b66c", 1, 1.5);
      pegMaterial.uniforms.uCard.value.set(PEG_WIDTH, PEG_HEIGHT);
      pegMaterial.uniforms.uRadius.value = PEG_WIDTH * 0.32;
      const peg = new THREE.Mesh(geometry, pegMaterial);
      peg.scale.set(PEG_WIDTH, PEG_HEIGHT, 1);
      peg.position.set(0, PEG_Y, 4);
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
        texture: null,
        develop: 0,
        phase: (i * 1.7) % (Math.PI * 2),
        // Perspective throws anything off the z=0 plane away from the centre
        // of the screen, so near prints hung above the cord and far ones
        // below it - and since depth and size are cycled together, that read
        // as the large and small prints clipping on differently. Dividing the
        // placement by the same factor lands every peg back on the line, and
        // depth still does its job on the print's size.
        parallax: (camera.position.z - group.position.z) / camera.position.z,
      });

      cursor += width + GAP;
    });

    const wrapWidth = cursor - GAP + GAP;

    /** A gentle periodic dip, so the sag stays continuous across the wrap. */
    function lineY(x) {
      return lineTop - SAG * Math.cos((x / wrapWidth) * Math.PI * 2);
    }

    // ------------------------------------------- the line and its fairy lights
    // The cord is a dim warm wire rather than a visible rope: what the eye
    // should read along the line is the row of bulbs threaded onto it.
    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#7d6b56"),
      transparent: true,
      opacity: 0.5,
    });
    const lineGeometry = new THREE.BufferGeometry();
    const line = new THREE.Line(lineGeometry, lineMaterial);
    threeScene.add(line);

    const bulbMaterial = new THREE.ShaderMaterial({
      vertexShader: BULB_VERTEX,
      fragmentShader: BULB_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 1 },
        uHalo: { value: new THREE.Color("#ffc878") },
        uCore: { value: new THREE.Color("#fff4d6") },
      },
    });
    const bulbGeometry = new THREE.BufferGeometry();
    const bulbs = new THREE.Points(bulbGeometry, bulbMaterial);
    // Frustum culling reads the bounding sphere, which the per-frame position
    // rewrite never updates; the string spans the view anyway.
    bulbs.frustumCulled = false;
    threeScene.add(bulbs);

    let stringHalf = 0;
    let bulbCount = 0;

    function visibleWidth() {
      return 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    }

    // gl_PointSize is capped by the driver - 64 on some mobile GPUs - and a
    // sprite past the cap is silently clipped, so the string is scaled to fit.
    const gl = renderer.getContext();
    const maxPointSize = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];

    /** Bulbs are sized in world units, so convert once per resize. */
    function worldToPixels() {
      const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const scale = (container.clientHeight / visibleHeight) * renderer.getPixelRatio();
      return Math.min(scale, maxPointSize / Math.max(...BULB_SIZES));
    }

    /** Allocates the cord and the bulbs for the current viewport width. */
    function buildString() {
      stringHalf = visibleWidth() / 2 + 220;

      lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array((CORD_STEPS + 1) * 3), 3)
      );

      bulbCount = Math.max(2, Math.round((stringHalf * 2) / BULB_GAP));
      const phase = new Float32Array(bulbCount);
      const size = new Float32Array(bulbCount);
      for (let i = 0; i < bulbCount; i++) {
        // The golden angle keeps neighbouring bulbs out of step with each other.
        phase[i] = (i * 2.399) % (Math.PI * 2);
        size[i] = BULB_SIZES[i % BULB_SIZES.length];
      }

      bulbGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(bulbCount * 3), 3)
      );
      bulbGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
      bulbGeometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

      bulbMaterial.uniforms.uScale.value = worldToPixels();
      updateString();
    }

    /** Rides the cord and the bulbs along with the line's current sag. */
    function updateString() {
      const cord = lineGeometry.attributes.position;
      for (let i = 0; i <= CORD_STEPS; i++) {
        const x = -stringHalf + (i / CORD_STEPS) * stringHalf * 2;
        cord.array[i * 3] = x;
        cord.array[i * 3 + 1] = lineY(x - offset);
        cord.array[i * 3 + 2] = 0;
      }
      cord.needsUpdate = true;

      const points = bulbGeometry.attributes.position;
      for (let i = 0; i < bulbCount; i++) {
        const x = -stringHalf + (i / (bulbCount - 1)) * stringHalf * 2;
        points.array[i * 3] = x;
        // Bulbs hang just under the wire they are clipped to.
        points.array[i * 3 + 1] = lineY(x - offset) - 5;
        points.array[i * 3 + 2] = 6;
      }
      points.needsUpdate = true;
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
      if (width && height) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      // Built even at zero size: the wall is display:none until the scene
      // reports itself live, so the first layout the container ever has is
      // the one the ResizeObserver delivers *after* the loop is running.
      buildString();
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
        item.group.position.x = x * item.parallax;
        item.group.position.y = lineY(x - offset) * item.parallax;
        // A slow swing, faster while the line is actually moving.
        const energy = 1 + Math.min(Math.abs(velocity) * 0.05, 2.5);
        item.group.rotation.z =
          Math.sin(time * 0.8 + item.phase) * 0.035 * energy;
      }
      updateString();
      bulbMaterial.uniforms.uTime.value = time;

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
      /** Drops a photo into a print that is already hanging on the line. */
      adopt(index, texture) {
        const item = items[index];
        if (!item) return false;

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        item.texture?.dispose();
        item.texture = texture;
        item.printMaterial.uniforms.uMap.value = texture;
        item.printMaterial.uniforms.uImageAspect.value =
          texture.image.width / texture.image.height;
        return true;
      },
      destroy() {
        stop();
        listeners.abort();
        visibility.disconnect();
        resizeObserver.disconnect();
        geometry.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        bulbGeometry.dispose();
        bulbMaterial.dispose();
        placeholder.dispose();
        for (const item of items) {
          item.texture?.dispose();
          item.printMaterial.uniforms.uLabel.value.dispose();
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
      await waitForMarkerFont();
      if (!containerRef.value) return;

      // The line goes up before a single photo has arrived. An undeveloped
      // print is nearly flat dark anyway, so a placeholder is indistinguishable
      // from a loaded print that has not been pointed at yet - the wall is
      // there immediately and the photos land inside it as they come in,
      // rather than everyone waiting on the slowest of sixteen downloads.
      const placeholder = new THREE.DataTexture(
        new Uint8Array([26, 29, 33, 255]),
        1,
        1
      );
      placeholder.colorSpace = THREE.SRGBColorSpace;
      placeholder.needsUpdate = true;

      scene = createScene(THREE, containerRef.value, placeholder);
      isActive.value = true;

      const loader = new THREE.TextureLoader();
      for (const [index, photo] of photos.entries()) {
        loader
          .loadAsync(photo.src)
          .then((texture) => {
            // Unmounted mid-flight: nothing owns this, so drop it here.
            if (!scene?.adopt(index, texture)) texture.dispose();
          })
          .catch((error) => {
            console.warn(`Photo ${index} failed to load:`, error.message);
          });
      }
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
