import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Fetch user profile details on app startup if authenticated
const authStore = useAuthStore()
if (authStore.isAuthenticated) {
  authStore.fetchUserProfileDetails().catch((error) => {
    console.error('Failed to fetch user profile on startup:', error)
  })
}

app.mount('#app')
