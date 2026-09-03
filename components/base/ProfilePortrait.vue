<script setup>
import ProfileImage from "@/assets/img/me.jpg";

/**
 * The portrait used by the home About section and the About page.
 */
defineProps({
  alt: { type: String, default: "Portrait of Navid Bonyadi" },
});
</script>

<template>
  <div class="portrait">
    <img class="portrait__image" :src="ProfileImage" :alt="alt" width="853" height="1280" />
  </div>
</template>

<style scoped>
.portrait {
  flex-shrink: 0;
  width: clamp(13rem, 22vw, 25rem);
}

.portrait__image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-2xl);
  object-fit: cover;
  object-position: bottom;
}

@media (max-width: 60rem) {
  /* Centred and capped: a full-width portrait swamped the section. */
  .portrait {
    width: min(100%, 20rem);
    margin-inline: auto;
  }
}
</style>
