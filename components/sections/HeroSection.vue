<script setup>
import BaseButton from "@/components/base/BaseButton.vue";
import HeroDock from "@/components/sections/HeroDock.vue";
import WaterRippleImage from "@/components/effects/WaterRippleImage.vue";
import { heroPhoto } from "@/data/hobbies";
import { site, socialUrlById } from "@/data/site";
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
        I build responsive, accessible interfaces with Vue and Nuxt &mdash; and
        care about the small motions that make them feel alive.
      </p>

      <div class="hero__actions">
        <BaseButton
          to="/about"
          label="About me"
          icon="lucide:user"
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

    <HeroDock class="hero__dock" />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Fills the phone screen without fighting mobile browser chrome. */
  min-height: 100svh;
  padding-block: var(--space-24) var(--space-32);
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

.hero__name {
  font-size: clamp(2.75rem, 9vw, 6rem);
  font-weight: var(--font-weight-bold);
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-wrap: balance;
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

.hero__dock {
  position: absolute;
  bottom: var(--space-10);
  left: 50%;
  z-index: var(--z-raised);
  transform: translateX(-50%);
}

@media (max-width: 48rem) {
  .hero {
    padding-block: var(--space-20) var(--space-32);
  }

  .hero__dock {
    /* Clears the bottom navigation island. */
    bottom: calc(var(--space-24) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
