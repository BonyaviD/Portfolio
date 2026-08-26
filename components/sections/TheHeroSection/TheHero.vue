<script setup>
import TehranPeople from "~/assets/img/photography/tehran-people.jpg";
import HeroIconsDance from "@/components/sections/TheHeroSection/HeroIconsDance.vue";
</script>

<template>
  <div class="hero-section">
    <img class="hero-background" :src="TehranPeople" alt="People walking at night in Tehran" />
    <HeroIconsDance />
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 2rem;
  height: 700px;
}

.hero-section .hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  filter: blur(2px);
}
</style>