<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />
  <div class="container">
    <h2>Login</h2>
    <div class="input-group">
      <label for="username">Username</label>
      <input id="username" v-model="username" type="text" placeholder="Enter your username" />
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
    <div class="forgot-password">
      <a href="#">Forgot Password</a>
    </div>
    <button class="btn-Login">Login</button>
    <div style="text-align: center; margin-top: 20px">Or continue with</div>
    <div class="container-google">
      <img :src="Google" alt="" />
    </div>
    <div class = create-account>
      <span style="text-align: center; margin-top: 20px">Don't have an account yet?</span>
      <span>Hellow orld</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'

const Google = new URL('@/assets/google.png', import.meta.url).href

export default {
  name: 'LoginScreen',
  setup() {
    const password = ref('')
    const username = ref('')
    const passwordFieldType = ref('password')

    const togglePassword = () => {
      passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
    }

    return {
      username,
      password,
      passwordFieldType,
      togglePassword,
      Google,
    }
  },
}
</script>

<style>
.container {
  width: 449px;
  height: auto;
  position: absolute;
  top: 200px;
  left: 535px;
  color: white;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.29);
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
}
.input-group {
  display: flex;
  flex-direction: column;
  font-size: 20px;
  font-family: 'Lato', sans-serif;
  margin: 20px;
  padding: 10px;
}
.btn-Login {
  width: 374px;
  height: 53px;
  border-radius: 25px;
  background-color: #2331fb;
  color: white;
  font-size: 20px;
  border: none;
  cursor: pointer;
  margin-left: 37px;
  margin-top: 20px;
}
.input-group label {
  padding: 10px;
}
.input-group input {
  width: 374px;
  height: 53px;
  border-radius: 25px;
  background-color: rgba(255, 255, 255, 0.4);
  border: none;
  color: white;
}
.input-group:first-of-type {
  margin-top: -40px;
}
h2 {
  margin-top: 10px;
  font-size: 48px;
  text-align: center;
  font-family: 'Lato', sans-serif;
}
.forgot-password {
  text-align: right;
  margin-top: 5px;
  margin-right: 50px;
}

.forgot-password a {
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
}
.password-wrapper {
  position: relative;
  width: 374px;
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
</style>
