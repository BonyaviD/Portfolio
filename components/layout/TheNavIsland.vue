<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import LanguageSwitch from "@/components/layout/LanguageSwitch.vue";
import { useActiveSection } from "@/composables/useActiveSection";
import { useLocale } from "@/composables/useLocale";
import { sectionIds, sections, site } from "@/data/site";
import { ui } from "@/data/ui";
import { refractionMap, supportsRefraction } from "@/utils/liquidGlass";
import LogoImage from "~/assets/img/brand/mark.svg";

/**
 * The navigation, as a Liquid Glass tab bar in the manner of iOS 26.
 *
 * The capsule is glass rather than a frosted panel: it bends the page behind
 * it at the rim (see utils/liquidGlass.js), catches light along its edge, and
 * holds the current section in a single lens that slides between the items -
 * stretching as it goes, leading edge first, and settling with a little
 * spring. The items themselves have no backgrounds of their own. The lens can
 * be dragged, the way a thumb drags it on a phone.
 *
 * At the top of the page on wide screens, where it also carries the monogram
 * and the language; at the bottom on phones, where the thumb is, with each
 * label under its icon as in an iOS tab bar.
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
const condensed = ref(false);
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
    href: refractionMap(width, height, height / 2, Math.min(18, height * 0.36)),
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
  // The items can shift while the lens is travelling - labels fold as the
  // bar condenses - so it lands on a fresh measurement, not the one it left
  // with.
  animation.onfinish = () => {
    animation = null;
    if (dragId.value === null) moveLens(currentId.value, { animate: false });
  };
  paintLens();
}

/**
 * Keeps the lens glued to its item for a moment while the bar re-lays
 * itself out - labels folding and unfolding shift every item, and a resize
 * observer only hears about the ones whose own size changed.
 */
let followUntil = 0;
let followFrame = 0;

function follow(ms = 700) {
  followUntil = performance.now() + ms;
  cancelAnimationFrame(followFrame);
  const step = () => {
    if (!animation && dragId.value === null) moveLens(currentId.value, { animate: false });
    if (performance.now() < followUntil) followFrame = requestAnimationFrame(step);
  };
  followFrame = requestAnimationFrame(step);
}

watch(currentId, (id) => {
  if (dragId.value === null) moveLens(id);
  // The new item's label unfolds as it becomes current.
  follow(900);
});

watch(condensed, () => follow(900));

/** A transition inside the bar has settled: take a final measurement. */
function onLayoutSettled() {
  if (!animation && dragId.value === null) moveLens(currentId.value, { animate: false });
}

// -------------------------------------------------------------------- drag
let drag = null;
/** Set when a drag ends on an item, so the click it produces is not a tap. */
let suppressClick = false;

function nearestItem(clientX) {
  const track = trackEl.value.getBoundingClientRect();
  const x = clientX - track.left;
  let best = null;
  let bestDistance = Infinity;
  sections.forEach((section) => {
    const box = itemBox(section.id);
    if (!box) return;
    const distance = Math.abs(box.x + box.width / 2 - x);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = section.id;
    }
  });
  return best;
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  pressing.value = true;
  drag = { startX: event.clientX, pointerId: event.pointerId, moved: false };
}

function onPointerMove(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const dx = event.clientX - drag.startX;
  if (!drag.moved) {
    if (Math.abs(dx) < 6) return;
    drag.moved = true;
    trackEl.value.setPointerCapture(event.pointerId);
    animation?.cancel();
    animation = null;
  }

  // The lens rides under the finger, taking the width of the item beneath.
  const id = nearestItem(event.clientX);
  dragId.value = id;
  const box = itemBox(id);
  const track = trackEl.value.getBoundingClientRect();
  const centre = event.clientX - track.left;
  const max = track.width - box.width;
  lens = {
    x: Math.min(Math.max(centre - box.width / 2, 0), max),
    width: box.width,
    visible: true,
  };
  paintLens();
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
    moveLens(id);
    if (id && id !== currentId.value) go(id);
  }
  drag = null;
}

