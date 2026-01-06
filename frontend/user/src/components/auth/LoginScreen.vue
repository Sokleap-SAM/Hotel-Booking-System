<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />
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
    <div class="forgot-password" @click="goToForgotPw">
      <a href="#">Forgot Password</a>
    </div>
    <button class="btn-Login" @click="handleLogin">Login</button>
    <div style="text-align: center; margin-top: 20px">Or continue with</div>
    <div class="container-google">
      <GoogleLogin :click="callback" />
    </div>
    <div class="create-account">
      <span style="text-align: center; margin-top: 20px">Don't have an account yet?</span>
      <span class="register" @click="goToSignup"> Register for free</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginScreen',
  setup() {
    const password = ref('')
    const email = ref('')
    const passwordFieldType = ref('password')
    const error = ref<string | null>(null)

    const authStore = useAuthStore()
    const router = useRouter()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = (response: any) => {
      console.log('Encoded JWT ID token: ' + response.credential)
      // Google Login logic to be implemented
    }

    const goToSignup = () => {
      router.push('/signup')
    }

    const goToForgotPw = () => {
      router.push('/ForgotPassword')
    }

    const togglePassword = () => {
      passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
    }

    const handleLogin = async () => {
      error.value = null;
      if (!email.value || !password.value) {
        error.value = 'Please enter both email and password.';
        return;
      }
      try {
        await authStore.login({ email: email.value, password: password.value });
        router.push('/home');
      } catch (err) {
        error.value = err.message || 'An unexpected error occurred.';
      }
    };

    return {
      goToSignup,
      goToForgotPw,
      email,
      password,
      passwordFieldType,
      togglePassword,
      callback,
      handleLogin,
      error,
    }
  },
}
</script>

<style scoped>
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

.container-google {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 15px auto 0 auto;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.29);
  border-radius: 10px;
}

.create-account {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  margin-bottom: 10px;
  color: #ffffff93;
}

.register {
  color: #ffffff;
  cursor: pointer;
}

.register:hover {
  text-decoration: underline;
  color: #2d5ebf;
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

.btn-Login {
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

.btn-Login:hover {
  background-color: #1c259f;
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

.forgot-password {
  text-align: right;
  margin-top: 5px;
  width: 100%;
  max-width: 374px;
}

.forgot-password:hover a {
  text-decoration: underline;
  color: #2d5ebf;
}

.forgot-password a {
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
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

  .btn-Login {
    font-size: 18px;
  }
}
</style>
