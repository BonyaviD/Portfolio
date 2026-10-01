/**
 * Scroll reveal: every section below the fold waits, hidden, until it is
 * scrolled to, then makes its entrance. The animations themselves are CSS
 * (assets/css/reveal.css); this file only decides *when* each one plays.
 *
 * Markup opts in with an attribute and nothing else:
 *
 *   data-reveal            rise into place out of a blur (the default)
 *   data-reveal="heading"  a section title: up out of a mask, then a beam
 *   data-reveal="zoom"     a large block: tips forward out of the page
 *   data-reveal="start"    slide in from the reading start (left in English,
 *   data-reveal="end"      right in Persian) or from the reading end
 *   data-reveal="stagger"  a list: its children come in one after another
 *
 * and the engine marks the element `data-revealed` when its time comes.
 *
 * Why two inline scripts rather than a Nuxt plugin: a plugin runs only once
 * the app bundle has downloaded, and on a slow connection that is seconds
 * after the HTML has painted. Hiding content until then would leave the page
 * blank exactly when the visitor is waiting for it. Inlined into the HTML,
 * the hiding and the observing both start while the document is parsed and
 * depend on nothing else arriving.
 *
 * Every way this can fail leaves the content visible:
 * - no JavaScript: the head script never sets `data-motion`, nothing hides;
 * - prefers-reduced-motion, or no IntersectionObserver: same;
 * - the engine throws, or the observer never reports (some embedded and
 *   background contexts throttle it away): three seconds after the document
 *   is parsed the head script takes `data-motion` off again.
 *
 * Both functions are serialised with `toString()` into nuxt.config.ts, so
 * they must stay self-contained: no imports, no closures over this module.
 */

/** In <head>, before any of the body paints: opt the page in. */
export function revealHead() {
  var root = document.documentElement;
  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  root.setAttribute("data-motion", "reveal");

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      if (!root.hasAttribute("data-reveal-live")) root.removeAttribute("data-motion");
    }, 3000);
  });
}

/** At the end of <body>, once every section exists: start watching. */
export function revealBody() {
  var root = document.documentElement;
  // Unhead may insert this script a second time on the client; one engine.
  if (root.getAttribute("data-motion") !== "reveal" || window.__reveal) return;
  window.__reveal = true;

  var PENDING = "[data-reveal]:not([data-revealed])";

  var observer = new IntersectionObserver(
    function (entries) {
      // The first report proves the observer works here; see revealHead.
      root.setAttribute("data-reveal-live", "");

      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        // `bottom < 0`: already scrolled past - a restored scroll position or
        // a jump to a later section - which must not leave it hidden above.
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          observer.unobserve(entry.target);
          entry.target.setAttribute("data-revealed", "");
        }
      }
    },
    // Plays once the element is a tenth of the screen in, not on its first
    // pixel, so the entrance happens where the visitor is looking.
    { rootMargin: "0px 0px -10% 0px" }
  );

  function each(node, callback) {
    if (node.nodeType !== 1) return;
    if (node.matches(PENDING)) callback(node);
    var found = node.querySelectorAll(PENDING);
    for (var i = 0; i < found.length; i++) callback(found[i]);
  }

  function watch(node) {
    observer.observe(node);
  }

  function forget(node) {
    observer.unobserve(node);
  }

  each(document.body, watch);

  // Sections rendered later - another page, the other language, content
  // that arrives after load - get the same entrance.
  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      for (var j = 0; j < record.addedNodes.length; j++) each(record.addedNodes[j], watch);
      for (var k = 0; k < record.removedNodes.length; k++) each(record.removedNodes[k], forget);
    }
  }).observe(document.body, { childList: true, subtree: true });
}
