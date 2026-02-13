<template>
  <div class="positionHotel">
    <div class="title">My Booking</div>

    <!-- Show loading state -->
    <div v-if="isLoading" class="container loading-container">
      <div class="loading-content">
        <i class="ri-loader-4-line spinning"></i>
        <p>Loading your bookings...</p>
      </div>
    </div>

    <!-- Show empty state when not authenticated -->
    <div v-else-if="!isAuthenticated" class="container">
      <h2 class="booking-text">Haven't Booking yet?</h2>
      <div class="button-wrapper">
        <button class="explore-btn" @click="goToLogin">Login to View Bookings</button>
      </div>
    </div>

    <!-- Show empty state when no bookings -->
    <div v-else-if="bookings.length === 0" class="container">
      <h2 class="booking-text">Haven't Booking yet?</h2>
      <div class="button-wrapper">
        <button class="explore-btn" @click="exploreHotels">Explore Now</button>
      </div>
    </div>

    <!-- Show latest 3 bookings with images -->
    <template v-else>
      <div 
        v-for="booking in latestBookings" 
        :key="booking.id" 
        class="container booking-card clickable"
        @click="viewBooking(booking.id)"
      >
        <!-- Hotel Image -->
        <div class="hotel-image" :style="{ backgroundImage: `url(${getBookingHotelImage(booking)})` }">
          <span class="status-badge" :class="booking.status?.toLowerCase()">
            {{ booking.status }}
          </span>
        </div>

        <!-- Booking Info -->
        <div class="booking-info">
          <h3 class="hotel-name">{{ getBookingHotelName(booking) }}</h3>
          
          <div class="info-row">
            <i class="ri-calendar-check-line"></i>
            <span>Check-in: {{ formatDate(booking.bookingItems?.[0]?.checkIn) }}</span>
          </div>
          
          <div class="info-row">
            <i class="ri-calendar-close-line"></i>
            <span>Check-out: {{ formatDate(booking.bookingItems?.[0]?.checkOut) }}</span>
          </div>
          
          <div class="info-row">
            <i class="ri-hotel-bed-line"></i>
            <span>{{ getBookingRoomSummary(booking) }}</span>
          </div>

          <div class="price-row">
            <span class="total-label">Total</span>
            <span class="total-price">${{ booking.totalPrice }}</span>
          </div>

          <div v-if="booking.status === 'failed' && booking.rejectionReason" class="rejection-reason">
            <i class="ri-error-warning-line"></i>
            <span>{{ booking.rejectionReason }}</span>
          </div>
        </div>

        <div class="button-wrapper">
          <button class="explore-btn" @click.stop="viewBooking(booking.id)">View Details</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore, type BookingRecord } from '@/stores/bookingStore'

const router = useRouter()
const authStore = useAuthStore()
const bookingStore = useBookingStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isLoading = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const bookings = computed(() => bookingStore.userBookings)

// Limit to maximum 3 latest bookings
const latestBookings = computed(() => bookings.value?.slice(0, 4) || [])

// Helper function to get hotel image for a specific booking
const getBookingHotelImage = (booking: BookingRecord) => {
  const hotel = booking?.bookingItems?.[0]?.room?.hotel
  if (hotel?.images && hotel.images.length > 0) {
    const img = hotel.images[0]
    if (img) {
      return img.startsWith('http') ? img : `${API_URL}${img}`
    }
  }
  return '/placeholder-hotel.jpg'
}

// Helper function to get hotel name for a specific booking
const getBookingHotelName = (booking: BookingRecord) => {
  return booking?.bookingItems?.[0]?.room?.hotel?.name || booking?.bookingItems?.[0]?.hotelName || 'Hotel Booking'
}

// Helper function to get room summary for a specific booking
const getBookingRoomSummary = (booking: BookingRecord) => {
  const items = booking?.bookingItems || []
  if (items.length === 0) return 'No rooms'
  
  // Group rooms by type
  const roomCounts: Record<string, number> = {}
  items.forEach((item) => {
    const roomName = item.room?.name || item.roomName || 'Room'
    roomCounts[roomName] = (roomCounts[roomName] || 0) + 1
  })
  
  // Format as "2x Deluxe Room, 1x Standard Room"
  return Object.entries(roomCounts)
    .map(([name, count]) => `${count}x ${name}`)
    .join(', ')
}

const fetchUserBookings = async () => {
  if (!isAuthenticated.value) return
  
  isLoading.value = true
  try {
    await bookingStore.fetchUserBookings()
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

const goToLogin = () => {
  router.push('/login')
}

const exploreHotels = () => {
  router.push('/Bookingpage')
}

// Navigate to MyBookings page to view the specific booking
const viewBooking = (bookingId: string) => {
  router.push(`/MyBookings?bookingId=${bookingId}`)
}

onMounted(() => {
  fetchUserBookings()
})
</script>

<style scoped>
.positionHotel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  padding-left: 80px;
  padding-right: 20px;
}

.title {
  flex: 0 0 100%;
  font-size: 32px;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: 10px;
}

.container {
  flex: 0 0 auto;
  border-radius: 20px;
  margin-bottom: 30px;
  background-color: #eaeaea;
  padding: 30px;
  width: 350px;
  height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  font-family: 'Lato', sans-serif;
}

.booking-text {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  color: #000;
  line-height: 1.1;
}

.button-wrapper {
  display: flex;
  justify-content: flex-end;
}

.explore-btn {
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  background-color: #1a73e8;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.explore-btn:hover {
  background-color: #1557b0;
}

/* Booking card with image */
.booking-card {
  padding: 0;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.booking-card.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.booking-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.hotel-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #ff9800;
  color: white;
}

.status-badge.confirmed {
  background: #4caf50;
  color: white;
}

.status-badge.completed {
  background: #2196f3;
  color: white;
}

.status-badge.cancelled {
  background: #f44336;
  color: white;
}

.status-badge.failed {
  background: #dc3545;
  color: white;
}

.booking-info {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hotel-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #555;
}

.info-row i {
  color: #1a73e8;
  font-size: 16px;
  width: 18px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 22px;
  font-weight: bold;
  color: #003580;
}

.booking-card .button-wrapper {
  padding: 0 20px 16px;
}

.booking-card .explore-btn {
  width: 100%;
  text-align: center;
}

.loading-container {
  justify-content: center;
  align-items: center;
}

.loading-content {
  text-align: center;
}

.loading-content i {
  font-size: 3rem;
  color: #666;
  margin-bottom: 16px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.rejection-reason {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #dc3545;
  background: #f8d7da;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}

.rejection-reason i {
  font-size: 14px;
}
</style>
