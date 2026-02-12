<template>
  <div class="payment-wrapper">
    <div class="status-card">
      <div class="status-content">
        <strong>Pay online</strong>
        <p>You'll pay when you complete this booking.</p>
        <div class="payment-badges">
          <div class="khqr-mini-logo">KHQR</div>
          <div class="stripe-mini-logo">
            <i class="ri-bank-card-fill"></i> Stripe
          </div>
        </div>
      </div>
    </div>

    <div class="details-card">
      <h2 class="form-title">How do you want to pay?</h2>

      <div class="payment-selection-area">
        <!-- KHQR Option -->
        <div 
          class="payment-option" 
          :class="{ selected: selectedMethod === 'khqr' }"
          @click="selectMethod('khqr')"
        >
          <input 
            type="radio" 
            :checked="selectedMethod === 'khqr'" 
            class="top-left-checkbox" 
            name="payment-method"
          />
          <div class="khqr-red-box">KHQR</div>
        </div>

        <!-- Stripe Option -->
        <div 
          class="payment-option" 
          :class="{ selected: selectedMethod === 'stripe' }"
          @click="selectMethod('stripe')"
        >
          <input 
            type="radio" 
            :checked="selectedMethod === 'stripe'" 
            class="top-left-checkbox" 
            name="payment-method"
          />
          <div class="stripe-box">
            <i class="ri-bank-card-fill"></i>
            Stripe
          </div>
        </div>
      </div>

      <!-- KHQR Instructions -->
      <div v-if="selectedMethod === 'khqr'" class="instructions">
        <p class="method-title">KHQR Payment</p>
        <p class="next-steps-title">Here's what happens next</p>
        <ul class="steps-list">
          <li>Click "Generate QR" to get your payment QR code</li>
          <li>Scan the QR code with your banking app</li>
          <li>Complete the payment in your app</li>
          <li>Click "I've Paid" to confirm your payment</li>
        </ul>
      </div>

      <!-- Stripe Instructions -->
      <div v-if="selectedMethod === 'stripe'" class="instructions">
        <p class="method-title">Stripe Payment</p>
        <p class="next-steps-title">Secure card payment via Stripe</p>
        <ul class="steps-list">
          <li>Click "Pay with Stripe" to proceed</li>
          <li>You'll be redirected to Stripe's secure checkout page</li>
          <li>Enter your card details on Stripe</li>
          <li>After payment, you'll be redirected back to confirm your booking</li>
        </ul>
        <div class="stripe-info">
          <i class="ri-shield-check-line"></i>
          <span>Your payment is secured by Stripe. We never see your card details.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { usePaymentStore, type PaymentMethod } from '@/stores/paymentStore'

export default defineComponent({
  name: 'PaymentForm',
  emits: ['method-changed'],
  setup(_, { emit }) {
    const paymentStore = usePaymentStore()
    
    const selectedMethod = ref<PaymentMethod>('stripe')

    const selectMethod = (method: PaymentMethod) => {
      selectedMethod.value = method
      paymentStore.setPaymentMethod(method)
      emit('method-changed', method)
    }

    watch(selectedMethod, (newMethod) => {
      emit('method-changed', newMethod)
    })

    return {
      selectedMethod,
      selectMethod,
    }
  },
})
</script>

<style scoped>
.payment-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.payment-badges {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.khqr-mini-logo {
  background: #d91e1e;
  color: white;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: bold;
  border-radius: 4px;
}

.stripe-mini-logo {
  background: #635bff;
  color: white;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: bold;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.details-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
}

.form-title {
  font-size: 1.8rem;
  margin-bottom: 24px;
}

.payment-selection-area {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.payment-option {
  border: 2px solid #ddd;
  border-radius: 8px;
  width: 130px;
  height: 75px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: #635bff;
}

.payment-option.selected {
  border-color: #635bff;
  background: #f5f4ff;
}

.top-left-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  cursor: pointer;
}

.khqr-red-box {
  background: #d91e1e;
  color: white;
  padding: 10px 15px;
  font-weight: bold;
  border-radius: 4px;
}

.stripe-box {
  background: #635bff;
  color: white;
  padding: 10px 15px;
  font-weight: bold;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.instructions {
  margin-bottom: 20px;
}

.method-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.next-steps-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.steps-list {
  padding-left: 18px;
  margin-bottom: 20px;
}

.steps-list li {
  font-size: 0.85rem;
  margin-bottom: 5px;
  color: #555;
}

.stripe-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f4ff;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #635bff;
}

.stripe-info i {
  font-size: 1.2rem;
}
</style>
