<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import BulletText from "@/components/shared/BulletText.vue";
import BaseButton from "@/components/shared/BaseButton.vue";
import TheSkillsItem from "@/components/sections/TheSkills/TheSkillsItem.vue";
import ProfileSrc from "@/assets/img/me.jpg";
import Baloon from "@/assets/icons/Baloon.svg";
import Github from "~/assets/icons/GitHub.svg";
import Linkedin from "~/assets/icons/Linkedin.svg";
import Telegram from "~/assets/icons/Telegram.svg";

const siteUrl = "https://bonyadi.netlify.app";

const quickFacts = [
  { label: "Based in", value: "Tehran, Iran" },
  { label: "Experience", value: "+2 Years" },
  { label: "Focus", value: "Vue / Nuxt" },
  { label: "Languages", value: "FA / EN" },
];

const story = [
  "I'm Navid, a self-taught front-end developer who fell in love with the web while customizing tiny HTML pages - and never stopped building since.",
  "For over two years I've been crafting responsive, accessible and user-friendly interfaces, turning Figma designs into pixel-perfect reality.",
  "My daily toolkit revolves around Vue and Nuxt, backed by strong fundamentals in semantic HTML, modern CSS architecture and vanilla JavaScript.",
  "I care deeply about clean componentization, performance budgets and smooth micro-interactions that make a UI feel alive.",
  "Beyond coding, I enjoy photography walks, story-driven video games and sharing what I learn with the developer community.",
];

const coreStack = [
  { text: "Vue", level: "Advanced" },
  { text: "Nuxt", level: "Advanced" },
  { text: "JavaScript", level: "Advanced" },
  { text: "TypeScript", level: "Beginner" },
  { text: "Pinia", level: "Advanced" },
  { text: "Vite", level: "Intermediate" },
  { text: "Sass / Scss", level: "Advanced" },
  { text: "Tailwind CSS", level: "Intermediate" },
  { text: "RESTful APIs", level: "Advanced" },
  { text: "Git / GitHub", level: "Advanced" },
];

useHead({
  titleTemplate: "%s - About",
  meta: [
    { hid: "description", name: "description", content: "More about Navid Bonyadi, a self-taught frontend developer based in Tehran, specialized in Vue and Nuxt." },
    { hid: "og:title", property: "og:title", content: "About Navid Bonyadi" },
    { hid: "og:description", property: "og:description", content: "Self-taught frontend developer specialized in Vue, Nuxt and responsive interfaces." },
    { hid: "og:image", property: "og:image", content: siteUrl + "/images/me.jpg" },
    { hid: "og:url", property: "og:url", content: siteUrl + "/about" },
  ],
});
</script>

<template>
  <main class="about-page">
    <!-- ============ Intro ============ -->
    <section class="about-intro container">
      <div class="profile-section">
        <img class="profile-pic" :src="ProfileSrc" alt="Portrait of Navid Bonyadi" />
        <div class="profile-circle"></div>
        <img class="baloon" :src="Baloon" alt="" />
      </div>

      <div class="intro-content">
        <h1 class="intro-name">Navid Bonyadi</h1>
        <p class="intro-role">Front-End Developer</p>
        <BulletText>
          Front-end developer with strong teamwork skills and expertise in building responsive, user-friendly websites.
        </BulletText>

        <dl class="quick-facts">
          <div v-for="fact in quickFacts" :key="fact.label" class="fact-box">
            <dt class="fact-label">{{ fact.label }}</dt>
            <dd class="fact-value">{{ fact.value }}</dd>
          </div>
        </dl>

        <div class="about-actions">
          <BaseButton to="https://www.linkedin.com/in/bonyavid/" text="LinkedIn" :logo="Linkedin" opacityMode />
          <BaseButton to="https://github.com/BonyaviD" text="GitHub" :logo="Github" opacityMode />
          <BaseButton to="https://t.me/StreetNote" text="Telegram" :logo="Telegram" opacityMode />
        </div>
      </div>
    </section>

    <!-- ============ Story ============ -->
    <section class="about-story container">
      <SectionTitle text="More About Me" marginTop="6.25rem" marginBottom="3.125rem" />
      <div class="story-content">
        <BulletText v-for="(paragraph, index) in story" :key="index">{{ paragraph }}</BulletText>
      </div>
    </section>

    <!-- ============ Tech stack ============ -->
    <section class="about-stack container">
      <SectionTitle text="Tech Stack" marginTop="6.25rem" marginBottom="3.125rem" />
      <div class="stack-grid">
        <TheSkillsItem
          v-for="skill in coreStack"
          :key="skill.text"
          :text="skill.text"
          :level="skill.level"
        />
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="about-cta container">
      <SectionTitle text="Let's Build Something Together" marginTop="6.25rem" marginBottom="1.875rem" />
      <p class="cta-text">Have a project in mind, or just want to say hi? My inbox is always open.</p>
      <div class="cta-actions">
        <BaseButton to="https://www.linkedin.com/in/bonyavid/" text="Say Hello" :logo="Linkedin" />
        <BaseButton to="https://t.me/StreetNote" text="Message Me" :logo="Telegram" opacityMode />
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ---------- Intro ---------- */
.about-intro {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem 7.5rem;
  padding-top: 3.75rem;
}

.profile-section {
  position: relative;
  flex-shrink: 0;
}

.profile-pic {
  width: clamp(13rem, 22vw, 21.875rem);
  border-radius: 30px;
  object-fit: cover;
  object-position: bottom;
}

.profile-circle {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  width: 3rem;
  height: 3rem;
  background-color: var(--dark-background-color);
  border-radius: 100%;
}

.baloon {
  position: absolute;
  left: -1.5rem;
  top: -9.5rem;
  transform: rotate(50deg);
  animation: turnBaloon 2s alternate-reverse infinite;
}

@keyframes turnBaloon {
  from { transform: rotate(44deg); }
  to { transform: rotate(55deg); }
}

.intro-content {
  max-width: 43.75rem;
}

.intro-name {
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 700;
}

.intro-role {
  display: inline-block;
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 2.5rem;
}

.quick-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.938rem;
  margin: 2.5rem 0;
}

.fact-box {
  border: 1px solid var(--primary-opacity-color);
  background: linear-gradient(140deg, #523c1b5d 0%, #3a2a1244 20%, #0b162e 75%, #0a1f35 100%);
  border-radius: 8px;
  padding: 0.938rem 1.25rem;
}

.fact-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #b8c1c9;
}

.fact-value {
  color: var(--primary-color);
  font-size: 1.15rem;
  font-weight: 800;
}

.about-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}

/* ---------- Story ---------- */
.story-content {
  max-width: 62.5rem;
}

/* ---------- Tech stack ---------- */
.stack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: 1.25rem;
}

/* ---------- CTA ---------- */
.about-cta {
  text-align: center;
  padding-bottom: 3.125rem;
}

.cta-text {
  max-width: 40rem;
  margin: 0 auto 2.5rem auto;
  font-size: 1.25rem;
  line-height: 1.9;
}

.cta-actions {
  justify-content: center;
  padding-bottom: 2rem;
}

/* ---------- Responsive ---------- */
@media (max-width: 60rem) {
  .about-intro {
    flex-direction: column;
    gap: 2.5rem;
    padding-top: 1.5rem;
  }

  .baloon {
    display: none;
  }

  .quick-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stack-grid {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: 0.938rem;
  }
}

@media (max-width: 30rem) {
  .quick-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.625rem;
  }
}
</style>