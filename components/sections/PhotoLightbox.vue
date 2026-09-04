<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { formatPhotoDate } from "@/composables/usePhotoFeed";

/**
 * The picked print, brought forward.
 *
 * It keeps being the same object the visitor tapped: same paper, same marker
 * caption on the bottom border. The entrance is a FLIP from the print's own
 * place on the line, so the picture grows out of where it was hanging rather
 * than appearing over it.
 */
const props = defineProps({
  photos: { type: Array, required: true },
  /** Index into `photos`, or null when nothing is open. */
  index: { type: Number, default: null },
  /** Viewport rect of the print that was picked, for the FLIP. */
  origin: { type: Object, default: null },
});

const emit = defineEmits(["close", "navigate"]);

const frameEl = ref(null);
const closeEl = ref(null);
const flip = ref(null);

const photo = computed(() =>
  props.index === null ? null : (props.photos[props.index] ?? null)
);

const caption = computed(() => {
  const line = (photo.value?.description ?? "")
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);
  return line ?? "";
});

const footnote = computed(() => {
  if (!photo.value) return "";
  return [
    formatPhotoDate(photo.value.date),
    photo.value.views ? `${photo.value.views.toLocaleString("en-GB")} views` : "",
    photo.value.reactions ? `${photo.value.reactions.toLocaleString("en-GB")} likes` : "",
  ]
    .filter(Boolean)
    .join(" · ");
});

const isRtl = computed(() => /[؀-ۿݐ-ݿ]/.test(caption.value));

let restoreFocus = null;

/**
 * First/Last/Invert/Play. The frame is laid out at its final size, measured,
 * then thrown back onto the print's rect and released - so the browser
 * animates real layout rather than a guessed scale.
 */
async function runFlip() {
  flip.value = null;
  await nextTick();

  const el = frameEl.value;
  const from = props.origin;
  if (!el || !from) return;

  const to = el.getBoundingClientRect();
  if (!to.width || !to.height) return;

  const scaleX = from.width / to.width;
  const scaleY = from.height / to.height;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);

  flip.value = {
    transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`,
    transition: "none",
  };
  await nextTick();

  // Read once so the inverted transform is committed before it is cleared.
  void el.offsetWidth;
  flip.value = null;
}

function onKeydown(event) {
  if (props.index === null) return;

  if (event.key === "Escape") {
    event.preventDefault();
    emit("close");
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    emit("navigate", 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    emit("navigate", -1);
  }
}

watch(
  () => props.index,
  async (value, previous) => {
    if (value !== null && previous === null) {
      restoreFocus = document.activeElement;
      document.addEventListener("keydown", onKeydown);
      document.body.style.overflow = "hidden";
      await runFlip();
      closeEl.value?.focus({ preventScroll: true });
      return;
    }

    if (value === null && previous !== null) {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = "";
      restoreFocus?.focus?.({ preventScroll: true });
      restoreFocus = null;
      return;
    }

    // Moved between photos: re-run so the new print still grows into place.
    if (value !== null) await runFlip();
  }
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <transition name="lightbox">
      <div
        v-if="photo"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="caption || 'Photo'"
        @click.self="emit('close')"
      >
        <button
          ref="closeEl"
          type="button"
          class="lightbox__close"
          aria-label="Close"
          @click="emit('close')"
        >
          <Icon name="lucide:x" aria-hidden="true" />
        </button>

        <button
          v-if="photos.length > 1"
          type="button"
          class="lightbox__step lightbox__step--prev"
          aria-label="Previous photo"
          @click="emit('navigate', -1)"
        >
          <Icon name="lucide:chevron-left" aria-hidden="true" />
        </button>

        <figure ref="frameEl" class="print" :style="flip">
          <div class="print__window">
            <img class="print__image" :src="photo.src" :alt="photo.alt" />
          </div>
          <figcaption class="print__band">
            <p v-if="caption" class="print__caption" :dir="isRtl ? 'rtl' : 'ltr'">
              {{ caption }}
            </p>
            <p v-if="footnote" class="print__footnote">{{ footnote }}</p>
          </figcaption>
        </figure>

        <button
          v-if="photos.length > 1"
          type="button"
          class="lightbox__step lightbox__step--next"
          aria-label="Next photo"
          @click="emit('navigate', 1)"
        >
          <Icon name="lucide:chevron-right" aria-hidden="true" />
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: rgb(4 10 18 / 82%);
  backdrop-filter: blur(24px) saturate(130%);
}

/* ------------------------------------------------------------ the print */
.print {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: min(92vw, 46rem);
  /* The paper is what has to fit, not just the picture inside it: capping the
     image alone let the card grow past the bottom of the screen. */
  max-height: calc(100svh - var(--space-10));
  padding: var(--space-4) var(--space-4) var(--space-6);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #dbd9d4 0%, #f4f2ed 72%);
  box-shadow:
    0 40px 90px -30px rgb(0 0 0 / 85%),
    0 0 120px -40px rgb(255 200 120 / 45%);
  transform-origin: center;
  transition: transform var(--duration-slow) var(--ease-spring);
  will-change: transform;
}

/* Takes the space the caption band does not, and `min-height: 0` is what lets
   it actually shrink inside the flex column rather than overflow it. */
.print__window {
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  background: #12141a;
}

.print__image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.print__band {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  color: #15161a;
  font-family: var(--font-family-marker);
  text-align: center;
}

.print__caption {
  font-size: var(--font-size-lg);
  line-height: 1.3;
}

.print__footnote {
  font-size: var(--font-size-sm);
  opacity: 0.75;
}

/* ------------------------------------------------------------- controls */
.lightbox__close,
.lightbox__step {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border: var(--border-width-hairline) solid var(--glass-border);
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--color-text);
  font-size: 1.25rem;
  cursor: pointer;
  transition:
    background-color var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-spring);
}

.lightbox__close:hover,
.lightbox__step:hover {
  background: var(--glass-bg-strong);
  transform: scale(1.06);
}

.lightbox__close {
  position: absolute;
  top: var(--space-5);
  right: var(--space-5);
}

/* ------------------------------------------------------------ entrance */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@media (max-width: 48rem) {
  .lightbox {
    padding: var(--space-4);
  }

  /* The arrows would crowd the print; swiping is not offered, so they move
     under it rather than beside it. */
  .lightbox__step {
    position: absolute;
    bottom: calc(var(--space-6) + env(safe-area-inset-bottom, 0px));
  }

  .lightbox__step--prev {
    left: var(--space-6);
  }

  .lightbox__step--next {
    right: var(--space-6);
  }

  .print {
    /* Room for the arrows that moved under the card. */
    max-height: calc(100svh - var(--space-24));
  }
}

@media (prefers-reduced-motion: reduce) {
  .print {
    transition: none;
  }
}
</style>
