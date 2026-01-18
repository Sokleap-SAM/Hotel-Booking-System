import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import GoogleLogin from 'vue3-google-login'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(GoogleLogin, {
  clientId: '995088013142-bv5jjjsl8h11rn7clse3aabh50o33dm1.apps.googleusercontent.com',
})

app.mount('#app')
