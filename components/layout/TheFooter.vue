<script setup>
import SocialActions from "@/components/base/SocialActions.vue";
import { site } from "@/data/site";
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <SocialActions align="center" variant="soft" icon-only />

      <p class="footer__note">
        &copy; {{ site.copyrightYear }}
        <span class="footer__name">{{ site.name }}</span> &middot; built with Nuxt
      </p>
    </div>
  </footer>
</template>

<style scoped>
/* No background of its own: the page backdrop shows through, and a single
   hairline separates the footer from the last section. */
.footer {
  position: relative;
  border-top: var(--border-width-hairline) solid var(--glass-border);
  padding-block: var(--space-16) var(--space-10);
}

.footer__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  text-align: center;
}

.footer__note {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.footer__name {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

@media (max-width: 48rem) {
  /* Leave room for the floating navigation island. */
  .footer {
    padding-bottom: calc(var(--space-24) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
