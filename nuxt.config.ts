// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  app: {
    head: {
      titleTemplate: "%s | Navid Bonyadi",
      htmlAttrs: { lang: "en", dir: "ltr" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#0d1b2a" },
      ],
      link: [{ rel: "icon", href: "/favicon.ico" }],
    },
  },

  /**
   * Load order matters: tokens define the custom properties everything else
   * consumes, the reset clears defaults, then base/utilities build on top.
   */
  css: [
    "~/assets/css/fonts.css",
    "~/assets/css/tokens.css",
    "~/assets/css/reset.css",
    "~/assets/css/base.css",
    "~/assets/css/utilities.css",
    "~/assets/css/scrollbar.css",
  ],

  /**
   * Components are imported explicitly throughout the app. These entries keep
   * auto-import names flat (BaseButton, not BaseBaseButton) for the cases
   * where it is used anyway.
   */
  components: [
    { path: "~/components/base", pathPrefix: false },
    { path: "~/components/effects", pathPrefix: false },
    { path: "~/components/layout", pathPrefix: false },
    { path: "~/components/sections", pathPrefix: false },
  ],

  /**
   * The home page embeds the Telegram feed, so rendering it costs a scrape of
   * t.me. Serving it stale-while-revalidate from the edge takes that off the
   * critical path for everyone but the one visitor who triggers a refresh.
   */
  routeRules: {
    // Five minutes rather than longer: if the render that gets cached is one
    // where Telegram was unreachable, this is how long the page keeps showing
    // the bundled fallback before it retries.
    "/": { swr: 300 },
  },

  modules: [],
});
