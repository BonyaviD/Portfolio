import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { loadThree, prefersReducedMotion } from "@/utils/loadThree";

/**
 * The poster stage for the games slider.
 *
 * One quad renders the current and next artwork together, and the change
 * between them is a glitch: the picture dissolves in blocks, the channels
 * split apart, and scanlines roll over the whole thing. It is the vocabulary
 * of a game's own interface rather than a photo crossfade.
 *
 * The accent colour of each slide is sampled from its artwork, so the palette
 * always matches the poster instead of being guessed by hand.
 */

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uFromAspect;
uniform float uToAspect;
uniform float uProgress;
uniform float uTime;
uniform vec2 uParallax;
uniform vec2 uCard;
uniform float uRadius;
uniform float uSeam;
uniform vec3 uAccent;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * valueNoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

/** Cover-fit so artwork of any shape fills the card without stretching. */
vec2 cover(vec2 uv, float imageAspect, float boxAspect) {
  vec2 scale = imageAspect > boxAspect
    ? vec2(boxAspect / imageAspect, 1.0)
    : vec2(1.0, imageAspect / boxAspect);
  return (uv - 0.5) * scale + 0.5;
}

/**
 * Golden-angle spiral blur. Radius is driven per-pixel, so the picture melts
 * from sharp on the right into a soft wash on the left in one pass.
 */
vec3 blurred(sampler2D tex, vec2 uv, float radius, float aspect) {
  if (radius < 0.0005) return texture2D(tex, uv).rgb;

  vec3 sum = vec3(0.0);
  const int TAPS = 16;
  for (int i = 0; i < TAPS; i++) {
    float t = (float(i) + 0.5) / float(TAPS);
    float angle = float(i) * 2.39996;
    vec2 offset = vec2(cos(angle), sin(angle)) * sqrt(t) * radius;
    offset.y *= aspect;
    sum += texture2D(tex, uv + offset).rgb;
  }
  return sum / float(TAPS);
}

