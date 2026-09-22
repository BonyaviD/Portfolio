/**
 * The language layer, as plain functions with no Nuxt or Vue imports, so the
 * tests can load it directly.
 *
 * English lives at the root ("/", "/about") and Persian under "/fa" ("/fa",
 * "/fa/about"). The locale is read from the path, never from a cookie or the
 * Accept-Language header: every URL renders one language, so the edge cache
 * can store it and a search engine can index both.
 *
 * Translatable text is written as `{ en: "...", fa: "..." }` right where it is
 * used - in the data files and data/ui.js - so the two versions of a sentence
 * sit next to each other and cannot drift apart unnoticed.
 */

export const LOCALES = {
  en: {
    code: "en",
    dir: "ltr",
    prefix: "",
    /** Intl locale for numbers and dates. */
    intl: "en-GB",
    ogLocale: "en_US",
    /** The name of the language, in that language. */
    name: "English",
    short: "EN",
  },
  fa: {
    code: "fa",
    dir: "rtl",
    prefix: "/fa",
    intl: "fa-IR",
    ogLocale: "fa_IR",
    name: "فارسی",
    short: "فا",
  },
};

export const DEFAULT_LOCALE = "en";
export const LOCALE_CODES = Object.keys(LOCALES);

/** "fa" for "/fa" and anything under it, otherwise the default. */
export function localeFromPath(path = "/") {
  for (const code of LOCALE_CODES) {
    const { prefix } = LOCALES[code];
    if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) return code;
  }
  return DEFAULT_LOCALE;
}

/** The path with its locale prefix removed: "/fa/about" -> "/about". */
export function stripLocale(path = "/") {
  const { prefix } = LOCALES[localeFromPath(path)];
  if (!prefix) return path || "/";
  return path.slice(prefix.length) || "/";
}

/** A locale-free path, placed under `code`: ("/about", "fa") -> "/fa/about". */
export function localizePath(path, code) {
  const { prefix } = LOCALES[code] ?? LOCALES[DEFAULT_LOCALE];
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

/** True for a `{ en, fa }` pair. */
export function isTranslation(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value[DEFAULT_LOCALE] !== "undefined"
  );
}

/**
 * Picks the `code` version of a `{ en, fa }` pair and fills `{name}` style
 * placeholders from `vars`. Anything that is not a pair - a brand name, a URL
 * - passes through untouched, so call sites need not know which is which.
 */
export function translate(value, code = DEFAULT_LOCALE, vars = null) {
  let picked = isTranslation(value) ? (value[code] ?? value[DEFAULT_LOCALE]) : value;
  if (typeof picked !== "string") return picked;
  if (vars) {
    picked = picked.replace(/\{(\w+)\}/g, (match, key) =>
      key in vars ? String(vars[key]) : match
    );
  }
  return LOCALES[code]?.dir === "rtl" ? keepListOrder(picked) : picked;
}

/**
 * "Next.js، Nuxt و Three.js" has to read Next.js first, right to left.
 *
 * The Persian comma is neutral to the bidi algorithm, so between two Latin
 * words it joins them into one left-to-right run - and a Persian reader then
 * meets Nuxt before Next.js, with the comma on the wrong side of both. A
 * right-to-left mark after the comma ends the run there, which is what a
 * Persian typesetter does by hand.
 */
const LATIN_COMMA_LATIN = /([A-Za-z0-9.)+#])،\s*(?=[A-Za-z(])/g;
const RLM = "‏";

function keepListOrder(text) {
  return text.replace(LATIN_COMMA_LATIN, `$1،${RLM} `);
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** "6" -> "۶". For numbers written inside the data files' Persian copy. */
export function persianDigits(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[digit]);
}
