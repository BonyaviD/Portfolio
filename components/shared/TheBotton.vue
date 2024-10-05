<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { defineProps } from "vue";

// Define props
const props = defineProps({
  to: {
    type: String,
  },
  responsibility: {
    type: Boolean,
    default: false
  },
  btnSize: {
    type: [String, Number],
  },
  text: {
    type: String,
  },
  Logo: {
    type: String,
  },
  size: {
    type: Number,
    default: 1.563,
  },
  opacityMode: {
    type: Boolean,
    default: false,
  },
});

// Compute styles dynamically based on the size prop
const logoStyle = computed(() => ({
  width: `${props.size}rem`,
  height: `${props.size}rem`,
}));

const btnSize = computed(() => ({
  width: `${props.btnSize}rem`,
}));

const btnMode = computed(() => ({
  backgroundColor: `${
    props.opacityMode ? "var(--primary-opacity-color)" : "var(--primary-color)"
  }`,
  border: `${props.opacityMode ? "2px solid var(--primary-color)" : "none"}`,
}));

const responsive = ref();

function checkResolution() {
  if (window.innerWidth <= 560 && !props.responsibility) {
    responsive.value = true;
  } else {
    responsive.value = false;
  }
}

onMounted(() => {
  checkResolution();
  window.addEventListener('resize', checkResolution);
});


onBeforeUnmount(() => {
  window.removeEventListener('resize', checkResolution);
});
</script>

<template>
  <NuxtLink
    :to="to"
    target="_blank"
    :external="external"
    class="custom-link"
    :style="[btnMode, btnSize]"
  >
    <div class="link-logo" v-if="Logo">
      <img :src="Logo" :style="logoStyle" alt="Logo" />
    </div>
    <div class="link-text" v-if="text && !responsive">{{ text }}</div>
  </NuxtLink>
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
