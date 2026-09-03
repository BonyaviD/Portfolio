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
  /** URL of an SVG/image to show before the label. */
  icon: { type: String, default: "" },
  variant: {
    type: String,
    default: "solid",
    validator: (value) => ["solid", "soft"].includes(value),
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
    <img v-if="icon" class="button__icon" :src="icon" alt="" aria-hidden="true" />
    <span v-if="label" class="button__label">{{ label }}</span>
  </NuxtLink>
</template>

<style scoped>
/* Animating a gradient stop needs a registered custom property. */
@property --button-fill-stop {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 95%;
}

.button {
  --button-icon-size: 1.5rem;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  box-shadow: var(--shadow-raised);
  transition:
    --button-fill-stop var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-slow) var(--ease-standard),
    background-color var(--duration-base) var(--ease-standard);
}

.button:hover {
  box-shadow: var(--shadow-glow);
}

/* ------------------------------------------------------------------ sizes */
.button--sm {
  --button-icon-size: 1rem;

  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.button--md {
  --button-icon-size: 1.5rem;

  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
}

.button--lg {
  --button-icon-size: 2rem;

  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-lg);
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

/* Translucent plate with a gold hairline; the fill rises on hover. */
.button--soft {
  background: linear-gradient(
    180deg,
    var(--color-primary-soft) 10%,
    var(--color-primary-soft) var(--button-fill-stop),
    var(--color-primary) 80%
  );
}

.button--soft::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: var(--border-width-thin);
  border-radius: inherit;
  background: var(--color-primary);
  /* Border-as-gradient: paint the padding ring only. */
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.button--soft:hover {
  --button-fill-stop: 8%;
}

.button--solid {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-weight: var(--font-weight-bold);
}

.button--solid:hover {
  background-color: var(--color-primary-strong);
}

/* ---------------------------------------------------------------- content */
.button__icon {
  flex-shrink: 0;
  width: var(--button-icon-size);
  height: var(--button-icon-size);
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
