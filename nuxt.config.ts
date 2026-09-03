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

  modules: ["@nuxt/icon", "@nuxtjs/google-fonts"],

  icon: {
    mode: "svg",
    /**
     * Icons are bundled into the client build so the deployed site never calls
     * the Iconify API. `scan` catches literal `<Icon name="...">` usage; names
     * that come from data/ are dynamic, so they must be listed explicitly.
     */
    clientBundle: {
      scan: true,
      icons: [
        // Tech / brand logos
        "simple-icons:html5",
        "simple-icons:css",
        "simple-icons:sass",
        "simple-icons:tailwindcss",
        "simple-icons:bootstrap",
        "simple-icons:javascript",
        "simple-icons:typescript",
        "simple-icons:pinia",
        "simple-icons:vite",
        "simple-icons:git",
        "simple-icons:github",
        "simple-icons:vuedotjs",
        "simple-icons:nuxtdotjs",
        "simple-icons:visualstudiocode",
        "simple-icons:postman",
        "simple-icons:linkedin",
        "simple-icons:telegram",
        "simple-icons:vsco",
        // Interface icons
        "lucide:house",
        "lucide:user",
        "lucide:sparkles",
        "lucide:briefcase",
        "lucide:camera",
        "lucide:gamepad-2",
        "lucide:library",
        "lucide:drama",
        "lucide:monitor",
        "lucide:webhook",
        "lucide:network",
        "lucide:arrow-up-right",
        "lucide:arrow-down",
        "lucide:external-link",
        "lucide:map-pin",
        "lucide:calendar",
        "lucide:languages",
        "lucide:code",
        "lucide:x",
      ],
    },
  },

  googleFonts: {
    // Jura ships 300-700 only; never request 800 or it gets faux-bolded.
    families: { Jura: [400, 500, 600, 700] },
    display: "swap",
  },
});
