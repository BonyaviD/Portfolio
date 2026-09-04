import { computed } from "vue";
import { photos as bundledPhotos } from "@/data/hobbies";

/**
 * The photography feed, normalised to one shape.
 *
 * The source is /api/photos, which reads the Telegram channel on the server
 * and hands back image URLs that point at this site's own proxy. Both halves
 * matter: Iranian ISPs block Telegram, so neither the post list nor a single
 * image byte may be fetched by the visitor's browser from t.me or its CDN.
 * Everything the page loads comes from this origin.
 *
 * The route never throws - an unreachable channel returns an empty list - so
 * the photos bundled in the repo are the fallback and the section always has
 * something to show.
 *
 * @returns {{ photos: import("vue").ComputedRef<Array>, source: import("vue").ComputedRef<string> }}
 */
export async function usePhotoFeed() {
  const { data: feed } = await useAsyncData("telegram-feed", () =>
    $fetch("/api/photos").catch(() => null)
  );

  const remote = computed(() => {
    const list = feed.value?.photos;
    return Array.isArray(list) ? list.filter((item) => item?.src) : [];
  });

  const photos = computed(() => {
    if (remote.value.length) {
      return remote.value.map((photo) => ({
        id: photo.id,
        src: photo.src,
        description: photo.description || "",
        date: photo.date || null,
        views: photo.views ?? null,
        reactions: photo.reactions ?? null,
        // The caption is the only description of the image we have.
        alt: photo.description?.split("\n")[0] || "Photo from my Telegram channel",
      }));
    }

    return bundledPhotos.map((photo) => ({
      id: photo.id,
      src: photo.src,
      description: `${photo.title}, ${photo.place}`,
      date: null,
      views: null,
      reactions: null,
      alt: photo.alt,
    }));
  });

  return {
    photos,
    source: computed(() => (remote.value.length ? "telegram" : "bundled")),
  };
}

/**
 * Fixed locale and time zone: the server and the browser must format a date
 * identically or hydration mismatches.
 */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPhotoDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : DATE_FORMAT.format(date);
}
