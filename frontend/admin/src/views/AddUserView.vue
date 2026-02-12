<template>
  <main class="page-container">
    <header class="form-header">
      <button class="back-btn" @click="$router.back()">
        <img :src="backIcon" alt="Go back" class="btn-icon" />
      </button>
      <h1>Add New User</h1>
    </header>

    <form @submit.prevent="handleCreate" class="user-form">
      <h2 class="section-title">Profile Image</h2>

      <div class="form-group full-width">
        <label>Profile Photo</label>
        <div class="profile-upload-container">
          <div class="profile-preview" v-if="profileImagePreview">
            <img :src="profileImagePreview" alt="Profile preview" />
            <button type="button" class="remove-profile-btn" @click="removeProfileImage">×</button>
          </div>
          <label v-else class="upload-box profile-upload-box">
            <input type="file" accept="image/*" @change="handleProfileImage" hidden />
            <span class="upload-icon">+</span>
            <span class="upload-text">Upload Photo</span>
          </label>
        </div>
        <p class="help-text">Optional. Supported formats: JPG, PNG (max 5MB)</p>
      </div>

      <h2 class="section-title">Personal Information</h2>

      <div class="form-row">
        <div class="form-group">
          <label>First Name <span class="required">*</span></label>
          <input
            v-model="form.firstName"
            type="text"
            placeholder="Enter first name"
            :class="{ 'input-error': errors.firstName }"
          />
          <span v-if="errors.firstName" class="error-text">{{ errors.firstName }}</span>
        </div>
        <div class="form-group">
          <label>Last Name <span class="required">*</span></label>
          <input
            v-model="form.lastName"
            type="text"
            placeholder="Enter last name"
            :class="{ 'input-error': errors.lastName }"
          />
          <span v-if="errors.lastName" class="error-text">{{ errors.lastName }}</span>
        </div>
      </div>

      <div class="form-group full-width">
        <label>Email <span class="required">*</span></label>
        <input
          v-model="form.email"
          type="email"
          placeholder="Enter email address"
          :class="{ 'input-error': errors.email }"
        />
        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
      </div>

      <h2 class="section-title">Security</h2>

      <div class="form-row">
        <div class="form-group">
          <label>Password <span class="required">*</span></label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter password (min 8 characters)"
            :class="{ 'input-error': errors.password }"
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>
        <div class="form-group">
          <label>Confirm Password <span class="required">*</span></label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm password"
            :class="{ 'input-error': errors.confirmPassword }"
          />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>
      </div>

      <h2 class="section-title">Access & Permissions</h2>

      <div class="form-group full-width">
        <label>Roles <span class="required">*</span></label>
        <div class="roles-container" :class="{ 'error-border': errors.roleIds }">
          <div class="roles-list">
            <div v-for="role in availableRoles" :key="role.id" class="checkbox-item">
              <input
                type="checkbox"
                :id="'role-' + role.id"
                :value="role.id"
                v-model="form.roleIds"
              />
              <label :for="'role-' + role.id">{{ role.name }}</label>
            </div>
          </div>
        </div>
        <span v-if="errors.roleIds" class="error-text">{{ errors.roleIds }}</span>
        <p class="help-text">Select at least one role for the user.</p>
      </div>

      <div class="form-group full-width">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.isActive" />
          <span>Active Account</span>
        </label>
        <p class="help-text">If unchecked, the user will not be able to log in.</p>
      </div>

      <div class="provider-info">
        <span class="provider-badge badge-local">Local Account</span>
        <p class="info-text">This user will be created with local authentication (email/password).</p>
      </div>

      <p v-if="apiError" class="error-text api-error">{{ apiError }}</p>

      <div class="form-actions">
        <button type="submit" class="create-btn" :disabled="userStore.isLoading">
          {{ userStore.isLoading ? 'Creating...' : 'Create User' }}
        </button>
        <button type="button" class="cancel-btn" @click="$router.back()">Cancel</button>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { validateCreateUserForm } from '@/utils/user-validator'
import backIcon from '@/assets/icons/back-icon.svg'

const userStore = useUserStore()
const router = useRouter()
const errors = ref<Record<string, string>>({})
const apiError = ref('')
const profileImage = ref<File | null>(null)
const profileImagePreview = ref<string | null>(null)

// Filter out admin role from available roles
const availableRoles = computed(() => {
  return userStore.roles.filter(role => role.name.toLowerCase() !== 'admin')
})

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleIds: [] as number[],
  isActive: true,
})

onMounted(() => {
  userStore.fetchRoles()
})

const handleProfileImage = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  
  const file = target.files[0]
  profileImage.value = file
  profileImagePreview.value = URL.createObjectURL(file)
}

const removeProfileImage = () => {
  profileImage.value = null
  profileImagePreview.value = null
}

const handleCreate = async () => {
  errors.value = {}
  apiError.value = ''

  const validation = validateCreateUserForm(form.value)

  if (!validation.isValid) {
    errors.value = validation.errors
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const result = await userStore.createUser({
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    email: form.value.email.trim(),
    password: form.value.password,
    roleIds: form.value.roleIds,
    isActive: form.value.isActive,
  }, profileImage.value)

  if (result.success) {
    router.push('/users')
  } else {
    const errorResult = result as { errors?: Record<string, string>; message?: string }
    if (errorResult.errors && Object.keys(errorResult.errors).length > 0) {
      errors.value = { ...errors.value, ...errorResult.errors }
    } else {
      apiError.value = errorResult.message || 'Failed to create user'
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(
  form,
  () => {
    if (Object.keys(errors.value).length > 0) {
      const validation = validateCreateUserForm(form.value)
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

input[type="text"],
input[type="email"],
input[type="password"] {
  padding: 12px;
  border: 1px solid #D9D9D9;
  font-size: 16px;
  border-radius: 12px;
  outline: none;
}

input:focus {
  border-color: #0D4798;
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
  gap: 15px;
}

.provider-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-local {
  background: #e3f2fd;
  color: #0D4798;
}

.info-text {
  color: #0369a1;
  font-size: 14px;
  margin: 0;
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

.create-btn:hover {
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
  overflow: hidden;
  border: 3px solid #0D4798;
}

.profile-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-profile-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc2626;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 18px;
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
}
</style>
