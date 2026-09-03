<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useGameStage } from "@/composables/useGameStage";
import { games } from "@/data/hobbies";

/**
 * A full-viewport slider: artwork on the right, the game on the left, one
 * game at a time.
 *
 * Deliberately does not capture vertical scrolling. Hijacking the wheel to
 * drive a carousel makes a page feel broken, so this advances on horizontal
 * swipe, drag, the arrow keys and the controls, and lets the page scroll past
 * normally.
 */
const stageEl = ref(null);
const { isActive, index, accents, show } = useGameStage(stageEl, { games });

const current = computed(() => games[index.value] ?? games[0]);
const accent = computed(() => accents.value[index.value] || "rgb(230 182 108)");
const counter = computed(() => String(index.value + 1).padStart(2, "0"));

/** Re-keys the copy so it replays its entrance on every change. */
const slideKey = computed(() => current.value?.id ?? index.value);

function go(step) {
  show(index.value + step);
}

// ------------------------------------------------------------------ gestures
let pointerStartX = null;
let pointerStartY = null;
const SWIPE_THRESHOLD = 48;

function onPointerDown(event) {
  pointerStartX = event.clientX;
  pointerStartY = event.clientY;
}

function onPointerUp(event) {
  if (pointerStartX === null) return;
  const dx = event.clientX - pointerStartX;
  const dy = event.clientY - pointerStartY;
  pointerStartX = null;

  // Only a mostly-horizontal gesture counts; the rest belongs to the page.
  if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
    go(dx < 0 ? 1 : -1);
  }
}

function onKeydown(event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    go(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    go(-1);
  }
}

// Sideways trackpad swipes advance; vertical wheel is left to the page.
let wheelLock = false;
function onWheel(event) {
  if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
  event.preventDefault();
  if (wheelLock) return;
  wheelLock = true;
  go(event.deltaX > 0 ? 1 : -1);
  setTimeout(() => (wheelLock = false), 500);
}

const rootEl = ref(null);
let listeners = null;

onMounted(() => {
  listeners = new AbortController();
  rootEl.value?.addEventListener("wheel", onWheel, {
    passive: false,
    signal: listeners.signal,
  });
});

onBeforeUnmount(() => listeners?.abort());

/** Announce the change for assistive tech without moving focus. */
const liveMessage = ref("");
watch(index, () => {
  liveMessage.value = `${current.value.title}, ${index.value + 1} of ${games.length}`;
});
</script>

<template>
  <div
    ref="rootEl"
    class="games"
    :style="{ '--accent': accent }"
    role="group"
    aria-roledescription="carousel"
    aria-label="Favourite games"
    tabindex="0"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="pointerStartX = null"
  >
    <span class="games__wash" aria-hidden="true"></span>

    <div ref="stageEl" class="games__stage" aria-hidden="true"></div>

    <!-- Artwork fallback: shown until the stage is live, and if WebGL is out. -->
    <img
      v-if="!isActive"
      class="games__fallback"
      :src="current.src"
      :alt="`${current.title} cover art`"
    />

    <div class="games__panel">
      <div class="games__head">
        <h3 class="games__heading">
          <Icon name="lucide:gamepad-2" aria-hidden="true" />
          Gaming
        </h3>
        <p class="games__platform">
          <Icon name="simple-icons:playstation" aria-hidden="true" />
          Mostly PlayStation
        </p>
      </div>

      <transition name="slide" mode="out-in">
        <div :key="slideKey" class="copy">
          <p class="copy__counter">
            <span class="copy__index">{{ counter }}</span>
            <span class="copy__total">/ {{ String(games.length).padStart(2, "0") }}</span>
          </p>

          <h4 class="copy__title">{{ current.title }}</h4>

          <ul class="copy__meta" role="list">
            <li>{{ current.studio }}</li>
            <li v-if="current.year">{{ current.year }}</li>
            <li>{{ current.genre }}</li>
          </ul>

          <p class="copy__blurb">{{ current.blurb }}</p>
        </div>
      </transition>

      <div class="controls">
        <button type="button" class="controls__button" aria-label="Previous game" @click="go(-1)">
          <Icon name="lucide:arrow-left" aria-hidden="true" />
        </button>
        <button type="button" class="controls__button" aria-label="Next game" @click="go(1)">
          <Icon name="lucide:arrow-right" aria-hidden="true" />
        </button>

        <ul class="dots" role="list">
          <li v-for="(game, i) in games" :key="game.id">
            <button
              type="button"
              class="dots__dot"
              :class="{ 'is-current': i === index }"
              :aria-label="game.title"
              :aria-current="i === index ? 'true' : undefined"
              @click="show(i)"
            ></button>
          </li>
        </ul>
      </div>

      <p class="games__hint" aria-hidden="true">Swipe, drag or use &larr; &rarr;</p>
    </div>

    <p class="visually-hidden" aria-live="polite">{{ liveMessage }}</p>
  </div>
