<script setup>
import { ref } from "vue";
import { useWaterRipple } from "@/composables/useWaterRipple";

/**
 * An image that ripples where you press it.
 *
 * The plain <img> underneath is both the visual backdrop and the graceful
 * fallback: if WebGL is unavailable the canvas never shows and the picture
 * is still there, carrying the alt text.
 */
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  /** Displacement amount, clamped to 0.002-0.08 by the composable. */
  strength: { type: Number, default: 0.022 },
  /** Emit ripples on their own while the visitor is idle. */
  ambient: { type: Boolean, default: true },
});

const canvasEl = ref(null);

const { isActive, addRippleFromEvent } = useWaterRipple(canvasEl, {
  imageSrc: props.src,
  strength: props.strength,
  ambient: props.ambient,
});
</script>

<template>
  <div class="ripple" @pointerdown="addRippleFromEvent">
    <img class="ripple__image" :src="src" :alt="alt" />
    <canvas
      v-show="isActive"
      ref="canvasEl"
      class="ripple__canvas"
      aria-hidden="true"
    ></canvas>
    <slot />
  </div>
</template>

<style scoped>
.ripple {
  position: absolute;
  inset: 0;
}

.ripple__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(2px);
}

.ripple__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
