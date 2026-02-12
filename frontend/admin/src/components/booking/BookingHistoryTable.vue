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
import type { Booking } from '@/stores/bookingStore'

defineProps<{
  bookings: Booking[]
  isLoading: boolean
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

.rejection-reason {
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 5px;
  font-style: italic;
}
</style>
