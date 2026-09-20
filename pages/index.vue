<script setup>
import HeroSection from "@/components/sections/HeroSection.vue";
import AboutSection from "@/components/sections/AboutSection.vue";
import { defineAsyncComponent, hydrateOnVisible } from "vue";
import SkillsContent from "@/components/sections/SkillsSection.vue";
import ExperienceContent from "@/components/sections/ExperienceSection.vue";
import ContactContent from "@/components/sections/ContactSection.vue";
import HobbiesContent from "@/components/sections/HobbiesSection.vue";
import { ogImageUrl, personSchema, site } from "@/data/site";

// Keep SSR content and styles together; only defer attaching behavior. Dynamic
// imports here split the initial CSS into nine requests and delayed rendering.
const SkillsSection = defineAsyncComponent({
  loader: () => Promise.resolve(SkillsContent),
  hydrate: hydrateOnVisible({ rootMargin: "500px" }),
});
const ExperienceSection = defineAsyncComponent({
  loader: () => Promise.resolve(ExperienceContent),
  hydrate: hydrateOnVisible({ rootMargin: "500px" }),
});
const ContactSection = defineAsyncComponent({
  loader: () => Promise.resolve(ContactContent),
  hydrate: hydrateOnVisible({ rootMargin: "500px" }),
});
const HobbiesSection = defineAsyncComponent({
  loader: () => Promise.resolve(HobbiesContent),
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
