<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import BulletText from "@/components/base/BulletText.vue";
import ParticleField from "@/components/effects/ParticleField.vue";
import ProjectCard from "@/components/base/ProjectCard.vue";
import { experiences, projects } from "@/data/experience";
</script>

<template>
  <BaseSection id="experience" title="Experience">
    <!-- The one place particles appear; they sit over the page backdrop. -->
    <template #backdrop>
      <ParticleField :particle-count="7000" :opacity="0.7" />
    </template>

    <div class="experience">
      <article v-for="experience in experiences" :key="experience.id" class="experience__entry">
        <h3 class="experience__title">{{ experience.title }}</h3>
        <BulletText>{{ experience.description }}</BulletText>
      </article>
    </div>

    <ul class="projects" role="list">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.id"
        :name="project.name"
        :url="project.url"
        :image="project.image"
        :tech="project.tech"
        :index="index"
      />
    </ul>
  </BaseSection>
</template>

<style scoped>
.experience {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  margin-bottom: var(--space-16);
}

.experience__entry {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-10);
}

.experience__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

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
