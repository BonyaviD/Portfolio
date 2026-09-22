// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#0d1b2a" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
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
    "/fa": { swr: 300 },
  },

  /**
   * All CSS goes into the HTML instead of four render-blocking stylesheet
   * requests. On a phone those round trips were most of the wait before the
   * first paint; the page's CSS is small enough to ride along with it.
   */
  features: {
    inlineStyles: true,
  },

  hooks: {
    /**
     * Every page also exists in Persian, under /fa: /about is /fa/about.
     *
     * A second route per page rather than an optional [[lang]] segment, which
     * would also have matched /about as the home page in a language called
     * "about". The language is then read from the path - see utils/i18n.js.
     */
    "pages:extend": (pages) => {
      const persian = pages.map((page) => ({
        ...page,
        name: page.name ? `${page.name}-fa` : undefined,
        path: page.path === "/" ? "/fa" : `/fa${page.path}`,
      }));
      pages.push(...persian);
    },

    /**
     * Nuxt turns every imported asset into a <link rel="prefetch"> in the
     * head, which for this page meant all 25 images - game art, project shots,
     * the fallback photos - downloading on first load whether or not anyone
     * scrolls to them. The <img> tags already load them when they are needed.
     */
    "build:manifest": (manifest) => {
      for (const chunk of Object.values(manifest)) {
        if (!chunk.assets) continue;
        chunk.assets = chunk.assets.filter(
          (asset) => !/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(asset)
        );
      }
    },
  },

  modules: [],
});
