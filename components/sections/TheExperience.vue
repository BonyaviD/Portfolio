<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import BulletText from "@/components/shared/BulletText.vue";
import ExperienceArianSalamat from "~/assets/img/experience/ariansalamat.png";
import Experiencespy from "~/assets/img/experience/spy.png";
import Experiencedsh from "~/assets/img/experience/dsh.png";
import ExperienceAsarose from "~/assets/img/experience/asarose.png";

const experiences = [
  {
    title: "Shop",
    text: "This is an online shop practice project where I developed the frontend, while the backend is powered by a fake or test API. The project utilized libraries and tools such as Axios, Pinia, Vite, and Vuetify.",
  },
  {
    title: "Spy",
    text: "Spy is a small multiplayer game without a backend, where the frontend is built using Vue. The project made use of libraries including Pinia and Vite.",
  },
  {
    title: "Don't Say Hi",
    text: "This project leverages artificial intelligence for a dating platform, consisting of three subprojects: a landing page built with React, a Python-powered backend, and a Vue-based frontend. I contributed to the frontend development, and the project used libraries such as Axios, Pinia, Vite, and Vue Validate.",
  },
  {
    title: "Asa Gallery",
    text: "Asa Gallery is a Persian online store for cosmetics and beauty products. I designed and implemented the storefront theme using HTML and CSS, while the application itself is powered by an MVC backend developed by another team.",
  },
];

const projects = [
  {
    url: "https://ariansalamat.com",
    image: ExperienceArianSalamat,
    backgroundClass: "shop-card",
    name: "Arian Salamat",
    framework: "This project was developed using HTML and CSS",
  },
  {
    url: "https://spying.netlify.app/",
    image: Experiencespy,
    backgroundClass: "spy-card",
    name: "Spy",
    framework: "This project was developed using Vue.js",
  },
  {
    url: "https://dontsayhi.com/",
    image: Experiencedsh,
    backgroundClass: "dsh-card",
    name: "Don't Say hi",
    framework: "This project was developed using Vue.js",
  },
  {
    url: "https://asarose.com/",
    image: ExperienceAsarose,
    backgroundClass: "asa-card",
    name: "Asa Gallery",
    framework: "This project theme was developed using HTML and CSS",
  },
];
</script>
<template>
  <div class="container">
    <SectionTitle text="Experience" marginTop="6.25rem" marginBottom="3.75rem" />
    <div v-for="experience in experiences" :key="experience.title" class="experience-detail">
      <div class="experience-title">{{ experience.title }}</div>
      <BulletText>{{ experience.text }}</BulletText>
    </div>
    <div class="experience-cards">
      <NuxtLink
        v-for="project in projects"
        :key="project.name"
        :to="project.url"
        target="_blank"
        class="card-link"
      >
        <div class="card" :class="project.backgroundClass">
          <img :src="project.image" :alt="project.name" />
          <div class="card-info">
            <div class="project-name">{{ project.name }}</div>
            <div class="project-framework">{{ project.framework }}</div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
<style scoped>
.experience-detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 1.5rem;
  color: white;
  gap: 0.625rem 2.5rem;
  margin-bottom: 3.75rem;
}
.experience-cards {
    display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}
.card-link {
  width: clamp(300px, 100%, 700px);
  aspect-ratio: 3 / 4;
  /* height: 30rem; */
}
.card {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  overflow: hidden;
}

img {
  width: calc(100%);
  height: calc(100%);
  border-radius: 6px;
  transform: scale(1) rotate(0);
  transition: all 1s ease-in-out;
  object-fit: cover;
}
.card:hover img {
  transform: scale(1.2) rotate(0);
  transform-origin: top center;
}
.card:hover .card-info {
  opacity: 1;
}

.shop-card {
  background-color: white;
}
.spy-card {
  background-color: #131313;
}
.dsh-card:hover img {
  transform: scale(1.2) rotate(0);
  transform-origin: center center;
}
.dsh-card {
  background-color: #29263a;
}
.asa-card {
  background-color: #ffffff;
}
.card-info {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
  background-color: var(--second-dark-color);
  backdrop-filter: blur(0.5rem);
  padding: 2rem 0;
  opacity: 0;
  transition: all 1.5s ease-in-out;
}
.project-name {
  color: var(--primary-color);
  font-size: 1.8rem;
}
.project-framework {
  font-size: 0.9rem;
  font-weight: 800;
}
</style>
