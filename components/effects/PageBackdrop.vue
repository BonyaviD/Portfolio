<script setup>
import { ref } from "vue";
import { useAuroraField } from "@/composables/useAuroraField";
import { effectPalette } from "@/data/theme";

/**
 * The single background surface for the whole site.
 *
 * Fixed to the viewport and sitting behind every section, so the page reads as
 * one continuous surface rather than a stack of separately-painted bands. It
 * drifts on its own and shifts slightly with scroll.
 *
 * Everything above it must keep a transparent background; the CSS gradient
 * here is the pre-load and no-WebGL fallback.
 */
const containerEl = ref(null);

useAuroraField(containerEl, {
  baseColor: effectPalette.background,
  midColor: effectPalette.auroraMid,
  hotColor: effectPalette.accent,
  intensity: 0.55,
  followScroll: true,
});
</script>

<template>
  <div ref="containerEl" class="page-backdrop" aria-hidden="true"></div>
</template>

<style scoped>
.page-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-behind);
  background:
    radial-gradient(70% 55% at 22% 18%, rgb(18 58 92 / 45%) 0%, transparent 62%),
    radial-gradient(55% 45% at 82% 72%, rgb(230 182 108 / 9%) 0%, transparent 66%),
    var(--color-bg);
  pointer-events: none;
}

.page-backdrop :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
