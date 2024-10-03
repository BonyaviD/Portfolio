<script setup>
import TheBotton from "~/components/shared/TheBotton.vue";
import Github from '@/assets/icons/Github.svg'
import Linkedin from '@/assets/icons/Linkedin.svg'
import Telegram from '@/assets/icons/Telegram.svg'
</script>
<template>
    <div class="footer">
        <div class="footer-icons">
            <TheBotton to="https://www.linkedin.com/in/bonyavid/" btnSize="50" :Logo="Linkedin" opacityMode />
            <TheBotton to="https://github.com/BonyaviD" btnSize="50" :Logo="Github" opacityMode />
            <TheBotton to="https://t.me/StreetNote" btnSize="50" :Logo="Telegram" opacityMode />
        </div>
        <div>© 2024 <span class="my-name">Navid Bonyadi</span>, all rights reserved 👨🏻‍💻🤘🏻</div>
    </div>
</template>

<style scoped>
.footer {
    padding: 140px 0 25px 0;
    background: var(--footer-linear-background-color);
    text-align: center;
}

.footer-icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    margin-bottom: 10px;
}

.my-name {
   font-weight: 800;
}
</style>