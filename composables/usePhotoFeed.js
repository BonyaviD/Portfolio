import { computed } from "vue";
import { photos as bundledPhotos } from "@/data/hobbies";

/**
 * The photography feed, normalised to one shape.
 *
 * Preferred source is `public/telegram/feed.json`, written at build time by
 * scripts/fetch-telegram-photos.mjs. That file only exists when the build
 * machine could reach Telegram, so the photos bundled in the repo are the
 * fallback and the section always has something to show.
 *
 * Everything here is served from this site's own origin: a visitor's browser
 * never contacts Telegram, which is what makes the section work from Iran.
 *
 * @returns {{ photos: import("vue").ComputedRef<Array>, source: import("vue").ComputedRef<string> }}
 */
export async function usePhotoFeed() {
  const { data: feed } = await useAsyncData("telegram-feed", () =>
    $fetch("/telegram/feed.json").catch(() => null)
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
        // The caption is the only description of the image we have.
        alt: photo.description?.split("\n")[0] || "Photo from my Telegram channel",
      }));
    }

    return bundledPhotos.map((photo) => ({
      id: photo.id,
      src: photo.src,
      description: `${photo.title}, ${photo.place}`,
      date: null,
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
