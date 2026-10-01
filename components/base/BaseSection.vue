<script setup>
import { computed } from "vue";
import SectionHeading from "@/components/base/SectionHeading.vue";

/**
 * The page-section shell. Owns the vertical rhythm, the horizontal container
 * and the heading, so individual sections no longer hand-tune margins.
 *
 * Anything passed to the `backdrop` slot is painted full-bleed behind the
 * content, clipped to the section box.
 *
 * The heading makes its entrance when the section is scrolled to, a word at
 * a time; mark the blocks inside with `data-reveal` to have them follow it
 * in (see utils/reveal.js for the variants). The body also moves through
 * depth as it scrolls in and out - see "section depth" in
 * assets/css/reveal.css.
 */
const props = defineProps({
  /** Anchor id; also derives the heading id used by aria-labelledby. */
  id: { type: String, default: "" },
  title: { type: String, default: "" },
  headingLevel: { type: String, default: "h2" },
  /** Set false when the section lays out its own full-bleed content. */
  contained: { type: Boolean, default: true },
});

const headingId = computed(() => (props.id ? `${props.id}-heading` : undefined));

/** The title by words, so each can make its own entrance. */
const titleWords = computed(() => props.title.split(/\s+/).filter(Boolean));
</script>

<template>
  <section
    class="section"
    :id="id || undefined"
    :aria-labelledby="title && headingId ? headingId : undefined"
  >
    <div v-if="$slots.backdrop" class="section__backdrop">
      <slot name="backdrop" />
    </div>

    <div class="section__body" :class="{ container: contained }" data-depth>
      <SectionHeading
        v-if="title"
        :id="headingId"
        :as="headingLevel"
        class="section__heading"
        data-reveal="heading"
      >
        <template v-for="(word, index) in titleWords" :key="index">
          <span class="reveal__word" :style="{ '--word': index }">{{ word }}</span>
          {{ index < titleWords.length - 1 ? " " : "" }}
        </template>
      </SectionHeading>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section {
  position: relative;
  /* Keeps the backdrop's stacking contained to this section. */
  isolation: isolate;
}

.section__backdrop {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  overflow: hidden;
  pointer-events: none;
}

.section__body {
  position: relative;
  z-index: var(--z-raised);
}

.section__heading {
  margin-bottom: var(--space-12);
}
</style>
