import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(token.value ? jwtDecode(token.value) : null)

  const isAuthenticated = computed(() => !!token.value)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function login(credentials: any) {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      if (data.access_token) {
        token.value = data.access_token
        localStorage.setItem('token', data.access_token)
        user.value = jwtDecode(data.access_token)
      }
      return data;
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function register(userInfo: any) {
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isAuthenticated, login, register, logout }
})
