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
        <ProfilePortrait class="about__photo" fill />

        <figcaption class="about__badge">
          <strong class="about__badge-value">{{ experienceYears }}+</strong>
          <span class="about__badge-label">years building<br />for the web</span>
        </figcaption>
      </figure>

      <div class="about__intro">
        <p class="about__eyebrow">{{ site.role }}</p>
        <p class="about__name">{{ site.name }}</p>
        <p class="about__lede">{{ aboutIntro }}</p>

        <dl class="about__facts">
          <div v-for="fact in facts" :key="fact.id" class="about__fact">
            <dt class="about__fact-label">{{ fact.label }}</dt>
            <dd class="about__fact-value">{{ fact.value }}</dd>
          </div>
        </dl>

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

      <ul class="about__highlights" role="list">
        <li v-for="item in aboutHighlights" :key="item.title" class="about__highlight">
          <span class="about__icon" aria-hidden="true">
            <Icon :name="item.icon" />
          </span>
          <strong class="about__highlight-title">{{ item.title }}</strong>
          <span class="about__highlight-text">{{ item.text }}</span>
        </li>
      </ul>
    </div>
  </BaseSection>
</template>

<style scoped>
/*
 * Two rows. The top pairs the photo with the introduction; the highlight cards
 * get a row of their own underneath.
 *
 * The cards used to live in the text column, which made that column several
 * times taller than the photo on anything narrower than a wide desktop. Out
 * of it, the introduction is short enough to sit level with the photo - and
 * the photo is sized by the introduction, never the other way round, so the
 * two always end on the same line however the copy wraps.
 */
.about {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  grid-template-areas:
    "portrait intro"
    "highlights highlights";
  column-gap: clamp(var(--space-10), 6vw, var(--space-20));
  row-gap: var(--space-14);
}

/* --------------------------------------------------------------- portrait */
.about__portrait {
  position: relative;
  grid-area: portrait;
  /* A floor for when the copy is short; otherwise the row height decides. */
  min-height: 26rem;
  margin: 0;
}

/* Taken out of flow so the photo covers the row instead of stretching it. */
.about__photo {
  position: absolute;
  inset: 0;
}

.about__photo :deep(.portrait__image) {
  border: var(--border-width-hairline) solid var(--glass-border);
  box-shadow: var(--glass-shadow), 0 30px 60px -30px rgb(0 0 0 / 90%);
}

/* Warm light pooling behind the photo, so it sits in the page rather than on
   it. Kept inside the gutter: a wider box would scroll the page sideways. */
.about__halo {
  position: absolute;
  inset: -8% -6%;
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

/* ------------------------------------------------------------------ intro */
.about__intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  grid-area: intro;
  padding-block: var(--space-4);
}

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
  flex-shrink: 0;
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

.about__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

/* ------------------------------------------------------------- highlights */

/* No backdrop blur on purpose: these sit over the animated page backdrop,
   and a blurred card has to be re-blurred on every frame it moves. */
.about__highlights {
  display: grid;
  grid-area: highlights;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
  list-style: none;
}

.about__highlight {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-5);
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
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-bottom: var(--space-2);
  border: var(--border-width-hairline) solid rgb(230 182 108 / 28%);
  border-radius: var(--radius-lg);
  background: rgb(230 182 108 / 12%);
  color: var(--color-primary);
  font-size: 1.3rem;
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

/* ------------------------------------------------------------- responsive */

/* Four cards across stops leaving room for the text inside them. */
@media (max-width: 75rem) {
  .about__highlights {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Tablet landscape: an even split, so the copy column wraps less and the
   row - which the photo matches - stays short. */
@media (max-width: 68rem) {
  .about {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .about__portrait {
    min-height: 24rem;
  }
}

/*
 * Tablet portrait and phones. Side by side, the copy would get a column too
 * narrow to read and the photo would turn into a sliver, so they stack: a wide
 * photo first, then the introduction at full width.
 */
@media (max-width: 56rem) {
  .about {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "portrait"
      "intro"
      "highlights";
    row-gap: var(--space-10);
  }

  .about__portrait {
    min-height: 0;
    aspect-ratio: 16 / 10;
  }

  .about__halo {
    inset: -4% 0;
  }

  .about__badge {
    right: var(--space-4);
    bottom: var(--space-4);
  }

  .about__intro {
    padding-block: 0;
  }
}

@media (max-width: 36rem) {
  .about__portrait {
    aspect-ratio: 4 / 3;
  }

  .about__portrait::before {
    top: calc(var(--space-3) * -1);
    left: calc(var(--space-3) * -1);
  }

  .about__badge {
    padding: var(--space-2) var(--space-4) var(--space-2) var(--space-3);
  }

  .about__badge-value {
    font-size: var(--font-size-2xl);
  }

  .about__highlights {
    grid-template-columns: minmax(0, 1fr);
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
