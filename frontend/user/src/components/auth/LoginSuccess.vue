<template>
  <div>Logging in...</div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'LoginSuccess',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    onMounted(() => {
      const token = route.query.token
      if (typeof token === 'string') {
        authStore.setToken(token)
        router.push('/home')
      } else {
        // Handle error: No token provided
        router.push('/login')
      }
    })

    return {}
  },
})
</script>
