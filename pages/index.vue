<script setup>
import TheHero from '~/components/sections/TheHeroSection/TheHero.vue';
import TheAboutMe from '~/components/sections/TheAboutMe.vue';
import TheSkills from '~/components/sections/TheSkills/TheSkills.vue';
import TheExperience from '~/components/sections/TheExperience.vue';
import TheHobbies from '~/components/sections/TheHobbies/TheHobbies.vue';
import { computed } from 'vue'

const schemaData = computed(() => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Navid Bonyadi",
  "url": "https://bonyadi.netlify.app/",
  "sameAs": [
    "https://www.linkedin.com/in/navidbonyadi",
    "https://github.com/navidbonyadi"
  ],
  "jobTitle": "Frontend Developer",
  "worksFor": {
    "@type": "Organization",
    "name": "Web One"
  },
  "description": "Self-taught frontend developer with expertise in Vue, Nuxt, and modern web technologies.",
  "image": "https://bonyadi.netlify.app/_nuxt/me.Dsc_p8uZ.jpg",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tehran",
    "addressCountry": "IR"
  },
  "email": "mailto:your-email@example.com",
  "birthDate": "1992-05-24"
}))

useHead({
  titleTemplate: '%s - Home',
  meta: [
    { hid: 'description', name: 'description', content: 'Portfolio of Navid Bonyadi | سایت پورتفولیو نوید بنیادی ' },
    { hid: 'keywords', name: 'keywords', content: 'Frontend Developer, Vue, Nuxt, Portfolio, Navid Bonyadi, نوید بنیادی' },
    { hid: 'author', name: 'author', content: 'Navid Bonyadi' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },

    // متاتگ‌های Open Graph
    { hid: 'og:title', property: 'og:title', content: 'Portfolio of Navid Bonyadi' },
    { hid: 'og:description', property: 'og:description', content: 'Self-taught frontend developer with expertise in Vue, Nuxt, and modern web technologies.' },
    { hid: 'og:image', property: 'og:image', content: 'https://bonyadi.netlify.app/_nuxt/me.Dsc_p8uZ.jpg' },
    { hid: 'og:url', property: 'og:url', content: 'https://bonyadi.netlify.app/' },
    { hid: 'og:type', property: 'og:type', content: 'website' },

    // متاتگ‌های Twitter
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: 'Portfolio of Navid Bonyadi' },
    { hid: 'twitter:description', name: 'twitter:description', content: 'Self-taught frontend developer with expertise in Vue, Nuxt, and modern web technologies.' },
    { hid: 'twitter:image', name: 'twitter:image', content: 'https://bonyadi.netlify.app/_nuxt/me.Dsc_p8uZ.jpg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(schemaData.value) // استفاده از مقدار computed
    }
  ]
})
</script>

<template>
<div>
  <TheHero />
  <TheAboutMe />
  <TheSkills />
  <TheExperience />
  <TheHobbies />
</div>

</template>

<style scoped>
</style>
