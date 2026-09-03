<script setup>
import BaseButton from "@/components/base/BaseButton.vue";
import BulletText from "@/components/base/BulletText.vue";
import { photos } from "@/data/hobbies";
import { socialUrlById } from "@/data/site";
</script>

<template>
  <div class="photography">
    <div class="photography__intro">
      <h3 class="photography__title">
        <Icon name="lucide:camera" aria-hidden="true" />
        Photography</h3>
      <BulletText>
        I really enjoy photography and find great satisfaction in capturing unique moments
        through my lens.
      </BulletText>
    </div>

    <div class="mosaic">
      <figure v-for="photo in photos" :key="photo.id" class="tile" :class="`tile--${photo.id}`">
        <img class="tile__image" :src="photo.src" :alt="photo.alt" />
        <figcaption class="tile__caption">
          <span class="tile__title">{{ photo.title }}</span>
          <span class="tile__place">{{ photo.place }}</span>
        </figcaption>
      </figure>

      <div class="mosaic__brand">
        <Icon name="simple-icons:vsco" aria-label="VSCO" />
      </div>

      <div class="mosaic__cta">
        <BaseButton
          :to="socialUrlById.telegram"
          label="For More"
          icon="simple-icons:telegram"
          variant="soft"
          block
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.photography__intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-10);
  margin-bottom: var(--space-16);
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

/* ------------------------------------------------------------------ mosaic
   A fixed 11-column collage. Tile placement is keyed off each photo's id,
   so data/hobbies.js and the `.tile--*` rules below must stay in sync. */
.mosaic {
  display: grid;
  grid-auto-columns: minmax(3.75rem, auto);
  grid-auto-rows: minmax(0.625rem, auto);
  gap: var(--space-10);
  margin-bottom: var(--space-16);
}

.tile {
  position: relative;
  overflow: hidden;
  border: var(--border-width-thick) solid var(--color-border-strong);
  border-radius: var(--radius-md);
}

.tile__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform var(--duration-slower) var(--ease-standard),
    filter var(--duration-slower) var(--ease-standard);
}

.tile:hover .tile__image {
  transform: scale(1.5);
  filter: blur(2px) grayscale(100%);
}

.tile__caption {
  opacity: 0;
  transition: opacity var(--duration-slower) var(--ease-standard);
}

.tile:hover .tile__caption {
  opacity: 1;
}

.tile__title,
.tile__place {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: var(--space-1) var(--space-2);
}

.tile__title {
  top: 50%;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.tile__place {
  top: 85%;
  border-radius: var(--radius-xl);
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  backdrop-filter: blur(2px);
}

/* -------------------------------------------------------- tile placement */
.tile--tehran-people {
  grid-area: 1 / 1 / 2 / 4;
}

.tile--flower {
  grid-area: 1 / 4 / 4 / 6;
}

.tile--street {
  grid-area: 1 / 6 / 2 / 9;
}

.tile--milad-tower {
  grid-area: 1 / 9 / 8 / 12;
}

.tile--airplane {
  grid-area: 2 / 1 / 6 / 4;
}

.tile--astara-snow {
  grid-area: 4 / 4 / 8 / 7;
}

.tile--hormuz {
  grid-area: 2 / 7 / 8 / 9;
}

.mosaic__brand {
  grid-area: 2 / 6 / 4 / 7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: clamp(1.5rem, 4vw, 3rem);
}

.mosaic__cta {
  grid-area: 6 / 1 / 8 / 4;
}

@media (max-width: 68rem) {
  .mosaic {
    grid-auto-columns: minmax(0.625rem, auto);
    gap: var(--space-2);
  }
}

@media (max-width: 60rem) {
  .tile--tehran-people {
    grid-area: 1 / 1 / 2 / 8;
  }

  .tile--flower {
    grid-area: 2 / 1 / 6 / 8;
  }

  .tile--street {
    grid-area: 8 / 6 / 10 / 12;
  }

  .tile--milad-tower {
    grid-area: 1 / 8 / 8 / 12;
  }

  .tile--airplane {
    grid-area: 6 / 1 / 10 / 6;
  }

  .tile--astara-snow {
    grid-area: 10 / 7 / 14 / 12;
  }

  .tile--hormuz {
    grid-area: 10 / 1 / 14 / 7;
  }

  .mosaic__brand {
    grid-area: 6 / 6 / 8 / 8;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mosaic__brand {
    font-size: clamp(1.25rem, 6vw, 2rem);
  }

  .mosaic__cta {
    grid-area: 14 / 1 / 17 / 12;
  }
}
</style>
