<script setup>
import ProfileImage from "@/assets/img/me.jpg";
import BalloonImage from "@/assets/icons/Balloon.svg";

/**
 * The portrait plus its two decorations (corner notch and floating balloon).
 * Previously duplicated between the home About section and the About page,
 * each with its own hardcoded negative offsets.
 *
 * The balloon is anchored to the top edge of the image rather than to a fixed
 * pixel offset, so it stays put at any portrait size.
 */
defineProps({
  alt: { type: String, default: "Portrait of Navid Bonyadi" },
  /** The balloon is decorative; hide it where there is no room for it. */
  showBalloon: { type: Boolean, default: true },
});
</script>

<template>
  <div class="portrait">
    <img class="portrait__image" :src="ProfileImage" :alt="alt" width="400" height="500" />
    <span class="portrait__notch" aria-hidden="true"></span>
    <img
      v-if="showBalloon"
      class="portrait__balloon"
      :src="BalloonImage"
      alt=""
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.portrait {
  position: relative;
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

/* Punches a hole in the top-left corner using the page background colour. */
.portrait__notch {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  width: var(--space-12);
  height: var(--space-12);
  border-radius: var(--radius-circle);
  background-color: var(--color-bg);
}

.portrait__balloon {
  position: absolute;
  bottom: calc(100% - var(--space-4));
  left: calc(var(--space-6) * -1);
  width: 12.5rem;
  transform: rotate(50deg);
  animation: balloon-sway 2s alternate-reverse infinite;
}

@keyframes balloon-sway {
  from {
    transform: rotate(44deg);
  }

  to {
    transform: rotate(55deg);
  }
}

@media (max-width: 60rem) {
  /* Centred and capped: a full-width portrait swamped the section. */
  .portrait {
    width: min(100%, 20rem);
    margin-inline: auto;
  }

  /* No headroom for the balloon once the portrait goes full-width. */
  .portrait__balloon {
    display: none;
  }
}
</style>
