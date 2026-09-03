<script setup>
import TheHeader from "@/components/layout/TheHeader.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">Skip to content</a>
    <TheHeader />
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

/* Clears the fixed header. */
.app-shell__main {
  flex: 1;
  margin-top: var(--header-height);
}

.skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: calc(var(--z-header) + 1);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
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
