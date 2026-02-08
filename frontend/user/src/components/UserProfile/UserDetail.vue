<template>
  <div class="detail-panel">
    <button class="close-btn" @click="handleCancel">✕</button>

    <div class="form-container">
      <div class="info-row">
        <label>First Name</label>
        <span v-if="!isEditingFirstName" class="value">{{ user.firstName }}</span>
        <input v-else type="text" v-model="user.firstName" class="value-input" />
        <button @click="isEditingFirstName = !isEditingFirstName" class="edit-field-btn">
          {{ isEditingFirstName ? 'Done' : 'Edit' }}
        </button>
      </div>

      <div class="info-row">
        <label>Last Name</label>
        <span v-if="!isEditingLastName" class="value">{{ user.lastName }}</span>
        <input v-else type="text" v-model="user.lastName" class="value-input" />
        <button @click="isEditingLastName = !isEditingLastName" class="edit-field-btn">
          {{ isEditingLastName ? 'Done' : 'Edit' }}
        </button>
      </div>

      <div class="info-row">
        <label>Email</label>
        <span class="value">{{ user.email }}</span>
      </div>

      <div class="info-row" v-if="canChangePassword">
        <label>Password</label>
        <span v-if="!isEditingPassword" class="value">************</span>
        <div v-else class="password-fields">
          <input
            type="password"
            v-model="newPassword"
            placeholder="New Password"
            class="value-input"
          />
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="Confirm New Password"
            class="value-input"
          />
        </div>
        <button @click="togglePasswordEdit" class="edit-field-btn">
          {{ isEditingPassword ? 'Cancel' : 'Change' }}
        </button>
      </div>


    </div>

    <div class="button-group">
      <button class="save-btn" @click="handleSave">Save Change</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

export default defineComponent({
  name: 'DetailPanel',
  setup() {
    const authStore = useAuthStore()
    const user = ref({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      profileImage: null,
      provider: '',
    })

    const isEditingFirstName = ref(false)
    const isEditingLastName = ref(false)
    const isEditingPassword = ref(false)
    const newPassword = ref('')
    const confirmPassword = ref('')

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        })
        user.value = { ...user.value, ...response.data }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        alert('Failed to fetch user profile.')
      }
    }

    onMounted(() => {
      fetchUserProfile()
    })

    const handleSave = async (): Promise<void> => {
      try {
        if (isEditingFirstName.value || isEditingLastName.value) {
          const formData = new FormData()
          if (isEditingFirstName.value) {
            formData.append('firstName', user.value.firstName)
          }
          if (isEditingLastName.value) {
            formData.append('lastName', user.value.lastName)
          }

          await axios.patch(`${API_URL}/auth/profile`, formData, {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              'Content-Type': 'multipart/form-data',
            },
          })
          alert('Profile updated successfully!')
          isEditingFirstName.value = false
          isEditingLastName.value = false
          await fetchUserProfile() // Re-fetch to update image URL if changed
        }

        if (isEditingPassword.value) {
          if (user.value.provider !== 'local') {
            alert('Password cannot be changed for OAuth users.')
            return;
          }
          if (newPassword.value !== confirmPassword.value) {
            alert('New password and confirm password do not match!')
            return
          }
          if (!newPassword.value) { // Only check for newPassword presence
            alert('New Password is required to change password.')
            return
          }

          await axios.patch(
            `${API_URL}/auth/change-password`,
            {
              newPassword: newPassword.value,
            },
            {
              headers: {
                Authorization: `Bearer ${authStore.token}`,
              },
            },
          )
          alert('Password changed successfully!')
          isEditingPassword.value = false
          newPassword.value = ''
          confirmPassword.value = ''
        }

        if (!isEditingFirstName.value && !isEditingLastName.value && !isEditingPassword.value) {
          alert('No changes to save.')
        }
      } catch (error) {
        console.error('Error saving data:', error)
        if (axios.isAxiosError(error) && error.response) {
          alert(`Error: ${error.response.data.message || error.response.statusText}`)
        } else {
          alert('Failed to save changes.')
        }
      }
    }

    const handleCancel = (): void => {
      console.log('Action cancelled')
      isEditingFirstName.value = false
      isEditingLastName.value = false
      isEditingPassword.value = false
      newPassword.value = ''
      confirmPassword.value = ''
      fetchUserProfile() // Re-fetch to revert any unsaved changes
    }

    const togglePasswordEdit = () => {
      isEditingPassword.value = !isEditingPassword.value
      if (!isEditingPassword.value) {
        newPassword.value = ''
        confirmPassword.value = ''
      }
    }

    const canChangePassword = computed(() => user.value.provider === 'local');

    return {
      user,
      isEditingFirstName,
      isEditingLastName,
      isEditingPassword,
      newPassword,
      confirmPassword,
      handleSave,
      handleCancel,
      togglePasswordEdit,
      canChangePassword,
    }
  },
})
</script>

<style scoped>
.detail-panel {
  flex: 1;
  background: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.form-container {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.info-row label {
  font-weight: 500;
  color: #333;
}

.info-row .value {
  color: #000;
}

/* New styles for input fields and edit buttons */
.value-input {
  flex-grow: 1;
  margin-left: 10px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.edit-field-btn {
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

.password-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  margin-left: 10px;
}

.profile-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 10px;
}

.button-group {
  margin-top: auto;
  display: flex;
  gap: 15px;
}

.save-btn {
  background-color: #114b97;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #ff0000;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}

</style>
