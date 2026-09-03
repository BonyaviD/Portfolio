<script setup>
import HeroSection from "@/components/sections/HeroSection.vue";
import AboutSection from "@/components/sections/AboutSection.vue";
import SkillsSection from "@/components/sections/SkillsSection.vue";
import ExperienceSection from "@/components/sections/ExperienceSection.vue";
import HobbiesSection from "@/components/sections/HobbiesSection.vue";
import { personSchema, profileImageUrl, site } from "@/data/site";

const title = "Portfolio of Navid Bonyadi";

useSeoMeta({
  title: "Home",
  description: `${site.tagline} | سایت پورتفولیو نوید بنیادی`,
  keywords: "Frontend Developer, Vue, Nuxt, Portfolio, Navid Bonyadi, نوید بنیادی",
  author: site.name,
  ogTitle: title,
  ogDescription: site.tagline,
  ogImage: profileImageUrl,
  ogUrl: site.url,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: site.tagline,
  twitterImage: profileImageUrl,
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
    <HobbiesSection />
  </div>
</template>
