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
          <input 
            type="date" 
            v-model="formData.dateOfBirth" 
            class="date-picker" 
            :class="{ 'input-error': errors.dateOfBirth }"
            :max="maxDateOfBirth"
            required 
          />
        </div>
        <span v-if="errors.dateOfBirth" class="error-text">{{ errors.dateOfBirth }}</span>
      </div>

      <div class="form-group">
        <label>Phone number <span class="required">*</span></label>
        <input 
          type="tel" 
          v-model="formData.phone" 
          placeholder="0XX XXX XXXX" 
          :class="{ 'input-error': errors.phone }"
          @input="formatPhone"
          required 
        />
        <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
        <span class="help-text">Enter 9-10 digits (e.g., 012345678)</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, watch, ref } from 'vue'
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

    const errors = ref<Record<string, string>>({})

    // Calculate max date (must be at least 16 years old)
    const maxDateOfBirth = computed(() => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 16)
      return date.toISOString().split('T')[0]
    })

    // Validate date of birth (16+ years)
    const validateDateOfBirth = (dateStr: string): string | null => {
      if (!dateStr) return null
      const birthDate = new Date(dateStr)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age < 16) {
        return 'You must be at least 16 years old to make a booking'
      }
      return null
    }

    // Validate phone number (9-10 digits)
    const validatePhone = (phone: string): string | null => {
      if (!phone) return null
      const cleanedPhone = phone.replace(/\s+/g, '')
      const phoneRegex = /^[0-9]{9,10}$/
      if (!phoneRegex.test(cleanedPhone)) {
        return 'Phone number must be between 9 and 10 digits'
      }
      return null
    }

    // Format phone input (remove non-digits)
    const formatPhone = (e: Event) => {
      const input = e.target as HTMLInputElement
      formData.phone = input.value.replace(/[^0-9]/g, '').slice(0, 10)
    }

    // Sync form data to bookingStore and validate
    watch(
      () => ({ ...formData }),
      (newVal) => {
        // Validate and update errors
        const dobError = validateDateOfBirth(newVal.dateOfBirth)
        const phoneError = validatePhone(newVal.phone)
        
        errors.value = {}
        if (dobError) errors.value.dateOfBirth = dobError
        if (phoneError) errors.value.phone = phoneError

        // Only sync valid data to store
        bookingStore.setGuestDetails(
          dobError ? '' : newVal.dateOfBirth,
          phoneError ? '' : newVal.phone
        )
      },
      { deep: true }
    )

    return { userData, formData, errors, maxDateOfBirth, formatPhone }
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
.input-error {
  border-color: #dc3545 !important;
}
.error-text {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}
.help-text {
  color: #666;
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
}
</style>
