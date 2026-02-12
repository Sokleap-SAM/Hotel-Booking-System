<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="booking-page-container">
    <div class="hero-banner" :style="backgroundHeader"></div>

    <div class="stepper-wrapper">
      <div class="stepper">
        <div class="step">
          <div class="step-icon completed"><i class="ri-check-line"></i></div>
          <span class="step-text">Your Selection</span>
        </div>
        <div class="step-connector"></div>
        <div class="step">
          <div class="step-icon completed"><i class="ri-check-line"></i></div>
          <span class="step-text">Your Details</span>
        </div>
        <div class="step-connector"></div>
        <div class="step">
          <div class="step-icon inactive">3</div>
          <span class="step-text">Finish booking</span>
        </div>
      </div>
    </div>

    <main class="content-body">
      <div class="booking-layout-grid">
        <div class="left-section">
          <BookingSummary />
        </div>

        <div class="right-section">
          <PaymentForm 
            @method-changed="onPaymentMethodChanged"
          />
        </div>

        <!-- KHQR QR Code Display -->
        <div v-if="selectedPaymentMethod === 'khqr' && khqrData" class="qr-section">
          <div class="qr-card">
            <h3>Scan QR Code to Pay</h3>
            <div class="qr-code-display">
              <div class="qr-placeholder">
                <i class="ri-qr-code-line"></i>
                <p>{{ khqrData.qrReference }}</p>
              </div>
            </div>
            <p class="amount-display">Amount: ${{ khqrData.amount.toFixed(2) }}</p>
            <p class="expiry-note">QR code expires at {{ formatExpiry(khqrData.expiresAt) }}</p>
            <button class="btn-paid" @click="confirmKhqrPayment" :disabled="isSubmitting">
              <span v-if="isSubmitting">Confirming...</span>
              <span v-else>I've Paid</span>
            </button>
          </div>
        </div>

        <div class="fill-request">
          <Policy />
        </div>

        <div class="confirm-section">
          <!-- Loading state -->
          <div v-if="isLoadingBooking" class="loading-state">
            <i class="ri-loader-4-line spinning"></i>
            <p>Loading booking details...</p>
          </div>

          <!-- Error messages -->
          <p v-if="bookingError" class="error-msg">{{ bookingError }}</p>
          <p v-if="paymentStore.error" class="error-msg">{{ paymentStore.error }}</p>

          <!-- Not approved warning -->
          <div v-if="currentBooking && !canPay && !isLoadingBooking" class="warning-msg">
            <i class="ri-information-line"></i>
            <span>This booking requires admin approval before payment. Check "My Bookings" for status updates.</span>
          </div>
          
          <!-- Different button based on payment method -->
          <template v-if="canPay && !isLoadingBooking">
            <template v-if="selectedPaymentMethod === 'khqr'">
              <button 
                v-if="!khqrData" 
                class="btn-confirm" 
                :disabled="isSubmitting" 
                @click="initiateKhqrPayment"
              >
                <span v-if="isSubmitting">Processing...</span>
                <span v-else>Generate QR Code</span>
              </button>
            </template>
            <template v-else>
              <button 
                class="btn-confirm btn-stripe" 
                :disabled="isSubmitting" 
                @click="initiateStripeCheckout"
              >
                <span v-if="isSubmitting">Redirecting to Stripe...</span>
                <span v-else><i class="ri-bank-card-line"></i> Pay with Stripe</span>
              </button>
            </template>
          </template>

          <!-- Back to My Bookings if not approved -->
          <button v-if="!canPay && !isLoadingBooking" class="btn-secondary" @click="$router.push('/MyBookings')">
            <i class="ri-arrow-left-line"></i> Back to My Bookings
          </button>
        </div>
      </div>
    </main>

    <ProfileDetail v-if="isProfileOpen" @close="isProfileOpen = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import background from '@/assets/Background2.png'
