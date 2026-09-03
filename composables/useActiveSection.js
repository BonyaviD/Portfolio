import { onBeforeUnmount, onMounted, ref } from "vue";

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
    if (frame) return;
    frame = requestAnimationFrame(measure);
  }

  function scrollTo(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });

    // Reflect the destination immediately; smooth scrolling would otherwise
    // leave the highlight lagging behind the tap.
    activeId.value = id;
    // Keep the URL shareable without the jump a bare hash link would cause.
    history.replaceState(null, "", `#${id}`);
  }

  onMounted(() => {
    listeners = new AbortController();
    const { signal } = listeners;
    window.addEventListener("scroll", onScroll, { passive: true, signal });
    window.addEventListener("resize", onScroll, { passive: true, signal });
    measure();
  });

  onBeforeUnmount(() => {
    listeners?.abort();
    listeners = null;
    cancelAnimationFrame(frame);
  });

  return { activeId, scrollTo };
}
