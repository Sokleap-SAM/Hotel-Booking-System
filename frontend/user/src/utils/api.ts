import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

// Request interceptor - adds JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - handles 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      localStorage.removeItem('token')
      
      // Only redirect to login if on a protected route (not public pages)
      const publicPaths = ['/home', '/Bookingpage', '/BookingDetail', '/login', '/signup', '/auth']
      const currentPath = window.location.pathname
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path) || currentPath === '/')
      
      if (!isPublicPath) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
