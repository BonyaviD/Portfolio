<script setup>
import BaseButton from "@/components/base/BaseButton.vue";
import SocialActions from "@/components/base/SocialActions.vue";
import { site } from "@/data/site";
import LogoImage from "~/assets/img/Logo.svg";
</script>

<template>
  <header class="header">
    <div class="header__inner container">
      <NuxtLink to="/" class="header__logo" :aria-label="`${site.name} - home`">
        <img :src="LogoImage" alt="" width="60" height="57" />
      </NuxtLink>

      <nav class="header__nav" aria-label="Primary">
        <BaseButton to="/about" label="About" variant="soft" />
        <SocialActions :only="['linkedin', 'github']" variant="soft" hide-label-on-mobile />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  z-index: var(--z-header);
  width: 100%;
  height: var(--header-height);
  background-color: var(--color-surface);
  backdrop-filter: blur(var(--blur-backdrop));
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header__logo {
  display: flex;
  align-items: center;
  height: 100%;
}

.header__logo img {
  width: 3.75rem;
  height: auto;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
</style>
