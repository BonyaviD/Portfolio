<script setup>
import HtmlIcon from "~/assets/icons/Html.svg";
import CssIcon from "~/assets/icons/Css.svg";
import JsIcon from "~/assets/icons/Js.svg";
import VueIcon from "~/assets/icons/Vue.svg";
import NuxtIcon from "~/assets/icons/Nuxt.svg";
import VscodeIcon from "~/assets/icons/Vscode.svg";
import GitIcon from "~/assets/icons/Git.svg";
import PostmanIcon from "~/assets/icons/Postman.svg";

/**
 * Purely decorative logos drifting up through the hero.
 *
 * Position and speed are per-item CSS custom properties, replacing the eight
 * near-identical rules this component used to carry. The whole group is
 * aria-hidden: it conveys nothing the Skills section does not already say.
 */
const icons = [
  { id: "html", src: HtmlIcon, duration: 10 },
  { id: "css", src: CssIcon, duration: 15 },
  { id: "js", src: JsIcon, duration: 12 },
  { id: "vue", src: VueIcon, duration: 15 },
  { id: "nuxt", src: NuxtIcon, duration: 12 },
  { id: "vscode", src: VscodeIcon, duration: 14 },
  { id: "git", src: GitIcon, duration: 8 },
  { id: "postman", src: PostmanIcon, duration: 16 },
];

/** Evenly spaced across the hero, 10% to 80%. */
const positionFor = (index) => `${(index + 1) * 10}%`;
</script>

<template>
  <div class="floating-icons" aria-hidden="true">
    <img
      v-for="(icon, index) in icons"
      :key="icon.id"
      class="floating-icons__item"
      :src="icon.src"
      alt=""
      :style="{ '--icon-left': positionFor(index), '--icon-duration': `${icon.duration}s` }"
    />
  </div>
</template>

<style scoped>
.floating-icons__item {
  position: absolute;
  bottom: -4.25rem;
  left: var(--icon-left);
  z-index: var(--z-raised);
  width: 3.125rem;
  opacity: 0.8;
  animation: float-up var(--icon-duration) infinite;
}

@keyframes float-up {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-100vh);
  }
}
</style>
