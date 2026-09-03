<script setup>
import BulletText from "@/components/base/BulletText.vue";

/**
 * A group of bullet lines. Renders real list semantics, which the previous
 * stack of sibling <div>s did not.
 */
defineProps({
  items: { type: Array, required: true },
});
</script>

<template>
  <ul class="bullet-list" role="list">
    <BulletText v-for="(item, index) in items" :key="index" as="li">
      {{ item }}
    </BulletText>
  </ul>
</template>

<style scoped>
.bullet-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  list-style: none;
}
</style>
