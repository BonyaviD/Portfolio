<script setup>
import { ref } from "vue";
import { useAuroraField } from "@/composables/useAuroraField";
import { effectPalette } from "@/data/theme";

/**
 * Decorative animated gradient backdrop. Drop it into a section's `backdrop`
 * slot; it fills the box and never receives pointer events, so content on top
 * stays fully interactive.
 *
 * The CSS gradient on the host is the fallback that shows before Three.js has
 * loaded and if WebGL is unavailable.
 */
const props = defineProps({
  baseColor: { type: String, default: effectPalette.background },
  midColor: { type: String, default: effectPalette.auroraMid },
  hotColor: { type: String, default: effectPalette.accent },
  intensity: { type: Number, default: 1 },
});

const containerEl = ref(null);

useAuroraField(containerEl, props);
</script>

<template>
  <div ref="containerEl" class="aurora" aria-hidden="true"></div>
</template>

<style scoped>
.aurora {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(70% 60% at 25% 20%, rgb(18 58 92 / 65%) 0%, transparent 60%),
    radial-gradient(50% 50% at 80% 70%, rgb(230 182 108 / 18%) 0%, transparent 65%),
    var(--color-bg);
  pointer-events: none;
}

.aurora :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
