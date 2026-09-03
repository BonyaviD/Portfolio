/**
 * Site-wide facts and identity. Single source of truth for anything that
 * appears in more than one place (header, footer, pages, structured data).
 */

export const site = {
  url: "https://bonyadi.netlify.app",
  name: "Navid Bonyadi",
  role: "Frontend Developer",
  tagline:
    "Self-taught frontend developer with expertise in Vue, Nuxt, and modern web technologies.",
  location: { city: "Tehran", country: "IR" },
  employer: "Web One",
  birthDate: "1992-05-24",
  copyrightYear: 2024,
};

export const profileImageUrl = `${site.url}/images/me.jpg`;

/** Social links. `icon` is resolved to an asset by the consuming component. */
export const socialLinks = [
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/bonyavid/" },
  { id: "github", label: "GitHub", url: "https://github.com/BonyaviD" },
  { id: "telegram", label: "Telegram", url: "https://t.me/StreetNote" },
];

export const socialUrlById = Object.fromEntries(
  socialLinks.map((link) => [link.id, link.url])
);

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  sameAs: socialLinks
    .filter((link) => link.id !== "telegram")
    .map((link) => link.url),
  jobTitle: site.role,
  worksFor: { "@type": "Organization", name: site.employer },
  description: site.tagline,
  image: profileImageUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.location.city,
    addressCountry: site.location.country,
  },
  birthDate: site.birthDate,
};
