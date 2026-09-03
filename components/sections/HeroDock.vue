<script setup>
/**
 * The tech stack as an iOS dock: a frosted tray of app-style glyphs pinned to
 * the bottom of the hero, with the same magnify-on-hover behaviour the macOS
 * and iOS docks use.
 *
 * Replaces the old free-floating icons, which drifted up the page and read as
 * noise rather than as a statement of what the stack is.
 */
const tools = [
  { id: "html", name: "HTML", icon: "simple-icons:html5" },
  { id: "css", name: "CSS", icon: "simple-icons:css" },
  { id: "javascript", name: "JavaScript", icon: "simple-icons:javascript" },
  { id: "typescript", name: "TypeScript", icon: "simple-icons:typescript" },
  { id: "vue", name: "Vue", icon: "simple-icons:vuedotjs" },
  { id: "nuxt", name: "Nuxt", icon: "simple-icons:nuxtdotjs" },
  { id: "vite", name: "Vite", icon: "simple-icons:vite" },
  { id: "git", name: "Git", icon: "simple-icons:git" },
];
</script>

<template>
  <div class="dock">
    <ul class="dock__list" role="list">
      <li v-for="tool in tools" :key="tool.id" class="dock__item">
        <span class="dock__tile">
          <Icon :name="tool.icon" aria-hidden="true" />
          <span class="visually-hidden">{{ tool.name }}</span>
        </span>
        <span class="dock__tooltip" aria-hidden="true">{{ tool.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dock {
  padding: var(--space-3);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-2xl);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
}

.dock__list {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  list-style: none;
}

.dock__item {
  position: relative;
}

.dock__tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  border: var(--border-width-hairline) solid rgb(255 255 255 / 10%);
  background: linear-gradient(160deg, rgb(255 255 255 / 14%), rgb(255 255 255 / 4%));
  color: var(--color-text);
  font-size: 1.5rem;
  transition: transform var(--duration-slow) var(--ease-spring);
}

/* Dock magnification: the hovered tile lifts, its neighbours lift a little. */
.dock__item:hover .dock__tile {
  transform: translateY(-0.625rem) scale(1.18);
  color: var(--color-primary);
}

.dock__item:hover + .dock__item .dock__tile,
.dock__item:has(+ .dock__item:hover) .dock__tile {
  transform: translateY(-0.25rem) scale(1.07);
}

.dock__tooltip {
  position: absolute;
  bottom: calc(100% + var(--space-3));
  left: 50%;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, var(--space-2));
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
  pointer-events: none;
}

.dock__item:hover .dock__tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (max-width: 48rem) {
  .dock {
    padding: var(--space-2);
    border-radius: var(--radius-xl);
  }

  .dock__list {
    gap: var(--space-1);
  }

  .dock__tile {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.75rem;
    font-size: 1.125rem;
  }
}

@media (max-width: 30rem) {
  /* Four tools is enough of a signal at this width; the grid below tells the
     full story anyway. */
  .dock__item:nth-child(n + 7) {
    display: none;
  }
}
</style>
