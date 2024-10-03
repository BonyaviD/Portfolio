<template>
  <div class="bullet-text">
    <slot></slot>
  </div>
</template>

<style scoped>
.bullet-text:before {
  content: "";
  position: absolute;
  top: 8px;
  left: -25px;
  width: 15px;
  height: 15px;
  background-color: var(--primary-color);
  border-radius: 100%;
}
.bullet-text {
  position: relative;
  margin-left: 25px;
  font-weight: 600;
  font-size: 20px;
  line-height: 30px;

}
.bullet-text:not(:last-child) {
    margin-bottom: 30px;
 }
</style>
