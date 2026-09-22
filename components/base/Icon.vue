<script setup>
import { computed } from "vue";
import { icons } from "@/data/icons";

/**
 * Renders one icon from the generated set in data/icons.js.
 *
 * Auto-imported as `Icon`, so call sites read the same as they did under
 * @nuxt/icon. Unlike that module it adds no server handler and makes no
 * network request: every icon is inlined at build time.
 *
 * The markup comes from the Iconify packages at build time, never from user
 * input, which is what makes v-html safe here.
 */
const props = defineProps({
  /** Collection-qualified name, e.g. "simple-icons:github". */
  name: { type: String, required: true },
});

/**
 * Icons that point somewhere. In a right-to-left page "forward" is to the
 * left, so these are mirrored there; everything else - logos, a camera, a
 * map pin - reads the same either way and is left alone.
 */
const DIRECTIONAL = new Set([
  "lucide:arrow-up-right",
  "lucide:chevron-left",
  "lucide:chevron-right",
  "lucide:send",
]);

const directional = computed(() => DIRECTIONAL.has(props.name));

const icon = computed(() => {
  const found = icons[props.name];
  if (!found && import.meta.dev) {
    console.warn(
      `[Icon] "${props.name}" is not in the generated set. ` +
        "Add it to ICONS in scripts/generate-icons.mjs and run `npm run icons`."
    );
  }
  return found ?? null;
});
</script>

<template>
  <svg
    v-if="icon"
    class="icon"
    :class="{ 'icon--directional': directional }"
    :viewBox="`0 0 ${icon.width} ${icon.height}`"
    role="img"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    v-html="icon.body"
  ></svg>
</template>

<style scoped>
/* Sizes from the surrounding font-size, so callers style it with width/height
   or font-size exactly as they did before. */
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  flex-shrink: 0;
}

/* `:dir()` rather than an ancestor selector, so a left-to-right island inside
   a Persian page - the console mock-up - keeps its arrows as they are.
   `scale` rather than `transform`, so it composes with any hover transform
   a caller puts on the icon instead of being overwritten by it. */
.icon--directional:dir(rtl) {
  scale: -1 1;
}
</style>
