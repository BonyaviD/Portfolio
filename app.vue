<script setup>
import juraLatin from "~/assets/fonts/Jura-400-8.woff2?url";
import vazirmatnArabic from "~/assets/fonts/Vazirmatn-var-arabic.woff2?url";
import { useLocale } from "@/composables/useLocale";
import { site } from "@/data/site";
import { LOCALES, localizePath } from "@/utils/i18n";

const { code, locale, basePath, t } = useLocale();

/** Absolute URL of this page in a given language. */
const urlIn = (lang) => `${site.url}${localizePath(basePath.value, lang)}`;

useHead({
  htmlAttrs: {
    lang: () => code.value,
    dir: () => locale.value.dir,
  },
  titleTemplate: (title) => {
    const name = t(site.displayName);
    return title ? `${title} | ${name}` : name;
  },
  link: () => [
    /*
     * The hero tagline is the page's largest paint, so its face is fetched
     * before the CSS that names it is even parsed - otherwise the swap
     * repaints the tagline late, which is the moment LCP records. Jura for
     * English; for Persian, Vazirmatn's Arabic-script file.
     */
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      href: code.value === "fa" ? vazirmatnArabic : juraLatin,
      crossorigin: "",
    },
    // Tells search engines the two languages are one page, translated.
    { rel: "canonical", href: urlIn(code.value) },
    ...Object.keys(LOCALES).map((lang) => ({
      rel: "alternate",
      hreflang: lang,
      href: urlIn(lang),
    })),
    { rel: "alternate", hreflang: "x-default", href: urlIn("en") },
  ],
  meta: () => [
    { property: "og:locale", content: locale.value.ogLocale },
    ...Object.values(LOCALES)
      .filter((other) => other.code !== code.value)
      .map((other) => ({ property: "og:locale:alternate", content: other.ogLocale })),
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
