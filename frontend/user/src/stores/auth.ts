import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string | null>(localStorage.getItem('token'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = ref<any>(null)

  // Initialization: Safely decode token on page load/refresh
  if (token.value) {
    try {
      user.value = jwtDecode(token.value)
    } catch (error) {
      console.error('Invalid token in storage:', error)
      token.value = null
      localStorage.removeItem('token')
    }
  }

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value)

  // --- Actions ---

  /**
   * Helper to update state and storage.
   * Useful for both normal login and Google OAuth redirects.
   */
  function setToken(accessToken: string) {
    try {
      token.value = accessToken
      localStorage.setItem('token', accessToken)
      user.value = jwtDecode(accessToken)
    } catch (error) {
      console.error('Failed to set token:', error)
      logout()
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function login(credentials: any) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/login`, {
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
        setToken(data.access_token)
      }
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function register(userInfo: any) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register`, {
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

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    setToken
  }
})
