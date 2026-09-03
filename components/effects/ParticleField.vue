<script setup>
import { ref } from "vue";
import { useParticleField } from "@/composables/useParticleField";
import { effectPalette } from "@/data/theme";

/**
 * Decorative particle layer. Renders on a transparent canvas, so it sits over
 * the page backdrop rather than replacing it. Drop it into a section's
 * `backdrop` slot.
 */
const props = defineProps({
  particleCount: { type: Number, default: 7000 },
  baseColor: { type: String, default: effectPalette.accent },
  secondaryColor: { type: String, default: effectPalette.auroraLight },
  interaction: {
    type: String,
    default: "repel",
    validator: (value) => ["attract", "repel"].includes(value),
  },
  pointerRadius: { type: Number, default: 300 },
  forceStrength: { type: Number, default: 1.5 },
  particleSize: { type: Number, default: 3 },
  opacity: { type: Number, default: 0.75 },
});

const containerEl = ref(null);

useParticleField(containerEl, props);
</script>

<template>
  <div ref="containerEl" class="particle-field" aria-hidden="true"></div>
</template>

<style scoped>
.particle-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
