<template>
  <div class="sidebar">
    <div class="profile-header">
      <div class="avatar-wrapper">
        <img :src="user.profileImage" alt="User Avatar" class="avatar" />
        <div class="edit-icon" @click="triggerFileInput">
          <span>✎</span>
          <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none;" />
        </div>
      </div>
      <p class="username-label">{{ user.firstName || 'User' }} {{ user.lastName }}</p>
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
import { defineComponent, ref, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axios from 'axios' // Added this line
import localAvatar from '@/assets/Angkorwat.png' 

export default defineComponent({
  name: 'UserSidebar',
  // Removed username prop as it's not directly used for display
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const user = ref({
      profileImage: localAvatar,
      firstName: '',
      lastName: '',
    })
    const fileInput = ref<HTMLInputElement | null>(null);
    const selectedFile = ref<File | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    watchEffect(() => {
      if (authStore.user) {
        user.value.firstName = authStore.user.firstName || ''; // No fallback to email here
        user.value.lastName = authStore.user.lastName || '';
        // If authStore.user has profileImage, use it, otherwise keep localAvatar
        user.value.profileImage = authStore.user.profileImage ? 
                                 (import.meta.env.VITE_API_URL || 'http://localhost:3000') + authStore.user.profileImage
                                 : localAvatar;
      } else {
        // If not authenticated, reset to default or empty
        user.value.firstName = '';
        user.value.lastName = '';
        user.value.profileImage = localAvatar;
      }
    });

    const handleLogout = (): void => {
      authStore.logout()
      router.push({ name: 'login' })
    }

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleFileChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0];
        await uploadProfileImage();
      } else {
        selectedFile.value = null;
      }
    };

    const uploadProfileImage = async () => {
      if (!selectedFile.value) return;

      const formData = new FormData();
      formData.append('profileImage', selectedFile.value);

      try {
        await axios.patch(`${API_URL}/auth/profile`, formData, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Profile image updated successfully!');
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        if (response.data) {
          authStore.user = { ...authStore.user, ...response.data };
        }

      } catch (error) {
        console.error('Error uploading profile image:', error);
        if (axios.isAxiosError(error) && error.response) {
          alert(`Error: ${error.response.data.message || error.response.statusText}`);
        } else {
          alert('Failed to upload profile image.');
        }
      } finally {
        selectedFile.value = null; // Clear selected file
        if (fileInput.value) {
            fileInput.value.value = ''; // Reset file input
        }
      }
    };

    return {
      user,
      fileInput,
      handleLogout,
      triggerFileInput,
      handleFileChange,
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
  z-index: 10; /* Ensure it's above the avatar */
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
