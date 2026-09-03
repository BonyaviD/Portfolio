<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useArtworkAccents } from "@/composables/useArtworkAccents";
import { games } from "@/data/hobbies";

/**
 * A console home screen, in the spirit of a PS5 dashboard: a rail of game
 * tiles along the bottom, and the whole background belonging to whichever
 * tile is selected.
 *
 * The chrome across the top is scenery. It is aria-hidden and cannot be
 * clicked, because the only thing here that does anything is moving along the
 * rail - by tile, arrow key, buttons or swipe.
 *
 * Rendered with CSS rather than WebGL on purpose: it is a straight crossfade
 * and a scaling tile, so it stays sharp, cheap and works without a GPU path.
 */
const { accents } = useArtworkAccents(games.map((game) => game.src));

const index = ref(0);
const current = computed(() => games[index.value]);
const accent = computed(() => accents.value[index.value]?.css ?? "rgb(230 182 108)");

function go(step) {
  index.value = (index.value + step + games.length) % games.length;
}

function select(next) {
  index.value = next;
}

// Keep the selected tile in view as the rail moves.
const railEl = ref(null);
function scrollSelectedIntoView() {
  const tile = railEl.value?.querySelector(".tile.is-selected");
  tile?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function onKeydown(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  go(event.key === "ArrowRight" ? 1 : -1);
  scrollSelectedIntoView();
}

// --------------------------------------------------------------- swiping
let startX = null;
let startY = null;
const SWIPE_THRESHOLD = 44;

function onPointerDown(event) {
  startX = event.clientX;
  startY = event.clientY;
}

function onPointerUp(event) {
  if (startX === null) return;
  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  startX = null;

  // Horizontal intent only; vertical belongs to the page.
  if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
    go(dx < 0 ? 1 : -1);
    scrollSelectedIntoView();
  }
}

/** Decorative clock, so the chrome does not show a frozen fake time. */
const clock = ref("");
let timer = null;

function tick() {
  clock.value = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 30_000);
});

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div
    class="console"
    :style="{ '--accent': accent }"
    role="group"
    aria-roledescription="carousel"
    aria-label="Games, console shelf view"
    tabindex="0"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="startX = null"
  >
    <!-- Background belongs to the selected game. -->
    <div class="console__scene" aria-hidden="true">
      <transition name="scene" mode="default">
        <img :key="current.id" class="console__wallpaper" :src="current.src" alt="" />
      </transition>
      <span class="console__scrim"></span>
      <span class="console__glow"></span>
    </div>

    <!-- Scenery. Not interactive, not announced. -->
    <div class="chrome" aria-hidden="true">
      <div class="chrome__tabs">
        <span class="chrome__tab is-active">Games</span>
        <span class="chrome__tab">Media</span>
      </div>
      <div class="chrome__status">
        <Icon name="lucide:search" />
        <Icon name="lucide:bell" />
        <Icon name="lucide:wifi" />
        <span class="chrome__clock">{{ clock }}</span>
        <span class="chrome__avatar">NB</span>
      </div>
    </div>

    <!-- Hero: the selected game. -->
    <div class="hero">
      <transition name="hero" mode="out-in">
        <div :key="current.id" class="hero__inner">
          <img class="hero__art" :src="current.src" :alt="`${current.title} cover art`" />

          <div class="hero__text">
            <h4 class="hero__title">{{ current.title }}</h4>
            <p class="hero__meta">
              {{ current.studio }}<template v-if="current.year"> &middot; {{ current.year }}</template>
            </p>
            <span class="hero__play">
              <Icon name="lucide:play" aria-hidden="true" />
              Play
            </span>
          </div>
        </div>
      </transition>
    </div>

    <!-- The rail: the one thing that actually does something. -->
    <div class="rail">
      <button type="button" class="rail__arrow" aria-label="Previous game" @click="go(-1); scrollSelectedIntoView()">
        <Icon name="lucide:chevron-left" aria-hidden="true" />
      </button>

      <ul ref="railEl" class="rail__list" role="list">
        <li v-for="(game, i) in games" :key="game.id">
          <button
            type="button"
            class="tile"
            :class="{ 'is-selected': i === index }"
            :aria-current="i === index ? 'true' : undefined"
            @click="select(i)"
          >
            <img class="tile__art" :src="game.src" :alt="game.title" loading="lazy" />
          </button>
        </li>
      </ul>

      <button type="button" class="rail__arrow" aria-label="Next game" @click="go(1); scrollSelectedIntoView()">
        <Icon name="lucide:chevron-right" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.console {
  --inset: clamp(0.75rem, 2.5vw, 2.5rem);

  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: min(100svh - 2 * var(--inset), 56rem);
  width: calc(100vw - 2 * var(--inset));
  margin-left: 50%;
  margin-block: var(--inset);
  overflow: hidden;
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-2xl);
  transform: translateX(-50%);
  touch-action: pan-y;
}

