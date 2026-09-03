<script setup>
import BulletText from "@/components/base/BulletText.vue";
import { games } from "@/data/hobbies";
</script>

<template>
  <div class="gaming">
    <div class="gaming__intro">
      <h3 class="gaming__title">Gaming</h3>
      <BulletText>
        I'm also passionate about gaming, and it's one of my favorite ways to unwind and have
        fun.
      </BulletText>
    </div>

    <ul class="gaming__rail" role="list" tabindex="0" aria-label="Favourite games">
      <li v-for="game in games" :key="game.id" class="gaming__item">
        <img :src="game.src" :alt="game.title" loading="lazy" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.gaming__intro {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-10);
  margin-bottom: var(--space-16);
}

.gaming__title {
  font-size: var(--font-size-subheading);
}

/* Horizontal rail; focusable so it can also be scrolled from the keyboard.
   Scrollbar theming comes from the global scrollbar.css. */
.gaming__rail {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-2);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  list-style: none;
}

.gaming__item {
  flex: 0 0 auto;
  scroll-snap-align: start;
}

.gaming__item img {
  width: 18.75rem;
  height: 28.125rem;
  border-radius: var(--radius-md);
  object-fit: cover;
}
</style>
