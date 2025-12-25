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
    <div class="forgot-password" @click="goToForgotPw">
      <a href="#">Forgot Password</a>
    </div>
    <button class="btn-Login">Login</button>
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
import { jwtDecode } from 'jwt-decode'

export default {
  name: 'LoginScreen',
  setup() {
    const password = ref('')
    const username = ref('')
    const passwordFieldType = ref('password')

    const userprofile = ref({
      name: '',
      email: '',
      picture: '',
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = (response: any) => {
      console.log('Encoded JWT ID token: ' + response.credential)

      if (response?.credential) {
        const decoded = jwtDecode(response.credential)
        console.log('Decoded JWT ID token: ', decoded)
        userprofile.value = {
          // @ts-expect-error: myProperty is dynamically added at runtime
          name: decoded['name'],
          // @ts-expect-error: myProperty is dynamically added at runtime
          email: decoded['email'],
          // @ts-expect-error: myProperty is dynamically added at runtime
          picture: decoded['picture'],
        }
      }
    }

    const router = useRouter()
    const goToSignup = () => {
      router.push('/signup')
    }

    const goToForgotPw = () => {
      router.push('/ForgotPassword')
    }

    const togglePassword = () => {
      passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
    }

    return {
      goToSignup,
      goToForgotPw,
      username,
      password,
      passwordFieldType,
      togglePassword,
      userprofile,
      callback,
      // Google,
    }
  },
}
</script>

<style scoped>
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
.btn-Login:hover {
  background-color: #1c259f;
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
