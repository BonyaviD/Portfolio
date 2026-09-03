<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import PhotographyBlock from "@/components/sections/PhotographyBlock.vue";
import GamingBlock from "@/components/sections/GamingBlock.vue";
</script>

<template>
  <BaseSection id="hobbies" title="Hobbies">
    <div class="hobbies">
      <PhotographyBlock />
      <GamingBlock />
    </div>
  </BaseSection>
</template>

<style scoped>
.hobbies {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}
</style>
