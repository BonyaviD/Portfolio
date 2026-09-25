import { onBeforeUnmount, onMounted, ref } from "vue";

/**
 * A jump to a section, in flight.
 *
 * A smooth scroll to Contact passes Skills and Work on the way, and a
 * highlight that followed the scroll would visit each of them before
 * arriving - the navigation lens hopped across every item in between. While
 * a jump is in flight the destination is simply the current section; the
 * reading line takes over again once the page has stopped moving.
 *
 * Shared by every instance, so a jump started from anywhere - the bar, the
 * hero's scroll cue - holds all of them.
 */
const jump = {
  target: null,
  behavior: "smooth",
  startedAt: 0,
  timer: 0,
  corrections: 0,
  /** Each instance's measure(), re-run when a jump lands. */
  measures: new Set(),
};

/** Quiet time after the last scroll event before checking where it stopped. */
const SETTLE_MS = 180;
/** A jump never holds longer than this, whatever happens to the scroll. */
const MAX_JUMP_MS = 3500;
/** How many times a jump that stopped short is re-aimed. */
const MAX_CORRECTIONS = 2;

function land() {
  clearTimeout(jump.timer);
  jump.target = null;
  jump.measures.forEach((measure) => measure());
}

function aim() {
  document.getElementById(jump.target)?.scrollIntoView({
    behavior: jump.behavior,
    block: "start",
  });
}

/**
 * Whether the page has actually arrived: the target sits where scrolling to
 * it puts it (the scroll padding below the navigation), or the page cannot
 * scroll any further toward it.
 */
function arrived() {
  const element = document.getElementById(jump.target);
  if (!element) return true;
  const padding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const offset = element.getBoundingClientRect().top - padding;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  return Math.abs(offset) < 6 || (offset > 0 && atBottom);
}

/**
 * The page has gone quiet - but quiet is not the same as arrived. A frame
 * that stalls for a moment (a section hydrating, images decoding) looks like
 * a stop halfway, and let the highlight loose on the sections in between.
 * And the sections below hydrate and grow while the scroll is under way, so
 * it can genuinely stop short of where it was aimed. So check: land if it is
 * there, aim again if it stopped short, and otherwise keep waiting.
 */
function settle() {
  if (!jump.target) return;
  if (arrived() || performance.now() - jump.startedAt > MAX_JUMP_MS) {
    land();
    return;
  }
  if (jump.corrections < MAX_CORRECTIONS) {
    jump.corrections += 1;
    aim();
  }
  holdUntilSettled();
}

function holdUntilSettled() {
  clearTimeout(jump.timer);
  jump.timer = setTimeout(settle, SETTLE_MS);
}

/**
 * Tracks which section is currently under the reading line so the navigation
 * can highlight it.
 *
 * Uses scroll position rather than raw IntersectionObserver visibility: with
 * sections of wildly different heights, "closest to the top of the viewport"
 * matches what a reader considers the current section far better than
 * "largest visible area".
 *
 * @param {string[]} ids Section element ids, in document order.
 * @returns {{ activeId: object, scrollTo: (id: string) => void }}
 */
export function useActiveSection(ids) {
  const activeId = ref(ids[0] ?? "");
  let listeners = null;
  let frame = 0;

  /** Where on screen a section counts as "current". */
  const READING_LINE = 0.32;

  function measure() {
    frame = 0;
    if (jump.target) {
      activeId.value = jump.target;
      return;
    }
    const line = window.innerHeight * READING_LINE;

    let current = ids[0] ?? "";
    for (const id of ids) {
      const element = document.getElementById(id);
      if (!element) continue;
      if (element.getBoundingClientRect().top <= line) current = id;
    }

    // The last section is often too short to ever reach the reading line, so
    // hitting the bottom of the page selects it outright.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) current = ids.at(-1) ?? current;

    activeId.value = current;
  }

  function onScroll() {
    if (jump.target) {
      // Still travelling: keep holding, unless it has gone on far too long.
      if (performance.now() - jump.startedAt > MAX_JUMP_MS) land();
      else holdUntilSettled();
      return;
    }
    if (frame) return;
    frame = requestAnimationFrame(measure);
  }

  function scrollTo(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    jump.target = id;
    jump.behavior = reduceMotion ? "auto" : "smooth";
    jump.startedAt = performance.now();
    jump.corrections = 0;
    aim();

    // Reflect the destination immediately and hold it there for the whole
    // journey. If the page is already there, no scroll event comes, and the
    // settle timer alone lands it.
    holdUntilSettled();
    activeId.value = id;
    // Keep the URL shareable without the jump a bare hash link would cause.
    history.replaceState(null, "", `#${id}`);
  }

  onMounted(() => {
    listeners = new AbortController();
    const { signal } = listeners;
    window.addEventListener("scroll", onScroll, { passive: true, signal });
    window.addEventListener("resize", onScroll, { passive: true, signal });
    // Where supported, the browser says outright when a scroll has finished.
    window.addEventListener("scrollend", () => jump.target && settle(), { passive: true, signal });
    // The reader taking over mid-jump - wheel, touch, keys - ends it at once.
    for (const type of ["wheel", "touchstart", "keydown"]) {
      window.addEventListener(type, () => jump.target && land(), { passive: true, signal });
    }
    jump.measures.add(measure);
    measure();
  });

  onBeforeUnmount(() => {
    listeners?.abort();
    listeners = null;
    jump.measures.delete(measure);
    cancelAnimationFrame(frame);
  });

  return { activeId, scrollTo };
}
