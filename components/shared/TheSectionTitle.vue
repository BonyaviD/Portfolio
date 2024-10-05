<script setup>
import { computed } from "vue";
import { defineProps } from "vue";

// Define props
const props = defineProps({
  text: {
    type: String,
  },
  marginTop: {
    type: String,
    default: '0rem'
  },
  marginBottom: {
    type: String,
    default: '0rem'
  },
  color: {
    type: String
  }
});

const marginStyle = computed(() => ({
  marginTop: props.marginTop,
  marginBottom: props.marginBottom,
}));
</script>

<template>
    <div class="title" :style="marginStyle">
        <h2>{{ text }}</h2>
    </div>
</template>

<style scoped>
.title {
    color: var(--primary-color);
    font-size: 3.125rem;
    font-weight: 400;
    text-align: center;
}
</style>