</template>

<style scoped>
/* One card holding the whole slider. It reaches almost to the viewport edges
   but keeps a margin, so it reads as a card rather than a full-bleed band. */
.games {
  --card-inset: clamp(0.75rem, 2.5vw, 2.5rem);

  position: relative;
  display: grid;
  align-items: center;
  min-height: min(100svh - 2 * var(--card-inset), 56rem);
  width: calc(100vw - 2 * var(--card-inset));
  /* Only the left margin centres it; `margin-inline` would collapse the box. */
  margin-left: 50%;
  margin-block: var(--card-inset);
  transform: translateX(-50%);
  /* Vertical panning stays with the page; horizontal is ours. */
  touch-action: pan-y;
}

.games:focus-visible {
  outline: var(--border-width-thick) solid var(--color-primary);
  outline-offset: calc(var(--border-width-thick) * -3);
}

/* The slide's colour, sampled from the artwork. */
/* A soft spill of the slide's colour just outside the card. */
.games__wash {
  position: absolute;
  inset: -6%;
  z-index: var(--z-behind);
  background: radial-gradient(55% 55% at 50% 50%, var(--accent) 0%, transparent 70%);
  opacity: 0.16;
  filter: blur(60px);
  transition: background var(--duration-slower) var(--ease-standard);
  pointer-events: none;
}

.games__stage,
.games__fallback {
  position: absolute;
  inset: 0;
}

/* The shader draws the card's rounded corners; the fallback needs its own. */
.games__fallback {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-2xl);
  object-fit: cover;
  opacity: 0.9;
}

.games__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-5);
}

.games__heading {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-subheading);
}

.games__heading svg {
  color: var(--color-primary);
  font-size: 0.8em;
}

.games__platform {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.games__platform svg {
  color: var(--color-primary);
}

.games__panel {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  width: min(34rem, 42vw);
  margin-left: clamp(var(--space-5), 8vw, var(--space-32));
}

/* -------------------------------------------------------------------- copy */
.copy__counter {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  font-variant-numeric: tabular-nums;
}

.copy__index {
  color: var(--color-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.copy__total {
  color: var(--color-text-subtle);
  font-size: var(--font-size-sm);
}

.copy__title {
  font-size: clamp(1.75rem, 4.2vw, 3.25rem);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.copy__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  margin-top: var(--space-4);
  list-style: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.copy__meta li + li {
  position: relative;
  padding-left: var(--space-4);
}

.copy__meta li + li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: var(--radius-circle);
  background: var(--color-primary);
  transform: translateY(-50%);
}

.copy__blurb {
  max-width: 30rem;
  margin-top: var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
}

/* The copy arrives like a panel booting in, not a gentle fade. */
.slide-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-slow) var(--ease-spring),
    filter var(--duration-base) var(--ease-out);
}

.slide-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-1.5rem) skewX(6deg);
  filter: blur(6px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}

/* ---------------------------------------------------------------- controls */
.controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.controls__button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-circle);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text);
  cursor: pointer;
  transition:
    background-color var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
}

.controls__button:hover {
  border-color: var(--color-primary-soft);
  background: var(--glass-bg-strong);
}

.controls__button:active {
  transform: scale(0.92);
}

.dots {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-left: var(--space-2);
  list-style: none;
}

.dots__dot {
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: rgb(255 255 255 / 22%);
  cursor: pointer;
  transition:
    width var(--duration-base) var(--ease-spring),
    background-color var(--duration-base) var(--ease-standard);
}

.dots__dot.is-current {
  width: 1.75rem;
  background: var(--color-primary);
}

.games__hint {
  color: var(--color-text-subtle);
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

/* ------------------------------------------------------------- responsive */
@media (max-width: 56rem) {
  .games {
    align-content: end;
    padding-bottom: calc(var(--space-20) + env(safe-area-inset-bottom, 0px));
  }

  /* Artwork moves to the top half, copy sits under it. */
  .games__panel {
    width: auto;
    margin-inline: clamp(var(--space-4), 6vw, var(--space-8));
    gap: var(--space-5);
  }

  /* The copy sits on the lower part of the card, over a readable scrim. */
  .games__panel::before {
    content: "";
    position: absolute;
    inset: -12% -8% -40% -8%;
    z-index: -1;
    background: linear-gradient(180deg, transparent, rgb(6 14 24 / 82%) 38%);
    pointer-events: none;
  }

  .copy__blurb {
    font-size: var(--font-size-base);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slide-enter-active,
  .slide-leave-active {
    transition: opacity var(--duration-fast) linear;
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: none;
    filter: none;
  }
}
</style>
