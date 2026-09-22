import { computed } from "vue";
import { useLocale } from "@/composables/useLocale";
import { photos as bundledPhotos } from "@/data/hobbies";
import { ui } from "@/data/ui";

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
  const { t } = useLocale();

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
        alt: photo.description?.split("\n")[0] || t(ui.photography.fallbackAlt),
      }));
    }

    return bundledPhotos.map((photo) => ({
      id: photo.id,
      src: photo.src,
      description: `${t(photo.title)}${t({ en: ", ", fa: "، " })}${t(photo.place)}`,
      date: null,
      views: null,
      reactions: null,
      alt: t(photo.alt),
    }));
  });

  return {
    photos,
    /** The channel's own card, or null when the feed fell back. */
    profile: computed(() => (remote.value.length ? (feed.value?.profile ?? null) : null)),
    source: computed(() => (remote.value.length ? "telegram" : "bundled")),
  };
}

/**
 * Fixed time zone, and the locale passed in rather than read from the
 * browser: the server and the browser must format a date identically or
 * hydration mismatches. "fa-IR" formats in the Persian calendar, which is the
 * one a Persian reader expects - 1 Mehr 1405, not 23 September 2026.
 */
const dateFormats = new Map();

export function formatPhotoDate(value, intl = "en-GB") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (!dateFormats.has(intl)) {
    dateFormats.set(
      intl,
      new Intl.DateTimeFormat(intl, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    );
  }
  return dateFormats.get(intl).format(date);
}
