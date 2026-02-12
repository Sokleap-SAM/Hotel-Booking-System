<template>
  <main class="page-container">
    <header class="form-header">
      <button class="back-btn" @click="$router.back()">
        <img :src="backIcon" alt="Go back" class="btn-icon" />
      </button>
      <h1>Edit User</h1>
    </header>

    <div v-if="isLoading" class="loading-state">Loading user data...</div>

    <div v-else-if="!user" class="error-state">
      <p>User not found.</p>
      <button @click="$router.back()" class="back-link">Go back</button>
    </div>

    <form v-else @submit.prevent="handleUpdate" class="user-form">
      <!-- Profile Image Section -->
      <h2 class="section-title">Profile Image</h2>
      <div class="form-group full-width">
        <label>Profile Photo</label>
        <div class="profile-upload-container">
          <div class="profile-preview" v-if="profileImagePreview || (user.profileImage && !removeExistingImage)">
            <img :src="profileImagePreview || renderProfileImage(user.profileImage)" alt="Profile preview" />
            <div class="profile-actions" v-if="!isGoogleUser">
              <label class="change-profile-btn">
                <input type="file" accept="image/*" @change="handleProfileImage" hidden />
                Change
              </label>
              <button type="button" class="remove-profile-btn" @click="handleRemoveProfileImage">×</button>
            </div>
          </div>
          <label v-else class="upload-box profile-upload-box">
            <input type="file" accept="image/*" @change="handleProfileImage" hidden :disabled="isGoogleUser" />
            <span class="upload-icon">+</span>
            <span class="upload-text">Upload Photo</span>
          </label>
        </div>
        <p class="help-text" v-if="!isGoogleUser">Optional. Supported formats: JPG, PNG (max 5MB)</p>
        <p class="help-text" v-else>Profile image is managed by Google</p>
      </div>

      <!-- Google Provider Warning -->
      <div v-if="isGoogleUser" class="google-warning">
        <span class="provider-badge badge-google">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Connected with Google
        </span>
        <p class="warning-text">
          This user is connected with Google. Personal information (name, email, password) cannot be modified.
          You can only change the user's roles and account status.
        </p>
      </div>

      <h2 class="section-title">Personal Information</h2>

      <div class="form-row">
        <div class="form-group">
          <label>First Name <span v-if="!isGoogleUser" class="required">*</span></label>
          <input
            v-model="form.firstName"
            type="text"
            placeholder="Enter first name"
            :class="{ 'input-error': errors.firstName }"
            :disabled="isGoogleUser"
          />
          <span v-if="errors.firstName" class="error-text">{{ errors.firstName }}</span>
        </div>
        <div class="form-group">
          <label>Last Name <span v-if="!isGoogleUser" class="required">*</span></label>
          <input
            v-model="form.lastName"
            type="text"
            placeholder="Enter last name"
            :class="{ 'input-error': errors.lastName }"
            :disabled="isGoogleUser"
          />
          <span v-if="errors.lastName" class="error-text">{{ errors.lastName }}</span>
        </div>
      </div>

      <div class="form-group full-width">
        <label>Email</label>
        <input
          :value="user.email"
          type="email"
          disabled
          class="disabled-input"
        />
        <p class="help-text">Email address cannot be changed.</p>
      </div>

      <h2 class="section-title">Security</h2>

      <div v-if="!isGoogleUser" class="form-row">
        <div class="form-group">
          <label>New Password <span class="optional">(Leave blank to keep current)</span></label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter new password"
            :class="{ 'input-error': errors.password }"
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm new password"
            :class="{ 'input-error': errors.confirmPassword }"
          />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>
      </div>

      <div v-else class="google-security-note">
        <p>Password management is handled by Google for this account.</p>
      </div>

      <h2 class="section-title">Access & Permissions</h2>

      <!-- Warning for editing own profile -->
      <div v-if="isEditingSelf" class="self-edit-warning">
        <p class="warning-text">
          You cannot modify your own role or active status. Please contact another administrator to make these changes.
        </p>
      </div>

      <div class="form-group full-width">
        <label>Roles <span class="required">*</span></label>
        <div class="roles-container" :class="{ 'error-border': errors.roleIds, 'disabled-container': isEditingSelf }">
          <div class="roles-list">
            <div v-for="role in availableRoles" :key="role.id" class="checkbox-item">
              <input
                type="checkbox"
                :id="'role-' + role.id"
                :value="role.id"
                v-model="form.roleIds"
                :disabled="isEditingSelf"
              />
              <label :for="'role-' + role.id">{{ role.name }}</label>
            </div>
          </div>
        </div>
        <span v-if="errors.roleIds" class="error-text">{{ errors.roleIds }}</span>
      </div>

      <div class="form-group full-width">
        <label class="checkbox-label" :class="{ 'disabled-label': isEditingSelf }">
          <input type="checkbox" v-model="form.isActive" :disabled="isEditingSelf" />
          <span>Active Account</span>
        </label>
        <p class="help-text">If unchecked, the user will not be able to log in.</p>
      </div>

      <div class="provider-info">
        <span :class="['provider-badge', isGoogleUser ? 'badge-google' : 'badge-local']">
          {{ isGoogleUser ? 'Google Account' : 'Local Account' }}
        </span>
        <div class="user-meta">
          <p class="info-text">Created: {{ formatDate(user.createdAt) }}</p>
          <p class="info-text">Last Updated: {{ formatDate(user.updatedAt) }}</p>
        </div>
      </div>

      <p v-if="apiError" class="error-text api-error">{{ apiError }}</p>

      <div class="form-actions">
        <button type="submit" class="create-btn" :disabled="isUpdating">
          {{ isUpdating ? 'Updating...' : 'Update User' }}
        </button>
        <button type="button" class="cancel-btn" @click="$router.back()">Cancel</button>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/stores/userStore'
