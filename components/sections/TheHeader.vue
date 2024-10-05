<script setup>
import Logo from "~/assets/img/Logo.svg";
import Github from '~/assets/icons/Github.svg'
import Linkedin from '~/assets/icons/Linkedin.svg'
import TheBotton from "@/components/shared/TheBotton.vue";
</script>

<template>
  <div class="header-section">
    <div class="header-items container">
      <div class="header-logo">
        <img :src="Logo" alt="" srcset="" />
      </div>
      <div class="header-btns">
        <TheBotton to="https://www.linkedin.com/in/bonyavid/" text="LinkedIn" :Logo="Linkedin" opacityMode />
        <TheBotton to="https://github.com/BonyaviD" text="GitHub" :Logo="Github" opacityMode />
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
  background-color: var(--second-sark-color);
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
