<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <div>
    <HeaderScreen class="smart-header"/>
    <BackgroundHomeScreen />
    <PopularHotel />
    <MyBooking />
    <WhyCamBook />
    <ClientFeebBack />
    <NewsLetter />
    <FooterScreen />
  </div>
</template>

<script lang="ts">
import HeaderScreen from '@/components/homepage/HeaderScreen.vue'
import FooterScreen from '@/components/homepage/FooterScreen.vue'
import BackgroundHomeScreen from '@/components/homepage/BackgroundHomeScreen.vue'
import PopularHotel from '@/components/homepage/PopularHotel.vue'
import MyBooking from '@/components/homepage/MyBooking.vue'
import WhyCamBook from '@/components/homepage/WhyCamBook.vue'
import ClientFeebBack from '@/components/homepage/ClientFeebBack.vue'
import NewsLetter from '@/components/homepage/NewsLetter.vue'

export default {
  name: 'HomeScreen',
  components: {
    HeaderScreen,
    FooterScreen,
    BackgroundHomeScreen,
    MyBooking,
    WhyCamBook,
    ClientFeebBack,
    NewsLetter,
    PopularHotel,
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
.smart-header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}
</style>
