<script setup>
import SocialActions from "@/components/base/SocialActions.vue";
import { site } from "@/data/site";
</script>

<template>
  <footer class="footer">
    <div class="container">
      <SocialActions align="center" variant="soft" icon-only class="footer__social" />
      <p class="footer__note">
        &copy; {{ site.copyrightYear }}
        <span class="footer__name">{{ site.name }}</span>, all rights reserved
        <span aria-hidden="true">&#128104;&#127995;&#8205;&#128187;&#129310;&#127995;</span>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding-block: var(--space-36) var(--space-6);
  background: var(--gradient-footer);
  text-align: center;
}

.footer__social {
  margin-bottom: var(--space-3);
}

.footer__name {
  font-weight: var(--font-weight-bold);
}
</style>
