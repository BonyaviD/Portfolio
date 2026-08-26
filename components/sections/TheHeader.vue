<script setup>
import Logo from "~/assets/img/Logo.svg";
import Github from '~/assets/icons/GitHub.svg'
import Linkedin from '~/assets/icons/Linkedin.svg'
import BaseButton from "@/components/shared/BaseButton.vue";
</script>

<template>
  <div class="header-section">
    <div class="header-items container">
      <NuxtLink to="/" class="header-logo">
        <img :src="Logo" alt="Navid Bonyadi logo" />
      </NuxtLink>
      <div class="header-btns">
        <BaseButton to="/about" text="About" opacityMode />
        <BaseButton to="https://www.linkedin.com/in/bonyavid/" text="LinkedIn" :logo="Linkedin" opacityMode />
        <BaseButton to="https://github.com/BonyaviD" text="GitHub" :logo="Github" opacityMode />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-section {
  position: fixed;
  top: 0;
  width: 100%;
  height: 5rem;
  z-index: 100;
  backdrop-filter: blur(0.5rem);
  background-color: var(--second-dark-color);
}

.header-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  
}
.header-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.header-logo img { 
  width: 3.75rem;
}

.header-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}
</style>
