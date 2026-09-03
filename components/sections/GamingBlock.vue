<script setup>
import { games } from "@/data/hobbies";

/**
 * The games shelf: a rail of numbered poster plates, so the section reads as
 * "these are my picks, in order" rather than a decorative image strip.
 *
 * Titles are always visible. The previous rail only showed them in `alt` text,
 * which meant the posters were unlabelled for anyone who did not recognise the
 * cover art.
 */
/**
 * Both facts are derived from the list itself. Nothing here asserts anything
 * about hardware or hours played that the data does not actually support.
 */
const facts = [
  { id: "count", icon: "lucide:library", value: `${games.length} favourites` },
  { id: "genre", icon: "lucide:drama", value: "Story-driven" },
];
</script>

<template>
  <div class="gaming">
    <div class="gaming__head">
      <h3 class="gaming__title">
        <Icon name="lucide:gamepad-2" aria-hidden="true" />
        Gaming
      </h3>

      <p class="gaming__lede">
        Narrative games are my way to unwind &mdash; the ones where the writing
        does as much work as the mechanics.
      </p>

      <ul class="facts" role="list">
        <li v-for="fact in facts" :key="fact.id" class="facts__item">
          <Icon :name="fact.icon" aria-hidden="true" />
          {{ fact.value }}
        </li>
      </ul>
    </div>

    <!-- Focusable so the rail can be scrolled from the keyboard too. -->
    <div class="shelf">
      <ul class="shelf__rail" role="list" tabindex="0" aria-label="Favourite games">
        <li v-for="(game, index) in games" :key="game.id" class="poster">
          <span class="poster__plate">
            <img class="poster__art" :src="game.src" alt="" loading="lazy" />
            <span class="poster__rank">{{ String(index + 1).padStart(2, "0") }}</span>
            <span class="poster__shine" aria-hidden="true"></span>
          </span>
          <span class="poster__title">{{ game.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.gaming__head {
  margin-bottom: var(--space-8);
}

.gaming__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-subheading);
}

.gaming__title svg {
  color: var(--color-primary);
  font-size: 0.8em;
}

.gaming__lede {
  margin-top: var(--space-3);
  max-width: 36rem;
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
}

/* ------------------------------------------------------------------ facts */
.facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-5);
  list-style: none;
}

.facts__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.facts__item svg {
  color: var(--color-primary);
}

/* ------------------------------------------------------------------ shelf */
.shelf {
  position: relative;
  /* Full-bleed rail: posters run off both edges like a store shelf. */
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
}

/* Fades the rail into the page instead of cutting it off at the edges. */
.shelf::before,
.shelf::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: var(--z-raised);
  width: clamp(2rem, 8vw, 7rem);
  pointer-events: none;
}

.shelf::before {
  left: 0;
  background: linear-gradient(90deg, var(--color-bg), transparent);
}

.shelf::after {
  right: 0;
  background: linear-gradient(270deg, var(--color-bg), transparent);
}

.shelf__rail {
  display: flex;
  gap: var(--space-5);
  padding: var(--space-4) clamp(1rem, 5vw, 5rem) var(--space-6);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  list-style: none;
}

.poster {
  flex: 0 0 auto;
  width: clamp(11rem, 22vw, 15rem);
  scroll-snap-align: center;
  perspective: 50rem;
}

.poster__plate {
  position: relative;
  display: block;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow);
  transform: rotateY(0deg) translateZ(0);
  transition:
    transform var(--duration-slow) var(--ease-spring),
    box-shadow var(--duration-base) var(--ease-standard),
    border-color var(--duration-base) var(--ease-standard);
}

.poster:hover .poster__plate {
  border-color: var(--color-primary-soft);
  box-shadow:
    var(--glass-shadow),
    0 0 38px -10px rgb(230 182 108 / 40%);
  transform: translateY(-0.5rem) rotateY(-8deg) scale(1.03);
}

.poster__art {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Numbered like a ranked shelf. */
.poster__rank {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 0.125rem var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
}

/* Diagonal sweep across the art on hover, like light across a plastic case. */
.poster__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 35%,
    rgb(255 255 255 / 16%) 50%,
    transparent 65%
  );
  opacity: 0;
  transform: translateX(-60%);
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-slower) var(--ease-standard);
  pointer-events: none;
}

.poster:hover .poster__shine {
  opacity: 1;
  transform: translateX(60%);
}

.poster__title {
  display: block;
  margin-top: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  transition: color var(--duration-base) var(--ease-standard);
}

.poster:hover .poster__title {
  color: var(--color-text);
}

@media (hover: none) {
  .poster:hover .poster__plate {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .poster__plate,
  .poster__shine {
    transition: none;
  }

  .poster:hover .poster__plate {
    transform: none;
  }
}
</style>
