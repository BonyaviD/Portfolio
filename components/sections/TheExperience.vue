<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import ExperienceShop from "@/assets/img/experience/shop.png";
import Experiencespy from "@/assets/img/experience/spy.png";
import Experiencedsh from "@/assets/img/experience/dsh.png";
</script>
<template>
  <div class="container">
    <SectionTitle text="Exsperience" marginTop="100px" marginBottom="60px" />
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
.experience-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}
.card-link {
  width: clamp(300px, 100%, 380px);
  height: 450px;
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
  width: 100%;
  height: 100%;
  border-radius: 6px;
  transform: scale(1) rotate(20deg);
  transition: all 1s ease-in-out;
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
  background-color: #29263A;

}
.card-info {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background-color: var(--second-dark-color);
  backdrop-filter: blur(8px);
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
