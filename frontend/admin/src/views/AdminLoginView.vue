<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />
  <div class="login-screen" :style="backgroundStyle">
    <div class="container">
      <h2>Login</h2>
      <div class="input-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="text" placeholder="Enter your email" />
      </div>
      <div class="input-group">
        <label for="password">Password</label>
        <div class="password-wrapper">
          <input
            id="password"
            v-model="password"
            :type="passwordFieldType"
            placeholder="Enter your password"
          />
          <i
            :class="passwordFieldType === 'password' ? 'ri-eye-off-fill' : 'ri-eye-fill'"
            @click="togglePassword"
            class="toggle-icon"
          ></i>
        </div>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button class="btn-login" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import background from '@/assets/Background.png'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@cambook.kh')
const password = ref('')
const passwordFieldType = ref('password')
const isLoading = ref(false)
const error = ref('')

const backgroundStyle = {
  backgroundImage: `url(${background})`,
}

const togglePassword = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const success = await authStore.login(email.value, password.value)
    if (success) {
      router.push('/manage_hotel&room')
    } else {
      error.value = authStore.error || 'Login failed. Please check your credentials.'
    }
  } catch {
    error.value = 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-screen {
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.container {
  width: 90%;
  max-width: 450px;
  height: auto;
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.29);
  padding: 20px;
  box-sizing: border-box;
}

.error-message {
  color: red;
  margin-bottom: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  font-size: 20px;
  font-family: 'Lato', sans-serif;
  margin: 10px 0;
  width: 100%;
  max-width: 374px;
}

.btn-login {
  width: 100%;
  max-width: 374px;
  height: 53px;
  border-radius: 25px;
  background-color: #2331fb;
  color: white;
  font-size: 20px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
}

.btn-login:hover:not(:disabled) {
  background-color: #1c259f;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-group label {
  padding: 10px 0;
}

.input-group input {
  width: 100%;
  height: 53px;
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.4);
  border: none;
  color: white;
  padding: 0 20px;
  box-sizing: border-box;
}

.input-group:first-of-type {
  margin-top: 0;
}

h2 {
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 48px;
  text-align: center;
  font-family: 'Lato', sans-serif;
}

.password-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.toggle-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333;
  font-size: 22px;
  z-index: 2;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .container {
    padding: 20px 15px;
  }

  h2 {
    font-size: 36px;
  }

  .input-group {
    font-size: 18px;
  }

  .btn-login {
    font-size: 18px;
  }
}
</style>
