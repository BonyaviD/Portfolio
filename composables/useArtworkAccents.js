import { onBeforeUnmount, onMounted, shallowRef } from "vue";

/**
 * Pulls a usable accent colour out of artwork.
 *
 * A plain average turns to mud, so pixels are weighted by saturation and
 * penalised at the extremes of brightness. That lands on the colour a person
 * would name if asked what the artwork looks like.
 *
 * @param {HTMLImageElement} image Decoded, same-origin image.
 * @returns {{ rgb: number[], css: string } | null}
 */
export function sampleAccent(image) {
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
    // Tainted canvas: artwork is same-origin today, but never throw here.
    return null;
  }

  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i] / 255;
    const pg = data[i + 1] / 255;
    const pb = data[i + 2] / 255;

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
  return {
    rgb,
    css: `rgb(${rgb.map((value) => Math.round(value * 255)).join(" ")})`,
  };
}

/** The colour used until artwork has decoded, and if sampling fails. */
const FALLBACK = { rgb: [0.9, 0.71, 0.42], css: "rgb(230 182 108)" };

/**
 * Loads artwork purely to sample it, for sections that render with CSS rather
 * than WebGL. Decoding is best-effort: a failure just leaves the fallback.
 *
 * @param {string[]} sources Image URLs, in order.
 * @returns {{ accents: import("vue").ShallowRef<Array> }}
 */
export function useArtworkAccents(sources = []) {
  const accents = shallowRef(sources.map(() => FALLBACK));
  let cancelled = false;

  onMounted(async () => {
    const results = await Promise.all(
      sources.map(
        (src) =>
          new Promise((resolve) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => resolve(sampleAccent(image) ?? FALLBACK);
            image.onerror = () => resolve(FALLBACK);
            image.src = src;
          })
      )
    );

    if (!cancelled) accents.value = results;
  });

  onBeforeUnmount(() => {
    cancelled = true;
  });

  return { accents };
}
