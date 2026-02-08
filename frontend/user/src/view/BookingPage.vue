<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <div class="bookingpage" :style="backgroundHeader">
    <div class="RowHeader">
      <div class="title">CamBook.com</div>
      <button class="Profile" @click="isProfileOpen = true">
        <i class="ri-user-line"></i>
      </button>
    </div>
    <MenuPanel />
    <FilterPanel />
    <ViewHotelDetail />

    <ProfileDetail v-if="isProfileOpen" @close="isProfileOpen = false" />
  </div>
</template> 

<script lang="ts">
import { ref } from 'vue' // Import ref
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
    ProfileDetail, // Register component
  },
  setup() {
    const isProfileOpen = ref(false) // State to control visibility

    const backgroundHeader = {
      backgroundImage: `url(${background})`,
    }

    return {
      backgroundHeader,
      isProfileOpen, // Return the state
    }
  },
}
</script>

<style scoped>
.bookingpage {
  /* 1. Set a specific height to 'cut' the bottom of the image */
  height: 250px;

  /* 2. Anchor the image to the TOP so the sky and temple tops stay visible */
  background-position: center 50%;

  /* 3. Scale the image to cover the entire width of the header */
  background-size: cover;

  /* 4. Prevent the image from repeating if the container is wider than the image */
  background-repeat: no-repeat;

  /* Optional: Alignment for your logo and icons */
  display: flex;
  align-items: flex-start; /* Keeps content at the top */
  padding: 20px 80px;
  width: 100%;
  font-family: 'Lato', sans-serif;
}
.RowHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  font-family: 'Lato', sans-serif;
}
.Profile {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
}
.Profile:hover {
  background-color: #5a70d4;
  cursor: pointer;
}
.Profile i {
  font-size: 24px;
  color: #0d4798;
  line-height: 50px;
  text-align: center;
  display: block;
}
</style>
