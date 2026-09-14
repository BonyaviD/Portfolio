/**
 * Two ways to keep decorative work off the critical path.
 *
 * Every WebGL effect on this site used to build its scene in `onMounted`,
 * which meant the Three.js chunk was parsed and four renderers were created
 * before the page had finished the work a visitor is actually waiting on.
 * None of it is content: the aurora has a CSS gradient underneath it and the
 * rest sits well below the fold.
 *
 * Both helpers return a cancel function and run the callback immediately when
 * the API they need is missing, so a decorative effect never goes missing
 * because a browser is old or an observer is throttled.
 */

const INTERACTIONS = ["pointerdown", "pointermove", "keydown", "scroll", "wheel", "touchstart"];

/**
 * On the visitor's first scroll, touch, key press or mouse movement.
 *
 * Idle was not late enough: a phone is idle a second after load, and the
 * Three.js parse and shader compile then landed right in the middle of the
 * page becoming interactive. Nobody is looking at a drifting backdrop before
 * they have moved, and a real visitor moves almost at once.
 */
export function whenInteracted(callback) {
  if (typeof window === "undefined") return () => {};

  const listeners = new AbortController();
  const fire = () => {
    listeners.abort();
    callback();
  };

  for (const type of INTERACTIONS) {
    window.addEventListener(type, fire, { passive: true, signal: listeners.signal });
  }

  return () => listeners.abort();
}

/**
 * A `display: none` element has no box, so an observer on it would never
 * report an intersection and the callback would never run. Several of these
 * effects live inside a host that stays hidden until the effect itself says
 * it is live, which is exactly that deadlock - so watch the nearest ancestor
 * that is actually laid out instead.
 */
function nearestLaidOut(element) {
  let node = element;
  while (node && typeof node.getClientRects === "function" && !node.getClientRects().length) {
    node = node.parentElement;
  }
  return node ?? element;
}

/**
 * Once the element is within `rootMargin` of the viewport. The margin is
 * generous on purpose: the effect should be running by the time it is
 * scrolled to, not starting then.
 */
export function whenNearViewport(element, callback, rootMargin = "400px") {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    callback();
    return () => {};
  }

  const target = nearestLaidOut(element);
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    },
    { rootMargin }
  );

  observer.observe(target);
  return () => observer.disconnect();
}
