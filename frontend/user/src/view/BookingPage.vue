<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <div class="bookingpage-wrapper">
    <div class="bookingpage-hero" :style="backgroundHeader">
      <MenuPanel />
    </div>
    <div class="content-area">
      <FilterPanel />
      <ViewHotelDetail />
    </div>

    <ProfileDetail v-if="isProfileOpen" @close="isProfileOpen = false" />
  </div>
</template> 

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import background from '@/assets/Background2.png'
import MenuPanel from '@/components/Booking/MenuPanel.vue'
import FilterPanel from '@/components/Booking/FilterPanel.vue'
import ViewHotelDetail from '@/components/Booking/ViewHotelDetail.vue'
import ProfileDetail from '@/view/ProfileDetail.vue'

export default {
  name: 'BookingPage',
  components: {
    MenuPanel,
    FilterPanel,
    ViewHotelDetail,
    ProfileDetail,
  },
  setup() {
    const router = useRouter()
    const isProfileOpen = ref(false)

    const backgroundHeader = {
      backgroundImage: `url(${background})`,
    }

    const goToHome = () => {
      router.push('/home')
    }

    return {
      backgroundHeader,
      isProfileOpen,
      goToHome,
    }
  },
}
</script>

<style scoped>
.bookingpage-wrapper {
  font-family: 'Lato', sans-serif;
}

.bookingpage-hero {
  height: 280px;
  background-position: center 50%;
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  position: relative;
}

.content-area {
  display: flex;
  gap: 30px;
  padding: 100px 80px 50px 80px;
  min-height: 600px;
}
</style>
