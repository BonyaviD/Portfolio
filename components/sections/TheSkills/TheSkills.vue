<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import TheSkillsItem from "@/components/sections/TheSkills/TheSkillsItem.vue";
import ParticleFieldCanvas from "@/components/shared/ParticleFieldCanvas.vue";

const skills = [
  { text: "Html", level: "Expert" },
  { text: "Css", level: "Expert" },
  { text: "Sass", level: "Advanced" },
  { text: "Scss", level: "Advanced" },
  { text: "Tailwind CSS", level: "Intermediate" },
  { text: "Bootstrap", level: "Intermediate" },
  { text: "JavaScript", level: "Advanced" },
  { text: "TypeScript", level: "Beginner" },
  { text: "HTTP Requests", level: "Advanced" },
  { text: "RESTful APIs", level: "Advanced" },
  { text: "Pinia", level: "Advanced" },
  { text: "Vite", level: "Intermediate" },
  { text: "GIT", level: "Advanced" },
  { text: "GITHUB", level: "Advanced" },
  { text: "Vue", level: "Advanced" },
  { text: "Nuxt", level: "Advanced" },
];
</script>
<template>
  <div class="custom-section">
    <div class="skills-section">
      <!-- <ParticleFieldCanvas :particle-count="12000" mode="repel" /> -->
      <div class="skills-overlay"></div>

      <div class="container skills-inner">
      <SectionTitle text="Skills" marginTop="6.25rem" marginBottom="3.125rem" />
      <div class="skills-content">
        <div class="first-skills skills">
          <TheSkillsItem
            v-for="skill in skills"
            :key="skill.text"
            :text="skill.text"
            :level="skill.level"
          />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.skills-section {
  position: relative;
  overflow: hidden;
}

/* Keeps cards & title readable above the glowing particles */
.skills-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;}
  
.skills-inner {
  position: relative;
  z-index: 1;
}
.skills-content {
  /* width: 100%; */
  border-radius: 8px;
}
.skills {
  position: relative;
    display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  overflow: hidden;
}
</style>
