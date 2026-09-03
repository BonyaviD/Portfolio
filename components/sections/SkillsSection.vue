<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import BaseSection from "@/components/base/BaseSection.vue";
import SkillTile from "@/components/base/SkillTile.vue";
import { skills, skillsIntro } from "@/data/skills";
import { prefersReducedMotion } from "@/utils/loadThree";

const gridEl = ref(null);

/**
 * Starts true so server-rendered HTML (and anyone without JS) sees the tiles.
 * The client hides them again on mount purely to play the entrance once.
 */
const revealed = ref(true);
let observer = null;
let fallbackTimer = 0;

/**
 * Never leave the tiles hidden if the observer does not report back. Some
 * embedded and background contexts throttle IntersectionObserver away
 * entirely, and a decorative entrance must never cost the visitor the content.
 */
const REVEAL_FALLBACK_MS = 1800;

function reveal() {
  revealed.value = true;
  observer?.disconnect();
  observer = null;
  clearTimeout(fallbackTimer);
  fallbackTimer = 0;
}

onMounted(() => {
  if (prefersReducedMotion() || !("IntersectionObserver" in window) || !gridEl.value) {
    return;
  }

  // Already on screen on load: there is no entrance left to play, and hiding
  // the tiles now would only cause a flash.
  if (gridEl.value.getBoundingClientRect().top < window.innerHeight) return;

  revealed.value = false;
  observer = new IntersectionObserver(
    ([entry]) => {
      // `top < 0` catches an anchor jump that skipped straight past the grid,
      // which would otherwise leave the tiles invisible for good.
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) reveal();
    },
    { threshold: 0.15 }
  );
  observer.observe(gridEl.value);
  fallbackTimer = window.setTimeout(reveal, REVEAL_FALLBACK_MS);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  clearTimeout(fallbackTimer);
});
</script>

<template>
  <BaseSection id="skills" title="Skills" class="skills">
    <p class="skills__lede">{{ skillsIntro }}</p>

    <ul ref="gridEl" class="skills__grid" role="list">
      <SkillTile
        v-for="(skill, index) in skills"
        :key="skill.name"
        :name="skill.name"
        :icon="skill.icon"
        :level="skill.level"
        :index="index"
        :revealed="revealed"
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
