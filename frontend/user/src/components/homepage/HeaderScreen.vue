<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <header class="navbar">
    <div class="logo">CamBook</div>
    <nav class="nav-links">
      <a href="#" @click.prevent="goToHome">Home</a>
      <a href="#" @click.prevent="goToBooking">Book Now</a>
      <a href="#" @click.prevent="goToMyBookings">My Bookings</a>
      <a href="#" @click.prevent="goToContact">Contact Us</a>
    </nav>
    <button v-if="isAuthenticated" class="Profile" @click="isProfileOpen = true">
      <i class="ri-user-line"></i>
    </button>
    <button v-else class="login-btn" @click="goToLogin">Login</button>
    <ProfileDetail v-if="isProfileOpen" @close="isProfileOpen = false" />
  </header>
</template>

<script lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import ProfileDetail from '@/view/ProfileDetail.vue'
export default {
  name: 'HeaderScreen',
  components: {
    ProfileDetail,
  },
  setup() {
    const isProfileOpen = ref(false)

    const router = useRouter()
    const authStore = useAuthStore()
    const isAuthenticated = computed(() => authStore.isAuthenticated)

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
      isAuthenticated,
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
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0d4798;
  padding: 10px 100px;
  color: white;
  font-family: 'Lato', sans-serif;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;
}

.logo:hover {
  color: #a3c4ff;
}

.Profile {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid transparent;
  transition: all 0.2s ease-in-out;
}

.Profile:hover {
  background-color: #a3c4ff;
  border-color: white;
  cursor: pointer;
  transform: scale(1.05);
}

.Profile:active {
  transform: scale(0.95);
  background-color: #7aa8e6;
}

.Profile i {
  font-size: 24px;
  color: #0d4798;
  line-height: 46px;
  text-align: center;
  display: block;
  transition: color 0.2s ease;
}

.Profile:hover i {
  color: #0a3a7a;
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
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #a3c4ff;
  transition: all 0.2s ease-in-out;
  transform: translateX(-50%);
}

.nav-links a:hover {
  color: #a3c4ff;
  cursor: pointer;
}

.nav-links a:hover::after {
  width: 80%;
}

.nav-links a:active {
  color: #7aa8e6;
  transform: scale(0.95);
}

.login-btn {
  background-color: white;
  color: #007bff;
  border: 2px solid transparent;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
}

.login-btn:hover {
  background-color: #a3c4ff;
  color: #0d4798;
  border-color: white;
  transform: scale(1.05);
}

.login-btn:active {
  background-color: #7aa8e6;
  transform: scale(0.95);
}
</style>
