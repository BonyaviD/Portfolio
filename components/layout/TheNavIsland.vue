<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useActiveSection } from "@/composables/useActiveSection";
import { useLocale } from "@/composables/useLocale";
import { sectionIds, sections } from "@/data/site";
import { ui } from "@/data/ui";
import { refractionMap, supportsRefraction } from "@/utils/liquidGlass";

/**
 * The section navigation, as a Liquid Glass tab bar in the manner of iOS 26.
 *
 * One design at every size: each item is an icon with its name small beneath
 * it, all items the same width, and nothing ever folds away. Only the bar's
 * place changes - floating at the top on wide screens, at the bottom on
 * phones where the thumb is. The monogram and the language live in their own
 * glass buttons in the corners (layouts/default.vue), so this bar carries
 * nothing but the sections.
 *
 * The capsule bends the page behind its rim where the engine allows it (see
 * utils/liquidGlass.js), and a single lens marks the current section: it
 * slides between items, stretching across both for a moment - leading edge
 * first - and settles with a small spring. It swells under a press and can be
 * dragged to any item.
 */
const router = useRouter();

const { activeId, scrollTo } = useActiveSection(sectionIds);
const { basePath, path, t } = useLocale();

const isHome = computed(() => basePath.value === "/");

/** Which item the lens sits on: the section in view, or the page itself. */
const currentId = computed(() => {
  if (isHome.value) return activeId.value;
  if (basePath.value === "/about") return "about";
  return null;
});

/**
 * Scroll when the target is on this page, otherwise route home to the hash
 * and let Nuxt's scroll behaviour finish the job.
 */
async function go(id) {
  if (isHome.value && document.getElementById(id)) {
    scrollTo(id);
    return;
  }
  await router.push({ path: path("/"), hash: `#${id}` });
}

// ------------------------------------------------------------------- state
const navEl = ref(null);
const trackEl = ref(null);
const lensEl = ref(null);
const itemEls = ref([]);

/** The item under the lens while it is being dragged. */
const dragId = ref(null);
const pressing = ref(false);
const shownId = computed(() => dragId.value ?? currentId.value);

// ------------------------------------------------------------------- glass
const refract = ref(false);
const map = ref({ href: "", width: 0, height: 0 });
const FILTER_ID = "nav-liquid-glass";

/** Redraws the refraction map when the capsule changes size. */
function updateMap() {
  const nav = navEl.value;
  if (!refract.value || !nav) return;
  const width = nav.offsetWidth;
  const height = nav.offsetHeight;
  if (Math.abs(width - map.value.width) < 2 && Math.abs(height - map.value.height) < 2) return;
  map.value = {
    href: refractionMap(width, height, height / 2, Math.min(20, height * 0.32)),
    width,
    height,
  };
}

// -------------------------------------------------------------------- lens
/** Where the lens is now, in pixels from the track's left edge. */
let lens = { x: 0, width: 0, visible: false };
let animation = null;

function itemBox(id) {
  const index = sections.findIndex((section) => section.id === id);
  const el = itemEls.value[index];
  return el ? { x: el.offsetLeft, width: el.offsetWidth } : null;
}

function paintLens() {
  const el = lensEl.value;
  if (!el) return;
  el.style.width = `${lens.width}px`;
  el.style.transform = `translateX(${lens.x}px)`;
  el.style.opacity = lens.visible ? "1" : "0";
}

/**
 * Glides the lens to an item: the leading edge reaches it first while the
 * trailing edge is still leaving, so for a moment the lens stretches across
 * both, then it gathers onto the new item with a small overshoot.
 */
function moveLens(id, { animate = true } = {}) {
  const box = id ? itemBox(id) : null;
  if (!box) {
    lens.visible = false;
    paintLens();
    return;
  }

  // Already on its way there: a tap moves the lens and then the section
  // change asks for the same move again, which must not restart - or cut
  // short - the glide already under way.
  if (animation && lens.x === box.x && lens.width === box.width) return;

  const from = { ...lens };
  lens = { ...box, visible: true };
  animation?.cancel();

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!animate || !from.visible || reduce || !lensEl.value?.animate) {
    paintLens();
    return;
  }

  const left = Math.min(from.x, box.x);
  const right = Math.max(from.x + from.width, box.x + box.width);
  const frame = (x, width, squash) => ({
    transform: `translateX(${x}px) scaleY(${squash})`,
    width: `${width}px`,
  });

  animation = lensEl.value.animate(
    [
      frame(from.x, from.width, 1),
      // Both edges' span, a little flattened: liquid under tension.
      { ...frame(left, right - left, 0.86), offset: 0.42 },
      frame(box.x, box.width, 1),
    ],
    { duration: 520, easing: "cubic-bezier(0.34, 1.3, 0.5, 1)" }
  );
  // Land on a fresh measurement, in case the bar re-laid itself out - a font
  // arriving, a resize - while the lens was travelling.
  animation.onfinish = () => {
    animation = null;
    if (dragId.value === null) moveLens(currentId.value, { animate: false });
  };
  paintLens();
}

