<script setup>
import { computed } from "vue";

// Define props
const props = defineProps({
  to: {
    type: String,
  },
  btnSize: {
    type: [String, Number],
  },
  text: {
    type: String,
  },
  logo: {
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

const isExternalLink = computed(
  () => typeof props.to === "string" && props.to.startsWith("http")
);
</script>

<template>
  <NuxtLink
    :to="to"
    :target="isExternalLink ? '_blank' : null"
    class="custom-link"
    :style="[btnMode, btnSize]"
  >
    <div class="link-logo" v-if="logo">
      <img :src="logo" :style="logoStyle" alt="" />
    </div>
    <div class="link-text" v-if="text">{{ text }}</div>
  </NuxtLink>
</template>

<style scoped>
@property --btn-percent {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 95%;
}

.custom-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0 0.375rem;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
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

/* Hide the button text on small screens (CSS instead of JS resize listeners) */
@media (max-width: 35rem) {
  .custom-link .link-text {
    display: none;
  }
}
</style>