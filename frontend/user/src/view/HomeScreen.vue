<template>
  <link
    href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css"
    rel="stylesheet"
/>
  <div>
    <HeaderScreen />
    <BackgroundHomeScreen />
    <FooterScreen />
  </div>
</template>

<script lang="ts">
import HeaderScreen from '@/components/homepage/HeaderScreen.vue'
import FooterScreen from '@/components/homepage/FooterScreen.vue'
import BackgroundHomeScreen from '@/components/homepage/BackgroundHomeScreen.vue';

export default {
  name: 'HomeScreen',
  components: {
    HeaderScreen,
    FooterScreen,
    BackgroundHomeScreen,
  },
}
</script>

<style scoped>
.space {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: space-between;
}
</style>
