<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useArtworkAccents } from "@/composables/useArtworkAccents";
import { gamesWithArt as games } from "@/data/hobbies";
import ProfileImage from "@/assets/img/me.jpg";

/**
 * A console home screen, laid out after a PS5 dashboard: tabs and status along
 * the top, a rail of game tiles under them with the selected one enlarged and
 * named, the game's own art filling the screen, and the title, tagline and
 * actions down the left with cards stacked on the right.
 *
 * Everything except moving along the rail is scenery. The chrome and the
 * action buttons are aria-hidden and cannot be clicked, so nothing here
 * pretends to be a control that does something.
 *
 * Rendered with CSS rather than WebGL: it is a crossfade and a scaling tile,
 * so it stays sharp, costs little, and needs no GPU path.
 */
const { accents } = useArtworkAccents(games.map((game) => game.src));

const index = ref(0);
const current = computed(() => games[index.value]);
const accent = computed(() => accents.value[index.value]?.css ?? "rgb(230 182 108)");
const position = computed(() => `${index.value + 1} / ${games.length}`);

const railEl = ref(null);
const stripEl = ref(null);
/** How far the strip is shifted so the selection lands on the focus point. */
const shift = ref(0);
/** Slots from the left edge that the selected game always occupies. */
const SELECTED_SLOT = 2;
/** Where the name sits: right of the selected tile, under the next one. */
const nameOffset = ref({ left: 0, top: 0 });

/**
 * Moves the strip, not the selection.
 *
 * A console keeps one fixed slot and slides the games through it. Scrolling
 * the selected tile into view did the opposite - the slot moved to the tile -
 * so the whole row appeared to drift.
 */
async function alignToFocus() {
  await nextTick();
  const strip = stripEl.value;
  const tile = strip?.querySelector(".tile.is-selected");
  if (!railEl.value || !strip || !tile) return;

  const unselected = [...strip.querySelectorAll(".tile")].find(
    (el) => !el.classList.contains("is-selected")
  );
  const slot = unselected?.offsetWidth ?? 0;
  const gap = Number.parseFloat(getComputedStyle(strip).columnGap) || 0;

  // Two slots in: the selection always sits in the third position.
  shift.value = SELECTED_SLOT * (slot + gap) - tile.offsetLeft;

  /**
   * The name goes beside the enlarged tile, level with the bottom of the
   * small one next to it.
   *
   * Derived from the slot metrics rather than measured on screen: the strip
   * animates its transform, so reading live positions returned wherever the
   * tiles happened to be mid-slide and the label landed short by exactly the
   * shift. Since the selection always occupies the same slot, this is a
   * constant.
   */
  const rail = railEl.value;
  const railPadding = Number.parseFloat(getComputedStyle(rail).paddingLeft) || 0;
  const stripPaddingTop = Number.parseFloat(getComputedStyle(strip).paddingTop) || 0;

  nameOffset.value = {
    left: Math.round(railPadding + SELECTED_SLOT * (slot + gap) + tile.offsetWidth + gap),
    top: Math.round(stripPaddingTop + slot + gap * 0.5),
  };
}

function go(step) {
  index.value = (index.value + step + games.length) % games.length;
  alignToFocus();
}

function select(next) {
  index.value = next;
  alignToFocus();
}

function onKeydown(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  go(event.key === "ArrowRight" ? 1 : -1);
}

// ---------------------------------------------------------------- swiping
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
  }
}

/** A live clock, so the chrome is not showing a frozen fake time. */
const clock = ref("");
let timer = null;

function tick() {
  clock.value = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 30_000);
  alignToFocus();
  window.addEventListener("resize", alignToFocus, { passive: true });
});

onBeforeUnmount(() => {
  clearInterval(timer);
  window.removeEventListener("resize", alignToFocus);
});
</script>

