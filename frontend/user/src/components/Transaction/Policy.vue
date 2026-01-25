<template>
  <div class="policy-container">
    <div class="checkbox-section">
      <div class="checkbox-item">
        <input type="checkbox" id="verifyPay" v-model="policyData.verifiedPayment" />
        <label for="verifyPay">I already pay it</label>
      </div>

      <div class="checkbox-item marketing-text">
        <input type="checkbox" id="marketing" v-model="policyData.marketingConsent" />
        <label for="marketing">
          I agree to receiving marketing emails from Booking.com, including promotions, personalized recommendations, rewards, travel experiences, and updates about Booking.com's products and services.
        </label>
      </div>
    </div>

    <div class="legal-disclaimer">
      <p>
        By signing up, you allow us to tailor offers and content to your interests by monitoring how you use Booking.com through tracking technologies. Unsubscribe anytime through your account settings or the link in any marketing email. Read our <a>privacy policy</a>.
      </p>
      <p>
        Your booking is directly with Angkor Village Hotel - Small Luxury Hotels of the World and by completing this booking you agree to the booking conditions, <a>general terms</a>, <a>privacy policy</a>, and <a>Wallet terms</a>.
      </p>
    </div>

    <div class="action-wrapper">
      <button @click="handleCompleteBooking" class="complete-btn">
        <i class="ri-lock-fill"></i> Complete booking
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  name: 'PaymentPolicy',
  setup() {
    const policyData = reactive({
      verifiedPayment: false,
      marketingConsent: false,
    })

    const handleCompleteBooking = () => {
      if (!policyData.verifiedPayment) {
        alert('Please verify your payment before completing.');
        return;
      }
      console.log('Finalizing Booking:', policyData);
      // Future: axios.post('/bookings/complete', policyData)
    }

    return {
      policyData,
      handleCompleteBooking,
    }
  },
})
</script>

<style scoped>
.policy-container {
  margin-top: 30px;
  width: 100%;
  font-family: Arial, sans-serif;
}

.checkbox-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.checkbox-item input {
  margin-top: 4px;
  cursor: pointer;
}

.checkbox-item label {
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  line-height: 1.4;
}

.marketing-text label {
  font-size: 0.85rem;
}

.legal-disclaimer {
  font-size: 0.8rem;
  color: #444;
  line-height: 1.6;
  margin-bottom: 30px;
}

.legal-disclaimer a {
  color: #006ce4;
  text-decoration: underline;
  cursor: pointer;
}

.action-wrapper {
  display: flex;
  justify-content: flex-end;
}

.complete-btn {
  background-color: #006ce4;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s;
}

.complete-btn:hover {
  background-color: #0056b3;
}

.ri-lock-fill {
  font-size: 1.2rem;
}
</style>
