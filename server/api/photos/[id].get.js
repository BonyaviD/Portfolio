import { IMAGE_HOSTS, resolvePhoto } from "../../utils/telegram";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// Cache image bytes, never an expiring Telegram URL.
const readImage = defineCachedFunction(async (id) => {
  const url = new URL(await resolvePhoto(id));
  if (url.protocol !== "https:" || !IMAGE_HOSTS.test(url.hostname)) {
    throw createError({ statusCode: 403, statusMessage: "Host not allowed" });
  }
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(12000),
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
  const type = (response.headers.get("content-type") || "").split(";")[0].trim();
  if (!ALLOWED_TYPES.has(type)) throw new Error("Not an image");
  return { type, data: Buffer.from(await response.arrayBuffer()).toString("base64") };
}, {
  name: "telegram-image-bytes-v2",
  getKey: (id) => id,
  maxAge: 86400,
  staleMaxAge: 604800,
  swr: true,
});
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id || id.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "Bad photo id" });
  }
  try {
    const image = await readImage(id);
    setHeader(event, "content-type", image.type);
    setHeader(event, "cache-control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=604800");
    setHeader(event, "cdn-cache-control", "public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800");
    return Buffer.from(image.data, "base64");
  } catch (error) {
    setHeader(event, "cache-control", "no-store");
    console.error("[telegram] image:", error.message);
    throw createError({ statusCode: error.statusCode === 403 ? 403 : 502, statusMessage: "Photo temporarily unavailable" });
  }
});
