<script setup>
import BaseSection from "@/components/base/BaseSection.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import ProfilePortrait from "@/components/base/ProfilePortrait.vue";
import { aboutHighlights, aboutIntro, experienceYears, quickFacts } from "@/data/about";
import { site, socialUrlById } from "@/data/site";

/** The years already sit on the portrait badge; the row carries the rest. */
const facts = quickFacts.filter((fact) => fact.id !== "experience");
</script>

<template>
  <BaseSection id="about" title="About Me">
    <div class="about">
      <figure class="about__portrait">
        <span class="about__halo" aria-hidden="true"></span>
        <ProfilePortrait class="about__photo" />

        <figcaption class="about__badge">
          <strong class="about__badge-value">{{ experienceYears }}+</strong>
          <span class="about__badge-label">years building<br />for the web</span>
        </figcaption>
      </figure>

      <div class="about__content">
        <p class="about__eyebrow">{{ site.role }}</p>
        <p class="about__name">{{ site.name }}</p>
        <p class="about__lede">{{ aboutIntro }}</p>

        <dl class="about__facts">
          <div v-for="fact in facts" :key="fact.id" class="about__fact">
            <dt class="about__fact-label">{{ fact.label }}</dt>
            <dd class="about__fact-value">{{ fact.value }}</dd>
          </div>
        </dl>

        <ul class="about__highlights" role="list">
          <li v-for="item in aboutHighlights" :key="item.title" class="about__highlight">
            <span class="about__icon" aria-hidden="true">
              <Icon :name="item.icon" />
            </span>
            <span class="about__highlight-body">
              <strong class="about__highlight-title">{{ item.title }}</strong>
              <span class="about__highlight-text">{{ item.text }}</span>
            </span>
          </li>
        </ul>

        <div class="about__actions">
          <BaseButton to="#contact" label="Work with me" icon="lucide:mail" variant="solid" />
          <BaseButton
            :to="socialUrlById.linkedin"
            label="LinkedIn"
            icon="simple-icons:linkedin"
            trailing-icon="lucide:arrow-up-right"
            variant="soft"
          />
        </div>
      </div>
    </div>
  </BaseSection>
</template>

<style scoped>
.about {
  display: grid;
  grid-template-columns: minmax(15rem, 24rem) minmax(0, 1fr);
  align-items: center;
  gap: var(--space-16) clamp(var(--space-12), 7vw, var(--space-24));
}

/* --------------------------------------------------------------- portrait */
.about__portrait {
  position: relative;
  margin: 0;
}

/* Warm light pooling behind the photo, so it sits in the page rather than on it. */
.about__halo {
  position: absolute;
  inset: -12% -14%;
  z-index: -1;
  background:
    radial-gradient(55% 50% at 30% 30%, rgb(230 182 108 / 26%) 0%, transparent 70%),
    radial-gradient(50% 45% at 75% 80%, rgb(18 58 92 / 55%) 0%, transparent 72%);
  filter: blur(24px);
  pointer-events: none;
}

/* A gold corner bracket, offset behind the top-left of the frame. */
.about__portrait::before {
  content: "";
  position: absolute;
  top: calc(var(--space-4) * -1);
  left: calc(var(--space-4) * -1);
  width: 42%;
  height: 42%;
  border-top: var(--border-width-thick) solid var(--color-primary);
  border-left: var(--border-width-thick) solid var(--color-primary);
  border-top-left-radius: var(--radius-2xl);
  opacity: 0.7;
  pointer-events: none;
}

.about__photo {
  position: relative;
  width: 100%;
}

.about__photo :deep(.portrait__image) {
  border: var(--border-width-hairline) solid var(--glass-border);
  box-shadow: var(--glass-shadow), 0 30px 60px -30px rgb(0 0 0 / 90%);
}

.about__badge {
  position: absolute;
  right: calc(var(--space-6) * -1);
  bottom: var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5) var(--space-3) var(--space-4);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-xl);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  box-shadow: var(--glass-shadow);
}

.about__badge-value {
  color: var(--color-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.about__badge-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-wide);
  line-height: var(--line-height-base);
  text-transform: uppercase;
}

/* ---------------------------------------------------------------- content */
.about__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.about__eyebrow::before {
  content: "";
  width: var(--space-8);
  height: var(--border-width-thick);
  border-radius: var(--radius-pill);
  background: currentColor;
}

.about__name {
  margin-bottom: var(--space-5);
  font-size: var(--font-size-display);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
}

.about__lede {
  max-width: 40rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
}

.about__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-8);
  margin-block: var(--space-8);
  padding-block: var(--space-5);
  border-block: var(--border-width-hairline) solid var(--glass-border);
}

.about__fact-label {
  margin-bottom: var(--space-1);
  color: var(--color-text-subtle);
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.about__fact-value {
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

/* No backdrop blur on purpose: these sit over the animated page backdrop,
   and a blurred card has to be re-blurred on every frame it moves. */
.about__highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--space-4);
  list-style: none;
}

.about__highlight {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5);
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-xl);
  background: linear-gradient(155deg, rgb(255 255 255 / 7%) 0%, rgb(255 255 255 / 2%) 100%);
  transition:
    border-color var(--duration-base) var(--ease-standard),
    transform var(--duration-slow) var(--ease-spring);
}

.about__highlight:hover {
  border-color: var(--color-primary-soft);
  transform: translateY(-3px);
}

.about__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: var(--border-width-hairline) solid rgb(230 182 108 / 28%);
  border-radius: var(--radius-lg);
  background: rgb(230 182 108 / 12%);
  color: var(--color-primary);
  font-size: 1.3rem;
}

.about__highlight-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.about__highlight-title {
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

.about__highlight-text {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-base);
}

.about__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-10);
}

/* ------------------------------------------------------------- responsive */
@media (max-width: 60rem) {
  .about {
    grid-template-columns: minmax(0, 1fr);
  }

  .about__portrait {
    width: min(78%, 20rem);
    margin-inline: auto;
  }

  .about__badge {
    right: calc(var(--space-8) * -1);
    bottom: var(--space-5);
  }
}

@media (max-width: 30rem) {
  .about__badge {
    right: calc(var(--space-4) * -1);
    padding: var(--space-2) var(--space-4) var(--space-2) var(--space-3);
  }

  .about__badge-value {
    font-size: var(--font-size-2xl);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about__highlight {
    transition: none;
  }

  .about__highlight:hover {
    transform: none;
  }
}
</style>
