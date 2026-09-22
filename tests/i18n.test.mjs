import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import {
  localeFromPath,
  localizePath,
  persianDigits,
  stripLocale,
  translate,
} from "../utils/i18n.js";

// The data files are written for Vite; see the loader for what it stubs.
register("./support/nuxt-data-loader.mjs", import.meta.url);

test("the locale is read from the path", () => {
  assert.equal(localeFromPath("/"), "en");
  assert.equal(localeFromPath("/about"), "en");
  assert.equal(localeFromPath("/fa"), "fa");
  assert.equal(localeFromPath("/fa/about"), "fa");
  // Only a whole segment counts.
  assert.equal(localeFromPath("/fast"), "en");
});

test("paths move between languages and back", () => {
  assert.equal(stripLocale("/fa"), "/");
  assert.equal(stripLocale("/fa/about"), "/about");
  assert.equal(stripLocale("/about"), "/about");
  assert.equal(localizePath("/", "fa"), "/fa");
  assert.equal(localizePath("/about", "fa"), "/fa/about");
  assert.equal(localizePath("/about", "en"), "/about");
});

test("translate picks a side, fills placeholders and passes names through", () => {
  const pair = { en: "{count} views", fa: "{count} بازدید" };
  assert.equal(translate(pair, "fa", { count: "۳" }), "۳ بازدید");
  assert.equal(translate(pair, "en", { count: 3 }), "3 views");
  assert.equal(translate("Next.js", "fa"), "Next.js");
  assert.equal(persianDigits(2026), "۲۰۲۶");
});

test("a Persian list of Latin names keeps its reading order", () => {
  const list = { en: "Next.js, Nuxt and Three.js", fa: "Next.js، Nuxt و Three.js" };
  // A right-to-left mark after the comma, so Nuxt cannot jump ahead of Next.js.
  assert.equal(translate(list, "fa"), "Next.js،‏ Nuxt و Three.js");
  assert.equal(translate(list, "en"), "Next.js, Nuxt and Three.js");
  // Only between Latin words: an ordinary Persian comma is left alone.
  assert.equal(translate({ en: "a", fa: "تهران، ایران" }, "fa"), "تهران، ایران");
});

/** Every `{ en, fa }` pair under `value`, with where it was found. */
function* pairs(value, where) {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) yield* pairs(item, `${where}[${index}]`);
  } else if (value && typeof value === "object") {
    if ("en" in value || "fa" in value) {
      yield [where, value];
      return;
    }
    for (const [key, item] of Object.entries(value)) yield* pairs(item, `${where}.${key}`);
  }
}

const hasPersian = (text) => /[؀-ۿ]/.test(text);
const filled = (side) =>
  Array.isArray(side) ? side.length > 0 && side.every(filled) : typeof side === "string" && side.trim() !== "";
const joined = (side) => (Array.isArray(side) ? side.join(" ") : side);

test("every piece of text exists in both languages", async () => {
  const modules = {
    ui: await import("../data/ui.js"),
    site: await import("../data/site.js"),
    about: await import("../data/about.js"),
    skills: await import("../data/skills.js"),
    experience: await import("../data/experience.js"),
    hobbies: await import("../data/hobbies.js"),
  };

  let count = 0;
  for (const [name, exports] of Object.entries(modules)) {
    for (const [where, pair] of pairs(exports, name)) {
      count += 1;
      assert.ok(filled(pair.en), `${where}: English is missing`);
      assert.ok(filled(pair.fa), `${where}: Persian is missing`);
      assert.equal(Array.isArray(pair.en), Array.isArray(pair.fa), `${where}: shapes differ`);
      // Catches a pair where the English was pasted into both sides.
      assert.ok(
        hasPersian(joined(pair.fa)) || joined(pair.fa) === joined(pair.en),
        `${where}: the Persian side has no Persian in it`
      );
      // Placeholders must match, or one language renders a raw "{name}".
      const slots = (side) => [...joined(side).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      assert.deepEqual(slots(pair.fa), slots(pair.en), `${where}: placeholders differ`);
    }
  }
  assert.ok(count > 100, `expected the site's text to be translated, found ${count} pairs`);
});
