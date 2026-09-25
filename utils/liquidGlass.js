/**
 * Liquid glass: the look of iOS 26's floating bars, where the glass does not
 * just blur what is behind it but bends it - the page appears to curve into
 * the capsule at its rim, the way it would through a thick, rounded lens.
 *
 * The bend is an SVG feDisplacementMap applied as a backdrop filter. The map
 * is drawn here to fit the capsule exactly: neutral grey in the middle (no
 * shift), and towards the rim a push that samples the backdrop from further
 * inside, so the content is squeezed toward the edge like light through the
 * curved side of a lens.
 *
 * Only Chromium renders SVG filters in `backdrop-filter`. Safari parses the
 * property and then draws nothing at all, so this is switched on by engine,
 * not by feature test; everywhere else the glass is a plain frosted blur.
 */

/** True where `backdrop-filter: url(#filter)` actually renders. */
export function supportsRefraction() {
  if (typeof navigator === "undefined") return false;
  const brands = navigator.userAgentData?.brands ?? [];
  return brands.some((brand) => brand.brand === "Chromium");
}

/**
 * A displacement map for a rounded rectangle, as a data URL.
 *
 * Red carries the horizontal shift and green the vertical, both centred on
 * 128. `bezel` is how far in from the rim the bend reaches, in pixels.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} radius Corner radius; half the height for a capsule.
 * @param {number} bezel
 * @returns {string}
 */
export function refractionMap(width, height, radius, bezel) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const r = Math.min(radius, w / 2, h / 2);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(w, h);
  const data = image.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      // The nearest point on the shape's straight "spine": the rectangle
      // left over once the corners' radius is taken off every side.
      const cx = Math.min(Math.max(px, r), w - r);
      const cy = Math.min(Math.max(py, r), h - r);
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy);

      // 1 at the rim, easing to 0 a bezel's width inside it.
      const fromRim = r - dist;
      const t = Math.max(0, 1 - fromRim / bezel);
      const strength = t * t * (3 - 2 * t);

      // Outward normal; the backdrop is read from the opposite way, inside.
      const nx = dist > 0 ? dx / dist : 0;
      const ny = dist > 0 ? dy / dist : 0;

      const i = (y * w + x) * 4;
      data[i] = 128 - nx * strength * 127;
      data[i + 1] = 128 - ny * strength * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