watch(currentId, (id) => {
  if (dragId.value === null) moveLens(id);
});

// -------------------------------------------------------------------- drag
let drag = null;
/** Set when a drag ends on an item, so the click it produces is not a tap. */
let suppressClick = false;

function nearestItem(clientX) {
  const x = clientX - trackEl.value.getBoundingClientRect().left;
  let best = null;
  let bestDistance = Infinity;
  for (const section of sections) {
    const box = itemBox(section.id);
    if (!box) continue;
    const distance = Math.abs(box.x + box.width / 2 - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = section.id;
    }
  }
  return best;
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  pressing.value = true;
  drag = { startX: event.clientX, pointerId: event.pointerId, moved: false };
}

function onPointerMove(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  if (!drag.moved) {
    if (Math.abs(event.clientX - drag.startX) < 6) return;
    drag.moved = true;
    trackEl.value.setPointerCapture(event.pointerId);
    animation?.cancel();
    animation = null;
  }

  // The lens rides under the finger; whatever it is over lights up.
  const id = nearestItem(event.clientX);
  dragId.value = id;
  const box = itemBox(id);
  const track = trackEl.value.getBoundingClientRect();
  const centre = event.clientX - track.left;
  dragTarget = {
    x: Math.min(Math.max(centre - box.width / 2, 0), track.width - box.width),
    width: box.width,
  };
  if (!dragFrame) dragFrame = requestAnimationFrame(followFinger);
}

/**
 * Eases the lens after the finger each frame rather than pinning it there:
 * a hair of lag is what makes it feel like liquid being pulled, and it turns
 * the first move - from the lens's item to wherever the finger landed - into
 * a glide instead of a jump.
 */
let dragTarget = null;
let dragFrame = 0;

function followFinger() {
  dragFrame = 0;
  if (!dragTarget || dragId.value === null) return;
  lens = {
    x: lens.x + (dragTarget.x - lens.x) * 0.38,
    width: lens.width + (dragTarget.width - lens.width) * 0.38,
    visible: true,
  };
  paintLens();
  if (Math.abs(dragTarget.x - lens.x) > 0.3) dragFrame = requestAnimationFrame(followFinger);
}

function onPointerUp(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  pressing.value = false;
  if (drag.moved) {
    const id = dragId.value;
    // A captured pointer's release may or may not produce a click, depending
    // on where it lands; either way the flag must not outlive this gesture.
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 0);
    dragId.value = null;
    dragTarget = null;
    cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    moveLens(id);
    if (id && id !== currentId.value) go(id);
  }
  drag = null;
}

function onPointerCancel() {
  pressing.value = false;
  if (drag?.moved) {
    dragId.value = null;
    dragTarget = null;
    cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    moveLens(currentId.value);
  }
  drag = null;
}

function onItemClick(id) {
  if (suppressClick) {
    suppressClick = false;
    return;
  }
  moveLens(id);
  go(id);
}

// --------------------------------------------------------------- lifecycle
let listeners = null;
let resizeObserver = null;
let resizeFrame = 0;

onMounted(async () => {
  refract.value = supportsRefraction();

  listeners = new AbortController();
  // A press released outside the bar still has to let the lens go.
  window.addEventListener("pointerup", () => (pressing.value = false), {
    passive: true,
    signal: listeners.signal,
  });

  await nextTick();
  moveLens(currentId.value, { animate: false });
  updateMap();

  // The fonts arrive after the first layout, and the viewport can change:
  // keep the lens on its item and the refraction map the capsule's size.
  resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!animation && dragId.value === null) moveLens(currentId.value, { animate: false });
      updateMap();
    });
  });
  resizeObserver.observe(navEl.value);
});

onBeforeUnmount(() => {
  listeners?.abort();
  resizeObserver?.disconnect();
  cancelAnimationFrame(resizeFrame);
  animation?.cancel();
});
</script>

