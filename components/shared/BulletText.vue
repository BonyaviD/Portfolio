<template>
  <div class="bullet-text">
    <slot></slot>
  </div>
</template>

<style scoped>
.bullet-text:before {
  content: "";
  position: absolute;
  top: 0.5rem;
  left: -1.563rem;
  width: 0.938rem;
  height: 0.938rem;
  background-color: var(--primary-color);
  border-radius: 100%;
}
.bullet-text {
  position: relative;
  margin-left: 1.563rem;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.875rem;

}
.bullet-text:not(:last-child) {
    margin-bottom: 1.875rem;
 }
</style>
