<script setup>
import TheHero from '~/components/sections/TheHeroSection/TheHero.vue';
import TheAboutMe from '~/components/sections/TheAboutMe.vue';
import TheSkills from '~/components/sections/TheSkills/TheSkills.vue';
import TheExperience from '~/components/sections/TheExperience.vue';
import TheHobbies from '~/components/sections/TheHobbies/TheHobbies.vue';
const siteUrl = "https://bonyadi.netlify.app";
const profileImage = `${siteUrl}/images/me.jpg`;

const schemaData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Navid Bonyadi",
  "url": siteUrl,
  "sameAs": [
    "https://www.linkedin.com/in/bonyavid/",
    "https://github.com/BonyaviD"
  ],
  "jobTitle": "Frontend Developer",
  "worksFor": {
    "@type": "Organization",
    "name": "Web One"
  },
  "description": "Self-taught frontend developer with expertise in Vue, Nuxt, and modern web technologies.",
  "image": profileImage,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tehran",
    "addressCountry": "IR"
  },
  "birthDate": "1992-05-24"
};

useHead({
  titleTemplate: '%s - Home',
  meta: [
    { hid: 'description', name: 'description', content: 'Portfolio of Navid Bonyadi | سایت پورتفولیو نوید بنیادی ' },
    { hid: 'keywords', name: 'keywords', content: 'Frontend Developer, Vue, Nuxt, Portfolio, Navid Bonyadi, نوید بنیادی' },
    { hid: 'author', name: 'author', content: 'Navid Bonyadi' },

    // Open Graph
    { hid: 'og:title', property: 'og:title', content: 'Portfolio of Navid Bonyadi' },
    { hid: 'og:description', property: 'og:description', content: 'Self-taught frontend developer with expertise in Vue, Nuxt, and modern web technologies.' },
    { hid: 'og:image', property: 'og:image', content: profileImage },
    { hid: 'og:url', property: 'og:url', content: siteUrl },
    { hid: 'og:type', property: 'og:type', content: 'website' },

    // Twitter
    { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
    { hid: 'twitter:title', name: 'twitter:title', content: 'Portfolio of Navid Bonyadi' },
    { hid: 'twitter:description', name: 'twitter:description', content: 'Self-taught frontend developer with expertise in Vue, Nuxt, and modern web technologies.' },
    { hid: 'twitter:image', name: 'twitter:image', content: profileImage }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(schemaData)
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

