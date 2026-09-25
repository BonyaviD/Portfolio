<script setup>
import { ref } from "vue";
import { useParticleField } from "@/composables/useParticleField";
import { effectPalette } from "@/data/theme";

/**
 * Decorative layer: a dotted surface in perspective that answers the pointer.
 * Renders on a transparent canvas, so it sits over the page backdrop rather
 * than replacing it. Drop it into a section's `backdrop` slot.
 */
const props = defineProps({
  /** Troughs of the surface. */
  deepColor: { type: String, default: effectPalette.auroraLight },
  /** Crests of the surface. */
  crestColor: { type: String, default: effectPalette.accent },
  /** Points caught by the cursor and by passing rings. */
  hotColor: { type: String, default: "#fff1d6" },
  particleSize: { type: Number, default: 3.2 },
  opacity: { type: Number, default: 0.9 },
  /** Gather the field into hearts. */
  celebrate: { type: Boolean, default: false },
});

const containerEl = ref(null);
const { isActive } = useParticleField(containerEl, props);
</script>

<template>
  <div
    ref="containerEl"
    class="particle-field"
    :class="{ 'particle-field--live': isActive }"
    aria-hidden="true"
  ></div>
</template>

<style scoped>
.particle-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  /* Fades in once the first frame exists, rather than popping on. */
  transition: opacity 1.2s var(--ease-standard);
}

.particle-field--live {
  opacity: 1;
}

/*
 * A darker stage under the field. The page's own backdrop has warm halos
 * that drift after the cursor, and over this section they smeared into the
 * points; here they are held back so the surface has contrast to shine
 * against. Masked at top and bottom, so the section has no edge.
 */
.particle-field::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(90% 70% at 50% 85%, rgb(12 34 60 / 55%) 0%, transparent 70%),
    linear-gradient(180deg, rgb(4 10 18 / 30%) 0%, rgb(4 10 18 / 62%) 45%, rgb(4 10 18 / 70%) 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%);
}

.particle-field :deep(canvas) {
  display: block;
}
</style>
