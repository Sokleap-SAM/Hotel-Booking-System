<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()

// Pages that should NOT have the main header/footer layout
const excludedRoutes = ['login', 'signup', 'ForgotPassword', 'reset-password', 'login-success']

const useMainLayout = computed(() => {
  return !excludedRoutes.includes(route.name as string) && !route.path.startsWith('/auth')
})
</script>

<template>
  <MainLayout v-if="useMainLayout">
    <router-view />
  </MainLayout>
  <router-view v-else />
</template>

<style>
/* This must be GLOBAL (not scoped) */
* {
  box-sizing: border-box; /* Makes sure padding doesn't increase element size */
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* Fixes horizontal scroll */
}
</style>
