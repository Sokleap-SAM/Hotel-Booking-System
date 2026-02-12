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
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const state = reactive({
  activeTab: 'Dashboard',
  navBlocks: [
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Billing & Payment', route: '/billing' },
    { name: 'Booking Management', route: '/bookings' },
    { name: 'User Management', route: '/users' },
    { name: 'Hotel/Room Management', route: '/manage_hotel&room' },
    { name: 'Amenity Management', route: '/amenities' },
    { name: 'Bed Type Management', route: '/bed-types' },
    { name: 'Logout', route: '/login' }
  ]
});

watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/dashboard')) {
      state.activeTab = 'Dashboard';
    } else if (path.startsWith('/amenities')) {
      state.activeTab = 'Amenity Management';
    } else if (path.startsWith('/manage_hotel')) {
      state.activeTab = 'Hotel/Room Management';
    } else if (path.startsWith('/bookings')) {
      state.activeTab = 'Booking Management';
    } else if (path.startsWith('/billing')) {
      state.activeTab = 'Billing & Payment';
    } else if (path.startsWith('/bed-types')) {
      state.activeTab = 'Bed Type Management';
    } else if (path.startsWith('/users')) {
      state.activeTab = 'User Management';
    }
  },
  { immediate: true }
);

const navigateTo = (block: { name: string; route: string }) => {
  if (block.name === 'Logout') {
    authStore.logout();
    router.push('/login');
  } else {
    state.activeTab = block.name;
    if (block.route) {
      router.push(block.route);
    }
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