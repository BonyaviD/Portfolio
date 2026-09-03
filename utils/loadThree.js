/**
 * Three.js is a real dependency now, loaded through a dynamic import so Vite
 * code-splits it out of the main bundle: the library is only fetched when an
 * effect actually mounts, and never on the server.
 */
let pending = null;

export function loadThree() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Three.js can only be loaded in the browser"));
  }
  pending ??= import("three");
  return pending;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}
