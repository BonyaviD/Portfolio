import assert from "node:assert/strict";

// Read-only deployment check: every photo must be served by our own origin.
const origin = new URL(process.argv[2] || "https://navidbonyadi.ir").origin;
const page = await fetch(origin, { signal: AbortSignal.timeout(30000) });
assert.equal(page.status, 200, "Home page must load");
const html = await page.text();
const paths = [...new Set(html.match(/\/api\/photos\/[A-Za-z0-9_-]+/g) || [])];
assert.ok(paths.length > 1, "SSR page must contain Telegram photos");
assert.ok(paths.every((path) => /^\/api\/photos\/(post-|avatar-)/.test(path)), "SSR contains expired URL-based ids");

const results = [];
let next = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (next < paths.length) {
    const path = paths[next++];
    const started = Date.now();
    try {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30000) });
      const type = response.headers.get("content-type") || "";
      const bytes = (await response.arrayBuffer()).byteLength;
      const ok = response.status === 200 && /^image\/(jpeg|png|webp)/.test(type) && bytes > 0;
      results.push({ path, ok, status: response.status, bytes, ms: Date.now() - started });
    } catch (error) {
      results.push({ path, ok: false, error: error.message });
    }
  }
}));
console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), total: results.length, passed: results.filter((r) => r.ok).length, results }, null, 2));
assert.ok(results.every((r) => r.ok), "Some photos failed to load");
