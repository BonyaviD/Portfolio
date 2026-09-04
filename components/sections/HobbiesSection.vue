<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import PhotographyBlock from "@/components/sections/PhotographyBlock.vue";
import ConsoleShelf from "@/components/sections/ConsoleShelf.vue";
</script>

<template>
  <BaseSection id="hobbies" title="Hobbies">
    <div class="hobbies">
      <PhotographyBlock />

      <div class="gaming">
        <div class="gaming__head">
          <h3 class="gaming__title">
            <Icon name="lucide:gamepad-2" aria-hidden="true" />
            Gaming
          </h3>
          <p class="gaming__platform">
            <Icon name="simple-icons:playstation" aria-hidden="true" />
            Mostly PlayStation
          </p>
        </div>

        <ConsoleShelf />
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.hobbies {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.gaming__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-5);
  margin-bottom: var(--space-8);
}

.gaming__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-subheading);
}

.gaming__title svg {
  color: var(--color-primary);
  font-size: 0.8em;
}

.gaming__platform {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.gaming__platform svg {
  color: var(--color-primary);
}
</style>
