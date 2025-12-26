<template>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="container">
    <div class="circle">
      <i class="ri-key-line"></i>
    </div>
    <h2>Reset Password</h2>
    <span>Enter your new password below.</span>
    <br>
    <span>Make sure it's strong and secure!</span>

    <div class="input-group">
      <label for="password">New Password</label>
      <div class="password-wrapper">
        <input
          id="password"
          v-model="password"
          :type="passwordFieldType"
          placeholder="Enter your password"
        />
        <i
          :class="passwordFieldType === 'password' ? 'ri-eye-off-line' : 'ri-eye-line'"
          @click="togglePassword('main')"
          class="toggle-icon"
        ></i>
      </div>
    </div>

    <div class="input-group">
      <label for="confirmPassword">Confirm Password</label>
      <div class="password-wrapper">
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          :type="confirmPasswordFieldType"
          placeholder="Confirm your password"
        />
        <i
          :class="confirmPasswordFieldType === 'password' ? 'ri-eye-off-line' : 'ri-eye-line'"
          @click="togglePassword('confirm')"
          class="toggle-icon"
        ></i>
      </div>
    </div>

    <button class="btn-Login">Reset Password</button>
    <div class="back-link" @click="goToEnterEmail">
      <i class="ri-arrow-left-line"></i>
      <span>Back to enter email</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
export default {
  name: 'ForgotPasswordScreen',
  setup() {
    const password = ref('')
    const confirmPassword = ref('')
    const passwordFieldType = ref('password')
    const confirmPasswordFieldType = ref('password')

    const togglePassword = (type: string) => {
      if (type === 'main') {
        passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
      } else {
        confirmPasswordFieldType.value =
          confirmPasswordFieldType.value === 'password' ? 'text' : 'password'
      }
    }

    const router = useRouter()
    const goToEnterEmail = () => {
      router.push('/ForgotPassword')
    }

    return {
      password,
      confirmPassword,
      passwordFieldType,
      confirmPasswordFieldType,
      togglePassword,
      goToEnterEmail,
    }
  },
}
</script>

<style scoped>
/* Container set to occupy the full screen for the background */
.container {
  /* Positioning */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* Sizing and Layout */
  width: 450px;
  padding: 40px 20px;
  box-sizing: border-box;

  /* Flexbox: This centers all items (icon, text, inputs, button) */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  /* Visuals */
  background-color: rgba(255, 255, 255, 0.29);
  /* backdrop-filter: blur(10px); */
  border-radius: 20px;
  color: white;
  font-family: 'Lato', sans-serif;
}

/* The Key Icon Circle */
.circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.29);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.circle i {
  font-size: 50px;
}

/* Text Styling */
h2 {
  font-size: 32px;
  margin: 10px 0;
}

span {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.4;
}

/* Input Groups */
.input-group {
  width: 100%;
  max-width: 374px; /* Matches button width */
  display: flex;
  flex-direction: column;
  text-align: left; /* Label stays left-aligned relative to input */
  margin-top: 20px;
}

.input-group label {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  margin-left: 10px;
}

.password-wrapper {
  position: relative;
  width: 100%;
}

input {
  width: 100%;
  height: 55px;
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 30px;
  border: none;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 16px;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.toggle-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333; /* Darker for visibility against light input */
  font-size: 20px;
}

/* Reset Password Button */
.btn-Login {
  width: 100%;
  max-width: 374px;
  height: 55px;
  margin-top: 30px;
  border-radius: 30px;
  border: none;
  background-color: #2331fb;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-Login:hover {
  background-color: #1a27cc;
}

/* Back Link */
.back-link {
  margin-top: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.9;
}

.back-link:hover {
  text-decoration: underline;
  opacity: 1;
}
</style>
