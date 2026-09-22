<script setup>
import PageBackdrop from "@/components/effects/PageBackdrop.vue";
import LanguageSwitch from "@/components/layout/LanguageSwitch.vue";
import TheNavIsland from "@/components/layout/TheNavIsland.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
import { useLocale } from "@/composables/useLocale";
import { ui } from "@/data/ui";

const { t } = useLocale();
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">{{ t(ui.layout.skipLink) }}</a>

    <PageBackdrop />
    <TheNavIsland />

    <!-- Phones only. The navigation bar at the bottom has no room left for
         it, so the language sits at the top of the page, where a visitor
         looks first. It scrolls away with the page rather than following. -->
    <LanguageSwitch variant="floating" class="app-shell__lang" />

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

.app-shell .app-shell__lang {
  display: none;
}

@media (max-width: 48rem) {
  .app-shell .app-shell__lang {
    position: absolute;
    top: calc(var(--space-4) + env(safe-area-inset-top, 0px));
    inset-inline-end: var(--space-4);
    z-index: var(--z-header);
    display: inline-flex;
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
