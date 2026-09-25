<script setup>
import { ref } from "vue";
import { useLiquidSculpture } from "@/composables/useLiquidSculpture";
import { useLocale } from "@/composables/useLocale";

/**
 * Decorative layer: a raymarched sculpture of liquid gold that answers the
 * pointer and becomes a heart on `celebrate`. Transparent around the piece,
 * so it sits over the page backdrop. Drop it into a section's `backdrop`
 * slot.
 */
const props = defineProps({
  celebrate: { type: Boolean, default: false },
});

const { isRtl } = useLocale();
const containerEl = ref(null);

const { isActive } = useLiquidSculpture(containerEl, {
  get celebrate() {
    return props.celebrate;
  },
  // The form's side: the right in English, the left in Persian. The piece
  // sits in the other column, under the links.
  side: () => (isRtl.value ? -1 : 1),
});
</script>

<template>
  <div
    ref="containerEl"
    class="liquid"
    :class="{ 'liquid--live': isActive }"
    aria-hidden="true"
  ></div>
</template>

<style scoped>
.liquid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  /* Rises into view once the first frame exists, rather than popping on. */
  transition: opacity 1.4s var(--ease-standard);
}

.liquid--live {
  opacity: 1;
}

/*
 * A darker stage under the piece. The page's own backdrop has warm halos
 * that drift after the cursor, and here they muddied the gold; held back,
 * the metal has something to shine against. Masked at top and bottom, so
 * the section has no edge.
 */
.liquid::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(3 9 17 / 40%) 0%, rgb(3 9 17 / 78%) 50%, rgb(3 9 17 / 82%) 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 80%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 80%, transparent 100%);
}

/* Positioned, so it paints above the stage: an absolutely positioned
   ::before otherwise stacks over an unpositioned canvas and dims the piece. */
.liquid :deep(canvas) {
  position: relative;
  display: block;
}
</style>
