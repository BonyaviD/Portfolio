<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import LanguageSwitch from "@/components/layout/LanguageSwitch.vue";
import { useActiveSection } from "@/composables/useActiveSection";
import { useLocale } from "@/composables/useLocale";
import { sectionIds, sections, site } from "@/data/site";
import { ui } from "@/data/ui";
import LogoImage from "~/assets/img/brand/mark.svg";

/**
 * A floating glass capsule in the spirit of the Dynamic Island: it sits over
 * the page, tracks the section you are reading, and contracts once you scroll
 * away from the top.
 *
 * On narrow screens it drops to the bottom of the viewport and becomes a
 * thumb-reachable icon bar, which is where a phone wants its navigation.
 */
const router = useRouter();

const { activeId, scrollTo } = useActiveSection(sectionIds);
const { basePath, path, t } = useLocale();

/** The tracked sections only exist on the home page, in either language. */
const isHome = computed(() => basePath.value === "/");

/**
 * Scroll when the target is on this page, otherwise route home to the hash
 * and let Nuxt's scroll behaviour finish the job.
 */
async function go(id) {
  if (isHome.value && document.getElementById(id)) {
    scrollTo(id);
    return;
  }
  await router.push({ path: path("/"), hash: `#${id}` });
}

const condensed = ref(false);
let listeners = null;

function onScroll() {
  condensed.value = window.scrollY > 120;
}

onMounted(() => {
  listeners = new AbortController();
  window.addEventListener("scroll", onScroll, { passive: true, signal: listeners.signal });
  onScroll();
});

onBeforeUnmount(() => {
  listeners?.abort();
  listeners = null;
});
</script>

<template>
  <nav class="island" :class="{ 'island--condensed': condensed }" :aria-label="t(ui.nav.label)">
    <NuxtLink
      :to="path('/')"
      class="island__brand"
      :aria-label="t(ui.nav.home, { name: t(site.displayName) })"
    >
      <img :src="LogoImage" alt="" width="31" height="28" />
    </NuxtLink>

    <ul class="island__list" role="list">
      <li v-for="section in sections" :key="section.id">
        <button
          type="button"
          class="island__item"
          :class="{ 'is-active': isHome && activeId === section.id }"
          :aria-current="isHome && activeId === section.id ? 'true' : undefined"
          @click="go(section.id)"
        >
          <Icon :name="section.icon" class="island__icon" aria-hidden="true" />
          <span class="island__label">{{ t(section.label) }}</span>
        </button>
      </li>
    </ul>

    <!-- Phones get this at the top of the page instead: the bar is full. -->
    <LanguageSwitch variant="island" class="island__lang" />
  </nav>
</template>

<style scoped>
.island {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  position: fixed;
  top: var(--space-4);
  left: 50%;
  z-index: var(--z-header);
  padding: var(--space-2);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
  transform: translateX(-50%);
  transition:
    padding var(--duration-slow) var(--ease-spring),
    background-color var(--duration-slow) var(--ease-standard);
}

/* Monogram doubles as the home link; hidden on phones where width is scarce. */
.island__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline-start: var(--space-2);
  opacity: 0.9;
  transition: opacity var(--duration-base) var(--ease-standard);
}

.island__brand:hover {
  opacity: 1;
}

.island__brand img {
  width: 1.75rem;
  height: auto;
}

.island__list {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  list-style: none;
}

.island__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  white-space: nowrap;
  transition:
    color var(--duration-base) var(--ease-standard),
    background-color var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
}

.island__item:hover {
  color: var(--color-text);
  background: rgb(255 255 255 / 7%);
}

.island__item:active {
  transform: scale(0.94);
}

.island__item.is-active {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-raised);
}

.island__icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

/* Condensed: labels collapse away, leaving a compact row of glyphs. The
   active item keeps its label so the current position stays readable. */
.island--condensed .island__item {
  padding: var(--space-2);
}

.island--condensed .island__item .island__label {
  max-width: 0;
  margin-inline-start: calc(var(--space-2) * -1);
  opacity: 0;
}

.island--condensed .island__item.is-active {
  padding: var(--space-2) var(--space-4);
}

.island--condensed .island__item.is-active .island__label {
  max-width: 8rem;
  margin-inline-start: 0;
  opacity: 1;
}

/* The text fades well before the width finishes collapsing, so the label is
   never caught mid-clip reading as broken. */
.island__label {
  max-width: 8rem;
  overflow: hidden;
  transition:
    max-width var(--duration-slow) var(--ease-spring),
    opacity var(--duration-fast) var(--ease-standard),
    margin var(--duration-slow) var(--ease-spring);
}

/* ---------------------------------------------------------------- mobile */
@media (max-width: 48rem) {
  .island {
    top: auto;
    /* Clear of the home indicator on iOS. */
    bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    width: max-content;
    max-width: calc(100vw - var(--space-8));
  }

  .island .island__brand,
  .island .island__lang {
    display: none;
  }

  .island__item,
  .island--condensed .island__item,
  .island--condensed .island__item.is-active {
    justify-content: center;
    gap: 0;
    padding: var(--space-3);
  }

  .island__icon {
    width: 1.375rem;
    height: 1.375rem;
  }

  /* Icons only. The labels pushed the bar to the full width of the screen,
     which cost it the capsule shape; they stay in the DOM, unstyled by the
     transitions above, so the buttons keep their accessible names. */
  .island__label,
  .island--condensed .island__item .island__label,
  .island--condensed .island__item.is-active .island__label {
    position: absolute;
    width: 1px;
    height: 1px;
    max-width: none;
    margin: -1px;
    opacity: 1;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    transition: none;
  }
}
</style>