function onPointerCancel() {
  pressing.value = false;
  if (drag?.moved) {
    dragId.value = null;
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

function onScroll() {
  condensed.value = window.scrollY > 120;
}

onMounted(async () => {
  refract.value = supportsRefraction();

  listeners = new AbortController();
  window.addEventListener("scroll", onScroll, { passive: true, signal: listeners.signal });
  // A press released outside the bar still has to let the lens go.
  window.addEventListener("pointerup", () => (pressing.value = false), {
    passive: true,
    signal: listeners.signal,
  });
  onScroll();

  await nextTick();
  moveLens(currentId.value, { animate: false });
  updateMap();

  // Labels fold away as the bar condenses, and the fonts arrive late: keep
  // the lens on its item and the refraction map the capsule's size through
  // all of it.
  resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!animation && dragId.value === null) moveLens(currentId.value, { animate: false });
      updateMap();
    });
  });
  resizeObserver.observe(navEl.value);
  itemEls.value.forEach((el) => resizeObserver.observe(el));
});

onBeforeUnmount(() => {
  listeners?.abort();
  resizeObserver?.disconnect();
  cancelAnimationFrame(resizeFrame);
  cancelAnimationFrame(followFrame);
  animation?.cancel();
});
</script>

<template>
  <nav
    ref="navEl"
    class="island"
    :class="{
      'island--condensed': condensed,
      'island--refract': refract && map.href,
      'island--pressing': pressing,
      'island--dragging': dragId !== null,
    }"
    :aria-label="t(ui.nav.label)"
  >
    <!-- The glass: its own layer, so the bend and blur never touch the
         content drawn on top of it. -->
    <span class="island__glass" aria-hidden="true"></span>

    <NuxtLink
      :to="path('/')"
      class="island__brand"
      :aria-label="t(ui.nav.home, { name: t(site.displayName) })"
    >
      <img :src="LogoImage" alt="" width="31" height="28" />
    </NuxtLink>

    <div
      ref="trackEl"
      class="island__track"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @transitionend="onLayoutSettled"
    >
      <span ref="lensEl" class="island__lens" aria-hidden="true"></span>

      <ul class="island__list" role="list">
        <li v-for="section in sections" :key="section.id">
          <button
            ref="itemEls"
            type="button"
            class="island__item"
            :class="{
              'is-active': currentId === section.id,
              'is-lit': shownId === section.id,
            }"
            :aria-current="currentId === section.id ? 'true' : undefined"
            @click="onItemClick(section.id)"
          >
            <Icon :name="section.icon" class="island__icon" aria-hidden="true" />
            <span class="island__label">{{ t(section.label) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Phones get this at the top of the page instead: the bar is full. -->
    <LanguageSwitch variant="island" class="island__lang" />

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
  --island-radius: 999px;

  position: fixed;
  top: var(--space-4);
  left: 50%;
  z-index: var(--z-header);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1-5, 0.375rem);
  border-radius: var(--island-radius);
  transform: translateX(-50%);
  isolation: isolate;
  transition: padding var(--duration-slow) var(--ease-spring);
}

/*
 * The glass itself. A very light tint and a strong saturation boost: Liquid
 * Glass lets the colour behind it come through richer rather than greying
 * it out. The blur is modest - the refraction, where it runs, does most of
 * the work of separating the bar from the page.
 */
.island__glass {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 11%) 0%, rgb(255 255 255 / 3%) 55%, rgb(255 255 255 / 6%) 100%),
    rgb(10 20 34 / 38%);
  -webkit-backdrop-filter: blur(16px) saturate(190%) brightness(1.06);
  backdrop-filter: blur(16px) saturate(190%) brightness(1.06);
  box-shadow:
    /* Light caught along the top, and a faint return along the bottom. */
    inset 0 1px 0.5px rgb(255 255 255 / 42%),
    inset 0 -1px 0.5px rgb(255 255 255 / 12%),
    /* The thickness of the glass, read as a soft inner shade. */
    inset 0 0 18px rgb(255 255 255 / 5%),
    0 12px 32px -12px rgb(0 0 0 / 65%),
    0 2px 6px rgb(0 0 0 / 22%);
  pointer-events: none;
}

/* The rim: a bright edge where the curve faces the light, fading round the
   sides and returning faintly opposite, as on a real rounded lens. */
