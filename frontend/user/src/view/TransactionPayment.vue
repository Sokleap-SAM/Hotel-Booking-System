<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="booking-page-container">
    <header class="blue-header" :style="backgroundHeader">
      <nav class="nav-bar">
        <div class="logo">CamBook.com</div>
        <button class="profile-btn"><i class="ri-user-line"></i></button>
      </nav>
    </header>

    <div class="stepper-wrapper">
      <div class="stepper">
        <div class="step">
          <div class="step-icon completed"><i class="ri-check-line"></i></div>
          <span class="step-text">Your Selection</span>
        </div>
        <div class="step-connector"></div>
        <div class="step">
          <div class="step-icon active">2</div>
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
          <UserDetailsForm />
        </div>

        <div class="fill-request">
          <SpecialRequests />
        </div>
      </div>
    </main>

    <FooterScreen />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import background from '@/assets/Background2.png'
import FooterScreen from '@/components/homepage/FooterScreen.vue'
import BookingSummary from '@/components/Transaction/BookingSummary.vue'
import UserDetailsForm from '@/components/Transaction/UserDetailsForm.vue'
import SpecialRequests from '@/components/Transaction/SpecialRequests.vue'

export default defineComponent({
  name: 'TransactionPayment',
  components: {
    FooterScreen,
    BookingSummary,
    UserDetailsForm,
    SpecialRequests,
  },
  setup() {
    // Dynamic background for the header
    const backgroundHeader = {
      backgroundImage: `url(${background})`,
    }

    return {
      backgroundHeader,
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

/* Header UI */
.blue-header {
  height: 200px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  padding: 20px 80px;
}
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-size: 2.2rem;
  font-weight: bold;
  color: white;
}
.profile-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.profile-btn i {
  font-size: 22px;
  color: #0d4798;
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
.step-icon.active {
  background-color: #0046be;
  color: white;
}
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

/* Layout Grid Logic */
.content-body {
  flex: 1;
  padding: 20px 80px;
  background-color: #f9f9f9;
}

.booking-layout-grid {
  display: grid;
  grid-template-columns: 400px 1fr; /* 400px for left side, remaining for right */
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

/* THE MODIFICATION: Full width for Special Requests */
.fill-request {
  grid-column: 1 / -1; /* Spans from column 1 to the end */
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
  .fill-request {
    grid-column: auto;
  }
  .content-body {
    padding: 20px 0;
  }
  .blue-header {
    padding: 20px;
    height: 150px;
  }
}
</style>
