<script setup>
import { useLocale } from "@/composables/useLocale";
import { ui } from "@/data/ui";
import { translate } from "@/utils/i18n";

/**
 * The link to this page in the other language.
 *
 * Written in the language it leads to - "فارسی" on the English site,
 * "English" on the Persian one - because that is the word a reader of that
 * language is scanning the page for.
 *
 * A real link underneath, so it works before hydration and can be opened in a
 * new tab. With JavaScript it also carries the section you are reading
 * across, so switching language does not throw you back to the top.
 */
defineProps({
  /** "island" inside the navigation, "floating" on its own, "text" inline. */
  variant: {
    type: String,
    default: "text",
    validator: (value) => ["island", "floating", "text"].includes(value),
  },
});

const { other, otherCode, switchPath } = useLocale();

function onClick(event) {
  // Leave modified clicks to the browser: new tab, new window, download.
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigateTo(`${switchPath.value}${window.location.hash}`);
}
</script>

<template>
  <a
    :href="switchPath"
    class="lang"
    :class="`lang--${variant}`"
    :lang="other.code"
    :hreflang="other.code"
    :aria-label="translate(ui.language.switchTo, otherCode)"
    @click="onClick"
  >
    <Icon name="lucide:languages" class="lang__icon" aria-hidden="true" />
    <span class="lang__name">{{ other.name }}</span>
  </a>
</template>

<style scoped>
.lang {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--duration-base) var(--ease-standard),
    background-color var(--duration-base) var(--ease-standard);
}

/* The name is always set in its own script's face, whichever page it is on. */
.lang:lang(fa) {
  font-family: "Vazirmatn", var(--font-family-base);
}

.lang:lang(en) {
  font-family: "Jura", var(--font-family-base);
}

.lang:hover {
  color: var(--color-text);
}

.lang__icon {
  width: 1.05rem;
  height: 1.05rem;
  color: var(--color-primary);
}

/* ------------------------------------------------------------- in the nav */
.lang--island {
  position: relative;
  margin-inline-start: var(--space-1);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
}

/* A hairline between the sections and the language, which is not one. */
.lang--island::before {
  content: "";
  position: absolute;
  inset-block: 25%;
  inset-inline-start: calc(var(--space-1) * -1);
  width: var(--border-width-hairline);
  background: var(--glass-border);
}

.lang--island:hover {
  background: rgb(255 255 255 / 7%);
}

/* ----------------------------------------------------------- on its own */
.lang--floating {
  padding: var(--space-2) var(--space-4);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  color: var(--color-text);
}

/* ---------------------------------------------------------------- inline */
.lang--text:hover .lang__name {
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
</style>
