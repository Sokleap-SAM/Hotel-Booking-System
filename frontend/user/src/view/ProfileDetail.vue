<template>
  <div class="profile-overlay" @click.self="$emit('close')">
    <div class="profile-modal-container">
      <button class="close-btn-inside" @click="$emit('close')"></button>

      <UserSidebar />
      <UserDetail />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import UserDetail from '@/components/UserProfile/UserDetail.vue'
import UserSidebar from '@/components/UserProfile/UserSidebar.vue'
import { useAuthStore } from '@/stores/auth' // Import useAuthStore

export default defineComponent({
  name: 'ProfileDetail',
  emits: ['close'], // Define the close event
  components: {
    UserDetail,
    UserSidebar,
  },
  setup() {
    const authStore = useAuthStore()

    onMounted(async () => {
      // Ensure we have a token before trying to fetch profile
      if (authStore.token) {
        await authStore.fetchUserProfileDetails();
      }
    });

    return {
      // No need to return username as UserSidebar now gets it from authStore
    };
  },
})
</script>

<style scoped>
.profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensures it stays on top of other content */
}
.profile-modal-container {
  position: relative; /* Crucial: This keeps the 'X' inside this box */
  display: flex;
  width: 850px;
  height: 500px;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.close-btn-inside {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none; /* Matches the white background */
  border: none; /* Adds the box look from your image */
  font-size: 28px;
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
}
</style>
