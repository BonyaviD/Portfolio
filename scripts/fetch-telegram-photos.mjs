/**
 * Pulls the photo posts from a public Telegram channel at BUILD time and
 * copies the images into the site's own static output.
 *
 * Why build time: Telegram is unreachable from Iran, so a visitor's browser
 * must never be asked to contact t.me or its CDN. The build runs on Netlify /
 * Vercel, outside that block, and everything the visitor loads afterwards is
 * served from this site's own domain.
 *
 * This script must never fail a deploy. Any problem - channel private, network
 * down, markup changed - is logged and the site falls back to the photos
 * bundled in assets/img/photography.
 *
 * Output:
 *   public/telegram/feed.json     manifest consumed by the photography section
 *   public/telegram/<hash>.<ext>  the downloaded images
 */
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHANNEL = process.env.TELEGRAM_CHANNEL || "StreetNote";
const MAX_PHOTOS = Number(process.env.TELEGRAM_MAX_PHOTOS || 24);
const TIMEOUT_MS = 20000;
const OUT_DIR = join(process.cwd(), "public", "telegram");

/** Browser-ish UA: t.me serves a stripped page to unknown agents. */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const EXTENSION_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function log(message) {
  console.log(`[telegram] ${message}`);
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, ...(init.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  "#039": "'",
  nbsp: " ",
};

function decodeEntities(value) {
  return value
    .replace(/&(amp|lt|gt|quot|#0?39|nbsp);/g, (_, name) => ENTITIES[name] ?? " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

/**
 * Caption HTML to display text. The channel handle is dropped: it belongs in
 * the post, not in the site's photo captions.
 */
export function toPlainText(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/@[A-Za-z0-9_]{3,}/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/** Split the channel page into one chunk per post. */
export function splitPosts(html) {
  const marker = /data-post="[^"]+"/g;
  const starts = [];
  let match;
  while ((match = marker.exec(html))) starts.push(match.index);

  return starts.map((start, i) => html.slice(start, starts[i + 1] ?? html.length));
}

export function parsePost(chunk) {
  // Only the post's own photo wrapper carries a file URL; avatars do not.
  const photo = chunk.match(
    /tgme_widget_message_photo_wrap[\s\S]{0,400}?background-image:\s*url\('([^']+)'\)/
  );
  if (!photo) return null;

  const text = chunk.match(
    /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/
  );
  const time = chunk.match(/<time[^>]+datetime="([^"]+)"/);

  return {
    imageUrl: decodeEntities(photo[1]),
    description: text ? toPlainText(text[1]) : "",
    date: time ? time[1] : null,
  };
}

async function downloadImage(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const type = (response.headers.get("content-type") || "").split(";")[0].trim();
  const extension = EXTENSION_BY_TYPE[type];
  if (!extension) throw new Error(`unsupported content-type "${type}"`);

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength < 1024) throw new Error("suspiciously small image");

  const id = createHash("sha1").update(url).digest("hex").slice(0, 16);
  const fileName = `${id}.${extension}`;
  await writeFile(join(OUT_DIR, fileName), bytes);

  return { id, src: `/telegram/${fileName}`, bytes: bytes.byteLength };
}

/** Always leave a readable manifest behind so the site never 404s for it. */
async function writeManifest(photos, note) {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = { channel: CHANNEL, fetchedAt: new Date().toISOString(), photos };
  if (note) manifest.note = note;
  await writeFile(join(OUT_DIR, "feed.json"), `${JSON.stringify(manifest, null, 2)}
`);
}

async function main() {
  const pageUrl = `https://t.me/s/${CHANNEL}`;
  log(`fetching ${pageUrl}`);

  const response = await fetchWithTimeout(pageUrl);
  if (!response.ok) throw new Error(`channel page returned HTTP ${response.status}`);

  const html = await response.text();
  const posts = splitPosts(html).map(parsePost).filter(Boolean);

  if (!posts.length) {
    throw new Error(
      "no photo posts found - the channel may be private, have previews " +
        "disabled, or not be a channel at all"
    );
  }

  log(`found ${posts.length} photo posts, taking up to ${MAX_PHOTOS}`);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const photos = [];
  for (const post of posts.slice(0, MAX_PHOTOS)) {
    try {
      const file = await downloadImage(post.imageUrl);
      photos.push({
        id: file.id,
        src: file.src,
        description: post.description,
        date: post.date,
      });
    } catch (error) {
      log(`skipped one image: ${error.message}`);
    }
  }

  if (!photos.length) throw new Error("every image download failed");

  await writeFile(
    join(OUT_DIR, "feed.json"),
    `${JSON.stringify({ channel: CHANNEL, fetchedAt: new Date().toISOString(), photos }, null, 2)}\n`
  );

  log(`wrote ${photos.length} photos to public/telegram/`);
}

// Only run when invoked directly, so the parsers above stay importable
// (and testable) without triggering a network fetch.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (error) => {
    log(`falling back to the bundled photos: ${error.message}`);
    // Clear any stale images, then leave an empty manifest: the site reads it,
    // sees no photos, and shows the bundled set instead of 404-ing.
    await rm(OUT_DIR, { recursive: true, force: true }).catch(() => {});
    await writeManifest([], `fetch failed: ${error.message}`).catch(() => {});
    process.exit(0);
  });
}