.island__glass::after {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(
    125deg,
    rgb(255 255 255 / 60%) 0%,
    rgb(255 255 255 / 12%) 22%,
    rgb(255 255 255 / 4%) 50%,
    rgb(255 255 255 / 10%) 78%,
    rgb(255 255 255 / 38%) 100%
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box exclude,
    linear-gradient(#000 0 0);
}

/* Where the engine can bend the backdrop, it does, and blurs less. */
.island--refract .island__glass {
  -webkit-backdrop-filter: url(#nav-liquid-glass) blur(5px) saturate(190%) brightness(1.08);
  backdrop-filter: url(#nav-liquid-glass) blur(5px) saturate(190%) brightness(1.08);
}

.island__defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

/* ================================================================== brand */
.island__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: var(--space-3) var(--space-1);
  opacity: 0.9;
  transition: opacity var(--duration-base) var(--ease-standard);
}

.island__brand:hover {
  opacity: 1;
}

.island__brand img {
  width: 1.75rem;
  height: auto;
}

/* ================================================================== track */
.island__track {
  position: relative;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.island__list {
  position: relative;
  display: flex;
  align-items: center;
  list-style: none;
}

/*
 * The lens: the one piece of glass that marks where you are. Clearer and
 * brighter than the bar around it, with its own rim, as if a second, smaller
 * lens were resting on the first.
 */
.island__lens {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0;
  border-radius: var(--island-radius);
  background:
    radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 22%) 0%, transparent 70%),
    rgb(255 255 255 / 12%);
  box-shadow:
    inset 0 1px 0.5px rgb(255 255 255 / 55%),
    inset 0 -1px 0.5px rgb(255 255 255 / 14%),
    inset 0 0 10px rgb(230 182 108 / 12%),
    0 4px 14px -4px rgb(0 0 0 / 45%);
  opacity: 0;
  transform-origin: center;
  pointer-events: none;
  will-change: transform, width;
  transition:
    opacity var(--duration-base) var(--ease-standard),
    scale 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Pressed or held, the lens swells a little under the finger. */
.island--pressing .island__lens,
.island--dragging .island__lens {
  scale: 1.08 1.12;
}

.island--dragging .island__lens {
  background:
    radial-gradient(120% 90% at 50% 0%, rgb(255 255 255 / 28%) 0%, transparent 70%),
    rgb(255 255 255 / 16%);
}

/* ================================================================== items */
.island__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 0;
  border-radius: var(--island-radius);
  background: transparent;
  color: rgb(255 255 255 / 72%);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition:
    color var(--duration-base) var(--ease-standard),
    padding var(--duration-slow) var(--ease-spring);
}

.island__item:hover {
  color: var(--color-text);
}

/* Whatever sits under the lens takes the accent, as a tinted iOS tab does. */
.island__item.is-lit {
  color: var(--color-primary);
}

.island__icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

/* Condensed: labels fold away, leaving glyphs. The current item keeps its
   label so where you are stays readable. */
.island--condensed .island__item {
  padding: var(--space-2) var(--space-3);
}

.island--condensed .island__item .island__label {
  max-width: 0;
  margin-inline-start: calc(var(--space-2) * -1);
  opacity: 0;
}

.island--condensed .island__item.is-lit {
  padding: var(--space-2) var(--space-4);
}

.island--condensed .island__item.is-lit .island__label {
  max-width: 8rem;
  margin-inline-start: 0;
  opacity: 1;
}

/* The text fades well before the width finishes folding, so a label is
   never caught half clipped. */
.island__label {
  max-width: 8rem;
  overflow: hidden;
  transition:
    max-width var(--duration-slow) var(--ease-spring),
    opacity var(--duration-fast) var(--ease-standard),
    margin var(--duration-slow) var(--ease-spring);
}

/* ================================================================= phones */
@media (max-width: 48rem) {
  .island {
    top: auto;
    /* Clear of the home indicator on iOS. */
    bottom: calc(var(--space-3) + env(safe-area-inset-bottom, 0px));
    width: min(calc(100vw - var(--space-6)), 28rem);
    padding: var(--space-1);
  }

  .island .island__brand,
  .island .island__lang {
    display: none;
  }

  .island__track,
  .island__list {
    flex: 1;
  }

  .island__list > li {
    flex: 1;
    min-width: 0;
  }

  /* An iOS tab: the icon, and its name small underneath. */
  .island__item,
  .island--condensed .island__item,
  .island--condensed .island__item.is-lit {
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
    width: 100%;
    padding: var(--space-2) 0 0.4rem;
  }

  .island__icon {
    width: 1.3rem;
    height: 1.3rem;
  }

  .island__label,
  .island--condensed .island__item .island__label,
  .island--condensed .island__item.is-lit .island__label {
    max-width: 100%;
    margin: 0;
    opacity: 1;
    font-size: 0.625rem;
    font-weight: var(--font-weight-semibold);
    line-height: 1;
    text-overflow: ellipsis;
    transition: none;
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
