<template>
  <div class="form-wrapper">
    <div class="user-status-bar">
      <div class="avatar-icon">
        <i class="ri-user-fill"></i>
      </div>
      <div class="user-info">
        <p>You are signed in as</p>
        <strong>{{ userData.firstName }} {{ userData.lastName }}</strong>
      </div>
    </div>

    <div class="details-card">
      <h2 class="form-title">Enter your details</h2>

      <div class="name-grid">
        <div class="form-group">
          <label>First name</label>
          <input type="text" :value="userData.firstName" disabled class="readonly-input" />
        </div>
        <div class="form-group">
          <label>Last name</label>
          <input type="text" :value="userData.lastName" disabled class="readonly-input" />
        </div>
      </div>

      <div class="form-group">
        <label>Email address</label>
        <input type="email" :value="userData.email" disabled class="readonly-input" />
      </div>

      <div class="form-group">
        <label>Date of Birth <span class="required">*</span></label>
        <div class="date-input-container">
          <input type="date" v-model="formData.dateOfBirth" class="date-picker" required />
        </div>
      </div>

      <div class="form-group">
        <label>Phone number <span class="required">*</span></label>
        <input type="tel" v-model="formData.phone" placeholder="+855..." required />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/bookingStore'

export default defineComponent({
  setup() {
    const authStore = useAuthStore()
    const bookingStore = useBookingStore()

    // Get user data from auth store (decoded from JWT)
    const userData = computed(() => ({
      firstName: authStore.user?.firstName || '',
      lastName: authStore.user?.lastName || '',
      email: authStore.user?.email || '',
    }))

    // Form data for editable fields
    const formData = reactive({
      dateOfBirth: bookingStore.guestDetails.dateOfBirth || '',
      phone: bookingStore.guestDetails.phone || '',
    })

    // Sync form data to bookingStore whenever it changes
    watch(
      () => ({ ...formData }),
      (newVal) => {
        bookingStore.setGuestDetails(newVal.dateOfBirth, newVal.phone)
      },
      { deep: true }
    )

    return { userData, formData }
  },
})
</script>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.user-status-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.avatar-icon {
  width: 40px;
  height: 40px;
  background: #f2dada;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a37070;
}
.details-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 30px;
}
.form-title {
  margin: 0 0 25px;
  font-size: 1.5rem;
}
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 0.9rem;
}
input,
.custom-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #888;
  border-radius: 4px;
  box-sizing: border-box;
}
.readonly-input {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}
.required {
  color: #dc3545;
}
.date-picker {
  font-family: inherit;
}
</style>
