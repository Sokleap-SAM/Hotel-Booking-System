<template>
  <div class="profile-overlay" @click.self="$emit('close')">
    <div class="profile-modal-container">
      <button class="close-btn-inside" @click="$emit('close')"></button>

      <UserSidebar :username="username" />
      <UserDetail />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UserDetail from '@/components/UserProfile/UserDetail.vue'
import UserSidebar from '@/components/UserProfile/UserSidebar.vue'

export default defineComponent({
  name: 'ProfileDetail',
  emits: ['close'], // Define the close event
  components: {
    UserDetail,
    UserSidebar,
  },
  data() {
    return {
      username: '', // Replace with actual username or fetch from store/API
    }
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
