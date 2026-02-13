<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <div>
    <BackgroundHomeScreen />
    <PopularHotel />
    <MyBooking />
    <WhyCamBook />
    <NewsLetter />
  </div>
</template>

<script lang="ts">
import BackgroundHomeScreen from '@/components/homepage/BackgroundHomeScreen.vue'
import PopularHotel from '@/components/homepage/PopularHotel.vue'
import MyBooking from '@/components/homepage/MyBooking.vue'
import WhyCamBook from '@/components/homepage/WhyCamBook.vue'
import NewsLetter from '@/components/homepage/NewsLetter.vue'

export default {
  name: 'HomeScreen',
  components: {
    BackgroundHomeScreen,
    MyBooking,
    WhyCamBook,
    NewsLetter,
    PopularHotel,
  },
}
</script>

<style scoped>
</style>
