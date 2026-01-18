<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="container">
    <div class="circle">
      <i class="ri-lock-line"></i>
    </div>
    <h2>Forgot Password?</h2>
    <span>No worries! Enter yoru email address</span>
    <span>below and we'll verify your name</span>
    <div class="input-group">
      <label>Email Address</label>
      <input type="email" id="email" placeholder="Enter your email" v-model="email" />
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <button class="btn-Login" @click="handleForgotPassword">verify email</button>
    <div class="back-link" @click="goToLogin">
      <i class="ri-arrow-left-line"></i>
      <span>Back to login</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
export default {
  name: 'ForgotPasswordScreen',
  setup() {
    const email = ref('');
    const error = ref<string | null>(null);
    const router = useRouter();
    const authStore = useAuthStore();
    const goToLogin = () => {
      router.push('/login')
    }

    const handleForgotPassword = async () => {
      error.value = null;
      if (!email.value) {
        error.value = 'Please enter your email address.';
        return;
      }
      try {
        const data = await authStore.forgotPassword(email.value);
        router.push({ name: 'reset-password', params: { token: data.token } });
      } catch (err) {
        error.value = err.message || 'An unexpected error occurred.';
      }
    };

    return {
      handleForgotPassword,
      goToLogin,
      email,
      error,
    };
  }
}
</script>

<style scoped>
.error-message {
  color: red;
  margin-bottom: 15px;
}
/* Main card container */
.container {
  width: 90%;
  max-width: 450px;
  height: auto;
  min-height: 620px;
  font-family: 'Lato', sans-serif;
  padding: 40px 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.29);
  box-sizing: border-box;
  color: white;

  /* Centering Logic */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centers items horizontally */
  justify-content: center; /* Centers items vertically */
  text-align: center;
}

/* Icon Circle */
.circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.29);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 20px;
}

.circle i {
  font-size: 50px;
}

/* Typography */
h2 {
  font-size: 32px;
  margin: 10px 0;
  color: white;
}

span {
  display: block; /* Ensures text stacks correctly */
  color: white;
  margin-top: 5px;
  font-size: 16px;
  opacity: 0.9;
}

/* Input Group Logic */
.input-group {
  width: 100%;
  max-width: 374px; /* Standardized width */
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  text-align: left; /* Labels stay left-aligned to the input box */
}

.input-group label {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  margin-left: 15px; /* Aligns with the curve of the input */
}

input {
  width: 100%;
  height: 55px;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.4);
  border: none;
  color: white;
  padding: 0 25px;
  font-size: 16px;
  box-sizing: border-box;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

/* Button Logic */
.btn-Login {
  width: 100%;
  max-width: 374px;
  height: 55px;
  border-radius: 30px;
  background-color: #2331fb;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-top: 30px; /* Space between input and button */
  /* Removed margin-left to ensure it centers via the container's flexbox */
}

.btn-Login:hover {
  background-color: #1c259f;
}

/* Navigation Link */
.back-link {
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .container {
    padding: 20px 15px;
    min-height: 0;
  }

  .circle {
    width: 100px;
    height: 100px;
  }

  .circle i {
    font-size: 40px;
  }

  h2 {
    font-size: 28px;
  }

  .btn-Login {
    font-size: 18px;
  }
}
</style>
