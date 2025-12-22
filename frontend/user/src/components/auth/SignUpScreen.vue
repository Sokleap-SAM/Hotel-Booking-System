<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="container">
    <h2>Sign up</h2>

    <div class="name-row">
      <div class="name-column">
        <label>First Name</label>
        <input type="text" placeholder="Enter your firstname" />
      </div>
      <div class="name-column">
        <label>Last Name</label>
        <input type="text" placeholder="Enter your lastname" />
      </div>
    </div>

    <div class="input-group">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="Enter your email" />
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

    <button class="btn-signup">Sign up</button>

    <div class="back-link" @click="goToLogin">
      <i class="ri-arrow-left-line"></i>
      <span>Back to login</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';

export default {
  name: 'SignUpScreen',
  setup() {
    const password = ref('')
    const confirmPassword = ref('')
    const passwordFieldType = ref('password')
    const confirmPasswordFieldType = ref('password')

    const togglePassword = (type: string) => {
      if (type === 'main') {
        passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
      } else {
        confirmPasswordFieldType.value = confirmPasswordFieldType.value === 'password' ? 'text' : 'password'
      }
    }

    const router = useRouter();
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
    }
  },
}
</script>

<style scoped>
.container {
  width: 450px;
  font-family: 'Lato', sans-serif;
  padding: 40px 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.29);
  /* backdrop-filter: blur(10px); */
  text-align: center;
  box-sizing: border-box;
}

h2 {
  font-size: 48px;
  margin-bottom: 30px;
  margin-top: 0;
}

.name-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 0 20px;
  margin-bottom: 15px;
}

.name-column {
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
}
.name-column input {
  font-size: 15px;
}
.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0 20px;
  margin-bottom: 15px;
}

label {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  margin-left: 5px;
}

input {
  width: 100%;
  height: 55px;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.4);
  border: none;
  color: white;
  padding: 0 20px;
  font-size: 16px;
  box-sizing: border-box;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.password-wrapper {
  position: relative;
  width: 100%;
}

.toggle-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333;
  font-size: 24px;
}

.btn-signup {
  width: 200px;
  height: 55px;
  border-radius: 30px;
  background-color: #2b3ff2;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-top: 20px;
}

.btn-signup:hover {
  background-color: #1c259f;
}

.back-link {
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-size: 16px;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
