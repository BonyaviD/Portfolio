<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BulletList from "@/components/base/BulletList.vue";
import BulletText from "@/components/base/BulletText.vue";
import ProfilePortrait from "@/components/base/ProfilePortrait.vue";
import SkillTile from "@/components/base/SkillTile.vue";
import SocialActions from "@/components/base/SocialActions.vue";
import { aboutStory, quickFacts } from "@/data/about";
import { coreStack } from "@/data/skills";
import { profileImageUrl, site, socialUrlById } from "@/data/site";

const description = `More about ${site.name}, a self-taught frontend developer based in ${site.location.city}, specialized in Vue and Nuxt.`;

useSeoMeta({
  title: "About",
  description,
  ogTitle: `About ${site.name}`,
  ogDescription: "Self-taught frontend developer specialized in Vue, Nuxt and responsive interfaces.",
  ogImage: profileImageUrl,
  ogUrl: `${site.url}/about`,
});
</script>

<template>
  <div>
    <!-- ---------------------------------------------------------- intro -->
    <section class="section intro" aria-labelledby="intro-heading">
      <div class="container intro__inner">
        <ProfilePortrait />

        <div class="intro__content">
          <h1 id="intro-heading" class="intro__name">{{ site.name }}</h1>
          <p class="intro__role">Front-End Developer</p>

          <BulletText>
            Front-end developer with strong teamwork skills and expertise in building
            responsive, user-friendly websites.
          </BulletText>

          <dl class="facts">
            <BaseCard v-for="fact in quickFacts" :key="fact.label" class="facts__item">
              <dt class="facts__label">{{ fact.label }}</dt>
              <dd class="facts__value">{{ fact.value }}</dd>
            </BaseCard>
          </dl>

          <SocialActions variant="soft" />
        </div>
      </div>
    </section>

    <!-- ---------------------------------------------------------- story -->
    <BaseSection id="story" title="More About Me">
      <div class="story">
        <BulletList :items="aboutStory" />
      </div>
    </BaseSection>

    <!-- ------------------------------------------------------ tech stack -->
    <BaseSection id="stack" title="Tech Stack">
      <ul class="stack" role="list">
        <SkillTile
          v-for="(skill, index) in coreStack"
          :key="skill.name"
          :name="skill.name"
          :icon="skill.icon"
          :level="skill.level"
          :index="index"
        />
      </ul>
    </BaseSection>

    <!-- ------------------------------------------------------------ cta -->
    <BaseSection id="contact" title="Let's Build Something Together">
      <div class="cta">
        <p class="cta__text">
          Have a project in mind, or just want to say hi? My inbox is always open.
        </p>
        <div class="cta__actions">
          <BaseButton
            :to="socialUrlById.linkedin"
            label="Say Hello"
            icon="simple-icons:linkedin"
            variant="solid"
          />
          <BaseButton
            :to="socialUrlById.telegram"
            label="Message Me"
            icon="simple-icons:telegram"
            variant="soft"
          />
        </div>
      </div>
    </BaseSection>
  </div>
</template>

<style scoped>
/* ------------------------------------------------------------------ intro */
.intro__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-5) var(--space-24);
}

.intro__content {
  flex: 1 1 20rem;
  max-width: 43.75rem;
}

.intro__name {
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.intro__role {
  margin-bottom: var(--space-10);
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

/* ------------------------------------------------------------ quick facts */
.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-4);
  margin-block: var(--space-10);
}

.facts__label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.facts__value {
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
}

/* ------------------------------------------------------------------ story */
.story {
  max-width: 62.5rem;
}

/* ------------------------------------------------------------------ stack */
.stack {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: var(--space-5);
  list-style: none;
}

/* -------------------------------------------------------------------- cta */
.cta {
  text-align: center;
}

.cta__text {
  max-width: 40rem;
  margin: 0 auto var(--space-10);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

.cta__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

@media (max-width: 60rem) {
  .intro__inner {
    gap: var(--space-10);
  }

  .facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stack {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: var(--space-4);
  }
}
</style>
