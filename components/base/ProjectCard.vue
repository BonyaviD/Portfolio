<script setup>
import { computed } from "vue";

/**
 * A project as an App Store style preview card: the screenshot sits inside a
 * small browser frame, and the title, tech and visit affordance live below it.
 *
 * Deliberately not hover-only. The previous card hid the project's name behind
 * a hover state, so on touch devices the cards were unlabelled rectangles.
 */
const props = defineProps({
  name: { type: String, required: true },
  url: { type: String, required: true },
  image: { type: String, required: true },
  tech: { type: Array, default: () => [] },
  /** Drives the staggered entrance delay. */
  index: { type: Number, default: 0 },
});

/** Shown in the browser bar; derived so it can never drift from `url`. */
const domain = computed(() => {
  try {
    return new URL(props.url).hostname.replace(/^www\./, "");
  } catch {
    return props.url;
  }
});
</script>

<template>
  <li class="project" :style="{ '--card-index': index }">
    <NuxtLink
      :to="url"
      target="_blank"
      rel="noopener noreferrer"
      class="project__link"
      :aria-label="`${name} - opens in a new tab`"
    >
      <span class="project__frame">
        <span class="project__chrome" aria-hidden="true">
          <span class="project__dots">
            <i></i><i></i><i></i>
          </span>
          <span class="project__domain">{{ domain }}</span>
        </span>

        <span class="project__shot-wrap">
          <img class="project__shot" :src="image" :alt="`${name} website`" loading="lazy" />
        </span>
      </span>

      <span class="project__body">
        <span class="project__heading">
          <span class="project__name">{{ name }}</span>
          <span class="project__go" aria-hidden="true">
            <Icon name="lucide:arrow-up-right" />
          </span>
        </span>

        <span v-if="tech.length" class="project__tech">
          <span v-for="item in tech" :key="item" class="project__chip">{{ item }}</span>
        </span>
      </span>
    </NuxtLink>
  </li>
</template>

<style scoped>
.project {
  list-style: none;
  animation: card-in var(--duration-slow) var(--ease-spring) backwards;
  animation-delay: calc(var(--card-index) * 70ms);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(var(--space-6));
  }
}

.project__link {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
  padding: var(--space-3);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-2xl);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  transition:
    transform var(--duration-slow) var(--ease-spring),
    border-color var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}

.project__link:hover {
  transform: translateY(-6px);
  border-color: var(--color-primary-soft);
  box-shadow:
    var(--glass-shadow),
    0 0 34px -10px rgb(230 182 108 / 30%);
}

.project__link:active {
  transform: translateY(-2px) scale(0.99);
  transition-duration: var(--duration-fast);
}

/* ----------------------------------------------------------- browser frame */
.project__frame {
  display: block;
  overflow: hidden;
  border: var(--border-width-hairline) solid rgb(255 255 255 / 8%);
  border-radius: var(--radius-xl);
  /* Neutral plate behind any screenshot transparency. */
  background: rgb(6 14 24 / 70%);
}

.project__chrome {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-bottom: var(--border-width-hairline) solid rgb(255 255 255 / 8%);
  background: rgb(255 255 255 / 5%);
}

.project__dots {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.project__dots i {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: var(--radius-circle);
  background: rgb(255 255 255 / 22%);
}

.project__domain {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Fixed ratio keeps a row of cards aligned even though the source
   screenshots range from 0.97:1 to 1.6:1. */
.project__shot-wrap {
  display: block;
  aspect-ratio: 16 / 11;
  overflow: hidden;
}

.project__shot {
  width: 100%;
  height: 100%;
  /* Top-anchored: the header and hero are the recognisable part of a site. */
  object-fit: cover;
  object-position: top center;
  transition: transform var(--duration-slower) var(--ease-standard);
}

.project__link:hover .project__shot {
  transform: scale(1.06);
}

/* ------------------------------------------------------------------- body */
.project__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0 var(--space-2) var(--space-2);
}

.project__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.project__name {
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.01em;
}

.project__go {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-circle);
  border: var(--border-width-hairline) solid var(--glass-border);
  color: var(--color-text-muted);
  transition:
    background-color var(--duration-base) var(--ease-standard),
    color var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
}

.project__link:hover .project__go {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  transform: rotate(45deg);
}

.project__tech {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.project__chip {
  padding: 0.1875rem var(--space-2);
  border: var(--border-width-hairline) solid rgb(255 255 255 / 10%);
  border-radius: var(--radius-pill);
  background: rgb(255 255 255 / 5%);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

@media (prefers-reduced-motion: reduce) {
  .project {
    animation: none;
  }
}
</style>