import { validateUpdateUserForm } from '@/utils/user-validator'
import backIcon from '@/assets/icons/back-icon.svg'

const userStore = useUserStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const user = ref<User | null>(null)
const isLoading = ref(true)
const isUpdating = ref(false)
const errors = ref<Record<string, string>>({})
const apiError = ref('')
const profileImage = ref<File | null>(null)
const profileImagePreview = ref<string | null>(null)
const removeExistingImage = ref(false)

const renderProfileImage = (path: string | null): string | undefined => {
  if (!path) return undefined
  return path.startsWith('http') ? path : `http://localhost:3000${path}`
}

const handleProfileImage = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  
  const file = target.files[0]
  profileImage.value = file
  profileImagePreview.value = URL.createObjectURL(file)
  removeExistingImage.value = false
}

const handleRemoveProfileImage = () => {
  profileImage.value = null
  profileImagePreview.value = null
  removeExistingImage.value = true
}

const form = ref({
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  roleIds: [] as number[],
  isActive: true,
})

const isGoogleUser = computed(() => user.value?.provider === 'google')
const isEditingSelf = computed(() => user.value?.id === authStore.user?.id)

// Filter out admin role from available roles
const availableRoles = computed(() => {
  return userStore.roles.filter(role => role.name.toLowerCase() !== 'admin')
})

