<script setup>
import TheHero from '~/components/sections/TheHeroSection/TheHero.vue';
import TheAboutMe from '~/components/sections/TheAboutMe.vue';
import TheSkills from '~/components/sections/TheSkills/TheSkills.vue';
import TheExperience from '~/components/sections/TheExperience.vue';
import TheHobbies from '~/components/sections/TheHobbies/TheHobbies.vue';

useHead({
  titleTemplate: '%s - Home',
  meta: [
    { hid: 'description', name: 'description', content: 'Portfolio Navid Bonyadi | نوید بنیادی پورتفولیو ' },
  ],
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
