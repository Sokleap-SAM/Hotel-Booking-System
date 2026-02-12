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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        // LOG THIS: This will show you the NestJS error object
        console.error('Backend Error Response:', data)
        throw new Error(data.message || 'Login failed')
      }

      if (data.access_token) {
        token.value = data.access_token
        localStorage.setItem('token', data.access_token)
        user.value = jwtDecode(data.access_token)
      }
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function register(userInfo: FormData) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register`,
        {
          method: 'POST',
          body: userInfo,
        },
      )

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

  async function forgotPassword(email: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Forgot password failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }

  async function resetPassword(token: string, password: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, password }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Password reset failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  async function fetchUserProfileDetails() {
    if (!token.value) {
      console.warn('Cannot fetch user profile details: no authentication token available.');
      return;
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile details');
      }

      const profileData = await response.json();
      user.value = { ...user.value, ...profileData }; // Merge with existing user data
    } catch (error) {
      console.error('Error fetching user profile details:', error);
      // Optionally, log out user if token is invalid or expired during profile fetch
      // logout();
      throw error;
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
    setToken,
    resetPassword,
    forgotPassword,
    fetchUserProfileDetails, // Expose new action
  }
})
