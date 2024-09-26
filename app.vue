<script setup>
import TheHeader from './components/sections/TheHeader.vue';
import TheFooter from './components/sections/TheFooter.vue';
</script>

<template>
  <div id="app">
    <TheHeader />
    <NuxtPage />
    <TheFooter />
  </div>
</template>
<style scoped>
#app{
  margin-top: 80px;
}
</style>