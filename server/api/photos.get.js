import { fetchChannelPhotos } from "../utils/telegram";

/**
 * Server-side cache, which the edge cache cannot stand in for: during SSR the
 * page calls this handler in-process, so those calls never touch the CDN and
 * would otherwise re-scrape Telegram on every render.
 */
const readChannel = defineCachedFunction(fetchChannelPhotos, {
  name: "telegram",
  getKey: (channel, max) => `${channel}-${max}`,
  maxAge: 1800,
  staleMaxAge: 86400,
  swr: true,
});

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
  // One preview page holds about twenty posts, so twenty photos is roughly
  // the most that can be had for a single round trip to Telegram - and a page
  // render is waiting on that trip.
  const max = Number(process.env.TELEGRAM_MAX_PHOTOS || 20);

  // Cached at the edge, so Telegram is hit about twice an hour rather than
  // once per visitor, and a stale list is still served while it refreshes.
  const cacheControl = "public, max-age=0, s-maxage=1800, stale-while-revalidate=86400";
  setHeader(event, "cache-control", cacheControl);
  setHeader(event, "cdn-cache-control", cacheControl);

  try {
    const { photos, diagnostics } = await readChannel(channel, max);
    return {
      channel,
      fetchedAt: new Date().toISOString(),
      diagnostics,
      photos: photos.map((photo) => ({
        id: photo.id,
        src: `/api/photos/${photo.id}`,
        description: photo.description,
        date: photo.date,
        views: photo.views,
        reactions: photo.reactions,
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
