<script setup>
import AboutSection from "@/components/sections/AboutSection.vue";
import BaseSection from "@/components/base/BaseSection.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import SkillTile from "@/components/base/SkillTile.vue";
import { useLocale } from "@/composables/useLocale";
import { aboutStory } from "@/data/about";
import { coreStack } from "@/data/skills";
import { ogImageUrl, site, socialUrlById } from "@/data/site";
import { ui } from "@/data/ui";
import { localizePath } from "@/utils/i18n";

const { code, t, number } = useLocale();

useSeoMeta({
  title: t(ui.meta.aboutTitle),
  description: t(ui.meta.aboutDescription),
  ogTitle: t(ui.meta.aboutOgTitle),
  ogDescription: t(site.tagline),
  ogImage: ogImageUrl,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogUrl: `${site.url}${localizePath("/about", code.value)}`,
});

/** "01", "02"... - or "۰۱", "۰۲" - for the chapter markers. */
const chapterNumber = (index) => number(index + 1, { minimumIntegerDigits: 2 });
</script>

<template>
  <div>
    <!-- The same introduction as the home page, opening this page as its h1. -->
    <AboutSection heading-level="h1" />

    <!-- ---------------------------------------------------------- story -->
    <BaseSection id="story" :title="t(ui.aboutPage.story)">
      <ol class="story" role="list">
        <li v-for="(chapter, index) in aboutStory" :key="index" class="story__chapter">
          <span class="story__number" aria-hidden="true">{{ chapterNumber(index) }}</span>
          <h3 class="story__title">{{ t(chapter.title) }}</h3>
          <p class="story__text">{{ t(chapter.text) }}</p>
        </li>
      </ol>
    </BaseSection>

    <!-- ------------------------------------------------------ tech stack -->
    <BaseSection id="stack" :title="t(ui.aboutPage.stack)">
      <ul class="stack" role="list">
        <SkillTile
          v-for="(skill, index) in coreStack"
          :key="skill.icon"
          :name="t(skill.name)"
          :icon="skill.icon"
          :level="skill.level"
          :index="index"
        />
      </ul>
    </BaseSection>

    <!-- ------------------------------------------------------------ cta -->
    <section id="contact" class="section" aria-labelledby="cta-heading">
      <div class="container">
        <div class="cta">
          <span class="cta__glow" aria-hidden="true"></span>
          <p class="cta__eyebrow">{{ t(ui.aboutPage.ctaEyebrow) }}</p>
          <h2 id="cta-heading" class="cta__title">{{ t(ui.aboutPage.ctaTitle) }}</h2>
          <p class="cta__text">{{ t(ui.aboutPage.ctaText) }}</p>
          <div class="cta__actions">
            <BaseButton
              :to="socialUrlById.telegram"
              :label="t(ui.aboutPage.messageMe)"
              icon="simple-icons:telegram"
              variant="solid"
            />
            <BaseButton
              :to="socialUrlById.linkedin"
              label="LinkedIn"
              icon="simple-icons:linkedin"
              trailing-icon="lucide:arrow-up-right"
              variant="soft"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ------------------------------------------------------------------ story */

/*
 * A vertical timeline: a gold rule down the left with a numbered marker per
 * chapter. Two columns of cards on wide screens would read in a zigzag; one
 * column keeps the story in order.
 */
.story {
  position: relative;
  display: grid;
  gap: var(--space-2);
  max-width: 52rem;
  margin-inline: auto;
  list-style: none;
}

.story::before {
  content: "";
  position: absolute;
  top: var(--space-6);
  bottom: var(--space-6);
  inset-inline-start: 1.75rem;
  width: var(--border-width-hairline);
  background: linear-gradient(180deg, var(--color-primary) 0%, rgb(230 182 108 / 10%) 100%);
}

.story__chapter {
  position: relative;
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  column-gap: var(--space-6);
  padding-block: var(--space-4);
  padding-inline: 0 var(--space-6);
}

.story__number {
  position: relative;
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border: var(--border-width-hairline) solid rgb(230 182 108 / 35%);
  border-radius: var(--radius-circle);
  background: var(--color-bg);
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.story__title {
  margin-bottom: var(--space-2);
  padding-top: var(--space-3);
  color: var(--color-text);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.story__text {
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
}

/* ------------------------------------------------------------------ stack */
/* Ten tiles: five across fills two even rows instead of leaving a half row. */
.stack {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-5);
  list-style: none;
}

@media (max-width: 60rem) {
  .stack {
    grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  }
}

/* -------------------------------------------------------------------- cta */
.cta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(var(--space-10), 6vw, var(--space-20)) clamp(var(--space-6), 5vw, var(--space-16));
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-2xl);
  background: linear-gradient(155deg, rgb(255 255 255 / 7%) 0%, rgb(255 255 255 / 2%) 100%);
  text-align: center;
}

.cta__glow {
  position: absolute;
  inset: -40% 15% auto;
  z-index: -1;
  height: 90%;
  background: radial-gradient(closest-side, rgb(230 182 108 / 22%), transparent);
  pointer-events: none;
}

.cta__eyebrow {
  margin-bottom: var(--space-3);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.cta__title {
  margin-bottom: var(--space-4);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
}

.cta__text {
  max-width: 36rem;
  margin: 0 auto var(--space-8);
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
}

.cta__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

@media (max-width: 36rem) {
  .story::before {
    inset-inline-start: 1.25rem;
  }

  .story__chapter {
    grid-template-columns: 2.5rem minmax(0, 1fr);
    column-gap: var(--space-4);
    padding-inline-end: 0;
  }

  .story__number {
    width: 2.5rem;
    height: 2.5rem;
    font-size: var(--font-size-sm);
  }

  .story__title {
    padding-top: var(--space-2);
    font-size: var(--font-size-lg);
  }

  .stack {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: var(--space-4);
  }
}
</style>
