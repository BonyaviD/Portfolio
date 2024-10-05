<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import BulletText from "@/components/shared/BulletText.vue";
import ExperienceShop from "@/assets/img/experience/shop.png";
import Experiencespy from "@/assets/img/experience/spy.png";
import Experiencedsh from "@/assets/img/experience/dsh.png";
</script>
<template>
  <div class="container">
    <SectionTitle text="Experience" marginTop="6.25rem" marginBottom="3.75rem" />
    <div class="experience-detail">
      <div class="photography-title">Shop</div>
      <BulletText>
        This is an online shop practice project where I developed the frontend, while the backend is powered by a fake or test API. The project
        utilized libraries and tools such as Axios, Pinia, Vite, and Vuetify.</BulletText
      >
    </div>
    <div class="experience-detail">
      <div class="photography-title">Spy</div>
      <BulletText>
        Spy is a small multiplayer game without a backend, where the frontend is built using Vue. The project made use of libraries including Pinia
        and Vite.
      </BulletText>
    </div>
    <div class="experience-detail">
      <div class="photography-title">Don't Say Hi</div>
      <BulletText>
        This project leverages artificial intelligence for a dating platform, consisting of three subprojects: a landing page built with React, a
        Python-powered backend, and a Vue-based frontend. I contributed to the frontend development, and the project used libraries such as Axios,
        Pinia, Vite, and Vue Validate.
      </BulletText>
    </div>
    <div class="experience-cards">
      <NuxtLink to="https://tadavom.netlify.app/products" target="_blank" class="card-link">
        <div class="card shop-card">
          <img :src="ExperienceShop" alt="" />
          <div class="card-info">
            <div class="project-name">Shop</div>
            <div class="project-framework">This project was developed using Nuxt.js</div>
          </div>
        </div>
      </NuxtLink>
      <NuxtLink to="https://spyer.netlify.app/" target="_blank" class="card-link">
        <div class="card spy-card">
          <img :src="Experiencespy" alt="" />
          <div class="card-info">
            <div class="project-name">Spy</div>
            <div class="project-framework">This project was developed using Vue.js</div>
          </div>
        </div>
      </NuxtLink>
      <NuxtLink to="https://dontsayhi.com/" target="_blank" class="card-link">
        <div class="card dsh-card">
          <img :src="Experiencedsh" alt="" />
          <div class="card-info">
            <div class="project-name">Don't Say hi</div>
            <div class="project-framework">This project was developed using Vue.js</div>
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.25rem;
}
.card-link {
  width: clamp(18.75rem, 100%, 23.75rem);
  height: 28.125rem;
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
  width: calc(100% + 3.125rem);
  height: calc(100%);
  border-radius: 6px;
  transform: scale(0.8) rotate(20deg);
  transition: all 1s ease-in-out;
  object-fit: cover;
}
.card:hover img {
  transform: scale(2) rotate(0);
  transform-origin: top left;
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
  transform: scale(2) rotate(0);
  transform-origin: center center;
}
.dsh-card {
  background-color: #29263a;
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
