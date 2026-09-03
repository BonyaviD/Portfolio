<script setup>
/**
 * The shared surface plate: gold hairline border over the brand gradient.
 * Used for skill tags, quick facts, and anything else that needs to read as
 * a raised panel. Previously this gradient was copy-pasted per component.
 */
defineProps({
  /** Element or component to render as, e.g. "li" inside a list. */
  as: { type: String, default: "div" },
  padding: {
    type: String,
    default: "md",
    validator: (value) => ["none", "sm", "md", "lg"].includes(value),
  },
  align: {
    type: String,
    default: "start",
    validator: (value) => ["start", "center"].includes(value),
  },
});
</script>

<template>
  <component :is="as" class="card" :class="[`card--pad-${padding}`, `card--align-${align}`]">
    <slot />
  </component>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  color: var(--color-text-muted);
}

.card--pad-none {
  padding: var(--space-0);
}

.card--pad-sm {
  padding: var(--space-2);
}

.card--pad-md {
  padding: var(--space-4) var(--space-5);
}

.card--pad-lg {
  padding: var(--space-6) var(--space-8);
}

.card--align-center {
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