import BookingSummary from '@/components/Transaction/BookingSummary.vue'
import ProfileDetail from '@/view/ProfileDetail.vue'
import PaymentForm from '@/components/Transaction/Payment.vue'
import Policy from '@/components/Transaction/Policy.vue'
import { useBookingStore } from '@/stores/bookingStore'
import { usePaymentStore, type PaymentMethod } from '@/stores/paymentStore'

export default defineComponent({
  name: 'LastPayment',
  components: {
    BookingSummary,
    ProfileDetail,
    PaymentForm,
    Policy,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const bookingStore = useBookingStore()
    const paymentStore = usePaymentStore()
    
    const backgroundHeader = {
      backgroundImage: `url(${background})`,
    }

    const isProfileOpen = ref(false)
    const isSubmitting = ref(false)
    const isLoadingBooking = ref(false)
    const bookingError = ref('')
    const selectedPaymentMethod = ref<PaymentMethod>('stripe')

    const goToHome = () => {
      router.push('/home')
    }

    const khqrData = computed(() => paymentStore.khqrData)
    const currentBooking = computed(() => bookingStore.currentBooking)

    // Check if booking is confirmed and ready for payment
    const canPay = computed(() => {
      return currentBooking.value?.status === 'confirmed'
    })



    // Load booking on mount if bookingId is in query
    onMounted(async () => {
      const bookingId = route.query.bookingId as string
      if (bookingId) {
        isLoadingBooking.value = true
        try {
          await bookingStore.loadBookingForPayment(bookingId)
          if (bookingStore.currentBooking?.status !== 'confirmed') {
            bookingError.value = 'This booking is not approved for payment yet. Please wait for admin approval.'
          }
        } catch {
          bookingError.value = 'Failed to load booking.'
        } finally {
          isLoadingBooking.value = false
        }
      } else {
        // No bookingId - user shouldn't be here
        bookingError.value = 'No booking found. Please submit a booking first.'
      }
    })

    const onPaymentMethodChanged = (method: PaymentMethod) => {
      selectedPaymentMethod.value = method
      paymentStore.clearPaymentState()
    }



    const formatExpiry = (dateStr: string) => {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Create booking first, then initiate KHQR payment
    const initiateKhqrPayment = async () => {
      if (!canPay.value || !currentBooking.value) {
        bookingError.value = 'Booking must be approved before payment.'
        return
      }

      isSubmitting.value = true
      bookingError.value = ''
      
      try {
        // Use existing confirmed booking
        const result = await paymentStore.initializeKhqrPayment(currentBooking.value.id)
        if (!result) {
          throw new Error(paymentStore.error || 'Failed to initialize payment')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }, message?: string }
        bookingError.value = error.response?.data?.message || error.message || 'Failed to process. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    // Confirm KHQR payment after user has paid
    const confirmKhqrPayment = async () => {
      if (!khqrData.value) return
      
      isSubmitting.value = true
      bookingError.value = ''
      
      try {
        const result = await paymentStore.confirmKhqrPayment(khqrData.value.paymentId)
        if (result && result.status === 'completed') {
          // Update booking status for confirmation page
          if (bookingStore.currentBooking) {
            bookingStore.currentBooking.status = 'completed'
          }
          bookingStore.clearBookingFlow()
          paymentStore.clearPaymentState()
          router.push({ name: 'BookingConfirmation' })
        } else {
          throw new Error('Payment confirmation failed')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }, message?: string }
        bookingError.value = error.response?.data?.message || error.message || 'Payment confirmation failed.'
      } finally {
        isSubmitting.value = false
      }
    }

    // Initiate Stripe Checkout - redirects to Stripe hosted payment page
    const initiateStripeCheckout = async () => {
      if (!canPay.value || !currentBooking.value) {
        bookingError.value = 'Booking must be approved before payment.'
        return
      }

      isSubmitting.value = true
      bookingError.value = ''
      
      try {
        const result = await paymentStore.createStripeCheckout(currentBooking.value.id)
        
        if (result && result.checkoutUrl) {
          // Redirect to Stripe Checkout page
          window.location.href = result.checkoutUrl
        } else {
          throw new Error(paymentStore.error || 'Failed to create checkout session')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }, message?: string }
        bookingError.value = error.response?.data?.message || error.message || 'Failed to initiate payment. Please try again.'
        isSubmitting.value = false
      }
      // Note: Don't set isSubmitting to false on success since we're redirecting
    }

    return {
      backgroundHeader,
      isProfileOpen,
      isSubmitting,
      isLoadingBooking,
      bookingError,
      selectedPaymentMethod,
      khqrData,
      canPay,
      currentBooking,
      paymentStore,
      onPaymentMethodChanged,
      formatExpiry,
      initiateKhqrPayment,
      confirmKhqrPayment,
      initiateStripeCheckout,
      goToHome,
    }
  },
})
</script>

