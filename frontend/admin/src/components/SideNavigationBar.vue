<template>
  <nav class="sidebar">
    <div v-for="block in state.navBlocks" :key="block.name" :class="[
      'nav-block',
      { 'is-logout': block.name === 'Logout' },
      { 'is-active': state.activeTab === block.name }
    ]" @click="state.activeTab = block.name">
      <span class="nav-text">{{ block.name }}</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const state = reactive({
  activeTab: 'Hotel/Room Management',
  navBlocks: [
    { name: 'Billing & Payment' },
    { name: 'Booking management' },
    { name: 'User Management' },
    { name: 'Hotel/Room Management' },
    { name: 'Logout' }
  ]
});
</script>

<style scoped>
.sidebar {
  width: 280px;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  border-right: 5px solid #EAEAEA;
  font-family: 'Lato', sans-serif;
}

.nav-block {
  padding: 30px;
  cursor: pointer;
}

.nav-block:hover {
  background-color: #0D4798;
  color: white;
}

.nav-block.is-active {
  background-color: #549BFE;
  color: white;
  border-right: 15px solid #0D4798;
}

.nav-block.is-logout {
  background-color: #ff0000a0;
  color: white;
}

.nav-block.is-logout:hover {
  border-right: 15px solid #FF0000;
}

.nav-text {
  font-size: 16px;
  font-weight: bold;
}
</style>