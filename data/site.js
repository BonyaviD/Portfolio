/**
 * Site-wide facts and identity. Single source of truth for anything that
 * appears in more than one place (header, footer, pages, structured data).
 *
 * `{ en, fa }` pairs are shown in the visitor's language; plain strings are
 * the same in both. `name` stays a plain string because structured data and
 * link previews need one canonical spelling - `displayName` is what the page
 * itself shows.
 */

export const site = {
  url: "https://navidbonyadi.ir",
  name: "Navid Bonyadi",
  displayName: { en: "Navid Bonyadi", fa: "نوید بنیادی" },
  role: { en: "Senior Frontend Developer", fa: "توسعه‌دهنده‌ی ارشد فرانت‌اند" },
  tagline: {
    en: "Senior frontend developer building fast, accessible web apps with Next.js, Nuxt and Three.js.",
    fa: "توسعه‌دهنده‌ی ارشد فرانت‌اند؛ سازنده‌ی وب‌اپلیکیشن‌های سریع و دسترس‌پذیر با Next.js، Nuxt و Three.js.",
  },
  location: { city: { en: "Tehran", fa: "تهران" }, country: "IR" },
  employer: "Web One",
  birthDate: "1992-05-24",
};

/** A plain photo, for the structured data that describes the person. */
export const profileImageUrl = `${site.url}/images/navid-bonyadi.jpg`;
/** The 1200x630 link-preview card built by `npm run brand`. */
export const ogImageUrl = `${site.url}/images/og.jpg`;

/** Social links. `icon` is resolved to an asset by the consuming component. */
export const socialLinks = [
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/bonyavid/",
    icon: "simple-icons:linkedin",
  },
  {
    id: "github",
    label: "GitHub",
    url: "https://github.com/BonyaviD",
    icon: "simple-icons:github",
  },
  {
    id: "telegram",
    label: { en: "Telegram", fa: "تلگرام" },
    url: "https://t.me/StreetNote",
    icon: "simple-icons:telegram",
  },
];

/**
 * The page's scroll targets, in document order. Drives both the navigation
 * island and the active-section highlight, so ids must match the section
 * elements rendered on the home page.
 */
export const sections = [
  { id: "hero", label: { en: "Home", fa: "خانه" }, icon: "lucide:house" },
  { id: "about", label: { en: "About", fa: "درباره من" }, icon: "lucide:user" },
  { id: "skills", label: { en: "Skills", fa: "مهارت‌ها" }, icon: "lucide:sparkles" },
  { id: "experience", label: { en: "Work", fa: "نمونه‌کارها" }, icon: "lucide:briefcase" },
  { id: "contact", label: { en: "Contact", fa: "تماس" }, icon: "lucide:mail" },
  { id: "hobbies", label: { en: "Hobbies", fa: "سرگرمی‌ها" }, icon: "lucide:camera" },
];

export const sectionIds = sections.map((section) => section.id);

export const socialUrlById = Object.fromEntries(
  socialLinks.map((link) => [link.id, link.url])
);

/** schema.org Person, written in the page's language. */
export function personSchema(code = "en") {
  const pick = (pair) => pair[code] ?? pair.en;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: pick(site.displayName),
    alternateName: code === "fa" ? site.name : site.displayName.fa,
    url: site.url,
    sameAs: socialLinks
      .filter((link) => link.id !== "telegram")
      .map((link) => link.url),
    jobTitle: pick(site.role),
    worksFor: { "@type": "Organization", name: site.employer },
    description: pick(site.tagline),
    image: profileImageUrl,
    knowsLanguage: ["fa", "en"],
    address: {
      "@type": "PostalAddress",
      addressLocality: pick(site.location.city),
      addressCountry: site.location.country,
    },
    birthDate: site.birthDate,
  };
}
