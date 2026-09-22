import { computed } from "vue";
import {
  LOCALES,
  localeFromPath,
  localizePath,
  stripLocale,
  translate,
} from "@/utils/i18n";

/**
 * The current language, derived from the route, and the helpers every
 * component formats its text with.
 *
 * Reading it from the path keeps the server and the browser in agreement by
 * construction: both see the same URL, so a hydration can never start in one
 * language and finish in the other.
 */
export function useLocale() {
  const route = useRoute();

  const code = computed(() => localeFromPath(route.path));
  const locale = computed(() => LOCALES[code.value]);
  const isRtl = computed(() => locale.value.dir === "rtl");

  /** The other language - there are two, so the switch is a toggle. */
  const otherCode = computed(() => (code.value === "fa" ? "en" : "fa"));
  const other = computed(() => LOCALES[otherCode.value]);

  /** This page without its language prefix, e.g. "/about". */
  const basePath = computed(() => stripLocale(route.path));

  /** Picks this language's side of a `{ en, fa }` pair. */
  const t = (value, vars) => translate(value, code.value, vars);

  /** A path in the current language: path("/about") -> "/fa/about". */
  const path = (to = "/") => localizePath(to, code.value);

  /** The same page in the other language. */
  const switchPath = computed(() => localizePath(basePath.value, otherCode.value));

  /** Numbers in this language's digits: 1200 -> "1,200" or "۱٬۲۰۰". */
  const number = (value, options) =>
    new Intl.NumberFormat(locale.value.intl, options).format(value);

  return { code, locale, isRtl, other, otherCode, basePath, t, path, switchPath, number };
}
