<script setup>
import WaterRippleImage from "@/components/effects/WaterRippleImage.vue";
import FloatingTechIcons from "@/components/effects/FloatingTechIcons.vue";
import { heroPhoto } from "@/data/hobbies";
</script>

<template>
  <section class="hero" aria-label="Introduction">
    <WaterRippleImage :src="heroPhoto.src" :alt="heroPhoto.alt" />
    <FloatingTechIcons />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: min(43.75rem, 80vh);
  overflow: hidden;
}
</style>
