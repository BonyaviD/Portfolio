/**
 * Reads the photo posts of a public Telegram channel from its web preview.
 *
 * This runs on the server (Vercel / Netlify), never in the browser: Telegram
 * is blocked by Iranian ISPs, so a visitor's browser must only ever talk to
 * this site's own domain. The API routes in server/api are the only callers.
 *
 * There is no official read API for channel history - the Bot API cannot read
 * posts a bot did not receive - so this parses the public preview page at
 * t.me/s/<channel>, which is the same HTML the "Preview channel" link shows.
 */

const TIMEOUT_MS = 12000;

/** t.me serves a stripped page to unknown agents. */
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/** Hosts the image proxy is allowed to fetch from. */
export const IMAGE_HOSTS = /(^|\.)(cdn-telegram\.org|telesco\.pe|t\.me)$/;

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

/** Splits the channel page into one chunk per post, keeping the post id. */
export function splitPosts(html) {
  const marker = /data-post="[^/]+\/(\d+)"/g;
  const starts = [];
  let match;
  while ((match = marker.exec(html))) {
    starts.push({ index: match.index, id: Number(match[1]) });
  }

  return starts.map((start, i) => ({
    id: start.id,
    html: html.slice(start.index, starts[i + 1]?.index ?? html.length),
  }));
}

/**
 * One post to zero or more photos. An album posts several images under one
 * caption, so every wrapper in the chunk counts, not just the first.
 */
export function parsePost(chunk) {
  const images = [
    ...chunk.html.matchAll(
      /tgme_widget_message_photo_wrap[\s\S]{0,400}?background-image:\s*url\('([^']+)'\)/g
    ),
  ].map((match) => decodeEntities(match[1]));

  if (!images.length) return [];

  const text = chunk.html.match(
    /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/
  );
  const time = chunk.html.match(/<time[^>]+datetime="([^"]+)"/);

  const description = text ? toPlainText(text[1]) : "";
  const date = time ? time[1] : null;

  return images.map((url) => ({ url, description, date }));
}

/** The id is the upstream URL itself, so the proxy needs no shared state. */
export function encodeId(url) {
  return Buffer.from(url, "utf8").toString("base64url");
}

export function decodeId(id) {
  return Buffer.from(id, "base64url").toString("utf8");
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, "accept-language": "en" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`t.me returned HTTP ${response.status}`);
  return response.text();
}

/**
 * Newest photos first. The preview page only carries about twenty posts, so
 * older ones are paged in with ?before=<post id> until there are enough.
 *
 * @returns {Promise<Array<{ id: string, description: string, date: string|null }>>}
 */
export async function fetchChannelPhotos(channel, max = 24) {
  const base = `https://t.me/s/${encodeURIComponent(channel)}`;
  const photos = [];
  const seen = new Set();
  let before = null;

  // Bounded: five pages is ~100 posts, well past any sensible max.
  for (let page = 0; page < 5 && photos.length < max; page++) {
    const html = await fetchPage(before ? `${base}?before=${before}` : base);
    const posts = splitPosts(html);
    if (!posts.length) break;

    // The page lists oldest first; the site wants the newest at the front.
    for (const post of [...posts].reverse()) {
      for (const photo of parsePost(post)) {
        if (seen.has(photo.url)) continue;
        seen.add(photo.url);
        photos.push({
          id: encodeId(photo.url),
          description: photo.description,
          date: photo.date,
        });
        if (photos.length >= max) break;
      }
      if (photos.length >= max) break;
    }

    const oldest = Math.min(...posts.map((post) => post.id));
    if (!Number.isFinite(oldest) || oldest === before || oldest <= 1) break;
    before = oldest;
  }

  if (!photos.length) {
    throw new Error(
      "no photo posts found - the channel may be private, may have no " +
        "username, or may not be a channel"
    );
  }

  return photos;
}
