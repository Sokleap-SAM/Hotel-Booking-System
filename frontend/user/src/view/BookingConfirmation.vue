<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="confirmation-page">
    <div class="hero-banner" :style="backgroundHeader"></div>

    <main class="confirmation-content">
      <div class="confirmation-card">
        <!-- Pending status -->
        <template v-if="currentBooking?.status === 'pending'">
          <div class="pending-icon">
            <i class="ri-time-line"></i>
          </div>
          <h1>Booking Submitted!</h1>
          <p class="subtitle">Your reservation is pending admin approval.</p>
          <p class="info-text">You will be able to proceed to payment once approved. Check "My Bookings" for updates.</p>
        </template>

        <!-- Confirmed or completed status -->
        <template v-else>
          <div class="success-icon">
            <i class="ri-checkbox-circle-fill"></i>
          </div>
          <h1>Booking Confirmed!</h1>
          <p class="subtitle">Your reservation has been successfully placed.</p>
        </template>

        <div class="booking-info" v-if="currentBooking">
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value">{{ currentBooking.id.slice(0, 8).toUpperCase() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total Price</span>
            <span class="info-value price">USD${{ Number(currentBooking.totalPrice).toFixed(2) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span :class="['status-badge', `status-${currentBooking.status}`]">{{ currentBooking.status }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" @click="goToMyBookings">View My Bookings</button>
          <button class="btn-secondary" @click="goHome">Back to Home</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/bookingStore'
import background from '@/assets/Background2.png'

export default defineComponent({
  name: 'BookingConfirmation',
  setup() {
    const router = useRouter()
    const bookingStore = useBookingStore()
    const backgroundHeader = { backgroundImage: `url(${background})` }

    const currentBooking = computed(() => bookingStore.currentBooking)

    const goToMyBookings = () => router.push({ name: 'MyBookings' })
    const goHome = () => router.push({ name: 'home' })

    return { backgroundHeader, currentBooking, goToMyBookings, goHome }
  },
})
</script>

<style scoped>
.confirmation-page {
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: 'Lato', sans-serif;
  display: flex;
  flex-direction: column;
}

.hero-banner {
  height: 200px;
  background-position: center;
  background-size: cover;
}

.confirmation-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 20px;
}

.confirmation-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 50px;
  max-width: 550px;
  width: 100%;
  text-align: center;
}

.success-icon i {
  font-size: 80px;
  color: #22bb33;
}

.pending-icon i {
  font-size: 80px;
  color: #f0ad4e;
}

.info-text {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.confirmation-card h1 {
  margin: 15px 0 5px;
  color: #1a1a1a;
  font-size: 1.8rem;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.booking-info {
  background: #f5f7fb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  font-weight: 700;
}

.info-value.price {
  color: #003580;
  font-size: 1.1rem;
}

.status-badge {
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-badge.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  background: #003580;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: white;
  color: #003580;
  border: 2px solid #003580;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #f0f4fa;
}
</style>
