<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    text: {
        type: String
    },
    level: {
        type: String
    }
})
</script>

<template>
 <div class="skills-name">
       <div> {{ props.text }}</div>
        <span class="skill-level">{{ level }}</span>
    </div>
   
</template>

<style scoped>
.skills-name {
    /* height: 60px; */
    padding: 10px 20px;
    background-color: var(--second-dark-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0px 10px;
}

.skill-level {
    border: 1px solid var(--primary-color);
    background-color: var(--primary-opacity-color);
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
    margin-left: 4px;
}
</style>