.console:focus-visible {
  outline: var(--border-width-thick) solid var(--color-primary);
  outline-offset: calc(var(--border-width-thick) * -3);
}

/* ------------------------------------------------------------------ scene */
.console__scene {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
}

/* Portrait cover art blown up as a wallpaper: heavily blurred and scaled, so
   it reads as atmosphere rather than a cropped poster. */
.console__wallpaper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.25);
  filter: blur(38px) saturate(130%) brightness(0.5);
}

.console__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgb(4 10 18 / 78%) 0%, rgb(4 10 18 / 35%) 40%, rgb(4 10 18 / 92%) 100%),
    linear-gradient(90deg, rgb(4 10 18 / 72%) 0%, transparent 60%);
}

.console__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(48% 55% at 72% 42%, var(--accent) 0%, transparent 68%);
  opacity: 0.28;
  transition: background var(--duration-slower) var(--ease-standard);
}

.scene-enter-active,
.scene-leave-active {
  transition: opacity var(--duration-slower) var(--ease-standard);
}

.scene-enter-from,
.scene-leave-to {
  opacity: 0;
}

/* ----------------------------------------------------------------- chrome */
.chrome {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  padding: clamp(var(--space-4), 2.5vw, var(--space-8));
  /* Scenery: never clickable. */
  pointer-events: none;
}

.chrome__tabs {
  display: flex;
  gap: var(--space-5);
}

.chrome__tab {
  color: var(--color-text-subtle);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.chrome__tab.is-active {
  position: relative;
  color: var(--color-text);
}

.chrome__tab.is-active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.4rem;
  height: 2px;
  border-radius: var(--radius-pill);
  background: var(--color-text);
}

.chrome__status {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.chrome__clock {
  font-variant-numeric: tabular-nums;
}

.chrome__avatar {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-circle);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

/* ------------------------------------------------------------------- hero */
.hero {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  align-items: center;
  padding-inline: clamp(var(--space-4), 4vw, var(--space-16));
}

.hero__inner {
  display: flex;
  align-items: center;
  gap: clamp(var(--space-5), 4vw, var(--space-12));
}

/* The complete artwork, sharp and uncropped. */
.hero__art {
  flex-shrink: 0;
  width: clamp(8rem, 15vw, 13rem);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 60px -20px rgb(0 0 0 / 85%);
}

.hero__title {
  font-size: clamp(1.75rem, 4vw, 3.25rem);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.hero__meta {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

/* Looks like the console's play button; it is a label, not a control. */
.hero__play {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-pill);
  background: var(--color-text);
  color: var(--palette-navy-950, #071019);
  font-weight: var(--font-weight-bold);
}

.hero-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-slow) var(--ease-spring);
}

.hero-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.hero-enter-from {
  opacity: 0;
  transform: translateY(1.25rem);
}

.hero-leave-to {
  opacity: 0;
  transform: translateY(-0.75rem);
}

/* ------------------------------------------------------------------- rail */
.rail {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: clamp(var(--space-4), 2vw, var(--space-8));
}

.rail__arrow {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-circle);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-standard);
}

.rail__arrow:hover {
  background: var(--glass-bg-strong);
}

.rail__list {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-block: var(--space-4);
  overflow-x: auto;
  list-style: none;
  scrollbar-width: none;
}

.rail__list::-webkit-scrollbar {
  display: none;
}

.tile {
  display: block;
  flex-shrink: 0;
  width: clamp(3.5rem, 6vw, 5rem);
  padding: 0;
  border: var(--border-width-thick) solid transparent;
  border-radius: var(--radius-md);
  background: none;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.55;
  transform-origin: bottom center;
  transition:
    transform var(--duration-slow) var(--ease-spring),
    opacity var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}

.tile:hover {
  opacity: 0.85;
}

/* The selected tile lifts and lights up, the way a console highlights it. */
.tile.is-selected {
  border-color: var(--color-text);
  opacity: 1;
  transform: scale(1.32) translateY(-0.35rem);
  box-shadow:
    0 18px 34px -12px rgb(0 0 0 / 85%),
    0 0 26px -4px var(--accent);
}

.tile__art {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

/* ------------------------------------------------------------- responsive */
@media (max-width: 56rem) {
  .hero__inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero__art {
    width: clamp(7rem, 26vw, 10rem);
  }

  .rail__arrow {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .hero-enter-active,
  .hero-leave-active,
  .scene-enter-active,
  .scene-leave-active {
    transition-duration: 1ms;
  }

  .tile.is-selected {
    transform: none;
  }
}
</style>
