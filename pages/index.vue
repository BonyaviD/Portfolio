<script setup>
import HeroSection from "@/components/sections/HeroSection.vue";
import AboutSection from "@/components/sections/AboutSection.vue";
import { defineAsyncComponent, hydrateOnVisible } from "vue";
import SkillsContent from "@/components/sections/SkillsSection.vue";
import ExperienceContent from "@/components/sections/ExperienceSection.vue";
import ContactContent from "@/components/sections/ContactSection.vue";
import HobbiesContent from "@/components/sections/HobbiesSection.vue";
import { useLocale } from "@/composables/useLocale";
import { ogImageUrl, personSchema, site } from "@/data/site";
import { ui } from "@/data/ui";
import { localizePath } from "@/utils/i18n";

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

const { code, t } = useLocale();
const title = t(ui.meta.homeOgTitle);
const description = t(site.tagline);

useSeoMeta({
  title: t(ui.meta.homeTitle),
  description,
  keywords: t(ui.meta.homeKeywords),
  author: site.name,
  ogTitle: title,
  ogDescription: description,
  ogImage: ogImageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogUrl: `${site.url}${localizePath("/", code.value)}`,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImageUrl,
});

useHead({
  script: [
    { type: "application/ld+json", innerHTML: JSON.stringify(personSchema(code.value)) },
  ],
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
