<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <div class="router-view-container">
      <RouterView />
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
}

.app-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: stretch;
  /* 渐变背景 */
  background: linear-gradient(135deg, #f5f7ff 0%, #e8f0fe 100%) !important;
}

.router-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
</style>
