/**
 * Reports which games still have no landscape key art, and what the file
 * should be called. Purely informational: nothing here changes the build.
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const WIDE_DIR = join(process.cwd(), "assets", "img", "gaming", "wide");
const source = readFileSync(join(process.cwd(), "data", "hobbies.js"), "utf8");

// Read ids straight out of the games list rather than importing the module,
// which would need Vite to resolve its image imports.
const gamesBlock = source.slice(source.indexOf("export const games = ["));
const ids = [...gamesBlock.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]);

const present = new Set(
  (existsSync(WIDE_DIR) ? readdirSync(WIDE_DIR) : [])
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .map((file) => file.replace(/\.[^.]+$/, ""))
);

const missing = ids.filter((id) => !present.has(id));

console.log(`wide key art: ${ids.length - missing.length}/${ids.length} present`);
if (missing.length) {
  console.log("\nstill using the portrait cover - drop a 16:9 image in");
  console.log("assets/img/gaming/wide/ named:\n");
  for (const id of missing) console.log(`  ${id}.jpg`);
  console.log("\n1920x1080 is ideal; anything 16:9 and >=1280 wide looks right.");
}
