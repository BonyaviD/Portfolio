<script setup>
import ProfileImage from "@/assets/img/me.webp";

/**
 * The portrait used by the home About section and the About page.
 *
 * By default it sets its own 4:5 frame. `fill` drops that frame and covers
 * whatever box the parent gives it instead - for layouts where the photo has
 * to end at the same line as the copy beside it, not decide its own height.
 */
defineProps({
  alt: { type: String, default: "Portrait of Navid Bonyadi" },
  fill: { type: Boolean, default: false },
});
</script>

<template>
  <div class="portrait" :class="{ 'portrait--fill': fill }">
    <img
      class="portrait__image"
      :src="ProfileImage"
      :alt="alt"
      width="853"
      height="1280"
      loading="lazy"
      decoding="async"
    />
  </div>
</template>

<style scoped>
.portrait {
  flex-shrink: 0;
  width: clamp(13rem, 22vw, 25rem);
}

/* A fixed frame, so the portrait keeps its shape whatever the photo's own
   proportions are - swapping in a landscape shot crops rather than squashes. */
.portrait__image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-2xl);
  object-fit: cover;
  object-position: 50% 30%;
}

.portrait--fill {
  width: 100%;
  height: 100%;
}

.portrait--fill .portrait__image {
  height: 100%;
  aspect-ratio: auto;
}

@media (max-width: 60rem) {
  /* Centred and capped: a full-width portrait swamped the section. */
  .portrait:not(.portrait--fill) {
    width: min(100%, 20rem);
    margin-inline: auto;
  }
}
</style>
