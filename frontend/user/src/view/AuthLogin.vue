<script lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import background1 from '@/assets/Background.png'
import background2 from '@/assets/Background2.png'

export default {
  name: 'AuthLogin',
  setup() {
    const route = useRoute()

    const backgroundStyle = computed(() => {
      if (route.name === 'login') {
        return {
          backgroundImage: `url(${background1})`,
        }
      }
      return {
        backgroundImage: `url(${background2})`,
      }
    })
    return {
      backgroundStyle,
    }
  },
}
</script>

<template>
  <div class="login-screen" :style="backgroundStyle">
    <router-view />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
.login-screen {
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}
</style>
