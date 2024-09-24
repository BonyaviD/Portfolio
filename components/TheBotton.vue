<script setup>
import { computed } from "vue";
import { defineProps } from "vue";

// Define props
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  Logo: {
    type: String,
  },
  size: {
    type: Number,
    default: 25,
  },
  opacityMode: {
    type: Boolean,
    default: false
  }
});

// Compute styles dynamically based on the size prop
const logoStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));

const btnMode = computed(() => ({
  backgroundColor: `${props.opacityMode? 'var(--primary-opacity-color)' : 'var(--primary-color)'}`,
  border: `${props.opacityMode? '2px solid var(--primary-color)' : 'none'}`,
}));
</script>

<template>
  <NuxtLink :to="to" target="_blank" class="custom-link" :style="btnMode">
    <div class="link-logo" v-if="Logo">
      <img :src="Logo" :style="logoStyle" alt="Logo" />
    </div>
    <div class="link-text">{{ text }}</div>
  </NuxtLink>
</template>

<style scoped>
.custom-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0 6px;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  width: clamp(60px, 100%, 140px);
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
