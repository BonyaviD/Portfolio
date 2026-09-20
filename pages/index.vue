<script setup>
import HeroSection from "@/components/sections/HeroSection.vue";
import AboutSection from "@/components/sections/AboutSection.vue";
import { defineAsyncComponent, hydrateOnVisible } from "vue";
import { ogImageUrl, personSchema, site } from "@/data/site";

// Keep every section in SSR HTML, but attach its behavior only near the viewport.
const SkillsSection = defineAsyncComponent({
  loader: () => import("@/components/sections/SkillsSection.vue"),
  hydrate: hydrateOnVisible({ rootMargin: "500px" }),
});
const ExperienceSection = defineAsyncComponent({
  loader: () => import("@/components/sections/ExperienceSection.vue"),
  hydrate: hydrateOnVisible({ rootMargin: "500px" }),
});
const ContactSection = defineAsyncComponent({
  loader: () => import("@/components/sections/ContactSection.vue"),
  hydrate: hydrateOnVisible({ rootMargin: "500px" }),
});
const HobbiesSection = defineAsyncComponent({
  loader: () => import("@/components/sections/HobbiesSection.vue"),
  hydrate: hydrateOnVisible({ rootMargin: "1000px" }),
});

const title = "Portfolio of Navid Bonyadi";

useSeoMeta({
  title: "Home",
  description: `${site.tagline} | سایت پورتفولیو نوید بنیادی`,
  keywords:
    "Senior Frontend Developer, Next.js, Nuxt, Three.js, Vue, React, Portfolio, Navid Bonyadi, نوید بنیادی",
  author: site.name,
  ogTitle: title,
  ogDescription: site.tagline,
  ogImage: ogImageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogUrl: site.url,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: site.tagline,
  twitterImage: ogImageUrl,
});

useHead({
  script: [{ type: "application/ld+json", innerHTML: JSON.stringify(personSchema) }],
});
</script>

<template>
  <div>
    <HeroSection />
    <AboutSection />

    <SkillsSection />
    <ExperienceSection />
    <ContactSection />
    <HobbiesSection />
  </div>
</template>
