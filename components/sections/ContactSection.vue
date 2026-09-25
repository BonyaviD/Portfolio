<script setup>
import { reactive, ref } from "vue";
import BaseSection from "@/components/base/BaseSection.vue";
import LiquidSculpture from "@/components/effects/LiquidSculpture.vue";
import { useLocale } from "@/composables/useLocale";
import { site, socialLinks } from "@/data/site";
import { ui } from "@/data/ui";

const { code, t } = useLocale();

/**
 * The ask. Posts to /api/contact, which relays to Telegram from the server -
 * the visitor's browser never touches api.telegram.org, which is blocked from
 * Iran.
 */
const form = reactive({ name: "", contact: "", message: "", website: "" });

/** "idle" | "sending" | "sent" | "error" */
const state = ref("idle");
const error = ref("");

/** Filled on mount, so a submit that arrives too fast reads as a bot. */
const startedAt = Date.now();

/** Same limits as the server; the messages are in data/ui.js. */
const RULES = {
  name: [2, 80],
  contact: [3, 120],
  message: [10, 2000],
};

function validate() {
  for (const [field, [min, max]] of Object.entries(RULES)) {
    const length = form[field].trim().length;
    if (length < min || length > max) return t(ui.contact.errors[field]);
  }
  return "";
}

async function submit() {
  if (state.value === "sending") return;

  const complaint = validate();
  if (complaint) {
    state.value = "error";
    error.value = complaint;
    return;
  }

  state.value = "sending";
  error.value = "";

  try {
    await $fetch("/api/contact", {
      method: "POST",
      // The language tells me which one to answer in.
      body: { ...form, startedAt, locale: code.value },
    });
    state.value = "sent";
  } catch (thrown) {
    state.value = "error";

    // The form checks the same limits before sending, so a rejection here is
    // about the server's own state - nothing a visitor can act on beyond
    // reaching me another way. The server's reason goes to the console.
    console.warn("[contact]", thrown?.data?.statusMessage ?? thrown?.message);
    error.value = t(ui.contact.errors.failed);
  }
}

function reset() {
  form.name = "";
  form.contact = "";
  form.message = "";
  state.value = "idle";
  error.value = "";
}
</script>

<template>
  <BaseSection id="contact" :title="t(ui.sections.contact)">
    <!-- The loudest piece of the site sits here, because this is the
         section the page is asking for: liquid gold behind the form. -->
    <template #backdrop>
      <LiquidSculpture :celebrate="state === 'sent'" />
    </template>

    <div class="contact">
      <div class="contact__intro">
        <p class="contact__lede">{{ t(ui.contact.lede) }}</p>

        <ul class="contact__links" role="list">
          <li v-for="link in socialLinks" :key="link.id">
            <a class="contact__link" :href="link.url" target="_blank" rel="noopener noreferrer">
              <Icon :name="link.icon" aria-hidden="true" />
              {{ t(link.label) }}
              <Icon name="lucide:arrow-up-right" class="contact__link-arrow" aria-hidden="true" />
            </a>
          </li>
        </ul>

        <p class="contact__where">
          <Icon name="lucide:map-pin" aria-hidden="true" />
          {{ t(site.location.city) }} &middot; {{ t(ui.contact.replies) }}
        </p>
      </div>

      <div class="contact__panel">
        <transition name="swap" mode="out-in">
          <div v-if="state === 'sent'" key="sent" class="sent">
            <span class="sent__mark" aria-hidden="true">
              <Icon name="lucide:check" />
            </span>
            <h3 class="sent__title">{{ t(ui.contact.sentTitle) }}</h3>
            <p class="sent__body">{{ t(ui.contact.sentBody) }}</p>
            <button type="button" class="field__button field__button--quiet" @click="reset">
              {{ t(ui.contact.sendAnother) }}
            </button>
          </div>

          <form v-else key="form" class="form" novalidate @submit.prevent="submit">
            <!-- Honeypot. Hidden from people, irresistible to bots. -->
            <div class="form__trap" aria-hidden="true">
              <label for="contact-website">Website</label>
              <input
                id="contact-website"
                v-model="form.website"
                type="text"
                tabindex="-1"
                autocomplete="off"
              />
            </div>

            <p class="field">
              <label class="field__label" for="contact-name">{{ t(ui.contact.name) }}</label>
              <input
                id="contact-name"
                v-model="form.name"
                class="field__input"
                type="text"
                name="name"
                autocomplete="name"
                dir="auto"
                maxlength="80"
                required
              />
            </p>

            <p class="field">
              <label class="field__label" for="contact-reply">{{ t(ui.contact.reply) }}</label>
              <input
                id="contact-reply"
                v-model="form.contact"
                class="field__input"
                type="text"
                name="contact"
                autocomplete="email"
                dir="ltr"
                maxlength="120"
                placeholder="you@example.com"
                required
              />
            </p>

            <p class="field">
              <label class="field__label" for="contact-message">{{ t(ui.contact.message) }}</label>
              <textarea
                id="contact-message"
                v-model="form.message"
                class="field__input field__input--area"
                name="message"
                rows="5"
                dir="auto"
                maxlength="2000"
                required
              ></textarea>
            </p>

            <p v-if="error" class="form__error" role="alert">
              <Icon name="lucide:triangle-alert" aria-hidden="true" />
              {{ error }}
            </p>

            <button
              type="submit"
              class="field__button"
              :disabled="state === 'sending'"
              :aria-busy="state === 'sending'"
            >
              <Icon v-if="state !== 'sending'" name="lucide:send" aria-hidden="true" />
              <span v-else class="field__spinner" aria-hidden="true"></span>
              {{ state === "sending" ? t(ui.contact.sending) : t(ui.contact.send) }}
            </button>
          </form>
        </transition>
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: var(--space-10);
  align-items: start;
}

