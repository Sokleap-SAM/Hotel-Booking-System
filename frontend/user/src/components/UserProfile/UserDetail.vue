<template>
  <div class="detail-panel">
    <button class="close-btn" @click="handleCancel">✕</button>

    <div class="form-container">
      <div class="info-row">
        <label>Username</label>
        <span v-if="!isEditingUsername" class="value">{{ user.username }}</span>
        <input v-else type="text" v-model="user.username" class="value-input" />
        <button @click="isEditingUsername = !isEditingUsername" class="edit-field-btn">
          {{ isEditingUsername ? 'Done' : 'Edit' }}
        </button>
      </div>

      <div class="info-row">
        <label>Email</label>
        <span class="value">{{ user.email }}</span>
      </div>

      <div class="info-row">
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
      <button class="cancel-btn" @click="handleCancel">Cancel</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'DetailPanel',
  setup() {
    const user = ref<{ username: string; email: string; password: string }>({
      username: 'Alla Allish',
      email: 'allish.alla@gmail.com',
      password: 'hashed_password_placeholder',
    })

    const isEditingUsername = ref(false)
    const isEditingPassword = ref(false)
    const newPassword = ref('')
    const confirmPassword = ref('')

    const handleSave = (): void => {
      console.log('Saving data to NestJS backend...')
      if (isEditingUsername.value) {
        console.log('New Username:', user.value.username)
        // API call to update username
      }

      if (isEditingPassword.value) {
        if (newPassword.value !== confirmPassword.value) {
          alert('New password and confirm password do not match!')
          return
        }
        if (newPassword.value) {
          console.log('New Password:', newPassword.value)
          // API call to update password
        }
      }

      alert('Data saved (Mock)')
      isEditingUsername.value = false
      isEditingPassword.value = false
      newPassword.value = ''
      confirmPassword.value = ''
    }

    const handleCancel = (): void => {
      console.log('Action cancelled')
      isEditingUsername.value = false
      isEditingPassword.value = false
      newPassword.value = ''
      confirmPassword.value = ''
    }

    const togglePasswordEdit = () => {
      isEditingPassword.value = !isEditingPassword.value
      if (!isEditingPassword.value) {
        newPassword.value = ''
        confirmPassword.value = ''
      }
    }

    return {
      user,
      isEditingUsername,
      isEditingPassword,
      newPassword,
      confirmPassword,
      handleSave,
      handleCancel,
      togglePasswordEdit,
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
