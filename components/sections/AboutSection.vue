<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import BulletList from "@/components/base/BulletList.vue";
import ProfilePortrait from "@/components/base/ProfilePortrait.vue";
import { aboutHighlights } from "@/data/about";
import { site } from "@/data/site";
</script>

<template>
  <BaseSection id="about" title="About Me">
    <div class="about">
      <ProfilePortrait />

      <div class="about__content">
        <p class="about__name">{{ site.name }}</p>
        <BulletList :items="aboutHighlights" />
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.about {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5) var(--space-24);
}

.about__content {
  flex: 1 1 20rem;
}

.about__name {
  margin-bottom: var(--space-10);
  font-size: var(--font-size-subheading);
  font-weight: var(--font-weight-regular);
}

@media (max-width: 68rem) {
  .about {
    gap: var(--space-5) var(--space-12);
  }
}

@media (max-width: 60rem) {
  .about__content {
    flex-basis: 100%;
  }
}
</style>
