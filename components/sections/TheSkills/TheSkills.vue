<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import TheSkillsItem from "@/components/sections/TheSkills/TheSkillsItem.vue";

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
  <div class="container">
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
</template>

<style scoped>
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
