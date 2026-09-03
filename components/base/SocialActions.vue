<script setup>
import { computed } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { socialLinks } from "@/data/site";

/**
 * The social link row. URLs and icons live in data/site.js, so the navigation,
 * footer and About page can no longer drift out of sync.
 */
const props = defineProps({
  /** Ids to show, in order. Defaults to every configured link. */
  only: { type: Array, default: null },
  variant: { type: String, default: "soft" },
  size: { type: String, default: "md" },
  iconOnly: { type: Boolean, default: false },
  hideLabelOnMobile: { type: Boolean, default: false },
  align: {
    type: String,
    default: "start",
    validator: (value) => ["start", "center"].includes(value),
  },
});

const links = computed(() => {
  if (!props.only) return socialLinks;
  return props.only
    .map((id) => socialLinks.find((link) => link.id === id))
    .filter(Boolean);
});
</script>

<template>
  <ul class="social-actions" :class="`social-actions--${align}`" role="list">
    <li v-for="link in links" :key="link.id">
      <BaseButton
        :to="link.url"
        :label="link.label"
        :icon="link.icon"
        :variant="variant"
        :size="size"
        :icon-only="iconOnly"
        :hide-label-on-mobile="hideLabelOnMobile"
      />
    </li>
  </ul>
</template>

<style scoped>
.social-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
}

.social-actions--center {
  justify-content: center;
}
</style>
