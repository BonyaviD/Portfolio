/**
 * Three.js is loaded from a CDN because the package is not installed locally.
 * TODO: `npm i three` and replace this module with `import * as THREE from "three"`.
 *
 * The promise is module-scoped, so however many effects ask for Three.js the
 * script is fetched and parsed exactly once.
 */
const THREE_CDN_URL = "https://unpkg.com/three@0.160.0/build/three.min.js";

let pending = null;

export function loadThree() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Three.js can only be loaded in the browser"));
  }
  if (window.THREE) return Promise.resolve(window.THREE);
  if (pending) return pending;

  pending = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = THREE_CDN_URL;
    script.async = true;
    script.onload = () =>
      window.THREE
        ? resolve(window.THREE)
        : reject(new Error("THREE was not defined after the script loaded"));
    script.onerror = () => {
      // Allow a later effect to retry rather than caching the failure forever.
      pending = null;
      reject(new Error(`Failed to load ${THREE_CDN_URL}`));
    };
    document.head.appendChild(script);
  });

  return pending;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}
