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
  min-height: 100vh;
  width: 100vw;
}

.content-area {
  margin-left: 280px;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-y: auto;
}
</style>