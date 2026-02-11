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
    <button v-if="isAuthenticated" class="profile-btn" @click="goToProfile">
      <i class="ri-user-line"></i>
    </button>
    <button v-else class="login-btn" @click="goToLogin">Login</button>
  </header>
</template>

<script lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'HeaderScreen',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    const goToLogin = () => {
      router.push('/login')
    }

    const goToProfile = () => {
      router.push('/ProfileDetail')
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
      goToProfile,
      goToHome,
      goToBooking,
      goToMyBookings,
      goToContact,
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

.profile-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-btn:hover {
  background-color: #5a70d4;
}

.profile-btn i {
  font-size: 20px;
  color: #0d4798;
}

.profile-btn:hover i {
  color: white;
}
</style>
