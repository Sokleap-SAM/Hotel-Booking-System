<template>
  <div class="sidebar">
    <div class="profile-header">
      <div class="avatar-wrapper">
        <img :src="user.profileImage" alt="User Avatar" class="avatar" />
        <div class="edit-icon">
          <span>✎</span>
        </div>
      </div>
      <p class="username-label">{{ username }}</p>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-item active">
        <span class="icon">👤</span>
        My profile
      </div>
    </nav>

    <button class="logout-btn" @click="handleLogout">Logout</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
// 1. Import the local image so Vite processes the correct URL
import localAvatar from '@/assets/Angkorwat.png' // Make sure the extension is correct (.jpg, .png, etc.)

export default defineComponent({
  name: 'UserSidebar',
  props: {
    username: {
      type: String,
      required: true,
    },
  },
  setup() {
    // 2. Initial state uses the imported local image
    const user = ref<{ profileImage: string }>({
      profileImage: localAvatar,
    })

    const handleLogout = (): void => {
      console.log('Logging out...')
    }

    /* FUTURE NESTJS NOTE:
      When you fetch from NestJS, you will simply do:
      user.value.profileImage = "http://localhost:3000/uploads/image.jpg"
      The <img> tag will automatically update.
    */

    return {
      user,
      handleLogout,
    }
  },
})
</script>

<style scoped>
/* Keeping your existing styles... */
.sidebar {
  width: 180px;
  background-color: #d1d1d1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  height: 100%; /* Ensure it fills the modal height */
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white; /* Optional: adds a nice border like your image */
}

.edit-icon {
  position: absolute;
  top: 0;
  right: -5px;
  background: #20509e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.username-label {
  font-size: 12px;
  color: #444;
  margin-bottom: 30px;
  text-align: center;
}

.sidebar-nav {
  width: 100%;
}

.nav-item.active {
  background-color: #a3c9e2;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}

.logout-btn {
  margin-top: auto;
  background-color: #ff0000;
  color: white;
  border: none;
  padding: 8px 25px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}

.logout-btn:hover {
  opacity: 0.8;
}
</style>
