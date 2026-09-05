<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import ProjectCard from "@/components/base/ProjectCard.vue";
import { projects } from "@/data/experience";
</script>

<template>
  <BaseSection id="experience" title="Experience">
    <ul class="projects" role="list">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.id"
        :name="project.name"
        :url="project.url"
        :image="project.image"
        :description="project.description"
        :tech="project.tech"
        :index="index"
      />
    </ul>
  </BaseSection>
</template>

<style scoped>
/* ------------------------------------------------------------ project grid */
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
  gap: var(--space-5);
  list-style: none;
}

@media (max-width: 30rem) {
  .projects {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
