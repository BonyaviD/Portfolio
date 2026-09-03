<script setup>
import { computed } from "vue";

/**
 * The single call-to-action primitive. Renders a NuxtLink so it works for both
 * internal routes and external URLs.
 *
 * The label is always rendered for assistive technology: `iconOnly` and
 * `hideLabelOnMobile` hide it visually but keep it in the accessibility tree,
 * which is what gives icon-only buttons an accessible name.
 */
const props = defineProps({
  to: { type: String, required: true },
  label: { type: String, default: "" },
  /** Iconify name, e.g. "simple-icons:github". */
  icon: { type: String, default: "" },
  /** Iconify name shown after the label, e.g. an external-link arrow. */
  trailingIcon: { type: String, default: "" },
  variant: {
    type: String,
    default: "solid",
    validator: (value) => ["solid", "soft", "ghost"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  /** Square button showing only the icon; `label` becomes the accessible name. */
  iconOnly: { type: Boolean, default: false },
  /** Collapse to the icon alone on narrow viewports. */
  hideLabelOnMobile: { type: Boolean, default: false },
  /** Stretch to fill the parent. */
  block: { type: Boolean, default: false },
});

const isExternal = computed(() => /^https?:\/\//.test(props.to));

const classes = computed(() => [
  `button--${props.variant}`,
  `button--${props.size}`,
  {
    "button--icon-only": props.iconOnly,
    "button--hide-label-mobile": props.hideLabelOnMobile && !props.iconOnly,
    "button--block": props.block,
  },
]);
</script>

<template>
  <NuxtLink
    :to="to"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    class="button"
    :class="classes"
  >
    <Icon v-if="icon" :name="icon" class="button__icon" aria-hidden="true" />
    <span v-if="label" class="button__label">{{ label }}</span>
    <Icon
      v-if="trailingIcon"
      :name="trailingIcon"
      class="button__icon button__icon--trailing"
      aria-hidden="true"
    />
  </NuxtLink>
</template>

<style scoped>
.button {
  --button-icon-size: 1.25rem;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-pill);
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  white-space: nowrap;
  transition:
    transform var(--duration-base) var(--ease-spring),
    background-color var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard);
}

.button:hover {
  transform: translateY(-1px);
}

.button:active {
  transform: scale(0.96);
  transition-duration: var(--duration-fast);
}

/* ------------------------------------------------------------------ sizes */
.button--sm {
  --button-icon-size: 1rem;

  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
}

.button--md {
  --button-icon-size: 1.25rem;

  padding: var(--space-3) var(--space-5);
  font-size: var(--font-size-base);
}

.button--lg {
  --button-icon-size: 1.5rem;

  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-md);
}

.button--icon-only.button--sm {
  padding: var(--space-2);
}

.button--icon-only.button--md {
  padding: var(--space-3);
}

.button--icon-only.button--lg {
  padding: var(--space-4);
}

.button--block {
  display: flex;
  width: 100%;
  height: 100%;
}

/* --------------------------------------------------------------- variants */

/* Frosted plate, the default chrome treatment across the site. */
.button--soft {
  border: var(--border-width-hairline) solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
}

.button--soft:hover {
  border-color: var(--color-primary-soft);
  background: var(--glass-bg-strong);
}

.button--solid {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-raised);
}

.button--solid:hover {
  background-color: var(--color-primary-strong);
  box-shadow: var(--shadow-glow);
}

/* No plate at all: for dense rows where the icon carries the affordance. */
.button--ghost {
  color: var(--color-text-muted);
}

.button--ghost:hover {
  color: var(--color-text);
  background: var(--glass-bg);
}

/* ---------------------------------------------------------------- content */
.button__icon {
  flex-shrink: 0;
  width: var(--button-icon-size);
  height: var(--button-icon-size);
}

.button__icon--trailing {
  opacity: 0.7;
}

/* Visually hidden, still announced: keeps icon buttons named. */
.button--icon-only .button__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 30rem) {
  .button--hide-label-mobile .button__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
