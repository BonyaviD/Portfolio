<script setup>
/**
 * The gold, centred heading used at the top of every section.
 *
 * Deliberately takes no margin props: outer spacing belongs to the layout
 * (BaseSection) rather than to inline styles on the heading itself.
 */
defineProps({
  /** Heading level, so document outline order stays correct per page. */
  as: {
    type: String,
    default: "h2",
    validator: (value) => ["h1", "h2", "h3", "h4"].includes(value),
  },
  align: {
    type: String,
    default: "center",
    validator: (value) => ["center", "start"].includes(value),
  },
});
</script>

<template>
  <component :is="as" class="section-heading" :class="`section-heading--${align}`">
    <slot />
  </component>
</template>

<style scoped>
.section-heading {
  color: var(--color-primary);
  font-size: var(--font-size-heading);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-tight);
}

.section-heading--center {
  text-align: center;
}

.section-heading--start {
  text-align: start;
}
</style>
