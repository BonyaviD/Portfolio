<script setup>
import TheAboutMe from "~/components/sections/TheAboutMe.vue";

useHead({
  titleTemplate: "%s - About",
  meta: [
    {
      hid: "description",
      name: "description",
      content: "More about Navid Bonyadi, a self-taught frontend developer based in Tehran.",
    },
  ],
});
</script>

<template>
  <TheAboutMe />
</template>