/* ----------------------------------------------------------------- intro */
.contact__lede {
  max-width: 26rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
}

.contact__links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-6);
  list-style: none;
}

.contact__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  font-weight: var(--font-weight-semibold);
  transition:
    border-color var(--duration-base) var(--ease-standard),
    background-color var(--duration-base) var(--ease-standard);
}

.contact__link:hover {
  border-color: var(--color-primary-soft);
  background: var(--glass-bg-strong);
}

.contact__link svg {
  color: var(--color-primary);
}

.contact__link-arrow {
  margin-inline-start: auto;
  opacity: 0.6;
}

.contact__where {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
  color: var(--color-text-subtle);
  font-size: var(--font-size-sm);
}

.contact__where svg {
  color: var(--color-primary);
}

/* ------------------------------------------------------------------ form */
.contact__panel {
  padding: var(--space-6);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-2xl);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Off-screen rather than display:none, which some bots skip. */
.form__trap {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.field__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 4%);
  color: var(--color-text);
  font: inherit;
  transition:
    border-color var(--duration-base) var(--ease-standard),
    background-color var(--duration-base) var(--ease-standard);
}

.field__input:focus-visible {
  border-color: var(--color-primary);
  background: rgb(255 255 255 / 7%);
  outline: none;
}

.field__input--area {
  resize: vertical;
  min-height: 8rem;
  line-height: var(--line-height-relaxed);
}

.field__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font: inherit;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition:
    background-color var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
}

.field__button:hover:not(:disabled) {
  background: var(--color-primary-strong);
}

.field__button:active:not(:disabled) {
  transform: scale(0.97);
}

.field__button:disabled {
  cursor: progress;
  opacity: 0.75;
}

.field__button--quiet {
  margin-top: var(--space-4);
  border: var(--border-width-hairline) solid var(--glass-border);
  background: transparent;
  color: var(--color-text);
}

.field__spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid rgb(0 0 0 / 25%);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}

.form__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

/* ------------------------------------------------------------- sent state */
.sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) 0;
  text-align: center;
}

.sent__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: 1.75rem;
}

.sent__title {
  font-size: var(--font-size-xl);
}

.sent__body {
  color: var(--color-text-muted);
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: translateY(var(--space-3));
}

@media (max-width: 60rem) {
  .contact {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }

  .contact__links {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .contact__link-arrow {
    display: none;
  }
}
</style>
