<script setup>
import SocialActions from "@/components/base/SocialActions.vue";
import LanguageSwitch from "@/components/layout/LanguageSwitch.vue";
import { useLocale } from "@/composables/useLocale";
import { ui } from "@/data/ui";

const { t } = useLocale();
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <SocialActions align="center" variant="soft" icon-only />

      <p class="footer__note">
        {{ t(ui.footer.madeWith) }}
        <Icon name="lucide:heart" class="footer__heart" :aria-label="t(ui.footer.love)" />
        {{ t(ui.footer.by) }}
        <span class="footer__name" dir="ltr">navidbonyadi</span>
      </p>
      <LanguageSwitch variant="text" />
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

.footer__heart {
  margin-inline: 0.15em;
  color: #ff3b5c;
  fill: currentColor;
  vertical-align: -0.15em;
  animation: footer-beat 1.8s var(--ease-standard) infinite;
}

/* Two quick beats, then a rest - a heartbeat, not a pulse. */
@keyframes footer-beat {
  0%, 40%, 100% { transform: scale(1); }
  10%, 30% { transform: scale(1.18); }
  20% { transform: scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .footer__heart {
    animation: none;
  }
}

@media (max-width: 48rem) {
  /* Leave room for the floating navigation island. */
  .footer {
    padding-bottom: calc(var(--space-24) + env(safe-area-inset-bottom, 0px));
  }
}
</style>
