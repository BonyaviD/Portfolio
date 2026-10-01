<script setup>
import { computed } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import HeroScrollCue from "@/components/sections/HeroScrollCue.vue";
import WaterRippleImage from "@/components/effects/WaterRippleImage.vue";
import { useActiveSection } from "@/composables/useActiveSection";
import { useLocale } from "@/composables/useLocale";
import { heroPhoto } from "@/data/hobbies";
import { sectionIds, site, socialUrlById } from "@/data/site";
import { ui } from "@/data/ui";

const { scrollTo } = useActiveSection(sectionIds);
const { t } = useLocale();

/** The name by words, so each can make its own entrance. */
const nameWords = computed(() => t(site.displayName).split(/\s+/).filter(Boolean));
</script>

<template>
  <section id="hero" class="hero" aria-labelledby="hero-heading">
    <div class="hero__media">
      <WaterRippleImage :src="heroPhoto.src" :alt="t(heroPhoto.alt)" />
      <span class="hero__scrim" aria-hidden="true"></span>
    </div>

    <div class="hero__content container">
      <p class="hero__eyebrow">
        <Icon name="lucide:map-pin" aria-hidden="true" />
        {{ t(site.location.city) }} &middot; {{ t(site.role) }}
      </p>

      <h1 id="hero-heading" class="hero__name">
        <template v-for="(word, index) in nameWords" :key="index">
          <span class="hero__word" :style="{ '--word': index }">{{ word }}</span>
          {{ index < nameWords.length - 1 ? " " : "" }}
        </template>
      </h1>

      <p class="hero__tagline">{{ t(ui.hero.tagline) }}</p>

      <div class="hero__actions">
        <BaseButton
          to="#contact"
          :label="t(ui.hero.contact)"
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

/*
 * A portrait phone carries the language switch in the top corner, over the
 * hero. The short-screen rules above pull the copy up towards it, so here it
 * is held below: the eyebrow is centred and wide enough to reach the corner.
 */
@media (max-width: 30rem) and (max-height: 46rem) {
  .hero {
    padding-top: var(--space-16);
  }
}

/* ------------------------------------------------------------- the intro
   The hero is on screen before anything is scrolled, so it does not wait for
   the scroll reveal (utils/reveal.js): its entrance is plain CSS and plays as
   the page first paints. The photo settles back from a slow push-in while
   the copy arrives in depth over it - the name a word at a time, each one
   flipping up on its own hinge. */
.hero__word {
  display: inline-block;
}

@media (prefers-reduced-motion: no-preference) {
  .hero__media {
    animation: hero-settle 2600ms var(--ease-reveal) backwards;
  }

  .hero__eyebrow {
    animation: hero-drop var(--duration-reveal) var(--ease-reveal-settle) 150ms backwards;
  }

  .hero__word {
    animation: hero-word 1500ms var(--ease-reveal-settle) backwards;
    animation-delay: calc(250ms + var(--word, 0) * 160ms);
  }

  /* The tagline is the page's largest paint (see app.vue), so it is never
     transparent: it paints at once, out of focus, and sharpens. Fading it in
     would push LCP back by the length of the fade. */
  .hero__tagline {
    animation: hero-focus 1500ms var(--ease-reveal) backwards;
  }

  .hero__actions {
    animation: hero-rise var(--duration-reveal) var(--ease-reveal-settle) 700ms backwards;
  }

  .hero__cue {
    animation: hero-fade var(--duration-slower) var(--ease-standard) 1300ms backwards;
  }
}

@keyframes hero-settle {
  from {
    scale: 1.18;
  }
}

@keyframes hero-drop {
  from {
    transform-origin: 50% 0;
    opacity: 0;
    transform: perspective(var(--reveal-perspective)) translateY(calc(-1 * var(--space-6)))
      rotateX(90deg);
  }

  to {
    transform-origin: 50% 0;
  }
}

@keyframes hero-word {
  from {
    transform-origin: 50% 100%;
    opacity: 0;
    transform: perspective(var(--reveal-perspective)) translate3d(0, 0.5em, -6rem) rotateX(-95deg);
    filter: blur(10px);
  }

  to {
    transform-origin: 50% 100%;
  }
}

@keyframes hero-focus {
  from {
    translate: 0 var(--space-4);
    filter: blur(14px);
  }
}

@keyframes hero-rise {
  from {
    transform-origin: 50% 100%;
    opacity: 0;
    transform: perspective(var(--reveal-perspective)) translate3d(0, var(--space-12), -8rem)
      rotateX(45deg);
  }

  to {
    transform-origin: 50% 100%;
  }
}

@keyframes hero-fade {
  from {
    opacity: 0;
  }
}

/* -------------------------------------------------------------- the exit
   Tied to the scroll: as the hero is scrolled away its copy tips back and
   sinks into the page while the photo pushes in behind it, so the first
   swipe already moves in depth. Separate properties from the intro above
   (transform here, scale and translate there) so the two never collide. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .hero {
      view-timeline: --hero block;
    }

    .hero__content {
      animation: hero-recede linear both;
      animation-timeline: --hero;
      animation-range: exit 0% exit 80%;
    }

    .hero__media {
      animation:
        hero-settle 2600ms var(--ease-reveal) backwards,
        hero-push linear both;
      animation-timeline: auto, --hero;
      animation-range: normal, exit 0% exit 100%;
    }
  }
}

@keyframes hero-recede {
  to {
    transform-origin: 50% 100%;
    opacity: 0;
    transform: perspective(var(--reveal-perspective)) translate3d(0, calc(-1 * var(--space-16)), -24rem)
      rotateX(28deg);
  }
}

@keyframes hero-push {
  to {
    transform: translateY(18%) scale(1.15);
  }
}
</style>
