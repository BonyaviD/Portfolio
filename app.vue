<script setup>
import juraLatin from "~/assets/fonts/Jura-400-8.woff2?url";

/*
 * The hero tagline is the page's largest paint and it is set in Jura. Left to
 * itself the browser only finds the font once the CSS is parsed, and the swap
 * repaints the tagline late - which is the moment LCP records.
 */
useHead({
  link: [{ rel: "preload", as: "font", type: "font/woff2", href: juraLatin, crossorigin: "" }],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
