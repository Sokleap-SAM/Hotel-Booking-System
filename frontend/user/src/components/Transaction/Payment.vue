<template>
  <div class="payment-wrapper">
    <div class="status-card">
      <div class="status-content">
        <strong>Pay online</strong>
        <p>You'll pay when you complete this booking.</p>
        <div class="khqr-mini-logo">KHQR</div>
      </div>
    </div>

    <div class="details-card">
      <h2 class="form-title">How do you want to pay?</h2>

      <div class="payment-selection-area">
        <div class="payment-option selected">
          <input type="checkbox" checked class="top-left-checkbox" />
          <div class="khqr-red-box">KHQR</div>
        </div>
      </div>

      <div class="instructions">
        <p class="khqr-bold">KHQR</p>
        <p class="next-steps-title">Here’s what happens next</p>
        <ul class="steps-list">
          <li>Just scan it and pay it and take a screenshot of the payment proof.</li>
          <li>Check the box to verify that you already pay it</li>
          <li>You’ll get a confirmation once it’s complete.</li>
        </ul>
      </div>

      <div class="qr-display-container">
        <img src="@/assets/QR.png" alt="KHQR Payment Code" class="full-qr-image" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PaymentForm',
  setup() {
    return {}
  },
})
</script>

<style scoped>
.payment-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Status Card */
.status-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}
.khqr-mini-logo {
  background: #d91e1e;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: bold;
  border-radius: 4px;
  margin-top: 10px;
}

/* Main Details Card */
.details-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
}

.form-title {
  font-size: 1.8rem;
  margin-bottom: 24px;
}

/* Selection Area */
.payment-option {
  border: 1px solid #888;
  border-radius: 8px;
  width: 130px;
  height: 75px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.top-left-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
}
.khqr-red-box {
  background: #d91e1e;
  color: white;
  padding: 10px 15px;
  font-weight: bold;
  border-radius: 4px;
}
.method-label {
  margin-top: 8px;
  font-weight: bold;
}

/* Instructions */
.khqr-bold {
  font-weight: bold;
  margin-bottom: 10px;
}
.next-steps-title {
  font-weight: bold;
  font-size: 0.9rem;
}
.steps-list {
  padding-left: 18px;
  margin-bottom: 20px;
}
.steps-list li {
  font-size: 0.85rem;
  margin-bottom: 5px;
}

/* The QR Image Container */
.qr-display-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.full-qr-image {
  width: 100%;
  max-width: 320px; /* Adjust this to match the scale of your design */
  height: auto;
  border: 1px solid #eee; /* Slight border to define the image edges */
  border-radius: 4px;
}
</style>
