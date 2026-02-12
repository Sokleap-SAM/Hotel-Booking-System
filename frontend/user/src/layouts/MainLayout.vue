<template>
  <div class="main-layout">
    <HeaderScreen />
    <main class="page-content">
      <slot></slot>
    </main>
    <FooterScreen />
  </div>
</template>

<script setup lang="ts">
import HeaderScreen from '@/components/homepage/HeaderScreen.vue'
import FooterScreen from '@/components/homepage/FooterScreen.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  flex: 1;
}
</style>
