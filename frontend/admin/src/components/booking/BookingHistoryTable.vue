<template>
  <table class="booking-table">
    <thead>
      <tr>
        <th>Guest</th>
        <th>Hotel / Room</th>
        <th>Check-in / Check-out</th>
        <th>Total</th>
        <th>Status</th>
        <th>Booked At</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="isLoading">
        <td colspan="6" style="text-align: center;">Loading bookings...</td>
      </tr>

      <tr v-else-if="bookings.length === 0">
        <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
          No booking history found.
        </td>
      </tr>

      <tr v-for="booking in bookings" :key="booking.id" v-else>
        <td>
          <div class="guest-info">
            <strong>{{ booking.user?.firstName || 'N/A' }} {{ booking.user?.lastName || '' }}</strong>
            <span class="guest-email">{{ booking.user?.email }}</span>
            <span class="guest-phone" v-if="booking.guestPhone">{{ booking.guestPhone }}</span>
          </div>
        </td>
        <td>
          <div v-for="item in booking.bookingItems" :key="item.id" class="room-info">
            <strong>{{ item.room?.hotel?.name || 'N/A' }}</strong>
            <span>{{ item.room?.name }}</span>
          </div>
        </td>
        <td>
          <div v-for="item in booking.bookingItems" :key="item.id" class="date-info">
            {{ formatDate(item.checkIn) }} → {{ formatDate(item.checkOut) }}
          </div>
        </td>
        <td class="price-cell">${{ Number(booking.totalPrice).toFixed(2) }}</td>
        <td>
          <span :class="['status-badge', `status-${booking.status}`]">
            {{ booking.status }}
          </span>
          <div v-if="booking.status === 'confirmed' && booking.paymentExpiresAt" class="payment-countdown">
            <span class="countdown-label">Payment expires:</span>
            <span :class="['countdown-value', { 'expired': isExpired(booking.paymentExpiresAt) }]">
              {{ getCountdown(booking.paymentExpiresAt) }}
            </span>
          </div>
          <div v-if="booking.rejectionReason" class="rejection-reason">
            {{ booking.rejectionReason }}
          </div>
        </td>
        <td>{{ formatDateTime(booking.createdAt) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Booking } from '@/stores/bookingStore'

defineProps<{
  bookings: Booking[]
  isLoading: boolean
}>()

// Countdown timer state
const currentTime = ref(new Date())
let countdownInterval: ReturnType<typeof setInterval> | null = null

const getCountdown = (expiresAt: string) => {
  const expiry = new Date(expiresAt)
  const diff = expiry.getTime() - currentTime.value.getTime()
  
  if (diff <= 0) {
    return 'Expired'
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  return `${minutes}m ${seconds}s`
}

const isExpired = (expiresAt: string) => {
  return new Date(expiresAt).getTime() <= currentTime.value.getTime()
}

onMounted(() => {
  countdownInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.booking-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000;
}

.booking-table th {
  background: #0D4798;
  color: white;
  text-align: left;
  padding: 15px;
  border-bottom: 3px solid #000000;
}

.booking-table td {
  padding: 18px 15px;
  border-bottom: 1px solid #D9D9D9;
  vertical-align: top;
}

.guest-info,
.room-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.guest-email {
  font-size: 0.85rem;
  color: #666;
}

.guest-phone {
  font-size: 0.85rem;
  color: #666;
}

.room-info span {
  font-size: 0.9rem;
  color: #555;
}

.date-info {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 4px;
}

.price-cell {
  font-weight: 700;
  color: #0D4798;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-failed {
  background: #f8d7da;
  color: #dc3545;
}

.payment-countdown {
  margin-top: 8px;
  font-size: 0.8rem;
}

.countdown-label {
  color: #666;
}

.countdown-value {
  display: inline-block;
  margin-left: 4px;
  padding: 2px 8px;
  background: #fff3cd;
  color: #856404;
  border-radius: 4px;
  font-weight: 600;
}

.countdown-value.expired {
  background: #f8d7da;
  color: #dc3545;
}

.rejection-reason {
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 5px;
  font-style: italic;
}
</style>
