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

/** After the browser is done with what matters for first paint. */
export function whenIdle(callback, timeout = 2000) {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback !== "function") {
    const id = setTimeout(callback, 200);
    return () => clearTimeout(id);
  }

  const id = window.requestIdleCallback(callback, { timeout });
  return () => window.cancelIdleCallback(id);
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