onMounted(async () => {
  await userStore.fetchRoles()

  const userId = Number(route.params.id)
  if (isNaN(userId)) {
    isLoading.value = false
    return
  }

  const userData = await userStore.getUserById(userId)
  if (userData) {
    user.value = userData
    form.value = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: '',
      confirmPassword: '',
      roleIds: userData.roles?.map((ur) => ur.role?.id).filter(Boolean) as number[] ?? [],
      isActive: userData.isActive,
    }
  }

  isLoading.value = false
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleUpdate = async () => {
  if (!user.value) return

  errors.value = {}
  apiError.value = ''

  // Validate form (skip personal info validation for Google users)
  const validation = validateUpdateUserForm(form.value)

  if (!validation.isValid) {
    // For Google users, only check roleIds
    if (isGoogleUser.value) {
      if (validation.errors.roleIds) {
        errors.value = { roleIds: validation.errors.roleIds }
      }
    } else {
      errors.value = validation.errors
    }

    if (Object.keys(errors.value).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }

  isUpdating.value = true

  // For Google users, only update status (no personal info)
  if (!isGoogleUser.value) {
    const updateData: Record<string, unknown> = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      isActive: form.value.isActive,
    }

    if (form.value.password) {
      updateData.password = form.value.password
    }

    const result = await userStore.updateUser(user.value.id, updateData, profileImage.value, removeExistingImage.value)

    if (!result.success) {
      const errorResult = result as { errors?: Record<string, string>; message?: string }
      if (errorResult.errors && Object.keys(errorResult.errors).length > 0) {
        errors.value = { ...errors.value, ...errorResult.errors }
      } else {
        apiError.value = errorResult.message || 'Failed to update user'
      }
      isUpdating.value = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  } else {
    // For Google users, only update status
    const result = await userStore.updateUser(user.value.id, {
      isActive: form.value.isActive,
    })

    if (!result.success) {
      const errorResult = result as { errors?: Record<string, string>; message?: string }
      apiError.value = errorResult.message || 'Failed to update user status'
      isUpdating.value = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }

  // Update roles (skip if editing self - roles are disabled for self-editing)
  if (!isEditingSelf.value) {
    const rolesResult = await userStore.updateUserRoles(user.value.id, form.value.roleIds)

    if (!rolesResult.success) {
      apiError.value = rolesResult.message || 'Failed to update user roles'
      isUpdating.value = false
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  }

  router.push('/users')
}

watch(
  form,
  () => {
    if (Object.keys(errors.value).length > 0) {
      const validation = validateUpdateUserForm(form.value)
      errors.value = validation.errors
    }
  },
  { deep: true }
)
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.back-btn {
  background-color: white;
  border: none;
  cursor: pointer;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: #666;
}

.back-link {
  margin-top: 20px;
  padding: 10px 20px;
  background: #0D4798;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.google-warning {
  background: #fef3cd;
  border: 1px solid #ffc107;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.warning-text {
  color: #856404;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.google-security-note {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  color: #666;
  font-style: italic;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  width: 100%;
}

label {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.required {
  color: #dc2626;
}

.optional {
  color: #999;
  font-weight: 400;
  font-size: 13px;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  padding: 12px;
  border: 1px solid #D9D9D9;
  font-size: 16px;
  border-radius: 12px;
  outline: none;
}

input:focus:not(:disabled) {
  border-color: #0D4798;
}

input:disabled,
.disabled-input {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.roles-container {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-item label {
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  text-transform: capitalize;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
}

.help-text {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
  font-style: italic;
}

.provider-info {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.provider-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-local {
  background: #e3f2fd;
  color: #0D4798;
}

.badge-google {
  background: #fef3cd;
  color: #856404;
}

.user-meta {
  text-align: right;
}

.info-text {
  color: #0369a1;
  font-size: 13px;
  margin: 4px 0;
}

.section-title {
  margin: 10px 0;
  font-size: 24px;
  color: #0D4798;
  font-weight: 700;
}

.form-actions {
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-top: 20px;
}

.create-btn {
  background: #0D4798;
  color: white;
  padding: 15px 30px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.create-btn:hover:not(:disabled) {
  background-color: #07316d;
}

.create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #FF0000;
  color: white;
  padding: 15px 25px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.cancel-btn:hover {
  background-color: #cc0000;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.api-error {
  font-size: 14px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fff5f5;
}

.error-border {
  border: 2px solid #dc2626 !important;
  background-color: #fff5f5;
}

/* Self-edit warning and disabled states */
.self-edit-warning {
  background: #fef3cd;
  border: 1px solid #ffc107;
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 15px;
}

.self-edit-warning .warning-text {
  color: #856404;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.disabled-container {
  background-color: #f5f5f5;
  opacity: 0.7;
  cursor: not-allowed;
}

.disabled-container input[type="checkbox"] {
  cursor: not-allowed;
}

.disabled-label {
  opacity: 0.7;
  cursor: not-allowed;
}

.disabled-label input[type="checkbox"] {
  cursor: not-allowed;
}

.profile-upload-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: visible;
  border: 3px solid #0D4798;
}

.profile-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-actions {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.change-profile-btn {
  background: #0D4798;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.change-profile-btn:hover {
  background: #0a3670;
}

.remove-profile-btn {
  background: #dc2626;
  color: white;
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-upload-box {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed #D9D9D9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.profile-upload-box:hover {
  border-color: #0D4798;
}

.upload-icon {
  font-size: 24px;
  color: #666;
}

.upload-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .page-container {
    padding: 20px;
  }

  .provider-info {
    flex-direction: column;
    text-align: center;
  }

  .user-meta {
    text-align: center;
  }
}
</style>