<template>
  <div
    class="ps"
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
    <!-- The selected game's art fills the screen behind everything. -->
    <div class="ps__scene" aria-hidden="true">
      <transition name="scene">
        <img
          :key="current.id"
          class="ps__art"
          :class="{ 'ps__art--wide': current.wide }"
          :src="current.wide || current.src"
          alt=""
        />
      </transition>
      <span class="ps__scrim"></span>
    </div>

    <!-- Scenery: not interactive, not announced. -->
    <header class="bar" aria-hidden="true">
      <nav class="bar__tabs">
        <span class="bar__tab is-active">Games</span>
        <span class="bar__tab">Media</span>
      </nav>

      <div class="bar__status">
        <Icon name="lucide:search" class="bar__icon" />
        <Icon name="lucide:settings" class="bar__icon" />
        <span class="bar__avatar">
          <img :src="ProfileImage" alt="" />
          <i class="bar__online"></i>
        </span>
        <span class="bar__clock">{{ clock }}</span>
      </div>
    </header>

    <!-- The rail. The only thing here that does anything. -->
    <div ref="railEl" class="rail">
      <div class="rail__viewport">
        <ul
          ref="stripEl"
          class="rail__strip"
          :style="{ transform: `translateX(${shift}px)` }"
          role="list"
        >
          <li v-for="(game, i) in games" :key="game.id" class="rail__item">
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
      </div>

      <!-- Beside the enlarged tile, under the one after it. -->
      <p
        class="rail__name"
        :style="{ left: `${nameOffset.left}px`, top: `${nameOffset.top}px` }"
      >
        {{ current.title }}
      </p>
    </div>

    <!-- Left: the game. Right: its cards. -->
    <div class="stage">
      <transition name="stage" mode="out-in">
        <div :key="current.id" class="stage__inner">
          <div class="detail">
            <h4 class="detail__title">{{ current.title }}</h4>
            <p class="detail__tagline">{{ current.blurb }}</p>

            <div class="detail__actions" aria-hidden="true">
              <span class="detail__play">Play</span>
              <span class="detail__more">
                <Icon name="lucide:ellipsis" />
              </span>
            </div>
          </div>

          <div class="cards">
            <div class="cards__art">
              <img :src="current.src" :alt="`${current.title} cover art`" />
              <span class="cards__badge">{{ current.genre }}</span>
              <span class="cards__year">{{ current.year || "Series" }}</span>
            </div>

            <div class="cards__stats">
              <Icon name="lucide:trophy" class="cards__trophy" aria-hidden="true" />
              <span class="cards__stat">
                <span class="cards__label">Studio</span>
                <span class="cards__value">{{ current.studio }}</span>
              </span>
              <span class="cards__stat">
                <span class="cards__label">In shelf</span>
                <span class="cards__value">{{ position }}</span>
              </span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.ps {
  --inset: clamp(0.75rem, 2.5vw, 2.5rem);

  position: relative;
  display: grid;
  grid-template-rows: auto auto 1fr;
  /* An implicit `auto` column sizes to content, so a wide row pushed the
     stage past the card's right edge and the overflow clipped it. */
  grid-template-columns: minmax(0, 1fr);
  /**
   * Height follows the content, with the viewport as a floor rather than a
   * ceiling. A fixed 16:9 box got clamped on short viewports and, with the
   * overflow hidden, clipped the buttons off the bottom row.
   */
  min-height: min(calc(100svh - 2 * var(--inset)), 46rem);
  width: calc(100vw - 2 * var(--inset));
  margin-left: 50%;
  margin-block: var(--inset);
  overflow: hidden;
  border-radius: var(--radius-2xl);
  transform: translateX(-50%);
  touch-action: pan-y;
}

.ps:focus-visible {
  outline: var(--border-width-thick) solid var(--color-primary);
  outline-offset: calc(var(--border-width-thick) * -3);
}

/* ------------------------------------------------------------------ scene */
.ps__scene {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  background: var(--palette-navy-950, #071019);
}

/**
 * A portrait cover has to be blown up and blurred to work as a backdrop.
 * Real landscape key art needs none of that, so it is shown nearly sharp.
 */
.ps__art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.3);
  filter: blur(26px) saturate(125%);
}

/* Real key art is shown as-is: the console does not blur it. */
.ps__art--wide {
  transform: none;
  filter: none;
}

.ps__scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgb(4 10 18 / 88%) 0%, rgb(4 10 18 / 45%) 45%, rgb(4 10 18 / 70%) 100%),
    linear-gradient(180deg, rgb(4 10 18 / 85%) 0%, transparent 32%, rgb(4 10 18 / 55%) 100%);
}

.scene-enter-active,
.scene-leave-active {
  transition: opacity var(--duration-slower) var(--ease-standard);
}

.scene-enter-from,
.scene-leave-to {
  opacity: 0;
}

