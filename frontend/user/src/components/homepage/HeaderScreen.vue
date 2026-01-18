<template>
  <header class="navbar">
    <div class="logo">CamBook</div>
    <nav class="nav-links">
      <a href="#">Home</a>
      <a href="#" @click="goToBooking">Book Now</a>
      <a href="#">My Bookings</a>
      <a href="#">Contact Us</a>
    </nav>
    <button class="login-btn" @click="goToLogin">Login</button>
  </header>
</template>

<script lang="ts">
  import { useRouter } from 'vue-router'
  export default {
    name: 'HeaderScreen',
    setup() {
      const router = useRouter()
      const goToLogin = () => {
        router.push('/login')
      }

      const goToBooking = () => {
        router.push('/Bookingpage')
      }

      return {
        goToLogin,
        goToBooking,
      }
    },
  }
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #0D4798;
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
</style>
