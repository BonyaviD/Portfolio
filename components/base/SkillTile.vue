<script setup>
import { computed, ref } from "vue";
import { SKILL_LEVELS } from "@/data/skills";

/**
 * A frosted glass skill tile, styled after an iOS home-screen icon: squircle
 * corners, a lit top edge, and a spring-loaded tilt that follows the pointer.
 *
 * Two layers on purpose - the <li> owns the entrance animation, the surface
 * owns the tilt - so the two transforms never fight each other.
 */
const props = defineProps({
  name: { type: String, required: true },
  /** Iconify name for the technology's logo. */
  icon: { type: String, default: "" },
  level: {
    type: String,
    default: "",
    validator: (value) => value === "" || SKILL_LEVELS.includes(value),
  },
  /** Drives the staggered entrance delay. */
  index: { type: Number, default: 0 },
  /** Parent-controlled: flips on when the grid scrolls into view. */
  revealed: { type: Boolean, default: true },
});

const MAX_TILT_DEG = 9;

const tiltX = ref(0);
const tiltY = ref(0);
const glowX = ref(50);
const glowY = ref(50);

/** How many of the four level segments are lit. */
const filledSegments = computed(() =>
  props.level ? SKILL_LEVELS.indexOf(props.level) + 1 : 0
);

function handlePointerMove(event) {
  // Touch has no hover state, so the tilt would just fight the tap.
  if (event.pointerType !== "mouse") return;

  const rect = event.currentTarget.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width;
  const py = (event.clientY - rect.top) / rect.height;

  glowX.value = px * 100;
  glowY.value = py * 100;
  tiltY.value = (px - 0.5) * 2 * MAX_TILT_DEG;
  tiltX.value = (0.5 - py) * 2 * MAX_TILT_DEG;
}

function resetTilt() {
  tiltX.value = 0;
  tiltY.value = 0;
  glowX.value = 50;
  glowY.value = 50;
}
</script>

<template>
  <li
    class="skill-tile"
    :class="{ 'is-revealed': revealed }"
    :style="{
      '--tile-index': index,
      '--tilt-x': `${tiltX}deg`,
      '--tilt-y': `${tiltY}deg`,
      '--glow-x': `${glowX}%`,
      '--glow-y': `${glowY}%`,
    }"
    @pointermove="handlePointerMove"
    @pointerleave="resetTilt"
  >
    <div class="skill-tile__surface">
      <span class="skill-tile__sheen" aria-hidden="true"></span>

      <span v-if="icon" class="skill-tile__glyph">
        <Icon :name="icon" aria-hidden="true" />
      </span>

      <span class="skill-tile__name">{{ name }}</span>

      <span v-if="level" class="skill-tile__meta">
        <span class="skill-tile__level">{{ level }}</span>
        <span class="skill-tile__meter" aria-hidden="true">
          <span
            v-for="segment in SKILL_LEVELS.length"
            :key="segment"
            class="skill-tile__segment"
            :class="{ 'is-filled': segment <= filledSegments }"
          ></span>
        </span>
      </span>
    </div>
  </li>
</template>

<style scoped>
/* ---------------------------------------------- layer 1: entrance + depth */
.skill-tile {
  list-style: none;
  /* Depth for the child's rotation; per-tile so each tilts independently. */
  perspective: 42rem;
}

/* Hidden only while a parent is deliberately holding the entrance back, so a
   tile is never invisible just because its animation did not get to run. */
.skill-tile:not(.is-revealed) {
  opacity: 0;
}

/* `backwards` holds the start frame through the stagger delay (no flash) and
   then hands back to the base style, which is visible. */
.skill-tile.is-revealed {
  animation: tile-in var(--duration-slow) cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
  animation-delay: calc(var(--tile-index) * 35ms);
}

@keyframes tile-in {
  from {
    opacity: 0;
    transform: translateY(var(--space-6)) scale(0.96);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

/* ------------------------------------------------------ layer 2: the glass */
.skill-tile__surface {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  height: 100%;
  min-height: 9rem;
  padding: var(--space-4);
  overflow: hidden;
  /* Roughly the iOS icon corner ratio. */
  border-radius: 1.5rem;
  background:
    radial-gradient(
      60% 60% at var(--glow-x) var(--glow-y),
      rgb(230 182 108 / 16%) 0%,
      transparent 70%
    ),
    linear-gradient(
      155deg,
      rgb(255 255 255 / 11%) 0%,
      rgb(255 255 255 / 3%) 48%,
      rgb(255 255 255 / 6%) 100%
    );
  backdrop-filter: blur(18px) saturate(160%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 20%),
    inset 0 0 0 1px rgb(255 255 255 / 7%),
    0 12px 30px -14px rgb(0 0 0 / 80%);
  transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transition:
    transform var(--duration-slow) cubic-bezier(0.34, 1.4, 0.64, 1),
    box-shadow var(--duration-base) var(--ease-standard);
  will-change: transform;
}

.skill-tile:hover .skill-tile__surface {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 28%),
    inset 0 0 0 1px rgb(230 182 108 / 32%),
    0 20px 44px -16px rgb(0 0 0 / 85%),
    0 0 30px -6px rgb(230 182 108 / 22%);
}

/* Pressed state, borrowed straight from a tapped app icon. */
.skill-tile__surface:active {
  transform: scale(0.96);
  transition-duration: var(--duration-fast);
}

/* Specular streak across the upper edge. */
.skill-tile__sheen {
  position: absolute;
  inset: 0 0 auto;
  height: 55%;
  background: linear-gradient(180deg, rgb(255 255 255 / 9%) 0%, transparent 100%);
  pointer-events: none;
}

/* ---------------------------------------------------------------- content */

/* Small rounded plate holding the logo, like an icon inside an icon. */
.skill-tile__glyph {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-lg);
  border: var(--border-width-hairline) solid rgb(255 255 255 / 10%);
  background: rgb(255 255 255 / 7%);
  color: var(--color-primary);
  font-size: 1.25rem;
  transition:
    color var(--duration-base) var(--ease-standard),
    transform var(--duration-slow) var(--ease-spring);
}

.skill-tile:hover .skill-tile__glyph {
  transform: translateY(-2px) scale(1.06);
}

.skill-tile__name {
  position: relative;
  margin-top: auto;
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.01em;
}

.skill-tile__meta {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skill-tile__level {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.skill-tile__meter {
  display: flex;
  gap: 0.1875rem;
}

.skill-tile__segment {
  flex: 1;
  height: 0.1875rem;
  border-radius: var(--radius-pill);
  background-color: rgb(255 255 255 / 12%);
}

.skill-tile__segment.is-filled {
  background-color: var(--color-primary);
}

/* ------------------------------------------------------------ responsive */

/* Coarse pointers get no tilt: there is no hover to drive it. */
@media (hover: none) {
  .skill-tile__surface {
    transform: none;
  }
}

@media (max-width: 48rem) {
  .skill-tile__surface {
    min-height: 7.5rem;
    padding: var(--space-3);
    border-radius: 1.125rem;
    /* Cheaper on phones, where a blur behind every tile is the expensive part. */
    backdrop-filter: blur(10px) saturate(140%);
  }

  .skill-tile__name {
    font-size: var(--font-size-base);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skill-tile,
  .skill-tile:not(.is-revealed) {
    opacity: 1;
    animation: none;
  }

  .skill-tile__surface {
    transform: none;
  }
}
</style>