<style scoped>
/* Base Container */
.booking-page-container {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Lato', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Hero Banner */
.hero-banner {
  height: 200px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* Stepper UI */
.stepper-wrapper {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  background-color: #fff;
}
.stepper {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 900px;
  justify-content: center;
}
.step {
  display: flex;
  align-items: center;
  gap: 12px;
}
.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
}
.step-icon.completed,
.step-icon.inactive {
  background-color: #0046be;
  color: white;
}
.step-text {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
  white-space: nowrap;
}
.step-connector {
  flex-grow: 1;
  max-width: 150px;
  height: 1px;
  background-color: #333;
  margin: 0 15px;
  position: relative;
}
.step-connector::after {
  content: '';
  position: absolute;
  right: 0;
  top: -4px;
  width: 8px;
  height: 8px;
  border-top: 1.5px solid #333;
  border-right: 1.5px solid #333;
  transform: rotate(45deg);
}

/* Layout Grid */
.content-body {
  flex: 1;
  padding: 20px 80px;
  background-color: #f9f9f9;
}

.booking-layout-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

/* UPDATED: Full width for both Payment and Policy sections */
.Proof-payment-section,
.fill-request {
  grid-column: 1 / -1; /* This makes it span both columns */
  width: 100%;
  margin-top: 10px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .booking-layout-grid {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }
  .fill-request,
  .Proof-payment-section {
    grid-column: auto;
  }
  .content-body {
    padding: 20px 0;
  }
  .hero-banner {
    height: 150px;
  }
}

.confirm-section {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 20px;
  padding: 20px 0;
}

.btn-confirm {
  background: linear-gradient(135deg, #003580 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 16px 60px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 53, 128, 0.3);
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3 0%, #003580 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 53, 128, 0.4);
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-stripe {
  background: linear-gradient(135deg, #635bff 0%, #7c3aed 100%);
  box-shadow: 0 4px 15px rgba(99, 91, 255, 0.3);
}

.btn-stripe:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #635bff 100%);
  box-shadow: 0 6px 20px rgba(99, 91, 255, 0.4);
}

.btn-stripe i {
  margin-right: 8px;
}

.error-msg {
  color: #cc0000;
  margin-bottom: 10px;
  font-weight: 600;
}

.warning-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.warning-msg i {
  font-size: 1.2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #666;
}

.loading-state i {
  font-size: 2rem;
  color: #003580;
  margin-bottom: 10px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-secondary {
  background: white;
  color: #003580;
  border: 2px solid #003580;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #f0f4fa;
}

/* QR Code Section */
.qr-section {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qr-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.qr-card h3 {
  margin-bottom: 20px;
  color: #003580;
}

.qr-code-display {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-placeholder i {
  font-size: 80px;
  color: #003580;
  margin-bottom: 10px;
}

.qr-placeholder p {
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

.amount-display {
  font-size: 24px;
  font-weight: bold;
  color: #003580;
  margin-bottom: 10px;
}

.expiry-note {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
}

.btn-paid {
  background: #28a745;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-paid:hover:not(:disabled) {
  background: #218838;
}

.btn-paid:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
