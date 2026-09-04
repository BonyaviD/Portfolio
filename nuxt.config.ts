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

  modules: ["@nuxtjs/google-fonts"],

  googleFonts: {
    // Jura ships 300-700 only; never request 800 or it gets faux-bolded.
    // Permanent Marker is a single weight and is only used for the captions
    // written onto the photo prints.
    families: { Jura: [400, 500, 600, 700], "Permanent+Marker": [400] },
    display: "swap",
  },
});
