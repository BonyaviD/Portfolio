<script setup>
import TheHero from '~/components/sections/TheHeroSection/TheHero.vue';
import TheAboutMe from '~/components/sections/TheAboutMeSection/TheAboutMe.vue';
import TheSkills from '~/components/sections/TheSkills.vue';
import TheExperience from '~/components/sections/TheExperience.vue';
import TheHobbies from '~/components/sections/TheHobbies.vue';

useHead({
  titleTemplate: '%s - Home',
  meta: [
    { hid: 'description', name: 'description', content: 'پورتفولیو نوید بنیادی' },
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
