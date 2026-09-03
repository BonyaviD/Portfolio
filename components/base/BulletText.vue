<script setup>
/**
 * A line of copy marked with the brand's gold dot.
 *
 * Spacing between consecutive bullets is the container's job (use a flex/grid
 * gap) so this component never dictates its own outer margins.
 */
defineProps({
  /** Render as "li" when used inside a list, "p" when standalone. */
  as: { type: String, default: "p" },
});
</script>

<template>
  <component :is="as" class="bullet-text">
    <slot />
  </component>
</template>

<style scoped>
.bullet-text {
  position: relative;
  margin-left: var(--space-6);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-relaxed);
}

.bullet-text::before {
  content: "";
  position: absolute;
  top: 0.5em;
  left: calc(var(--space-6) * -1);
  width: var(--space-4);
  height: var(--space-4);
  border-radius: var(--radius-circle);
  background-color: var(--color-primary);
}
</style>
