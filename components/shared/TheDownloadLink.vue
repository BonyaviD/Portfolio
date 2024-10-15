<script setup>

import { defineProps } from "vue";

// Define props
const props = defineProps({
  text: {
    type: String,
  },
  path: {
    type: String
  }
});




</script>

<template>
  <a
    :href="path"
    target="_blank"
    class="custom-link"
  >
    {{ text }}
</a>
</template>

<style scoped>
.custom-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0 0.375rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}
.custom-link .link-text {
  color: var(--light-text-color);
}

.custom-link .link-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
