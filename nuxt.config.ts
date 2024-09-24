// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app:{
    head: {
      title: 'Portfolio',
      htmlAttrs: {
        lang: 'en',
        dir: 'ltr'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'پورتفولیو نوید بنیادی Portfolio Navid Bonyadi'},
      ]
    }
  },
  css: [
    '~/assets/css/main.css',
    '~/assets/css/base.css'
  ],
  modules: [
    '@nuxtjs/google-fonts'
  ],
  googleFonts: {
    families: {
      Jura: [400, 500, 600, 700]
    }
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false }
})
