/**
 * Builds every raster copy of the brand from the source SVGs and the portrait:
 * the favicon set, the Open Graph card and the small avatar.
 *
 * Browsers and link previews want fixed files at fixed sizes, and none of them
 * change unless the logo or the photo does. Re-run with `npm run brand` after
 * replacing either.
 */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const ICON = "assets/img/brand/icon.svg";
const PORTRAIT = "assets/img/portrait.webp";

const icon = await readFile(ICON);
const png = (size) => sharp(icon, { density: 72 * (size / 64) * 4 }).resize(size).png().toBuffer();

// ------------------------------------------------------------------ favicon
await writeFile("public/favicon.svg", icon);
await writeFile("public/apple-touch-icon.png", await png(180));

/** An .ico is a small directory of PNGs; every modern browser reads that form. */
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile("public/favicon.ico", Buffer.concat([header, ...images]));

// ------------------------------------------------------------------- avatar
// A square around the face in the parking-garage portrait.
await sharp(PORTRAIT)
  .extract({ left: 500, top: 235, width: 320, height: 320 })
  .resize(96)
  .webp({ quality: 82 })
  .toFile("assets/img/avatar.webp");

// ------------------------------------------------------------ profile photo
// Square and plain, for the structured data that describes the person.
await sharp(PORTRAIT)
  .extract({ left: 340, top: 120, width: 640, height: 640 })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile("public/images/navid-bonyadi.jpg");

// ------------------------------------------------------------ open graph card
const W = 1200;
const H = 630;
const photo = await sharp(PORTRAIT)
  .resize({ height: H })
  .extract({ left: 83, top: 0, width: 700, height: H })
  .toBuffer();

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0.42" stop-color="#0d1b2a"/>
      <stop offset="0.6" stop-color="#0d1b2a" stop-opacity="0.45"/>
      <stop offset="0.8" stop-color="#0d1b2a" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect x="72" y="258" width="56" height="4" rx="2" fill="#e6b66c"/>
  <g font-family="Segoe UI, Helvetica, Arial, sans-serif">
    <text x="72" y="226" fill="#ffffff" font-size="76" font-weight="700" letter-spacing="-1.5">Navid Bonyadi</text>
    <text x="72" y="320" fill="#e6b66c" font-size="34" font-weight="600">Senior Frontend Developer</text>
    <text x="72" y="372" fill="#c9d2dc" font-size="28">Next.js · Nuxt · Three.js</text>
    <text x="150" y="540" fill="#8a97a6" font-size="26" dominant-baseline="middle">navidbonyadi.ir</text>
  </g>
</svg>`);

await sharp({ create: { width: W, height: H, channels: 3, background: "#0d1b2a" } })
  .composite([
    { input: photo, left: W - 700, top: 0 },
    { input: overlay, left: 0, top: 0 },
    { input: await png(56), left: 72, top: 512 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile("public/images/og.jpg");

console.log("[brand] favicon.ico, favicon.svg, apple-touch-icon.png, og.jpg, navid-bonyadi.jpg, avatar.webp");
