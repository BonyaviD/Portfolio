<script setup>
import { computed, ref } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { usePhotoWall } from "@/composables/usePhotoWall";
import { photos } from "@/data/hobbies";
import { socialUrlById } from "@/data/site";

const wallEl = ref(null);
const { isActive, activeIndex, focus } = usePhotoWall(wallEl, { photos });

const hovered = computed(() => photos[activeIndex.value] ?? null);
</script>

<template>
  <div class="photography">
    <div class="photography__head">
      <h3 class="photography__title">
        <Icon name="lucide:camera" aria-hidden="true" />
        Photography
      </h3>

      <p class="photography__lede">
        Moments caught on walks around Iran. Drag the wall to move through them.
      </p>
    </div>

    <!-- The wall is decorative chrome around content that also exists as a
         plain list below, which is what assistive tech and no-WebGL get. -->
    <div class="wall" :class="{ 'wall--live': isActive }">
      <div ref="wallEl" class="wall__stage" aria-hidden="true"></div>

      <transition name="caption">
        <p v-if="isActive && hovered" class="wall__caption">
          <span class="wall__caption-title">{{ hovered.title }}</span>
          <span class="wall__caption-place">
            <Icon name="lucide:map-pin" aria-hidden="true" />
            {{ hovered.place }}
          </span>
        </p>
      </transition>

      <p v-if="isActive" class="wall__hint" aria-hidden="true">Drag to explore</p>
    </div>

    <ul class="grid" :class="{ 'grid--replaced': isActive }" role="list">
      <li v-for="(photo, index) in photos" :key="photo.id" class="grid__item">
        <button type="button" class="grid__button" @click="focus(index)">
          <img class="grid__image" :src="photo.src" :alt="photo.alt" loading="lazy" />
          <span class="grid__caption">
            <span class="grid__title">{{ photo.title }}</span>
            <span class="grid__place">{{ photo.place }}</span>
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
  height: clamp(24rem, 58vh, 36rem);
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

.wall__caption {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-5);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  transform: translateX(-50%);
  pointer-events: none;
}

.wall__caption-title {
  font-weight: var(--font-weight-bold);
}

.wall__caption-place {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
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

.caption-enter-active,
.caption-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
}

.caption-enter-from,
.caption-leave-to {
  opacity: 0;
  transform: translate(-50%, var(--space-2));
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
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3);
}

.grid__title {
  font-weight: var(--font-weight-semibold);
}

.grid__place {
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
