<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import BulletText from "@/components/base/BulletText.vue";
import AuroraField from "@/components/effects/AuroraField.vue";
import { experiences, projects } from "@/data/experience";
</script>

<template>
  <BaseSection id="experience" title="Experience">
    <!-- Dimmer than the Skills aurora: the project screenshots lead here. -->
    <template #backdrop>
      <AuroraField :intensity="0.7" />
    </template>

    <div class="experience">
      <article v-for="experience in experiences" :key="experience.id" class="experience__entry">
        <h3 class="experience__title">{{ experience.title }}</h3>
        <BulletText>{{ experience.description }}</BulletText>
      </article>
    </div>

    <ul class="projects" role="list">
      <li v-for="project in projects" :key="project.id">
        <NuxtLink
          :to="project.url"
          target="_blank"
          rel="noopener noreferrer"
          class="project"
          :class="[`project--${project.surface}`, `project--zoom-${project.zoomOrigin}`]"
        >
          <img class="project__shot" :src="project.image" :alt="`${project.name} website`" />
          <div class="project__info">
            <span class="project__name">{{ project.name }}</span>
            <span class="project__stack">{{ project.stack }}</span>
          </div>
        </NuxtLink>
      </li>
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
  grid-template-columns: repeat(auto-fit, minmax(18.75rem, 1fr));
  gap: var(--space-5);
  list-style: none;
}

.project {
  position: relative;
  display: block;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border: var(--border-width-thick) solid var(--color-border-strong);
  border-radius: var(--radius-md);
}

/* Each screenshot sits on its own site's brand colour. */
.project--light {
  background-color: var(--color-plate-light);
}

.project--ink {
  background-color: var(--color-plate-ink);
}

.project--violet {
  background-color: var(--color-plate-violet);
}

.project__shot {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform var(--duration-slower) var(--ease-standard);
}

.project:hover .project__shot,
.project:focus-visible .project__shot {
  transform: scale(1.2);
}

.project--zoom-top .project__shot {
  transform-origin: top center;
}

.project--zoom-center .project__shot {
  transform-origin: center center;
}

.project__info {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  width: 100%;
  padding-block: var(--space-8);
  background-color: var(--color-surface);
  backdrop-filter: blur(var(--blur-backdrop));
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-standard);
}

.project:hover .project__info,
.project:focus-visible .project__info {
  opacity: 1;
}

.project__name {
  color: var(--color-primary);
  font-size: var(--font-size-2xl);
}

.project__stack {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}
</style>