void main() {
  vec2 p = (vUv - 0.5) * uCard;
  float card = 1.0 - smoothstep(-1.5, 1.5, roundedBox(p, uCard * 0.5, uRadius));
  if (card <= 0.002) discard;

  float boxAspect = uCard.x / uCard.y;

  // Peaks mid-change, zero at rest.
  float burst = sin(clamp(uProgress, 0.0, 1.0) * 3.14159);

  // Horizontal bands tear sideways during the change.
  float band = floor(vUv.y * 22.0);
  float tear = (hash(vec2(band, floor(uTime * 12.0))) - 0.5) * 0.14 * burst;

  vec2 uv = vUv + uParallax;
  uv.x += tear;

  /**
   * The seam. A straight edge would read as two images bolted together, so
   * the boundary is warped by drifting noise and given a soft falloff: the
   * picture dissolves into the blur instead of being cut against it.
   */
  float warp = fbm(vec2(vUv.y * 2.6, uTime * 0.06)) - 0.5;
  float edge = uSeam + warp * 0.16;
  float wash = 1.0 - smoothstep(edge - 0.26, edge + 0.16, vUv.x);

  float split = 0.012 * burst;
  float radius = wash * 0.05 + burst * 0.004;

  vec2 fromUv = cover(uv, uFromAspect, boxAspect);
  vec2 toUv = cover(uv, uToAspect, boxAspect);

  vec3 from = blurred(uFrom, fromUv, radius, boxAspect);
  vec3 to = blurred(uTo, toUv, radius, boxAspect);

  // Channel split, strongest mid-change, only where the picture is sharp.
  float sharp = 1.0 - wash;
  from.r = mix(from.r, texture2D(uFrom, fromUv + vec2(split, 0.0)).r, sharp);
  from.b = mix(from.b, texture2D(uFrom, fromUv - vec2(split, 0.0)).b, sharp);
  to.r = mix(to.r, texture2D(uTo, toUv + vec2(split, 0.0)).r, sharp);
  to.b = mix(to.b, texture2D(uTo, toUv - vec2(split, 0.0)).b, sharp);

  // Dissolve in blocks rather than a flat fade.
  float block = hash(floor(vUv * vec2(14.0, 24.0)));
  float mask = smoothstep(block * 0.55, block * 0.55 + 0.45, uProgress);
  vec3 color = mix(from, to, mask);

  // Darken and tint the washed side so the copy on top stays readable.
  vec3 tinted = mix(color * 0.34, uAccent * 0.5, 0.35);
  color = mix(color, tinted, wash * 0.92);

  // A faint glow along the seam so the join reads as deliberate.
  float seamGlow = exp(-abs(vUv.x - edge) * 26.0) * 0.16;
  color += uAccent * seamGlow;

  // A bright edge riding the dissolve front.
  color += vec3(0.55, 0.42, 0.18) * (1.0 - abs(mask * 2.0 - 1.0)) * burst * 0.45;

  // Rolling scanlines, and a sweep while the picture changes.
  color *= 0.94 + 0.06 * sin(vUv.y * 780.0);
  color += 0.05 * burst * smoothstep(0.0, 0.08, abs(fract(vUv.y - uTime * 0.35) - 0.5));

  // Vignette so the card sits into the page.
  color *= mix(0.78, 1.0, smoothstep(1.25, 0.35, length(vUv - 0.5) * 1.25));

  gl_FragColor = vec4(color, card);
  #include <colorspace_fragment>
}`;

/**
 * The most characterful colour in an image.
 *
 * A plain average of artwork turns to mud, so pixels are weighted by
 * saturation and penalised at the extremes of brightness. That lands on the
 * colour a person would name if asked what the poster looks like.
 */
function sampleAccent(image) {
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, size, size);

  let data;
  try {
    data = context.getImageData(0, 0, size, size).data;
  } catch {
    // Tainted canvas: the artwork is same-origin today, but never throw here.
    return null;
  }

  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const [pr, pg, pb] = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
    const max = Math.max(pr, pg, pb);
    const min = Math.min(pr, pg, pb);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const brightness = (max + min) / 2;

    // Favour saturated, mid-bright pixels; ignore near-black and near-white.
    const weight = saturation * saturation * Math.sin(Math.PI * brightness) + 0.02;

    r += pr * weight;
    g += pg * weight;
    b += pb * weight;
    total += weight;
  }

  if (!total) return null;

  const norm = (value) => Math.min(1, value / total);
  const rgb = [norm(r), norm(g), norm(b)];
  const css = `rgb(${rgb.map((v) => Math.round(v * 255)).join(" ")})`;
  return { rgb, css };
}

/**
 * @param {object} containerRef Vue ref holding the host element.
 * @param {object} options
 * @param {Array<{src: string}>} options.games Ordered games to render.
 * @returns {object} stage controls and state
 */
export function useGameStage(containerRef, options = {}) {
  const { games = [] } = options;

  const isActive = ref(false);
  const index = ref(0);
  /** Accent colour per game, filled in once the artwork decodes. */
  const accents = shallowRef([]);
  /** The same colours as shader-ready triples. */
  let accentRgb = [];

  let scene = null;

  function createScene(THREE, container, textures) {
    const listeners = new AbortController();
    const { signal } = listeners;
    const animated = !prefersReducedMotion();

    const threeScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(container.clientHeight, 1),
      1,
      3000
    );
    camera.position.z = 800;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    for (const texture of textures) texture.colorSpace = THREE.SRGBColorSpace;

    const aspectOf = (i) => textures[i].image.width / textures[i].image.height;

    const uniforms = {
      uFrom: { value: textures[0] },
      uTo: { value: textures[0] },
      uFromAspect: { value: aspectOf(0) },
      uToAspect: { value: aspectOf(0) },
      uProgress: { value: 1 },
      uTime: { value: 0 },
      uParallax: { value: new THREE.Vector2(0, 0) },
      uCard: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: 18 },
      /** Where the sharp picture gives way to the blurred wash, in card UV. */
      uSeam: { value: 0.44 },
      uAccent: { value: new THREE.Color(0.9, 0.71, 0.42) },
    };

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      uniforms,
    });
    const poster = new THREE.Mesh(geometry, material);
    threeScene.add(poster);

    /**
     * The card fills the stage. On wide viewports the left part of it is
     * washed out so the copy can sit on top; on narrow ones the copy moves
     * below the card, so almost none of the picture is blurred.
     */
    function layout() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      const viewHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const viewWidth = viewHeight * camera.aspect;

      poster.scale.set(viewWidth, viewHeight, 1);
      poster.position.x = 0;
      uniforms.uCard.value.set(viewWidth, viewHeight);

      const split = width >= 900;
      uniforms.uSeam.value = split ? 0.46 : 0.04;
      // Corner radius in world units, matched to the CSS card radius.
      uniforms.uRadius.value = (viewHeight / height) * 28;
    }

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(container);
    layout();

    // ------------------------------------------------------------- parallax
    const parallaxTarget = { x: 0, y: 0 };

    window.addEventListener(
      "pointermove",
      (event) => {
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        parallaxTarget.x = -((event.clientX - rect.left) / rect.width - 0.5) * 0.03;
        parallaxTarget.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.03;
      },
      { passive: true, signal }
    );

    // ----------------------------------------------------------- transition
    let progress = 1;
    let fromIndex = 0;
    let toIndex = 0;

    function show(next) {
      const target = ((next % games.length) + games.length) % games.length;
      if (target === toIndex && progress >= 1) return;

      // Interrupting mid-change: whatever is on screen becomes the new source.
      fromIndex = progress < 1 ? toIndex : toIndex;
      toIndex = target;

      uniforms.uFrom.value = textures[fromIndex];
      uniforms.uFromAspect.value = aspectOf(fromIndex);
      uniforms.uTo.value = textures[toIndex];
      uniforms.uToAspect.value = aspectOf(toIndex);

      const rgb = accentRgb[toIndex] ?? [0.9, 0.71, 0.42];
      uniforms.uAccent.value.setRGB(rgb[0], rgb[1], rgb[2]);

      progress = animated ? 0 : 1;
      uniforms.uProgress.value = progress;
      index.value = toIndex;
    }

    const clock = new THREE.Clock();
    let rafId = 0;
    let running = false;

    function frame() {
      rafId = requestAnimationFrame(frame);
      const delta = Math.min(clock.getDelta(), 0.05);

      if (progress < 1) {
        progress = Math.min(1, progress + delta * 1.5);
        uniforms.uProgress.value = progress;
      }

      uniforms.uTime.value = clock.elapsedTime;
      uniforms.uParallax.value.x +=
        (parallaxTarget.x - uniforms.uParallax.value.x) * 0.06;
      uniforms.uParallax.value.y +=
        (parallaxTarget.y - uniforms.uParallax.value.y) * 0.06;

      renderer.render(threeScene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      clock.start();
      frame();
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
    // Start regardless: the observer only pauses.
    start();

    document.addEventListener(
      "visibilitychange",
      () => (document.hidden ? stop() : start()),
      { signal }
    );

    return {
      show,
      applyAccent(i) {
        const rgb = accentRgb[i] ?? [0.9, 0.71, 0.42];
        uniforms.uAccent.value.setRGB(rgb[0], rgb[1], rgb[2]);
      },
      destroy() {
        stop();
        listeners.abort();
        visibility.disconnect();
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        for (const texture of textures) texture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }

  onMounted(async () => {
    if (!games.length) return;

    try {
      const THREE = await loadThree();
      const loader = new THREE.TextureLoader();
      const textures = await Promise.all(games.map((game) => loader.loadAsync(game.src)));

      const sampled = textures.map((texture) => sampleAccent(texture.image));
      accents.value = sampled.map((accent) => accent?.css ?? null);
      accentRgb = sampled.map((accent) => accent?.rgb ?? [0.9, 0.71, 0.42]);

      if (!containerRef.value) {
        for (const texture of textures) texture.dispose();
        return;
      }

      scene = createScene(THREE, containerRef.value, textures);
      scene.applyAccent(0);
      isActive.value = true;
    } catch (error) {
      // The DOM slides stay usable without the stage.
      console.warn("Game stage disabled:", error.message);
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
    index,
    accents,
    show: (next) => scene?.show(next),
  };
}
