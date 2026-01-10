<script setup lang="ts">
import NavigationBar from './components/SideNavigationBar.vue';
</script>

<template>
  <div class="main-layout">
    <NavigationBar />

    <main class="content-area">
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
  display: flex;
  min-height: 100vh;
  width: 90vw;
}

.content-area {
  flex-grow: 1;
  background-color: #ffffff;
  overflow-y: auto;
}
</style>