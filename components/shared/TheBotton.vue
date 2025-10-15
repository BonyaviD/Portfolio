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

@property --btn-percent {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 95%;
}

.custom-link {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(
    180deg,
    #E6B66C4D 10%,        
    #E6B66C4D var(--btn-percent), 
    #E6B66C 80%  
  );
  color: #fff;
  box-shadow: 
    0 2px 2px 0 rgba(198, 138, 54, 0.12),
    0 6px 8px -2px rgba(198, 138, 54, 0.34);
  transition: --btn-percent 240ms ease,
              box-shadow 400ms ease;
}

.custom-link:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 8px;
  padding: 1.5px;
  background: linear-gradient(
    180deg,
    #E6B66C 0%, 
    #E6B66C 20%,
    #E6B66C 75%, 
    #E6B66C 100% 
  );
  
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: exclude;
  mask-composite: exclude;
  pointer-events: none;
}

.custom-link:hover {
  --btn-percent: 8%;
  box-shadow: 
    0 1px 8px 2px rgba(198, 138, 54, 0.24),
    0 6px 8px -2px rgba(198, 138, 54, 0.34);
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
