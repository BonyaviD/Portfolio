<script setup>
import BaseButton from "@/components/shared/BaseButton.vue";
import Github from '~/assets/icons/GitHub.svg'
import Linkedin from '~/assets/icons/Linkedin.svg'
import Telegram from '~/assets/icons/Telegram.svg'
</script>
<template>
    <div class="footer">
        <div class="footer-icons">
            <BaseButton to="https://www.linkedin.com/in/bonyavid/" btnSize="3.125" :logo="Linkedin" opacityMode />
            <BaseButton to="https://github.com/BonyaviD" btnSize="3.125" :logo="Github" opacityMode />
            <BaseButton to="https://t.me/StreetNote" btnSize="3.125" :logo="Telegram" opacityMode />
        </div>
        <div>© 2024 <span class="my-name">Navid Bonyadi</span>, all rights reserved 👨🏻‍💻🤘🏻</div>
    </div>
</template>

<style scoped>
.footer {
    padding: 8.75rem 0 1.563rem 0;
    background: var(--footer-linear-background-color);
    text-align: center;
}

.footer-icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.313rem;
    margin-bottom: 0.625rem;
}

.my-name {
   font-weight: 800;
}
</style>