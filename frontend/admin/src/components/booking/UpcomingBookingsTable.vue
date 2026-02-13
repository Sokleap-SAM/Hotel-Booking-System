<template>
  <table class="booking-table">
    <thead>
      <tr>
        <th>Guest</th>
        <th>Hotel / Room</th>
        <th>Check-in / Check-out</th>
        <th>Total</th>
        <th>Booked At</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="isLoading">
        <td colspan="6" style="text-align: center;">Loading bookings...</td>
      </tr>

      <tr v-else-if="bookings.length === 0">
        <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
          No pending bookings to review.
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
        <td>{{ formatDateTime(booking.createdAt) }}</td>
        <td class="action-cell">
          <button class="approve-btn" @click="$emit('approve', booking.id)" :disabled="isLoading">
            Approve
          </button>
          <button class="reject-btn" @click="$emit('reject', booking.id)" :disabled="isLoading">
            Reject
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { Booking } from '@/stores/bookingStore'

defineProps<{
  bookings: Booking[]
  isLoading: boolean
}>()

defineEmits<{
  (e: 'approve', bookingId: string): void
  (e: 'reject', bookingId: string): void
}>()

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

.action-cell {
  display: flex;
  gap: 8px;
}

.approve-btn,
.reject-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.approve-btn {
  background: #28a745;
  color: white;
}

.approve-btn:hover:not(:disabled) {
  background: #218838;
}

.reject-btn {
  background: #dc3545;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background: #c82333;
}

.approve-btn:disabled,
.reject-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
