<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import ProjectCard from "@/components/base/ProjectCard.vue";
import { useLocale } from "@/composables/useLocale";
import { projects } from "@/data/experience";
import { ui } from "@/data/ui";

const { t } = useLocale();
</script>

<template>
  <BaseSection id="experience" :title="t(ui.sections.experience)">
    <ul class="projects" role="list" data-reveal="stagger">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :name="t(project.name)"
        :url="project.url"
        :image="project.image"
        :description="t(project.description)"
        :tech="project.tech"
      />
    </ul>
  </BaseSection>
</template>

<style scoped>
/* ------------------------------------------------------------ project grid */
.projects {
  /* Few, large cards: each gets a beat of its own. */
  --reveal-step: 110ms;
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
