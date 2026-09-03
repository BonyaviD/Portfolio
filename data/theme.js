/**
 * Brand values that have to exist as plain strings.
 *
 * WebGL and canvas APIs cannot read CSS custom properties, so the few colours
 * the effects need are declared here rather than being retyped at each call
 * site. Keep them in step with assets/css/tokens.css.
 */
export const effectPalette = {
  /** Matches --color-bg. */
  background: "#0d1b2a",
  /** Matches --color-primary; the aurora's brightest highlight. */
  accent: "#e6b66c",
  /** Mid-tone of the aurora; sits between background and accent. */
  auroraMid: "#123a5c",
};
