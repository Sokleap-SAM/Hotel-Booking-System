<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <div class="bookingpage" :style="backgroundHeader">
    <div class="RowHeader">
      <div class="title" @click="goToHome" style="cursor: pointer;">CamBook.com</div>
      <div class="nav-actions">
        <router-link to="/home" class="nav-link">Home</router-link>
        <router-link to="/MyBookings" class="nav-link">My Bookings</router-link>
        <button class="Profile" @click="isProfileOpen = true">
          <i class="ri-user-line"></i>
        </button>
      </div>
    </div>
    <MenuPanel />
    <FilterPanel />
    <ViewHotelDetail />

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
.nav-actions {
  display: flex;
  align-items: center;
  gap: 30px;
}
.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
}
.nav-link:hover {
  text-decoration: underline;
}
</style>
