<script setup>
import HtmlLogo from "@/assets/icons/Html.svg";
</script>
<template>
  <div>
    <img class="dance-icons" :src="HtmlLogo" alt="" />
  </div>
</template>

<style scoped>
.dance-icons {
  position: absolute;
  animation: upicon 20s infinite;
  left: 10%;
 filter: blur(2px);
}

@keyframes upicon {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-110vh);
  }
}
</style>
