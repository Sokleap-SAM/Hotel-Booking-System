import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    roles: string[]
  } | null
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('admin_token'),
    isAuthenticated: !!localStorage.getItem('admin_token'),
    user: null,
    error: null,
  }),

  actions: {
    async login(email: string, password: string) {
      this.error = null
      try {
        const { data } = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        })

        this.token = data.access_token
        this.isAuthenticated = true
        localStorage.setItem('admin_token', data.access_token)

        // Optionally fetch user profile
        await this.fetchProfile()

        return true
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Login failed'
        return false
      }
    },

    async fetchProfile() {
      if (!this.token) return

      try {
        const { data } = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.user = data
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    },

    logout() {
      this.token = null
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem('admin_token')
    },

    // Initialize auth state on app load
    initAuth() {
      const token = localStorage.getItem('admin_token')
      if (token) {
        this.token = token
        this.isAuthenticated = true
        this.fetchProfile()
      }
    },
  },
})