<template>
  <nav
    ref="navEl"
    class="island"
    :class="{
      'island--refract': refract && map.href,
      'island--pressing': pressing,
      'island--dragging': dragId !== null,
    }"
    :aria-label="t(ui.nav.label)"
  >
    <!-- The glass: its own layer, so the bend and blur never touch the
         content drawn on top of it. -->
    <span class="island__glass liquid-glass" aria-hidden="true"></span>

    <div
      ref="trackEl"
      class="island__track"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <span ref="lensEl" class="island__lens" aria-hidden="true"></span>

      <ul class="island__list" role="list">
        <li v-for="section in sections" :key="section.id">
          <button
            ref="itemEls"
            type="button"
            class="island__item"
            :class="{ 'is-lit': shownId === section.id }"
            :aria-current="currentId === section.id ? 'true' : undefined"
            @click="onItemClick(section.id)"
          >
            <Icon :name="section.icon" class="island__icon" aria-hidden="true" />
            <span class="island__label">{{ t(section.label) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <svg v-if="refract" class="island__defs" aria-hidden="true" focusable="false">
      <filter
        :id="FILTER_ID"
        x="0"
        y="0"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feImage
          :href="map.href"
          x="0"
          y="0"
          :width="map.width"
          :height="map.height"
          preserveAspectRatio="none"
          result="map"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale="34"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  </nav>
</template>

<style scoped>
/* ================================================================ capsule */
.island {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  z-index: var(--z-header);
  padding: 0.3rem;
  border-radius: 999px;
  transform: translateX(-50%);
  isolation: isolate;
}

.island__glass {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
}

/* Where the engine can bend the backdrop, it does, and blurs less: the bend
   is what separates the bar from the page. */
.island--refract .island__glass {
  -webkit-backdrop-filter: url(#nav-liquid-glass) blur(4px) saturate(200%) brightness(1.1);
  backdrop-filter: url(#nav-liquid-glass) blur(4px) saturate(200%) brightness(1.1);
}

.island__defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

/* ================================================================== track */
.island__track {
  position: relative;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

/* Every item the width of the widest, so the lens is one size wherever it
   goes and the bar never changes shape. */
.island__list {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  list-style: none;
}

/*
 * The lens: the one piece of glass that marks where you are. Clearer and
 * brighter than the bar around it, with its own lit edge, as if a second,
 * smaller lens were resting on the first.
 */
.island__lens {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  border-radius: 999px;
  background:
    radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 24%) 0%, transparent 70%),
    rgb(255 255 255 / 13%);
  box-shadow:
    inset 0 1px 0.5px rgb(255 255 255 / 60%),
    inset 0 -1px 0.5px rgb(255 255 255 / 16%),
    inset 0 0 12px rgb(230 182 108 / 14%),
    0 4px 14px -4px rgb(0 0 0 / 40%);
  opacity: 0;
  pointer-events: none;
  will-change: transform, width;
  transition:
    opacity var(--duration-base) var(--ease-standard),
    scale 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Pressed or held, the lens swells a little under the finger. */
.island--pressing .island__lens,
.island--dragging .island__lens {
  scale: 1.07 1.1;
}

.island--dragging .island__lens {
  background:
    radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 30%) 0%, transparent 70%),
    rgb(255 255 255 / 17%);
}

/* ================================================================== items */
/* An iOS tab: the icon, and its name small underneath. */
.island__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  min-width: 4.25rem;
  padding: 0.55rem var(--space-3) 0.45rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgb(255 255 255 / 80%);
  cursor: pointer;
  white-space: nowrap;
  /* The glass is clear, so the type carries a faint shadow to stay legible
     over a bright photo behind it. */
  text-shadow: 0 1px 2px rgb(0 0 0 / 35%);
  -webkit-tap-highlight-color: transparent;
  transition: color var(--duration-base) var(--ease-standard);
}

/* A pointer over an item shows a faint glass of its own - fainter than the
   lens, and never on the item the lens already covers. */
.island__item::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: rgb(255 255 255 / 13%);
  box-shadow:
    inset 0 1px 0.5px rgb(255 255 255 / 32%),
    inset 0 -1px 0.5px rgb(255 255 255 / 8%);
  opacity: 0;
  scale: 0.9;
  transition:
    opacity var(--duration-base) var(--ease-standard),
    scale var(--duration-base) var(--ease-spring);
}

@media (hover: hover) {
  .island__item:hover {
    color: var(--color-text);
  }

  .island__item:not(.is-lit):hover::before {
    opacity: 1;
    scale: 1;
  }

  .island__item:hover .island__icon {
    translate: 0 -1px;
  }
}

.island__icon {
  transition: translate var(--duration-base) var(--ease-spring);
}

/* No hover glass while the lens is being dragged across the bar. */
.island--dragging .island__item::before {
  opacity: 0;
}

.island__item {
  isolation: isolate;
}

/* Whatever sits under the lens takes the accent, as a tinted iOS tab does. */
.island__item.is-lit {
  color: var(--color-primary);
}

.island__icon {
  width: 1.3rem;
  height: 1.3rem;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 1.5px rgb(0 0 0 / 30%));
}

.island__label {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.6875rem;
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  text-overflow: ellipsis;
}

/* ================================================================= phones */
@media (max-width: 48rem) {
  .island {
    top: auto;
    /* Clear of the home indicator on iOS. */
    bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
    width: min(calc(100vw - var(--space-6)), 28rem);
  }

  .island__item {
    min-width: 0;
    padding-inline: 0;
  }

  .island__label {
    font-size: 0.625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .island__lens {
    transition: opacity var(--duration-base) var(--ease-standard);
  }

  .island--pressing .island__lens,
  .island--dragging .island__lens {
    scale: none;
  }
}
</style>
