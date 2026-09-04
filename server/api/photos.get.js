import { fetchChannelPhotos } from "../utils/telegram";

/**
 * The photography feed, read from the Telegram channel on the server.
 *
 * Every `src` points back at this site's own image proxy, so the browser
 * never contacts Telegram - which is the whole point, since Iranian ISPs
 * block it.
 *
 * Never throws: a failure returns an empty list and the section falls back to
 * the photos bundled in the repo.
 */
export default defineEventHandler(async (event) => {
  const channel = process.env.TELEGRAM_CHANNEL || "StreetNote";
  const max = Number(process.env.TELEGRAM_MAX_PHOTOS || 24);

  // Cached at the edge, so Telegram is hit about twice an hour rather than
  // once per visitor, and a stale list is still served while it refreshes.
  const cacheControl = "public, max-age=0, s-maxage=1800, stale-while-revalidate=86400";
  setHeader(event, "cache-control", cacheControl);
  setHeader(event, "cdn-cache-control", cacheControl);

  try {
    const photos = await fetchChannelPhotos(channel, max);
    return {
      channel,
      fetchedAt: new Date().toISOString(),
      photos: photos.map((photo) => ({
        id: photo.id,
        src: `/api/photos/${photo.id}`,
        description: photo.description,
        date: photo.date,
      })),
    };
  } catch (error) {
    console.error(`[telegram] ${channel}: ${error.message}`);
    // Short cache on failure: retry soon rather than serving nothing for half
    // an hour, but still absorb a burst of traffic.
    const retry = "public, max-age=0, s-maxage=60";
    setHeader(event, "cache-control", retry);
    setHeader(event, "cdn-cache-control", retry);
    return { channel, fetchedAt: new Date().toISOString(), photos: [], error: error.message };
  }
});
