<script setup>
import PostmanLogo from "~/assets/icons/Postman.svg";
import GitLogo from "~/assets/icons/Git.svg";
import VscodeLogo from "~/assets/icons/Vscode.svg";
import NuxtLogo from "~/assets/icons/Nuxt.svg";
import VueLogo from "~/assets/icons/Vue.svg";
import JsLogo from "~/assets/icons/Js.svg";
import CssLogo from "~/assets/icons/Css.svg";
import HtmlLogo from "~/assets/icons/Html.svg";
</script>
<template>
  <div>
    <img class="dance-icons html" :src="HtmlLogo" alt="Html Logo" />
    <img class="dance-icons css" :src="CssLogo" alt="Css Logo" />
    <img class="dance-icons js" :src="JsLogo" alt="Js Logo" />
    <img class="dance-icons vue" :src="VueLogo" alt="Vue Logo" />
    <img class="dance-icons nuxt" :src="NuxtLogo" alt="Nuxt Logo" />
    <img class="dance-icons vscode" :src="VscodeLogo" alt="Vscode Logo" />
    <img class="dance-icons git" :src="GitLogo" alt="Git Logo" />
    <img class="dance-icons postman" :src="PostmanLogo" alt="Postman Logo" />
  </div>
</template>

<style scoped>
.dance-icons {
  position: absolute;
  bottom: -6.25rem;
  width: 3.125rem;
  filter: blur(0.125rem);
  z-index: -1;
}
.html {
  left: 10%;
  animation: upicon 20s infinite;
}
.css {
  left: 20%;
  animation: upicon 25s infinite;
}
.js {
  left: 30%;
  animation: upicon 20s infinite;
}
.vue {
  left: 40%;
  animation: upicon 30s infinite;
}
.nuxt {
  left: 50%;
  animation: upicon 25s infinite;
}
.vscode {
  left: 60%;
  animation: upicon 30s infinite;
}
.git {
  left: 70%;
  animation: upicon 20s infinite;
  width: 6.25rem;
}
.postman {
  left: 80%;
  animation: upicon 25s infinite;
}
@keyframes upicon {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100vh);
  }
}
</style>
