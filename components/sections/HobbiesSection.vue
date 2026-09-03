<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import PhotographyBlock from "@/components/sections/PhotographyBlock.vue";
import GamingBlock from "@/components/sections/GamingBlock.vue";
import ConsoleShelf from "@/components/sections/ConsoleShelf.vue";
</script>

<template>
  <BaseSection id="hobbies" title="Hobbies">
    <div class="hobbies">
      <PhotographyBlock />
      <GamingBlock />

      <!-- Second take on the same content, for comparison. -->
      <div class="hobbies__variant">
        <p class="hobbies__label">Same games, console shelf layout</p>
        <ConsoleShelf />
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.hobbies__label {
  color: var(--color-text-subtle);
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.hobbies {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}
</style>
