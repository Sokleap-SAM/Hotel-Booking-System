<template>
  <header class="navbar">
    <div class="logo">CamBook</div>
    <nav class="nav-links">
      <a href="#" @click.prevent="goToHome">Home</a>
      <a href="#" @click.prevent="goToBooking">Book Now</a>
      <a href="#" @click.prevent="goToMyBookings">My Bookings</a>
      <a href="#" @click.prevent="goToContact">Contact Us</a>
    </nav>
    <button class="Profile" @click="isProfileOpen = true">
      <i class="ri-user-line"></i>
    </button>
    <ProfileDetail v-if="isProfileOpen" @close="isProfileOpen = false" />
  </header>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ProfileDetail from '@/view/ProfileDetail.vue'
export default {
  name: 'HeaderScreen',
  components: {
    ProfileDetail,
  },
  setup() {
    const isProfileOpen = ref(false)

    const router = useRouter()

    const goToLogin = () => {
      router.push('/login')
    }

    const goToHome = () => {
      router.push('/home')
    }

    const goToBooking = () => {
      router.push('/Bookingpage')
    }

    const goToMyBookings = () => {
      router.push('/MyBookings')
    }

    const goToContact = () => {
      // Scroll to footer/contact section or navigate to contact page
      const footer = document.querySelector('footer')
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return {
      goToLogin,
      goToHome,
      goToBooking,
      goToMyBookings,
      goToContact,
      isProfileOpen,
    }
  },
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0d4798;
  padding: 10px 20px;
  color: white;
  font-family: 'Lato', sans-serif;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
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
.nav-links {
  display: flex;
  gap: 40px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  margin: 0 25px;
}

.nav-links a:hover {
  text-decoration: underline;
  cursor: pointer;
}

.login-btn {
  background-color: white;
  color: #007bff;
  border: none;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
}

.login-btn:hover {
  background-color: #e6e6e6;
}
</style>
