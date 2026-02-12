<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Payment Details</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div v-if="isLoading" class="loading-state">
        Loading payment details...
      </div>

      <div v-else-if="payment" class="modal-content">
        <!-- Payment Info Section -->
        <div class="detail-section">
          <h3>Transaction Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Transaction ID</label>
              <span class="mono-text">{{ payment.id }}</span>
            </div>
            <div class="detail-item">
              <label>Payment Method</label>
              <span :class="['method-badge', `badge-${payment.paymentMethod}`]">
                {{ payment.paymentMethod === 'khqr' ? 'KHQR' : 'Stripe' }}
              </span>
            </div>
            <div class="detail-item">
              <label>Amount</label>
              <span class="amount">${{ formatCurrency(payment.amount) }}</span>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <span :class="['status-badge', `status-${payment.status}`]">
                {{ capitalizeFirst(payment.status) }}
              </span>
            </div>
            <div class="detail-item">
              <label>Created At</label>
              <span>{{ formatDate(payment.createdAt) }}</span>
            </div>
            <div class="detail-item" v-if="payment.completedAt">
              <label>Completed At</label>
              <span>{{ formatDate(payment.completedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method Details -->
        <div class="detail-section" v-if="payment.paymentMethod === 'stripe' && payment.cardLast4">
          <h3>Card Details</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Card Brand</label>
              <span>{{ payment.cardBrand || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Card Last 4</label>
              <span>**** {{ payment.cardLast4 }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="payment.paymentMethod === 'khqr' && payment.qrReference">
          <h3>KHQR Details</h3>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <label>QR Reference</label>
              <span class="mono-text">{{ payment.qrReference }}</span>
            </div>
          </div>
        </div>

        <!-- Failure Reason -->
        <div class="detail-section error-section" v-if="payment.failureReason">
          <h3>Failure Reason</h3>
          <p class="error-text">{{ payment.failureReason }}</p>
        </div>

        <!-- Booking Info Section -->
        <div class="detail-section">
          <h3>Booking Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Booking ID</label>
              <span class="mono-text">{{ payment.bookingId }}</span>
            </div>
            <div class="detail-item" v-if="payment.booking">
              <label>Booking Status</label>
              <span :class="['status-badge', `booking-${payment.booking.status}`]">
                {{ capitalizeFirst(payment.booking.status) }}
              </span>
            </div>
            <div class="detail-item" v-if="payment.booking">
              <label>Total Price</label>
              <span>${{ formatCurrency(payment.booking.totalPrice) }}</span>
            </div>
          </div>

          <!-- Booking Items -->
          <div v-if="payment.booking?.bookingItems?.length" class="booking-items">
            <label>Rooms Booked</label>
            <ul>
              <li v-for="item in payment.booking.bookingItems" :key="item.id">
                {{ item.room?.name || 'Room' }}
              </li>
            </ul>
          </div>
        </div>

        <!-- User Info Section -->
        <div class="detail-section" v-if="payment.user">
          <h3>Customer Information</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Customer Name</label>
              <span>{{ payment.user.firstName || '' }} {{ payment.user.lastName || '' }}</span>
            </div>
            <div class="detail-item">
              <label>Email</label>
              <span>{{ payment.user.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '../../stores/paymentStore'

defineProps<{
  payment: Payment | null
  isLoading: boolean
}>()

defineEmits<{
  close: []
}>()

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
}

.close-btn:hover {
  color: #333;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #666;
}

.modal-content {
  padding: 25px;
}

.detail-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-section h3 {
  margin: 0 0 15px;
  font-size: 1rem;
  color: #0D4798;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
}

.detail-item span {
  font-size: 14px;
  color: #333;
}

.mono-text {
  font-family: monospace;
  font-size: 13px !important;
  word-break: break-all;
}

.amount {
  font-weight: 700;
  font-size: 16px !important;
  color: #1a1a1a;
}

/* Method Badges */
.method-badge {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  width: fit-content;
}

.badge-khqr {
  background: #fff3e0;
  color: #e65100;
}

.badge-stripe {
  background: #e3f2fd;
  color: #1565c0;
}

/* Status Badges */
.status-badge {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.status-pending,
.booking-pending {
  background: #fff8e1;
  color: #f57c00;
}

.status-processing {
  background: #e3f2fd;
  color: #1976d2;
}

.status-completed,
.booking-confirmed,
.booking-completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-failed,
.booking-cancelled {
  background: #ffebee;
  color: #c62828;
}

.status-refunded {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* Error Section */
.error-section {
  background: #ffebee;
  padding: 15px;
  border-radius: 8px;
  border: none;
}

.error-section h3 {
  color: #c62828;
}

.error-text {
  margin: 0;
  color: #c62828;
  font-size: 14px;
}

/* Booking Items */
.booking-items {
  margin-top: 15px;
}

.booking-items label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.booking-items ul {
  margin: 0;
  padding-left: 20px;
}

.booking-items li {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

/* Footer */
.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 10px 24px;
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  color: #666;
}

.btn-close:hover {
  background: #f5f5f5;
}
</style>
