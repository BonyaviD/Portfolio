<script setup>
import { ref } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import PhotoLightbox from "@/components/sections/PhotoLightbox.vue";
import { usePhotoLine } from "@/composables/usePhotoLine";
import { formatPhotoDate, usePhotoFeed } from "@/composables/usePhotoFeed";
import { socialUrlById } from "@/data/site";

const { photos } = await usePhotoFeed();

// The caption is written onto the print itself, so the wall needs no chrome
// of its own; the list below still carries the full text for assistive tech.
const wallEl = ref(null);

/** Index of the print brought forward, and where it was hanging. */
const opened = ref(null);
const openedFrom = ref(null);

const { isActive, focus, rectOf } = usePhotoLine(wallEl, {
  photos: photos.value,
  onPick: (index, rect) => {
    openedFrom.value = rect;
    opened.value = index;
  },
});

/** Wraps, so the arrows never dead-end. */
function step(direction) {
  if (opened.value === null) return;
  const count = photos.value.length;
  const next = (opened.value + direction + count) % count;

  // Bring the line along, so closing leaves it on the photo just looked at,
  // and so the next FLIP has a real print to grow from.
  focus(next);
  opened.value = next;
  openedFrom.value = rectOf(next);
}

/** Matches what the WebGL prints write on their bottom border. */
function footnoteFor(photo) {
  return [
    formatPhotoDate(photo.date),
    photo.views ? `${photo.views.toLocaleString("en-GB")} views` : "",
    photo.reactions ? `${photo.reactions.toLocaleString("en-GB")} likes` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
</script>

<template>
  <div class="photography">
    <div class="photography__head">
      <h3 class="photography__title">
        <Icon name="lucide:camera" aria-hidden="true" />
        Photography
      </h3>

      <p class="photography__lede">
        Prints from walks around Iran, pegged up to dry. Drag the line, and point at one to watch it develop.
      </p>
    </div>

    <!-- The wall is decorative chrome around content that also exists as a
         plain list below, which is what assistive tech and no-WebGL get. -->
    <div class="wall" :class="{ 'wall--live': isActive }">
      <div ref="wallEl" class="wall__stage" aria-hidden="true"></div>

      <p v-if="isActive" class="wall__hint" aria-hidden="true">
        Drag the line &middot; tap a print
      </p>
    </div>

    <PhotoLightbox
      :photos="photos"
      :index="opened"
      :origin="openedFrom"
      @close="opened = null"
      @navigate="step"
    />

    <ul class="grid" :class="{ 'grid--replaced': isActive }" role="list">
      <li v-for="(photo, index) in photos" :key="photo.id" class="grid__item">
        <button
          type="button"
          class="grid__button"
          @click="
            focus(index);
            openedFrom = rectOf(index);
            opened = index;
          "
        >
          <!-- Dropped once the wall is up. The list stays for assistive tech
               and keyboard use, but the images would be a second download of
               everything the WebGL scene has already fetched - and being
               clipped rather than display:none, they really do load. -->
          <img
            v-if="!isActive"
            class="grid__image"
            :src="photo.src"
            :alt="photo.alt"
            loading="lazy"
          />
          <span class="grid__caption">
            <span class="grid__text">{{ photo.description }}</span>
            <span v-if="footnoteFor(photo)" class="grid__date">{{ footnoteFor(photo) }}</span>
          </span>
        </button>
      </li>
    </ul>

    <div class="photography__cta">
      <BaseButton
        :to="socialUrlById.telegram"
        label="More photos"
        icon="simple-icons:telegram"
        trailing-icon="lucide:arrow-up-right"
        variant="soft"
      />
    </div>
  </div>
</template>

<style scoped>
.photography__head {
  margin-bottom: var(--space-8);
}

.photography__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-subheading);
}

.photography__title svg {
  color: var(--color-primary);
  font-size: 0.8em;
}

.photography__lede {
  margin-top: var(--space-3);
  max-width: 34rem;
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
}

/* -------------------------------------------------------------------- wall */
.wall {
  position: relative;
  display: none;
  height: clamp(29rem, 72vh, 46rem);
  /* Full-bleed: the wall reads better edge to edge than inside the container. */
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
  touch-action: pan-y;
}

.wall--live {
  display: block;
}

.wall__stage {
  position: absolute;
  inset: 0;
}

.wall__hint {
  position: absolute;
  top: var(--space-4);
  right: var(--space-6);
  color: var(--color-text-subtle);
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
  pointer-events: none;
}

/* --------------------------------------------------------- fallback grid
   Shown when WebGL is unavailable or motion is reduced. When the wall is
   live this collapses to a screen-reader-only list, so the photos keep
   their alt text and remain reachable. */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: var(--space-4);
  list-style: none;
}

.grid--replaced {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.grid__button {
  display: block;
  width: 100%;
  padding: 0;
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-xl);
  background: none;
  overflow: hidden;
  cursor: pointer;
}

.grid__image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.grid__caption {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  text-align: left;
}

.grid__text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  font-weight: var(--font-weight-semibold);
  white-space: pre-line;
}

.grid__date {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.photography__cta {
  margin-top: var(--space-8);
}

@media (max-width: 48rem) {
  .wall__hint {
    display: none;
  }
}
</style>
