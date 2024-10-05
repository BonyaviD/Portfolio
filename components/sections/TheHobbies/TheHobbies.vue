<script setup>
import SectionTitle from "@/components/shared/TheSectionTitle.vue";
import BulletText from "@/components/shared/BulletText.vue";
import ThePhotography from "@/components/sections/TheHobbies/ThePhotography.vue";
import TheLastOfUs from "~/assets/img/gaming/the-last-of-us.jpg";
import Kena from "~/assets/img/gaming/kena.jpg";
import HellBlade from "~/assets/img/gaming/hellbalde.jpg";
import BeyondTwoTheSouls from "~/assets/img/gaming/beyond-two-souls.jpg";
import Plague from "~/assets/img/gaming/plague.jpg";
import Ghost from "~/assets/img/gaming/ghost.jpg";
import Control from "~/assets/img/gaming/control.jpg";
import Detroit from "~/assets/img/gaming/detroit.jpg";
import FinalFantasy from "~/assets/img/gaming/final-fantasy.jpg";
</script>
<template>
  <div class="container">
    <SectionTitle text="Hobbies" marginTop="6.25rem" marginBottom="3.125rem" />
    <ThePhotography />

    <div class="hobbies-title">
      <div class="gaming-title">Gaming</div>
      <BulletText>I'm also passionate about gaming, and it’s one of my favorite ways to unwind and have fun.</BulletText>
    </div>
    <div class="games">
      <img :src="TheLastOfUs" alt="" />
      <img :src="Kena" alt="" />
      <img :src="HellBlade" alt="" />
      <img :src="BeyondTwoTheSouls" alt="" />
      <img :src="Plague" alt="">
      <img :src="Ghost" alt="">
      <img :src="Control" alt="">
      <img :src="Detroit" alt="">
      <img :src="FinalFantasy" alt="">
    </div>
  </div>
</template>

<style scoped>
.hobbies-title {
  margin-bottom: 3.75rem;
}
.gaming-title {
  font-size: 2.188rem;
}

.games {
  display: flex;
  overflow-x: scroll;
  gap: 0.938rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) var(--second-dark-color);
  padding: 0.5rem;
}
.games::-webkit-scrollbar {
  height: 0.5rem;
}
.games::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 20px;
}
.games::-webkit-scrollbar-track {
  background-color: var(--second-dark-color);
}
.games img {
  width: 18.75rem;
  height: 28.125rem;
  object-fit: cover;
  border-radius: 6px;
  scroll-snap-align: start;

}
</style>
