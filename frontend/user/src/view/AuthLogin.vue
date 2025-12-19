<script lang="ts">
  import LoginScreen from '@/components/auth/LoginScreen.vue';

  const background = new URL('@/assets/Background.png ', import.meta.url).href;
  export default {
    name: 'App',
    data() {
      return {
        background,
      }
    },
    components: {
      LoginScreen,
    }
  }
</script>

<template>
  <div class="login-screen">
    <LoginScreen />
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
.login-screen {
  background-image: url('@/assets/Background.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

</style>
