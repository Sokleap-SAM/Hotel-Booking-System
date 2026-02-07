<template>
  <div class="payment-wrapper">
    <div class="status-card">
      <div class="status-content">
        <strong>Pay online</strong>
        <p>You'll pay when you complete this booking.</p>
        <div class="payment-badges">
          <div class="khqr-mini-logo">KHQR</div>
          <div class="card-mini-logo">
            <i class="ri-bank-card-fill"></i>
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

        <!-- Card Option -->
        <div 
          class="payment-option" 
          :class="{ selected: selectedMethod === 'card' }"
          @click="selectMethod('card')"
        >
          <input 
            type="radio" 
            :checked="selectedMethod === 'card'" 
            class="top-left-checkbox" 
            name="payment-method"
          />
          <div class="card-box">
            <i class="ri-bank-card-fill"></i>
            Card
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

      <!-- Card Instructions -->
      <div v-if="selectedMethod === 'card'" class="instructions">
        <p class="method-title">Card Payment</p>
        <p class="next-steps-title">Enter your card details</p>
        
        <div class="card-form">
          <div class="form-group">
            <label>Card Number</label>
            <input 
              type="text" 
              v-model="cardDetails.cardNumber"
              @input="formatCardNumber"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              class="card-input"
            />
            <div class="card-brands">
              <span class="brand-icon" :class="{ active: detectedBrand === 'Visa' }">Visa</span>
              <span class="brand-icon" :class="{ active: detectedBrand === 'Mastercard' }">MC</span>
              <span class="brand-icon" :class="{ active: detectedBrand === 'Amex' }">Amex</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Expiry Date</label>
              <input 
                type="text" 
                v-model="cardDetails.cardExpiry"
                @input="formatExpiry"
                placeholder="MM/YY"
                maxlength="5"
                class="card-input"
              />
            </div>
            <div class="form-group half">
              <label>CVV</label>
              <input 
                type="password" 
                v-model="cardDetails.cardCvv"
                placeholder="123"
                maxlength="4"
                class="card-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Cardholder Name</label>
            <input 
              type="text" 
              v-model="cardDetails.cardHolderName"
              placeholder="JOHN DOE"
              class="card-input"
              style="text-transform: uppercase;"
            />
          </div>
        </div>
      </div>

      <!-- Test info -->
      <div v-if="selectedMethod === 'card'" class="test-info">
        <p><strong>Test Cards:</strong></p>
        <p>Success: Use any valid card number (e.g., 4111111111111111)</p>
        <p>Fail: Use card ending in 0000 (e.g., 4111111111110000)</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { usePaymentStore, type PaymentMethod, type CardDetails } from '@/stores/paymentStore'

export default defineComponent({
  name: 'PaymentForm',
  emits: ['method-changed', 'card-details-changed'],
  setup(_, { emit }) {
    const paymentStore = usePaymentStore()
    
    const selectedMethod = ref<PaymentMethod>('card')
    
    const cardDetails = ref<CardDetails>({
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardHolderName: '',
    })

    const selectMethod = (method: PaymentMethod) => {
      selectedMethod.value = method
      paymentStore.setPaymentMethod(method)
      emit('method-changed', method)
    }

    const detectedBrand = computed(() => {
      const num = cardDetails.value.cardNumber.replace(/\s/g, '')
      if (!num) return ''
      if (num.startsWith('4')) return 'Visa'
      if (/^5[1-5]/.test(num)) return 'Mastercard'
      if (/^3[47]/.test(num)) return 'Amex'
      return ''
    })

    const formatCardNumber = (e: Event) => {
      const input = e.target as HTMLInputElement
      let value = input.value.replace(/\D/g, '')
      value = value.substring(0, 16)
      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ')
      cardDetails.value.cardNumber = formatted
    }

    const formatExpiry = (e: Event) => {
      const input = e.target as HTMLInputElement
      let value = input.value.replace(/\D/g, '')
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4)
      }
      cardDetails.value.cardExpiry = value
    }

    watch(cardDetails, (newVal) => {
      emit('card-details-changed', newVal)
    }, { deep: true })

    return {
      selectedMethod,
      cardDetails,
      selectMethod,
      detectedBrand,
      formatCardNumber,
      formatExpiry,
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

.card-mini-logo {
  background: #003580;
  color: white;
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 4px;
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
  border-color: #003580;
}

.payment-option.selected {
  border-color: #003580;
  background: #f0f7ff;
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

.card-box {
  background: #003580;
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

/* Card Form Styles */
.card-form {
  margin-top: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
}

.card-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.card-input:focus {
  outline: none;
  border-color: #003580;
}

.card-brands {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.brand-icon {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #999;
  transition: all 0.2s;
}

.brand-icon.active {
  background: #003580;
  color: white;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.half {
  flex: 1;
}

.test-info {
  margin-top: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
}

.test-info p {
  margin: 4px 0;
}
</style>
