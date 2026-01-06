<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="container">
    <h2>Sign up</h2>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div class="name-row">
      <div class="name-column">
        <label>First Name</label>
        <input v-model="firstName" type="text" placeholder="Enter your firstname" />
      </div>
      <div class="name-column">
        <label>Last Name</label>
        <input v-model="lastName" type="text" placeholder="Enter your lastname" />
      </div>
    </div>

    <div class="input-group">
      <label for="email">Email</label>
      <input v-model="email" type="email" id="email" placeholder="Enter your email" />
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
          placeholder="Enter your password"
        />
        <i
          :class="confirmPasswordFieldType === 'password' ? 'ri-eye-off-line' : 'ri-eye-line'"
          @click="togglePassword('confirm')"
          class="toggle-icon"
        ></i>
      </div>
    </div>

    <button class="btn-signup" @click="handleSignUp">Sign up</button>

    <div class="back-link" @click="goToLogin">
      <i class="ri-arrow-left-line"></i>
      <span>Back to login</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'SignUpScreen',
  setup() {
    const firstName = ref('')
    const lastName = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const passwordFieldType = ref('password')
    const confirmPasswordFieldType = ref('password')
    const error = ref<string | null>(null)

    const authStore = useAuthStore()
    const router = useRouter()

    const togglePassword = (type: string) => {
      if (type === 'main') {
        passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
      } else {
        confirmPasswordFieldType.value =
          confirmPasswordFieldType.value === 'password' ? 'text' : 'password'
      }
    }

    const handleSignUp = async () => {
      error.value = null;
      if (
        !firstName.value ||
        !lastName.value ||
        !email.value ||
        !password.value ||
        !confirmPassword.value
      ) {
        error.value = 'Please fill in all fields.';
        return;
      }
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.';
        return;
      }
      try {
        await authStore.register({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value,
          confirmPassword: confirmPassword.value,
        });
        alert('Registration successful! Please log in.');
        router.push('/login');
      } catch (err) {
        error.value = err.message || 'An unexpected error occurred.';
      }
    };

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      goToLogin,
      password,
      confirmPassword,
      passwordFieldType,
      confirmPasswordFieldType,
      togglePassword,
      handleSignUp,
      firstName,
      lastName,
      email,
      error,
    }
  },
}
</script>

<style scoped>
.error-message {
  color: red;
  margin-bottom: 15px;
}
/* Main Container - Optimized for small heights */
.container {
  width: 90%;
  max-width: 450px;
  font-family: 'Lato', sans-serif;
  padding: 15px 25px; /* Tightened padding */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.29);
  text-align: center;
  box-sizing: border-box;
  height: auto;
  max-height: 98vh; /* Use almost full viewport height */
  overflow-y: auto;
  scrollbar-width: none; /* Hide scrollbar Firefox */
}

.container::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome/Safari */
}

h2 {
  font-size: 32px; /* Reduced from 48px */
  margin: 0 0 5px 0;
}

/* Upload Section */
.upload-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
}

.drop-zone {
  width: 110px; /* Smaller circle to save vertical space */
  height: 110px;
  border-radius: 50%;
  border: 2px dashed #000000;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.drop-zone:hover,
.drop-zone.is-dragover {
  background-color: rgba(0, 0, 0, 0.1);
  border-style: solid;
  transform: scale(1.02);
}

.upload-label {
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: bold;
}

/* Form Layout */
.name-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin-top: 25px;
  margin-bottom: 8px; /* Reduced spacing */
}

.name-column,
.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
  margin-bottom: 8px; /* Reduced spacing */
}

label {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
  margin-left: 10px;
}

input {
  width: 100%;
  height: 45px; /* Reduced height from 55px */
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.4);
  border: none;
  color: white;
  padding: 0 20px;
  font-size: 14px;
  box-sizing: border-box;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

/* Password Toggle */
.password-wrapper {
  position: relative;
  width: 100%;
}

.toggle-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333;
  font-size: 20px;
}

/* Buttons and Links */
.btn-signup {
  width: 100%;
  max-width: 180px;
  height: 48px;
  border-radius: 30px;
  background-color: #2b3ff2;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

.back-link {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-size: 14px;
}

/* Placeholder inside dropzone */
.placeholder {
  color: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder i {
  font-size: 24px;
  margin-bottom: 2px;
}

.placeholder span {
  font-size: 11px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Mobile Adjustments */
@media (max-width: 480px) {
  .container {
    padding: 15px;
    width: 100%;
    height: 100%;
    max-height: none;
    top: 0;
    left: 0;
    transform: none;
    border-radius: 0;
  }

  .name-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
