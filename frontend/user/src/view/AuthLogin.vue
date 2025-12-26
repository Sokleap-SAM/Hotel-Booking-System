<script lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  export default {
    name: 'AuthLogin',
    setup() {
      const route = useRoute();

      const backgroundStyle = computed(() => {
        if (route.path === '/login') {
          return {
            backgroundImage: "url('src/assets/Background.png')"
          }
        }
        return {
          backgroundImage: "url('src/assets/Background2.png')"
        }
      })
      return {
        backgroundStyle,
      }
    }
  }
</script>

<template>
  <div class="login-screen" :style="backgroundStyle"  >
    <router-view />
  </div>
</template>

<style>
html, body {
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
