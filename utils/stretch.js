/**
 * Liquid glass under the finger, after the buttons of iOS 26: press one and
 * it swells and lights up where it is touched; drag, and it is pulled
 * towards the finger like a drop of liquid - longer the way it is pulled,
 * thinner across, harder to pull the further it goes; let go, and it springs
 * back with a wobble.
 *
 *   <button v-stretch>...</button>
 *
 * Nothing about what the element does changes. Releasing over it still
 * activates it; dragging off it and letting go cancels, as on iOS - and
 * the stray click a mouse would otherwise send to whatever lies under both
 * (a dialog's backdrop, say) is swallowed. Vertical drags still scroll the page
 * (assets/css/stretch.css sets touch-action) and the element springs back
 * the moment the browser takes the gesture over.
 *
 * The motion is written to the individual `translate` and `scale`
 * properties, never to `transform`, so it composes with whatever transform
 * the element already has - a hover lift, a centring offset - instead of
 * replacing it. The light follows from three custom properties read by
 * assets/css/stretch.css: --press (0 to 1) and --press-x / --press-y.
 *
 * Skipped entirely under prefers-reduced-motion.
 */

/** Furthest the element is pulled, in px, however far the finger goes. */
const MAX_PULL = 22;

/** Share of the pull the body itself moves; the stretch covers the rest. */
const FOLLOW = 0.5;

/** How much a pull lengthens the element, relative to its size that way. */
const STRETCH = 1.4;

/** Lengthening one way thins it this much the other way. */
const THIN = 0.45;

/** The most a stretch may change either side, as a share of its size. */
const MAX_STRETCH = 0.3;

/** How much a press swells the element, in px across its larger side. */
const SWELL_PX = 8;

/** ...but never more than this share of its size, for small buttons. */
const MAX_SWELL = 0.08;

/**
 * Springs as stiffness and damping. Held, the element tracks the finger
 * closely; released, it is underdamped on purpose - the wobble is the point.
 */
const HELD = { stiffness: 700, damping: 46 };
const RELEASED = { stiffness: 420, damping: 12 };
const PRESS_IN = { stiffness: 520, damping: 34 };
const PRESS_OUT = { stiffness: 420, damping: 20 };

