<script setup>
import CodeLogo from "@/assets/icons/Code.svg";
import NuxtLogo from "@/assets/icons/Nuxt.svg";
import VueLogo from "@/assets/icons/Vue.svg";
import GitLogo from "@/assets/icons/Git.svg";
import JsLogo from "@/assets/icons/Js.svg";
import CssLogo from "@/assets/icons/Css.svg";
import HtmlLogo from "@/assets/icons/Html.svg";
import HeroIconsDance from "@/components/sections/TheHeroSection/HeroIconsDance.vue";
import ResumePath from "@/assets/CV/navid-boniadi.pdf"
</script>

<template>
  <div class="hero-section">
    <h1 class="hero-title">Front-end Developer</h1>
    <div class="animation-icons">
      <img class="center-icon" :src="CodeLogo" alt="Code Logo" />
      <div class="spin-icons-small html-icon">
        <img :src="HtmlLogo" alt="HTML Logo" />
      </div>
      <div class="spin-icons-small css-icon">
        <img :src="CssLogo" alt="CSS Logo" />
      </div>
      <div class="spin-icons-small js-icon">
        <img :src="JsLogo" alt="JS Logo" />
      </div>
      <div class="spin-icons-small git-icon">
        <img :src="GitLogo" alt="Git Icon" />
      </div>
      <div class="spin-icons-big vue-icon">
        <img :src="VueLogo" alt="Vue Logo" />
      </div>
      <div class="spin-icons-big nuxt-icon">
        <img :src="NuxtLogo" alt="Nuxt Logo" />
      </div>
    </div>
    <div class="resume-btn">
      <a :href="ResumePath">
       Download CV
      </a>
    </div>
    <HeroIconsDance />
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  padding: 2rem;

}
.animation-icons {
  position: relative;
  top: -300px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem 0;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  transition: all 2s ease;
  overflow: hidden;
}
.hero-section:hover .animation-icons {
  top: 0;
}
.hero-section:hover .hero-title {
  top: 0;
}
.hero-title {
  position: relative;
  top: 6rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-size: 3rem;
  color: var(--primary-color);
  transition: all 0.6s ease-in-out;
  background-color: var(--dark-background-color);
  display: inline-block;
  padding: 0.2rem 1rem;
  border-radius: 10px;
}
.center-icon {
  position: relative;
  top: -200px;
  width: 100px;
  height: 100px;
  background-color: var(--dark-background-color);
  border-radius: 100%;
  z-index: 1;
  transition: all 0.4s ease-in-out;
}

.spin-icons-small,
.spin-icons-big {
  position: absolute;
  border-radius: 100%;
  border: 1px solid var(--primary-color);
  transition: all 0.4s ease-in-out;
  opacity: 0;
  top: -100px;
}
.spin-icons-small {
  width: 50px;
  height: 50px;
}
.hero-section:hover .animation-icons .spin-icons-small {
  top: 120px;
  left: 120px;
}

.spin-icons-big {
  width: 75px;
  height: 75px;
}
.hero-section:hover .animation-icons .spin-icons-big {
  top: 110px;
  left: 110px;
}

.hero-section:hover .animation-icons * {
  top: 0;
}
.hero-section:hover .animation-icons :not(:first-child) {
  animation: rotateAround 9s linear infinite;
  transform-origin: 50% 50%;
}
.hero-section:hover .animation-icons .html-icon {
  animation-delay: 1.5s;
  opacity: 1;
}

.hero-section:hover .animation-icons .vue-icon {
  animation-delay: 3s;
  opacity: 1;
}

.hero-section:hover .animation-icons .js-icon {
  animation-delay: 4.5s;
  opacity: 1;
}

.hero-section:hover .animation-icons .nuxt-icon {
  animation-delay: 7.5s;
  opacity: 1;
}

.hero-section:hover .animation-icons .css-icon {
  animation-delay: 9s;
  opacity: 1;
}

.hero-section:hover .animation-icons .git-icon {
  animation-delay: 6s;
  opacity: 1;
}


@keyframes rotateAround {
  0% {
    transform: rotate(0deg) translateX(90px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(90px) rotate(-360deg);
  }
}

.resume-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 5rem;
}

.resume-btn a {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid var(--primary-color);
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}
.resume-btn a:hover {
background-color: var(--primary-opacity-color);
}
</style>
