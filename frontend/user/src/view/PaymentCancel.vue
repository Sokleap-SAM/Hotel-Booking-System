<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="payment-result-container">
    <div class="hero-banner" :style="backgroundHeader"></div>

    <main class="result-content">
      <div class="result-card cancelled">
        <div class="icon-wrapper cancel-icon">
          <i class="ri-close-circle-fill"></i>
        </div>
        <h1>Payment Cancelled</h1>
        <p class="message">
          Your payment was cancelled. Don't worry - no charges were made to your account.
        </p>
        <p class="sub-message">
          Your booking is still pending. You can try again whenever you're ready.
        </p>
        
        <div class="action-buttons">
          <button class="btn-primary" @click="goBackToPayment">
            <i class="ri-refresh-line"></i> Try Again
          </button>
          <button class="btn-secondary" @click="goToMyBookings">
            <i class="ri-calendar-line"></i> View My Bookings
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import background from '@/assets/Background2.png'

export default defineComponent({
  name: 'PaymentCancel',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const backgroundHeader = {
      backgroundImage: `url(${background})`,
    }

    const bookingId = computed(() => route.query.bookingId as string)

    const goToHome = () => {
      router.push('/home')
    }

    const goToMyBookings = () => {
      router.push('/MyBookings')
    }

    const goBackToPayment = () => {
      if (bookingId.value) {
        router.push({ name: 'LastPayment', query: { bookingId: bookingId.value } })
      } else {
        router.push('/MyBookings')
      }
    }

    return {
      backgroundHeader,
      bookingId,
      goToHome,
      goToMyBookings,
      goBackToPayment,
    }
  },
})
</script>

<style scoped>
.payment-result-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: 'Lato', sans-serif;
  display: flex;
  flex-direction: column;
}

.hero-banner {
  background-size: cover;
  background-position: center;
  height: 150px;
}

.result-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.result-card {
  background: white;
  border-radius: 16px;
  padding: 50px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.icon-wrapper i {
  font-size: 48px;
}

.cancel-icon {
  background: #ffebee;
  color: #f44336;
}

.result-card h1 {
  font-size: 1.8rem;
  margin-bottom: 16px;
  color: #333;
}

.result-card.cancelled h1 {
  color: #c62828;
}

.message {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.6;
}

.sub-message {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #003580 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 14px 30px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 53, 128, 0.3);
}

.btn-secondary {
  background: white;
  color: #003580;
  border: 2px solid #003580;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: #003580;
  color: white;
}
</style>
