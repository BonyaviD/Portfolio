<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import TheSkillsItem from "@/components/sections/TheSkills/TheSkillsItem.vue";
</script>
<template>
  <div class="container">
    <SectionTitle text="Skills" marginTop="6.25rem" marginBottom="3.125rem" />
    <div class="skills-content">
      <div class="first-skills skills">
        <TheSkillsItem text="Html" level="Expert"/>
        <TheSkillsItem text="Css" level="Expert"/>
        <TheSkillsItem text="Sass" level="Advanced"/>
        <TheSkillsItem text="Scss" level="Advanced"/>
        <TheSkillsItem text="Tailwind CSS" level="Intermediate" />
        <TheSkillsItem text="Bootstrap" level="Intermediate" /> 
        <TheSkillsItem text="JavaScript" level="Advanced" />
        <TheSkillsItem text="TypeScript" level="Beginner " /> 
        <TheSkillsItem text="HTTP Requests" level="Advanced" />
        <TheSkillsItem text="RESTful APIs" level="Advanced" />
        <TheSkillsItem text="Pinia" level="Advanced" />
        <TheSkillsItem text="Vite" level="Intermediate" />
        <TheSkillsItem text="GIT" level="Advanced" /> 
        <TheSkillsItem text="GITHUB" level="Advanced" /> 
        <TheSkillsItem text="Vue" level="Advanced" /> 
        <TheSkillsItem text="Nuxt" level="Advanced" /> 
      </div>

    </div>
  </div>
</template>

<style scoped>
.skills-content {
  width: 100%;
  border-radius: 8px;
}
.skills {
  position: relative;
  display: flex;
  justify-content: center;
  align-self: center;
  flex-wrap: wrap;
  gap: 0.625rem;
  overflow: hidden;
}
</style>