/** Below these the element counts as at rest and the loop stops. */
const REST_OFFSET = 0.05;
const REST_PRESS = 0.002;

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/** Approaches `limit` but never reaches it: the further, the harder. */
function rubberBand(distance, limit) {
  return limit * (1 - Math.exp(-distance / (limit * 2.5)));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** One step of a damped spring, semi-implicit so it stays stable. */
function step(spring, position, velocity, target, dt) {
  const acceleration = spring.stiffness * (target - position) - spring.damping * velocity;
  const nextVelocity = velocity + acceleration * dt;
  return [position + nextVelocity * dt, nextVelocity];
}

function createStretch(el) {
  let pointerId = null;
  let start = { x: 0, y: 0 };
  let size = { width: 1, height: 1 };
  let target = { x: 0, y: 0 };
  let offset = { x: 0, y: 0 };
  let velocity = { x: 0, y: 0 };
  let press = 0;
  let pressVelocity = 0;
  let frame = 0;
  let lastTime = 0;
  let gesture = null;

  function isDisabled() {
    return el.matches(":disabled") || el.getAttribute("aria-disabled") === "true";
  }

  /** Where the light sits: under the finger, in the element's own box. */
  function light(event) {
    const box = el.getBoundingClientRect();
    el.style.setProperty("--press-x", `${event.clientX - box.left}px`);
    el.style.setProperty("--press-y", `${event.clientY - box.top}px`);
  }

  function render() {
    const nx = offset.x / size.width;
    const ny = offset.y / size.height;
    const stretchX = clamp((Math.abs(nx) - Math.abs(ny) * THIN) * STRETCH, -MAX_STRETCH, MAX_STRETCH);
    const stretchY = clamp((Math.abs(ny) - Math.abs(nx) * THIN) * STRETCH, -MAX_STRETCH, MAX_STRETCH);
    const swell = 1 + press * Math.min(MAX_SWELL, SWELL_PX / Math.max(size.width, size.height));

    el.style.translate = `${(offset.x * FOLLOW).toFixed(2)}px ${(offset.y * FOLLOW).toFixed(2)}px`;
    el.style.scale = `${(swell * (1 + stretchX)).toFixed(4)} ${(swell * (1 + stretchY)).toFixed(4)}`;
    el.style.setProperty("--press", clamp(press, 0, 1).toFixed(3));
  }

  function settle() {
    frame = 0;
    el.style.removeProperty("translate");
    el.style.removeProperty("scale");
    el.style.removeProperty("--press");
    el.removeAttribute("data-stretching");
  }

  function tick(now) {
    // Capped, so a dropped frame or a background tab cannot fling it.
    const dt = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;

    const held = pointerId !== null;
    const motion = held ? HELD : RELEASED;
    [offset.x, velocity.x] = step(motion, offset.x, velocity.x, target.x, dt);
    [offset.y, velocity.y] = step(motion, offset.y, velocity.y, target.y, dt);
    [press, pressVelocity] = step(held ? PRESS_IN : PRESS_OUT, press, pressVelocity, held ? 1 : 0, dt);

    const resting =
      !held &&
      Math.hypot(offset.x, offset.y) < REST_OFFSET &&
      Math.hypot(velocity.x, velocity.y) < REST_OFFSET &&
      Math.abs(press) < REST_PRESS &&
      Math.abs(pressVelocity) < REST_PRESS * 10;

    if (resting) {
      settle();
      return;
    }

    render();
    frame = requestAnimationFrame(tick);
  }

  function run() {
    if (frame) return;
    el.setAttribute("data-stretching", "");
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function onMove(event) {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = Math.hypot(dx, dy);
    const pull = rubberBand(distance, MAX_PULL);
    target = distance ? { x: (dx / distance) * pull, y: (dy / distance) * pull } : { x: 0, y: 0 };
    light(event);
  }

  /**
   * A mouse pressed on the element and released off it still clicks - on
   * the nearest element containing both ends, such as a dialog backdrop
   * that closes on click. Dragged off, the press is meant as cancelled.
   */
  function swallowNextClick() {
    const swallow = (event) => {
      event.stopPropagation();
      event.preventDefault();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    // The click, if any, is dispatched in the same task as the pointerup.
    setTimeout(() => window.removeEventListener("click", swallow, { capture: true }));
  }

  function release(event) {
    if (event && event.pointerId !== pointerId) return;
    if (event?.type === "pointerup" && !el.contains(event.target)) swallowNextClick();
    pointerId = null;
    target = { x: 0, y: 0 };
    gesture?.abort();
    gesture = null;
  }

  function onDown(event) {
    if (!event.isPrimary || pointerId !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isDisabled() || prefersReducedMotion()) return;

    pointerId = event.pointerId;
    start = { x: event.clientX, y: event.clientY };
    // Layout size, which a stretch already under way does not distort.
    size = { width: el.offsetWidth || 1, height: el.offsetHeight || 1 };
    target = { x: 0, y: 0 };
    light(event);

    // On the window, not the element: a pointer that leaves the element is
    // still the one stretching it.
    gesture = new AbortController();
    const options = { passive: true, signal: gesture.signal };
    window.addEventListener("pointermove", onMove, options);
    window.addEventListener("pointerup", release, options);
    // The browser took the gesture over: a scroll, a long press menu.
    window.addEventListener("pointercancel", release, options);
    window.addEventListener("blur", () => release(), options);

    run();
  }

  // A link or an image dragged by the mouse would start the browser's own
  // drag and drop, which ends the stretch the moment it begins.
  function onDragStart(event) {
    event.preventDefault();
  }

  el.addEventListener("pointerdown", onDown, { passive: true });
  el.addEventListener("dragstart", onDragStart);

  return {
    destroy() {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("dragstart", onDragStart);
      gesture?.abort();
      if (frame) cancelAnimationFrame(frame);
      settle();
    },
  };
}

const instances = new WeakMap();

/**
 * `v-stretch`: import it into a component and put it on the element.
 * `v-stretch="false"` leaves an element out, for a component that is only
 * sometimes a button.
 *
 * The `data-stretch` attribute is rendered on the server too, so the touch
 * rules in assets/css/stretch.css hold before the section hydrates.
 */
export const vStretch = {
  getSSRProps(binding) {
    return binding.value === false ? {} : { "data-stretch": "" };
  },
  mounted(el, binding) {
    if (binding.value === false) return;
    el.setAttribute("data-stretch", "");
    instances.set(el, createStretch(el));
  },
  unmounted(el) {
    instances.get(el)?.destroy();
    instances.delete(el);
  },
};
