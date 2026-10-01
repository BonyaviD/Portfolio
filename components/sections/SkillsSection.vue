<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import SkillTile from "@/components/base/SkillTile.vue";
import { useLocale } from "@/composables/useLocale";
import { skills, skillsIntro } from "@/data/skills";
import { ui } from "@/data/ui";

const { t } = useLocale();
</script>

<template>
  <BaseSection id="skills" :title="t(ui.sections.skills)" class="skills">
    <p class="skills__lede" data-reveal>{{ t(skillsIntro) }}</p>

    <ul class="skills__grid" role="list" data-reveal="stagger">
      <SkillTile
        v-for="skill in skills"
        :key="skill.icon"
        :name="t(skill.name)"
        :icon="skill.icon"
        :level="skill.level"
      />
    </ul>
  </BaseSection>
</template>

<style scoped>
.skills {
  /* The aurora needs room to read as a backdrop rather than a stripe. */
  padding-block: clamp(var(--space-16), 12vw, var(--space-32));
}

/* Tighten heading-to-lede so the two read as one block above the grid. */
.skills :deep(.section__heading) {
  margin-bottom: var(--space-4);
}

.skills__lede {
  max-width: 34rem;
  margin: 0 auto var(--space-12);
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
  text-align: center;
  text-wrap: balance;
}

.skills__grid {
  /* Many small tiles: a quick ripple across the grid, not a slow queue. */
  --reveal-step: 40ms;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  gap: clamp(var(--space-3), 1.4vw, var(--space-5));
  list-style: none;
}

@media (max-width: 48rem) {
  .skills__grid {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}

@media (max-width: 30rem) {
  .skills__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
