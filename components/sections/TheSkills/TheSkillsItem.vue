<script setup>
import { defineProps } from "vue";

const props = defineProps({
  text: {
    type: String,
  },
  level: {
    type: String,
  },
});
</script>

<template>
  <div class="skills-name">
    <div>{{ props.text }}</div>
  </div>
</template>

<style scoped>
.skills-name {
  padding: 0.6rem;
  border: 1px solid var(--primary-opacity-color);
  background: linear-gradient(140deg, #523c1b5d 0%, #3a2a1244 20%, #0b162e 75%, #0a1f35 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: #b8c1c9;
}

.skill-level {
  width: clamp(80px, 100%, 130px);
  background-color: #30363d41;
  border-radius: 8px;
}

.skill-level {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  color: #E6B66C;
  font-weight: 800;
}
</style>
