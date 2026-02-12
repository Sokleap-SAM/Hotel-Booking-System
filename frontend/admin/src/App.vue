<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavigationBar from './components/SideNavigationBar.vue'
import ToastNotification from './components/ToastNotification.vue'

const route = useRoute()
const showNavigation = computed(() => route.path !== '/login')
</script>

<template>
  <div class="main-layout">
    <NavigationBar v-if="showNavigation" />

    <main class="content-area" :class="{ 'no-margin': !showNavigation }">
      <RouterView />
    </main>
    
    <ToastNotification />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.main-layout {
  min-height: 100vh;
  width: 100%;
}

.content-area {
  margin-left: 280px;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-y: auto;
  overflow-x: hidden;
  max-width: calc(100vw - 280px);
  box-sizing: border-box;
}

.content-area.no-margin {
  margin-left: 0;
  max-width: 100vw;
}
</style>