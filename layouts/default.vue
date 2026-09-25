<script setup>
import PageBackdrop from "@/components/effects/PageBackdrop.vue";
import LanguageSwitch from "@/components/layout/LanguageSwitch.vue";
import TheNavIsland from "@/components/layout/TheNavIsland.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
import { useLocale } from "@/composables/useLocale";
import { site } from "@/data/site";
import { ui } from "@/data/ui";
import LogoImage from "~/assets/img/brand/mark.svg";

const { path, t } = useLocale();
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">{{ t(ui.layout.skipLink) }}</a>

    <PageBackdrop />
    <TheNavIsland />

    <!-- The two corner buttons, glass like the bar between them: home at the
         start, the other language at the end. They float with the bar on
         wide screens and scroll away with the page on phones, where the bar
         has moved to the bottom. -->
    <NuxtLink
      :to="path('/')"
      class="app-shell__corner app-shell__brand liquid-glass"
      :aria-label="t(ui.nav.home, { name: t(site.displayName) })"
    >
      <img :src="LogoImage" alt="" width="31" height="28" />
    </NuxtLink>
    <LanguageSwitch variant="glass" class="app-shell__corner app-shell__lang" />

    <main id="main" class="app-shell__main">
      <slot />
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-shell__main {
  flex: 1;
  /* Full-bleed children use 100vw, which overshoots when a vertical scrollbar
     is present. `clip` contains them without creating a scroll container the
     way `hidden` would. */
  overflow-x: clip;
}

/* ------------------------------------------------------------ corners */
/* Level with the middle of the bar (its top edge plus half its height). */
.app-shell .app-shell__corner {
  position: fixed;
  top: calc(var(--space-4) + 0.55rem);
  z-index: var(--z-header);
}

.app-shell .app-shell__brand {
  inset-inline-start: var(--space-6);
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  transition: scale var(--duration-base) var(--ease-spring);
}

.app-shell__brand img {
  width: 1.45rem;
  height: auto;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 35%));
}

.app-shell__brand:hover {
  scale: 1.05;
}

.app-shell .app-shell__lang {
  inset-inline-end: var(--space-6);
}

@media (max-width: 48rem) {
  .app-shell .app-shell__corner {
    position: absolute;
    top: calc(var(--space-4) + env(safe-area-inset-top, 0px));
  }

  .app-shell .app-shell__brand {
    inset-inline-start: var(--space-4);
  }

  .app-shell .app-shell__lang {
    inset-inline-end: var(--space-4);
  }
}

.skip-link {
  position: absolute;
  top: var(--space-2);
  inset-inline-start: var(--space-2);
  z-index: calc(var(--z-header) + 1);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: var(--font-weight-bold);
  transform: translateY(-200%);
  transition: transform var(--duration-fast) var(--ease-standard);
}

.skip-link:focus-visible {
  transform: translateY(0);
}
</style>
