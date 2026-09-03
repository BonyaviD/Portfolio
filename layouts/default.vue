<script setup>
import PageBackdrop from "@/components/effects/PageBackdrop.vue";
import TheNavIsland from "@/components/layout/TheNavIsland.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">Skip to content</a>

    <PageBackdrop />
    <TheNavIsland />

    <main id="main" class="app-shell__main">
      <slot />
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.app-shell {
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

.skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
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
