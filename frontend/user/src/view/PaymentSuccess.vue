<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="payment-result-container">
    <div class="hero-banner" :style="backgroundHeader"></div>

    <main class="result-content">
      <div class="result-card success">
        <div v-if="isVerifying" class="verifying-state">
          <i class="ri-loader-4-line spinning"></i>
          <p>Verifying payment...</p>
        </div>
        <template v-else>
          <div class="icon-wrapper success-icon">
            <i class="ri-checkbox-circle-fill"></i>
          </div>
          <h1>Payment Successful!</h1>
          <p class="message">
            Thank you for your payment. Your booking has been confirmed.
          </p>
          <p class="session-info" v-if="sessionId">
            Reference: {{ sessionId.substring(0, 20) }}...
          </p>
          
          <div class="action-buttons">
            <button class="btn-primary" @click="goToMyBookings">
              <i class="ri-calendar-check-line"></i> View My Bookings
            </button>
            <button class="btn-secondary" @click="goToHome">
              <i class="ri-home-line"></i> Back to Home
            </button>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import background from '@/assets/Background2.png'
import api from '@/utils/api'

export default defineComponent({
  name: 'PaymentSuccess',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const isVerifying = ref(true)

    const backgroundHeader = {
      backgroundImage: `url(${background})`,
    }

    const sessionId = computed(() => route.query.session_id as string)

    const verifyPayment = async () => {
      if (!sessionId.value) {
        isVerifying.value = false
        return
      }

      try {
        // Call backend to verify and update payment status
        await api.get(`/payments/stripe/verify?session_id=${sessionId.value}`)
      } catch (error) {
        console.error('Payment verification error:', error)
      } finally {
        isVerifying.value = false
      }
    }

    onMounted(() => {
      verifyPayment()
    })

    const goToHome = () => {
      router.push('/home')
    }

    const goToMyBookings = () => {
      router.push('/MyBookings')
    }

    return {
      backgroundHeader,
      sessionId,
      isVerifying,
      goToHome,
      goToMyBookings,
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

.success-icon {
  background: #e8f5e9;
  color: #4caf50;
}

.result-card h1 {
  font-size: 1.8rem;
  margin-bottom: 16px;
  color: #333;
}

.result-card.success h1 {
  color: #2e7d32;
}

.message {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.session-info {
  font-size: 0.85rem;
  color: #999;
  font-family: monospace;
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
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
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

.verifying-state {
  text-align: center;
  padding: 40px;
}

.verifying-state i {
  font-size: 3rem;
  color: #003580;
}

.verifying-state p {
  margin-top: 16px;
  color: #666;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
