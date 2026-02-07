<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="my-bookings-page">
    <header class="blue-header" :style="backgroundHeader">
      <nav class="nav-bar">
        <div class="logo">CamBook.com</div>
        <button class="profile-btn" @click="$router.push({ name: 'home' })">
          <i class="ri-home-line"></i>
        </button>
      </nav>
    </header>

    <main class="content">
      <h1 class="page-title">My Bookings</h1>

      <div v-if="bookingStore.isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading your bookings...</p>
      </div>

      <div v-else-if="bookingStore.bookings.length === 0" class="empty-state">
        <i class="ri-calendar-todo-line"></i>
        <p>You don't have any bookings yet.</p>
        <button class="btn-browse" @click="$router.push({ name: 'Bookingpage' })">Browse Hotels</button>
      </div>

      <div v-else class="bookings-list">
        <div v-for="booking in bookingStore.bookings" :key="booking.id" class="booking-card">
          <div class="card-header">
            <div class="booking-id">
              <span class="label">Booking</span>
              <span class="id">#{{ booking.id.slice(0, 8).toUpperCase() }}</span>
            </div>
            <span :class="['status-badge', `status-${booking.status}`]">{{ booking.status }}</span>
          </div>

          <div v-if="booking.status === 'pending'" class="status-info pending-info">
            <i class="ri-time-line"></i>
            <span>Waiting for admin approval</span>
          </div>

          <div v-if="booking.status === 'confirmed'" class="status-info confirmed-info">
            <i class="ri-checkbox-circle-line"></i>
            <span>Approved! Please proceed to payment.</span>
          </div>

          <div v-if="booking.status === 'cancelled' && booking.rejectionReason" class="status-info rejected-info">
            <i class="ri-close-circle-line"></i>
            <span>Rejection reason: {{ booking.rejectionReason }}</span>
          </div>

          <div class="card-body">
            <div v-for="item in booking.bookingItems" :key="item.id" class="booking-item">
              <div class="item-info">
                <h3>{{ item.room?.name || 'Room' }}</h3>
                <p class="hotel-name" v-if="item.room?.hotel">{{ item.room.hotel.name }}</p>
                <p class="dates">
                  <i class="ri-calendar-line"></i>
                  {{ formatDate(item.checkIn) }} — {{ formatDate(item.checkOut) }}
                </p>
              </div>
              <div class="item-price">USD${{ Number(item.priceAtBooking).toFixed(2) }}</div>
            </div>
          </div>

          <div class="card-footer">
            <div class="total">
              <span>Total</span>
              <span class="total-price">USD${{ Number(booking.totalPrice).toFixed(2) }}</span>
            </div>
            <div class="footer-actions">
              <button
                v-if="booking.status === 'confirmed'"
                class="btn-pay"
                @click="handlePayNow(booking.id)"
              >
                Pay Now
              </button>
              <button
                v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                class="btn-cancel"
                @click="handleCancel(booking.id)"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <FooterScreen />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useBookingStore } from '@/stores/bookingStore'
import { useRouter } from 'vue-router'
import background from '@/assets/Background2.png'
import FooterScreen from '@/components/homepage/FooterScreen.vue'

export default defineComponent({
  name: 'MyBookings',
  components: { FooterScreen },
  setup() {
    const bookingStore = useBookingStore()
    const router = useRouter()
    const backgroundHeader = { backgroundImage: `url(${background})` }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    const handleCancel = async (id: string) => {
      if (confirm('Are you sure you want to cancel this booking?')) {
        try {
          await bookingStore.cancelBooking(id)
        } catch {
          alert('Failed to cancel booking.')
        }
      }
    }

    const handlePayNow = (bookingId: string) => {
      router.push({ name: 'LastPayment', query: { bookingId } })
    }

    onMounted(() => {
      bookingStore.fetchMyBookings()
    })

    return { bookingStore, backgroundHeader, formatDate, handleCancel, handlePayNow }
  },
})
</script>

<style scoped>
.my-bookings-page {
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: 'Lato', sans-serif;
  display: flex;
  flex-direction: column;
}

.blue-header {
  height: 180px;
  background-position: center;
  background-size: cover;
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

.content {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 1.8rem;
  color: #1a1a1a;
  margin-bottom: 30px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #003580;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state i {
  font-size: 60px;
  color: #ccc;
}

.empty-state p {
  color: #666;
  font-size: 1.1rem;
  margin: 15px 0 25px;
}

.btn-browse {
  background: #003580;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.booking-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f5f7fb;
  border-bottom: 1px solid #e8e8e8;
}

.booking-id .label {
  color: #666;
  font-size: 0.85rem;
}

.booking-id .id {
  font-weight: 700;
  color: #003580;
  margin-left: 5px;
}

.status-badge {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
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
  background: #d1ecf1;
  color: #0c5460;
}

.card-body {
  padding: 15px 20px;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.booking-item:last-child {
  border-bottom: none;
}

.item-info h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.hotel-name {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 4px;
}

.dates {
  color: #888;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-price {
  font-weight: 700;
  color: #003580;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.total {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.total span:first-child {
  color: #666;
  font-size: 0.9rem;
}

.total-price {
  font-size: 1.3rem;
  font-weight: 800;
  color: #003580;
}

.btn-cancel {
  background: white;
  color: #cc0000;
  border: 1.5px solid #cc0000;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #cc0000;
  color: white;
}

.status-info {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.status-info i {
  font-size: 1.1rem;
}

.pending-info {
  background: #fff8e6;
  color: #856404;
  border-bottom: 1px solid #ffeeba;
}

.confirmed-info {
  background: #d4edda;
  color: #155724;
  border-bottom: 1px solid #c3e6cb;
}

.rejected-info {
  background: #f8d7da;
  color: #721c24;
  border-bottom: 1px solid #f5c6cb;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn-pay {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.btn-pay:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}
</style>
