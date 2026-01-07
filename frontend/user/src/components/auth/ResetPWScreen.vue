<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="container">
    <div class="circle">
      <i class="ri-key-line"></i>
    </div>
    <h2>Reset Password</h2>
    <span>Enter your new password below.</span>
    <br />
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
    <div class="requirements-box">
      <p class="requirements-title">Password must contains:</p>
      <ul>
        <li :class="{ valid: hasMinLength, invalid: !hasMinLength && password.length > 0 }">
          <i
            :class="hasMinLength ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"
          ></i>
          At least 8 characters
        </li>
        <li :class="{ valid: hasUppercase, invalid: !hasUppercase && password.length > 0 }">
          <i
            :class="hasUppercase ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"
          ></i>
          One uppercase letter
        </li>
        <li :class="{ valid: hasLowercase, invalid: !hasLowercase && password.length > 0 }">
          <i
            :class="hasLowercase ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"
          ></i>
          One lowercase letter
        </li>
        <li :class="{ valid: hasNumber, invalid: !hasNumber && password.length > 0 }">
          <i :class="hasNumber ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
          One number
        </li>
      </ul>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <button class="btn-Login" @click="handleResetPassword">Reset Password</button>
    <div class="back-link" @click="goToEnterEmail">
      <i class="ri-arrow-left-line"></i>
      <span>Back to enter email</span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
export default {
  name: 'ForgotPasswordScreen',
  setup() {
    const password = ref('')
    const confirmPassword = ref('')
    const passwordFieldType = ref('password')
    const confirmPasswordFieldType = ref('password');
    const error = ref<string | null>(null);

    // Validation Logic
    const hasMinLength = computed(() => password.value.length >= 8)
    const hasUppercase = computed(() => /[A-Z]/.test(password.value))
    const hasLowercase = computed(() => /[a-z]/.test(password.value))
    const hasNumber = computed(() => /\d/.test(password.value))

    const togglePassword = (type: string) => {
      if (type === 'main') {
        passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
      } else {
        confirmPasswordFieldType.value =
          confirmPasswordFieldType.value === 'password' ? 'text' : 'password'
      }
    }

    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const goToEnterEmail = () => {
      router.push('/ForgotPassword')
    }

    const handleResetPassword = async () => {
      error.value = null
      if (!password.value || !confirmPassword.value) {
        error.value = 'Please fill in all fields.'
        return
      }
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.'
        return
      }
      const allValid =
        hasMinLength.value &&
        hasUppercase.value &&
        hasLowercase.value &&
        hasNumber.value
      if (!allValid) {
        error.value = 'Password does not meet the requirements.'
        return
      }
      try {
        const token = route.params.token as string
        await authStore.resetPassword(token, password.value)
        alert('Password has been reset successfully. Please log in.')
        router.push('/Login')
      } catch (err) {
        error.value = err.message || 'An unexpected error occurred.'
      }
    }

    return {
      handleResetPassword, 
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      password,
      confirmPassword,
      passwordFieldType,
      confirmPasswordFieldType,
      togglePassword,
      goToEnterEmail,
      error,
    };
  },
}
</script>

<style scoped>
.error-message {
  color: red;
  margin-bottom: 15px;
}
/* Main Container - Adjusted for maximum vertical efficiency */
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 420px;
  padding: 15px 20px; /* Reduced vertical padding */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.29);
  border-radius: 20px;
  color: white;
  font-family: 'Lato', sans-serif;
  overflow: hidden; /* Prevents internal scrolling */
}

/* Reduced Icon Size */
.circle {
  width: 60px; /* Reduced from 120px */
  height: 60px; /* Reduced from 120px */
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.29);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px; /* Tight margin */
}

.circle i {
  font-size: 28px; /* Smaller icon */
}

/* Text Scaling */
h2 {
  font-size: 24px; /* Reduced from 32px */
  margin: 2px 0; /* Minimal margin */
}

.subtitle-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
}

span {
  font-size: 13px; /* Reduced from 16px */
  opacity: 0.9;
  line-height: 1.2;
}

/* Input Groups - Tightened */
.input-group {
  width: 100%;
  max-width: 374px;
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-top: 8px; /* Reduced from 20px */
}

.input-group label {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 3px;
  margin-left: 10px;
}

.password-wrapper {
  position: relative;
  width: 100%;
}

input {
  width: 100%;
  height: 42px; /* Reduced from 55px */
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 25px;
  border: none;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 14px;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.toggle-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333;
  font-size: 18px;
}

/* Requirements Box - Compact Version */
.requirements-box {
  width: 100%;
  max-width: 374px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px 15px;
  margin-top: 10px;
  text-align: left;
  box-sizing: border-box;
}

.requirements-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: white;
}

.requirements-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-box li {
  font-size: 12px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e0e0e0;
  transition: color 0.3s ease;
}

.requirements-box i {
  font-size: 14px;
}

/* Colors for Validation */
.valid {
  color: #4ade80 !important; /* Green */
}

.invalid {
  color: #f87171 !important; /* Red */
}

/* Action Button */
.btn-Login {
  width: 100%;
  max-width: 374px;
  height: 45px; /* Reduced from 55px */
  margin-top: 15px;
  border-radius: 25px;
  border: none;
  background-color: #2331fb;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

/* Footer Link */
.back-link {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
}

/* Responsive Hide for extremely small screens */
@media (max-height: 650px) {
  .circle { display: none; } /* Hides key icon to save space on small laptops */
  .container { padding: 10px 20px; }
}
</style>
