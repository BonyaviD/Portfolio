import { IMAGE_HOSTS, decodeId } from "../../utils/telegram";

const TIMEOUT_MS = 12000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Streams one channel photo through this site's own domain.
 *
 * Without this the manifest would hand the browser a cdn-telegram.org URL and
 * an Iranian visitor would see nothing: the page must not make the visitor
 * fetch anything from a blocked host.
 *
 * The id is the upstream URL, so this is an open proxy in shape - the host
 * allowlist is what keeps it from being used to fetch anything else, and the
 * content-type check keeps it from serving anything but an image.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  let url;
  try {
    url = new URL(decodeId(id));
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Bad photo id" });
  }

  if (url.protocol !== "https:" || !IMAGE_HOSTS.test(url.hostname)) {
    throw createError({ statusCode: 403, statusMessage: "Host not allowed" });
  }

  let upstream;
  try {
    upstream = await fetch(url, {
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`[telegram] image ${url.hostname}: ${error.message}`);
    throw createError({ statusCode: 502, statusMessage: "Upstream unreachable" });
  }

  if (!upstream.ok) {
    throw createError({ statusCode: 502, statusMessage: `Upstream HTTP ${upstream.status}` });
  }

  const type = (upstream.headers.get("content-type") || "").split(";")[0].trim();
  if (!ALLOWED_TYPES.has(type)) {
    throw createError({ statusCode: 415, statusMessage: "Not an image" });
  }

  // The upstream URL contains the file's own hash, so the bytes behind an id
  // never change: cache them for as long as anyone will keep them.
  const cacheControl = "public, max-age=31536000, s-maxage=31536000, immutable";
  setHeader(event, "content-type", type);
  setHeader(event, "cache-control", cacheControl);
  setHeader(event, "cdn-cache-control", cacheControl);

  return Buffer.from(await upstream.arrayBuffer());
});
