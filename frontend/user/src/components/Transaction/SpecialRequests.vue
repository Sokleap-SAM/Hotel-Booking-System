<template>
  <div class="special-requests-container">
    <div class="requests-card">
      <h3 class="card-title">Special requests</h3>
      <p class="description">
        Special requests can't be guaranteed, but the property will do its best to meet your needs.
        You can always make a special request after your booking is complete.
      </p>
      <p class="instruction">Please write your requests in English. (optional)</p>

      <textarea v-model="requestsData.text" class="request-textarea" rows="4"></textarea>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div class="button-wrapper">
      <button @click="submitBooking" class="next-btn" :disabled="isSubmitting">
        <span v-if="isSubmitting">Submitting...</span>
        <span v-else>Submit Booking <i class="ri-check-line"></i></span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/bookingStore'

export default defineComponent({
  name: 'SpecialRequests',
  setup() {
    const router = useRouter()
    const bookingStore = useBookingStore()

    const requestsData = reactive({
      text: '',
    })
    const isSubmitting = ref(false)
    const errorMessage = ref('')

    const submitBooking = async () => {
      // Validate required guest details
      if (!bookingStore.guestDetails.dateOfBirth || !bookingStore.guestDetails.phone) {
        errorMessage.value = 'Please fill in valid date of birth (16+ years) and phone number (9-10 digits) above.'
        return
      }

      isSubmitting.value = true
      errorMessage.value = ''

      try {
        // Create booking with pending status
        const booking = await bookingStore.createBooking()
        if (!booking) {
          throw new Error('Failed to create booking')
        }

        // Navigate to confirmation page (shows pending approval status)
        router.push({ name: 'BookingConfirmation' })
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }, message?: string }
        errorMessage.value = error.response?.data?.message || error.message || 'Failed to submit booking. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      requestsData,
      isSubmitting,
      errorMessage,
      submitBooking,
    }
  },
})
</script>

<style scoped>
.special-requests-container {
  margin-top: 25px;
  width: 100%;
}

.requests-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 25px;
  background-color: #fff;
}

.card-title {
  margin: 0 0 15px;
  font-size: 1.4rem;
}

.description,
.instruction {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.5;
  margin-bottom: 15px;
}

.request-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #888;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;
}

.button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.next-btn {
  background-color: #006ce4;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.next-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.next-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 15px;
  padding: 10px;
  background: #f8d7da;
  border-radius: 4px;
}
</style>
