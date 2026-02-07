<template>
  <nav class="sidebar">
    <div v-for="block in state.navBlocks" :key="block.name" :class="[
      'nav-block',
      { 'is-logout': block.name === 'Logout' },
      { 'is-active': state.activeTab === block.name }
    ]" @click="navigateTo(block)">
      <span class="nav-text">{{ block.name }}</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const state = reactive({
  activeTab: 'Hotel/Room Management',
  navBlocks: [
    { name: 'Billing & Payment', route: '' },
    { name: 'Booking Management', route: '/bookings' },
    { name: 'User Management', route: '' },
    { name: 'Hotel/Room Management', route: '/manage_hotel&room' },
    { name: 'Amenity Management', route: '/amenities' },
    { name: 'Logout', route: '' }
  ]
});

watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/amenities')) {
      state.activeTab = 'Amenity Management';
    } else if (path.startsWith('/manage_hotel')) {
      state.activeTab = 'Hotel/Room Management';
    } else if (path.startsWith('/bookings')) {
      state.activeTab = 'Booking Management';
    }
  },
  { immediate: true }
);

const navigateTo = (block: { name: string; route: string }) => {
  state.activeTab = block.name;
  if (block.route) {
    router.push(block.route);
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  border-right: 5px solid #EAEAEA;
  font-family: 'Lato', sans-serif;
  z-index: 100;
  overflow-y: auto;
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