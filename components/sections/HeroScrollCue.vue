<script setup>
/**
 * The invitation to scroll, pinned to the bottom of the hero.
 *
 * Replaces the dock of stack logos, which said what the Skills section
 * already says and gave the eye nothing to do. This gives it somewhere to
 * go: a curved yellow line with the promise written into its bowl, and a
 * mouse whose wheel keeps rolling downwards.
 */
defineProps({
  /** Section id to scroll to. */
  target: { type: String, default: "about" },
});

const emit = defineEmits(["go"]);
</script>

<template>
  <button type="button" class="cue" aria-label="See what is below" @click="emit('go', target)">
    <svg class="cue__art" viewBox="0 0 240 116" aria-hidden="true" focusable="false">
      <defs>
        <!-- Fades out at both ends so the arc reads as a stroke of light
             rather than a shape with a start and a stop. -->
        <linearGradient id="heroCueFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
          <stop offset="32%" stop-color="currentColor" stop-opacity="0.95" />
          <stop offset="68%" stop-color="currentColor" stop-opacity="0.95" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
        <!-- The text rides this; the drawn arc below is a second, deeper
             curve, so the line never crosses the letters. -->
        <path id="heroCueType" d="M 14 30 Q 120 66 226 30" />
        <path id="heroCueArc" d="M 34 46 Q 120 84 206 46" />
      </defs>

      <text class="cue__text">
        <textPath href="#heroCueType" startOffset="50%" text-anchor="middle">
          See Magic
        </textPath>
      </text>

      <use
        href="#heroCueArc"
        fill="none"
        stroke="url(#heroCueFade)"
        stroke-width="2.25"
        stroke-linecap="round"
      />

      <g class="cue__mouse">
        <rect
          x="105"
          y="72"
          width="30"
          height="42"
          rx="15"
          fill="rgb(6 14 24 / 45%)"
          stroke="currentColor"
          stroke-width="2"
        />
        <circle class="cue__wheel" cx="120" cy="84" r="2.8" fill="currentColor" />
      </g>
    </svg>
  </button>
</template>

<style scoped>
.cue {
  display: block;
  width: 16rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-primary);
  cursor: pointer;
  filter: drop-shadow(0 0 16px rgb(244 196 118 / 30%));
}

.cue:hover {
  color: var(--color-primary-strong);
}

/* The bob lives here rather than on the button, so the button is free to be
   centred with a transform of its own. */
.cue__art {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  animation: cue-bob 3.4s var(--ease-standard) infinite;
}

.cue__text {
  fill: currentColor;
  font-family: var(--font-family-base);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

/* The wheel keeps rolling: down, out, and back to the top. */
.cue__wheel {
  animation: cue-wheel 2.2s var(--ease-standard) infinite;
}

@keyframes cue-wheel {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  20% {
    opacity: 1;
  }
  70% {
    opacity: 0;
    transform: translateY(14px);
  }
  100% {
    opacity: 0;
    transform: translateY(14px);
  }
}

@keyframes cue-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(0.4rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cue__art,
  .cue__wheel {
    animation: none;
  }

  .cue__wheel {
    opacity: 1;
  }
}

@media (max-width: 48rem) {
  .cue {
    width: 12.5rem;
  }

  .cue__text {
    font-size: 17px;
    letter-spacing: 0.24em;
  }
}
</style>