/* -------------------------------------------------------------- title bar */
.bar {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-5);
  padding: clamp(var(--space-3), 2vw, var(--space-6)) clamp(var(--space-4), 3vw, var(--space-10));
  pointer-events: none;
}

.bar__tabs {
  display: flex;
  gap: clamp(var(--space-4), 2vw, var(--space-8));
}

.bar__tab {
  color: rgb(255 255 255 / 45%);
  font-size: clamp(0.95rem, 1.5vw, 1.4rem);
  font-weight: var(--font-weight-medium);
}

.bar__tab.is-active {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.bar__status {
  display: flex;
  align-items: center;
  gap: clamp(var(--space-3), 1.6vw, var(--space-6));
  color: rgb(255 255 255 / 78%);
}

.bar__icon {
  width: clamp(1rem, 1.5vw, 1.4rem);
  height: clamp(1rem, 1.5vw, 1.4rem);
}

.bar__avatar {
  position: relative;
  display: block;
  width: clamp(1.5rem, 2.2vw, 2.1rem);
  height: clamp(1.5rem, 2.2vw, 2.1rem);
}

.bar__avatar img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-circle);
  object-fit: cover;
  object-position: top;
}

/* The presence dot the console shows on the signed-in profile. */
.bar__online {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-circle);
  background: #3ddc84;
  box-shadow: 0 0 0 2px rgb(4 10 18 / 80%);
}

.bar__clock {
  font-size: clamp(0.9rem, 1.4vw, 1.3rem);
  font-variant-numeric: tabular-nums;
}

/* ------------------------------------------------------------------- rail */
.rail {
  position: relative;
  z-index: var(--z-raised);
  padding-left: clamp(var(--space-4), 3vw, var(--space-10));
  overflow: hidden;
}

/* The window the strip slides behind. */
.rail__viewport {
  overflow: hidden;
}

.rail__strip {
  display: flex;
  align-items: flex-start;
  gap: clamp(var(--space-2), 1vw, var(--space-4));
  padding-block: var(--space-2) var(--space-3);
  list-style: none;
  /* Only this moves. The selection itself never travels. */
  transition: transform var(--duration-slow) var(--ease-out);
  will-change: transform;
}

/* Reserves the enlarged tile's height so the row never shifts vertically. */
.rail__item {
  display: flex;
  align-items: flex-start;
  height: clamp(4.5rem, 9vw, 7rem);
}

.tile {
  display: block;
  flex-shrink: 0;
  width: clamp(2.9rem, 5.6vw, 4.4rem);
  padding: 0;
  border: 0;
  border-radius: clamp(0.5rem, 0.9vw, 0.75rem);
  background: none;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.72;
  /* Width is not animated: the strip's offset is measured from real layout,
     so an in-flight width would make the focus point land in the wrong place. */
  transition:
    opacity var(--duration-base) var(--ease-standard),
    box-shadow var(--duration-base) var(--ease-standard);
}

.tile:hover {
  opacity: 1;
}

/* The console enlarges the highlighted tile and rings it. */
.tile.is-selected {
  width: clamp(4.5rem, 9vw, 7rem);
  border-radius: clamp(0.75rem, 1.3vw, 1.1rem);
  opacity: 1;
  box-shadow:
    0 0 0 3px var(--color-text),
    0 18px 34px -12px rgb(0 0 0 / 85%);
}

.tile__art {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

/* Positioned from measured geometry, so it tracks the tiles exactly. */
.rail__name {
  position: absolute;
  margin: 0;
  color: var(--color-text);
  font-size: clamp(0.9rem, 1.4vw, 1.3rem);
  white-space: nowrap;
  text-shadow: 0 2px 12px rgb(0 0 0 / 70%);
  transition:
    left var(--duration-slow) var(--ease-out),
    top var(--duration-slow) var(--ease-out);
  pointer-events: none;
}

/* ------------------------------------------------------------------ stage */
.stage {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  align-items: flex-end;
  min-width: 0;
  padding: clamp(var(--space-4), 3vw, var(--space-10));
  padding-top: clamp(var(--space-6), 4vw, var(--space-16));
}

.stage__inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: clamp(var(--space-4), 3vw, var(--space-8));
  width: 100%;
  /* Without this the copy refuses to shrink and shoves the cards off the
     right edge, where the card's overflow clips them. */
  min-width: 0;
}

.detail {
  min-width: 0;
}

