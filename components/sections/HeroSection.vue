<script setup>
import BaseButton from "@/components/base/BaseButton.vue";
import HeroScrollCue from "@/components/sections/HeroScrollCue.vue";
import WaterRippleImage from "@/components/effects/WaterRippleImage.vue";
import { useActiveSection } from "@/composables/useActiveSection";
import { heroPhoto } from "@/data/hobbies";
import { sectionIds, site, socialUrlById } from "@/data/site";

const { scrollTo } = useActiveSection(sectionIds);
</script>

<template>
  <section id="hero" class="hero" aria-labelledby="hero-heading">
    <div class="hero__media">
      <WaterRippleImage :src="heroPhoto.src" :alt="heroPhoto.alt" />
      <span class="hero__scrim" aria-hidden="true"></span>
    </div>

    <div class="hero__content container">
      <p class="hero__eyebrow">
        <Icon name="lucide:map-pin" aria-hidden="true" />
        {{ site.location.city }} &middot; {{ site.role }}
      </p>

      <h1 id="hero-heading" class="hero__name">{{ site.name }}</h1>

      <p class="hero__tagline">
        I build fast, accessible products with Next.js, Nuxt and Three.js &mdash;
        and care about the small motions that make them feel alive.
      </p>

      <div class="hero__actions">
        <BaseButton
          to="#contact"
          label="Contact me"
          icon="lucide:mail"
          variant="solid"
          size="lg"
        />
        <BaseButton
          :to="socialUrlById.github"
          label="GitHub"
          icon="simple-icons:github"
          trailing-icon="lucide:arrow-up-right"
          variant="soft"
          size="lg"
        />
      </div>
    </div>

    <HeroScrollCue class="hero__cue" target="about" @go="scrollTo" />
  </section>
</template>

<style scoped>
/**
 * Two rows: the copy centred in everything left over, then the scroll cue on
 * a row of its own.
 *
 * The cue used to be absolutely positioned against the bottom, which took it
 * out of the flow - so on a short phone the centred copy grew straight into
 * it and "See Magic" landed across the buttons. In the flow it is simply the
 * last thing in the column, and the two can no longer meet.
 */
.hero {
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;
  align-items: center;
  justify-items: center;
  row-gap: var(--space-8);
  /* Fills the phone screen without fighting mobile browser chrome. */
  min-height: 100svh;
  padding-block: var(--space-24) var(--space-12);
  overflow: hidden;
  text-align: center;
}

.hero__media {
  position: absolute;
  inset: 0;
}

/* Darkens the photo so the display type stays legible over any part of it. */
.hero__scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 80% at 50% 42%, rgb(6 14 24 / 30%) 0%, rgb(6 14 24 / 78%) 72%),
    linear-gradient(180deg, rgb(6 14 24 / 62%) 0%, rgb(6 14 24 / 45%) 45%, var(--color-bg) 100%);
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  max-width: 52rem;
  /* The ripple reacts to presses on the photo, not through the copy. */
  pointer-events: none;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
}

/* Sized off the viewport width and never allowed to wrap: the name is meant
   to read as one line at every width. */
.hero__name {
  font-size: clamp(1.75rem, 10.5vw, 4.5rem);
  font-weight: var(--font-weight-bold);
  line-height: 1.05;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.hero__tagline {
  max-width: 36rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
  text-wrap: balance;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
  /* Re-enable clicks that the content wrapper turned off. */
  pointer-events: auto;
}

.hero__cue {
  position: relative;
  z-index: var(--z-raised);
}

@media (max-width: 48rem) {
  .hero {
    /* The bottom padding clears the navigation island, which moves to the
       bottom of the screen at this width. */
    padding-block: var(--space-20) calc(var(--space-24) + env(safe-area-inset-bottom, 0px));
  }
}

/*
 * Short screens - small phones, and any phone held sideways. The hero still
 * has to fit the copy, the cue and the navigation island between the top and
 * the bottom of the viewport, so everything tightens rather than spilling
 * past the fold.
 */
@media (max-height: 46rem) {
  .hero {
    padding-block: var(--space-12) calc(var(--space-24) + env(safe-area-inset-bottom, 0px));
    row-gap: var(--space-4);
  }

  .hero__tagline {
    font-size: var(--font-size-base);
  }

  .hero__cue {
    width: 9.5rem;
  }
}

/*
 * Shorter still: the copy alone fills the screen, and a hint to scroll is
 * redundant when there is visibly more page below it.
 */
@media (max-height: 38rem) {
  .hero {
    padding-block: var(--space-10) calc(var(--space-20) + env(safe-area-inset-bottom, 0px));
    row-gap: 0;
  }

  .hero__content {
    gap: var(--space-3);
  }

  /* Sized off the height as well, so a phone held sideways does not get a
     name scaled to its very wide viewport. */
  .hero__name {
    font-size: clamp(1.5rem, 11vh, 3.5rem);
  }

  .hero__tagline {
    font-size: var(--font-size-sm);
  }

  .hero__cue {
    display: none;
  }
}
</style>
