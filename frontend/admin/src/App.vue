<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavigationBar from './components/SideNavigationBar.vue'

const route = useRoute()
const showNavigation = computed(() => route.path !== '/login')
</script>

<template>
  <div class="main-layout">
    <NavigationBar v-if="showNavigation" />

    <main class="content-area" :class="{ 'no-margin': !showNavigation }">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}

.main-layout {
  min-height: 100vh;
  width: 100vw;
}

.content-area {
  margin-left: 280px;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-y: auto;
}

.content-area.no-margin {
  margin-left: 0;
}
</style>