/* The console prints the game's logo here; the title stands in for it. */
.detail__title {
  max-width: 12ch;
  font-size: clamp(1.6rem, 4.4vw, 3.75rem);
  font-weight: var(--font-weight-bold);
  line-height: 0.98;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-shadow: 0 4px 24px rgb(0 0 0 / 60%);
}

.detail__tagline {
  max-width: 34ch;
  margin-top: clamp(var(--space-3), 1.4vw, var(--space-5));
  color: rgb(255 255 255 / 82%);
  font-size: clamp(0.85rem, 1.3vw, 1.15rem);
  line-height: var(--line-height-relaxed);
  /* Two lines, like the console's one-line strapline, without clipping words. */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.detail__actions {
  display: flex;
  align-items: center;
  gap: clamp(var(--space-3), 1.4vw, var(--space-5));
  margin-top: clamp(var(--space-4), 2vw, var(--space-8));
}

.detail__play {
  display: grid;
  place-items: center;
  min-width: clamp(7rem, 12vw, 10rem);
  padding: clamp(var(--space-2), 1vw, var(--space-3)) var(--space-6);
  border-radius: var(--radius-md);
  background: var(--color-text);
  color: #071019;
  font-size: clamp(0.95rem, 1.4vw, 1.25rem);
  font-weight: var(--font-weight-bold);
}

.detail__more {
  display: grid;
  place-items: center;
  width: clamp(2.1rem, 3vw, 2.75rem);
  height: clamp(2.1rem, 3vw, 2.75rem);
  border-radius: var(--radius-circle);
  background: rgb(255 255 255 / 16%);
  backdrop-filter: blur(8px);
  color: var(--color-text);
}

/* ------------------------------------------------------------------ cards */
.cards {
  display: flex;
  flex-direction: column;
  gap: clamp(var(--space-2), 1vw, var(--space-4));
  width: clamp(9rem, 18vw, 17rem);
  min-width: 0;
  flex-shrink: 1;
}

.cards__art {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: 0 24px 50px -18px rgb(0 0 0 / 85%);
}

.cards__art img {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

/**
 * The console shows an edition badge and a price here. Those would be invented
 * numbers, so the slots carry the genre and the year instead.
 */
.cards__badge {
  position: absolute;
  left: var(--space-2);
  bottom: 2.1rem;
  padding: 0.15rem var(--space-2);
  background: rgb(255 255 255 / 92%);
  color: #071019;
  font-size: clamp(0.6rem, 0.85vw, 0.8rem);
  font-weight: var(--font-weight-semibold);
}

.cards__year {
  position: absolute;
  left: var(--space-2);
  bottom: var(--space-2);
  color: var(--color-text);
  font-size: clamp(0.7rem, 1vw, 0.95rem);
  font-weight: var(--font-weight-bold);
  text-shadow: 0 2px 10px rgb(0 0 0 / 80%);
}

.cards__stats {
  display: flex;
  align-items: center;
  gap: clamp(var(--space-2), 1.2vw, var(--space-4));
  padding: clamp(var(--space-2), 1vw, var(--space-4));
  border-radius: var(--radius-sm);
  background: rgb(10 18 28 / 72%);
  backdrop-filter: blur(10px);
}

.cards__trophy {
  width: clamp(1.1rem, 1.8vw, 1.6rem);
  height: clamp(1.1rem, 1.8vw, 1.6rem);
  color: var(--accent);
  flex-shrink: 0;
}

.cards__stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.cards__label {
  color: rgb(255 255 255 / 55%);
  font-size: clamp(0.6rem, 0.85vw, 0.78rem);
}

.cards__value {
  overflow: hidden;
  color: var(--color-text);
  font-size: clamp(0.7rem, 1vw, 0.95rem);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-enter-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-slow) var(--ease-spring);
}

.stage-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.stage-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.stage-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* ------------------------------------------------------------- responsive */
@media (max-width: 64rem) {
  .stage__inner {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: var(--space-6);
  }

  .cards {
    flex-direction: row;
    align-items: stretch;
    width: 100%;
  }

  .cards__art {
    width: 42%;
  }

  .cards__stats {
    flex: 1;
  }

  .detail__title {
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .stage-enter-active,
  .stage-leave-active,
  .scene-enter-active,
  .scene-leave-active {
    transition-duration: 1ms;
  }
}
</style>
