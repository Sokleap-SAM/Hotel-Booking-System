<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="my-bookings-page">
    <div class="hero-banner" :style="backgroundHeader"></div>

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

          <div v-if="booking.status === 'completed'" class="status-info completed-info">
            <i class="ri-star-smile-line"></i>
            <span>Stay completed! We'd love to hear about your experience.</span>
          </div>

          <div class="card-body">
            <!-- Hotel Info with Image -->
            <div class="hotel-section" v-if="booking.bookingItems?.[0]?.room?.hotel">
              <div class="hotel-image" :style="{ backgroundImage: `url(${getHotelImage(booking)})` }"></div>
              <div class="hotel-info">
                <h2 class="hotel-name">{{ booking.bookingItems[0].room.hotel.name }}</h2>
                <p class="hotel-location" v-if="booking.bookingItems[0].room.hotel.location">
                  <i class="ri-map-pin-line"></i>
                  {{ booking.bookingItems[0].room.hotel.location }}
                </p>
              </div>
            </div>

            <!-- Stay Duration -->
            <div class="stay-duration">
              <div class="date-box">
                <span class="date-label">Check-in</span>
                <span class="date-value">{{ formatDate(booking.bookingItems[0]?.checkIn || '') }}</span>
              </div>
              <div class="nights-indicator">
                <i class="ri-moon-line"></i>
                <span>{{ calculateNights(booking.bookingItems[0]?.checkIn || '', booking.bookingItems[0]?.checkOut || '') }} night(s)</span>
              </div>
              <div class="date-box">
                <span class="date-label">Check-out</span>
                <span class="date-value">{{ formatDate(booking.bookingItems[0]?.checkOut || '') }}</span>
              </div>
            </div>

            <!-- Room List -->
            <div class="rooms-section">
              <h4 class="section-title">
                <i class="ri-hotel-bed-line"></i>
                Booked Rooms ({{ booking.bookingItems.length }})
              </h4>
              <div class="rooms-list">
                <div v-for="(item, index) in booking.bookingItems" :key="item.id" class="room-item">
                  <div class="room-number">{{ index + 1 }}</div>
                  <div class="room-details">
                    <span class="room-name">{{ item.room?.name || 'Room' }}</span>
                    <span class="room-price">USD${{ Number(item.priceAtBooking).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="total">
              <span>Total</span>
              <span class="total-price">USD${{ Number(booking.totalPrice).toFixed(2) }}</span>
            </div>
            <div class="footer-actions">
              <button class="btn-detail" @click="openDetailModal(booking)">
                <i class="ri-eye-line"></i> View Details
              </button>
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
              <button
                v-if="booking.status === 'completed' && !bookingRatings[booking.id]"
                class="btn-rate"
                @click="openRatingModal(booking)"
              >
                <i class="ri-star-line"></i> Rate
              </button>
              <button
                v-if="booking.status === 'completed' && bookingRatings[booking.id]"
                class="btn-view-rate"
                @click="viewRating(booking)"
              >
                <i class="ri-star-fill"></i> View Rate
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Booking Detail Modal -->
    <div v-if="selectedBooking" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Booking Details</h2>
          <button class="close-btn" @click="closeDetailModal"><i class="ri-close-line"></i></button>
        </div>
        
        <div class="modal-body">
          <!-- Booking Info -->
          <div class="detail-section">
            <h3 class="section-label">Booking Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Booking ID</span>
                <span class="value">#{{ selectedBooking.id.slice(0, 8).toUpperCase() }}</span>
              </div>
              <div class="info-item">
                <span class="label">Status</span>
                <span :class="['status-badge', `status-${selectedBooking.status}`]">{{ selectedBooking.status }}</span>
              </div>
              <div class="info-item">
                <span class="label">Booked On</span>
                <span class="value">{{ formatDateTime(selectedBooking.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Total Price</span>
                <span class="value price">USD${{ Number(selectedBooking.totalPrice).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Hotel Info -->
          <div class="detail-section" v-if="selectedBooking.bookingItems?.[0]?.room?.hotel">
            <h3 class="section-label">Hotel</h3>
            <div class="hotel-detail">
              <div class="hotel-detail-image" :style="{ backgroundImage: `url(${getHotelImage(selectedBooking)})` }"></div>
              <div class="hotel-detail-info">
                <h4>{{ selectedBooking.bookingItems[0].room.hotel.name }}</h4>
                <p v-if="selectedBooking.bookingItems[0].room.hotel.location">
                  <i class="ri-map-pin-line"></i> {{ selectedBooking.bookingItems[0].room.hotel.location }}
                </p>
                <p v-if="selectedBooking.bookingItems[0].room.hotel.phone">
                  <i class="ri-phone-line"></i> {{ selectedBooking.bookingItems[0].room.hotel.phone }}
                </p>
              </div>
            </div>
          </div>

          <!-- Stay Duration -->
          <div class="detail-section">
            <h3 class="section-label">Stay Duration</h3>
            <div class="stay-detail">
              <div class="date-detail">
                <i class="ri-calendar-check-line"></i>
                <div>
                  <span class="label">Check-in</span>
                  <span class="value">{{ formatDate(selectedBooking.bookingItems[0]?.checkIn || '') }}</span>
                </div>
              </div>
              <div class="nights-detail">
                <span>{{ calculateNights(selectedBooking.bookingItems[0]?.checkIn || '', selectedBooking.bookingItems[0]?.checkOut || '') }}</span>
                <small>night(s)</small>
              </div>
              <div class="date-detail">
                <i class="ri-calendar-close-line"></i>
                <div>
                  <span class="label">Check-out</span>
                  <span class="value">{{ formatDate(selectedBooking.bookingItems[0]?.checkOut || '') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Rooms List -->
          <div class="detail-section">
            <h3 class="section-label">Booked Rooms ({{ selectedBooking.bookingItems.length }})</h3>
            <div class="rooms-detail-list">
              <div v-for="(item, index) in selectedBooking.bookingItems" :key="item.id" class="room-detail-item">
                <div class="room-detail-header">
                  <span class="room-num">#{{ Number(index) + 1 }}</span>
                  <span class="room-type">{{ item.room?.name || 'Room' }}</span>
                  <span class="room-price-detail">USD${{ Number(item.priceAtBooking).toFixed(2) }}</span>
                </div>
                <div class="room-detail-meta" v-if="item.room">
                  <span v-if="item.room.capacity"><i class="ri-user-line"></i> {{ item.room.capacity }} guests</span>
                  <span v-if="item.room.size"><i class="ri-fullscreen-line"></i> {{ item.room.size }} m²</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Guest Info -->
          <div class="detail-section" v-if="selectedBooking.user">
            <h3 class="section-label">Guest Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Name</span>
                <span class="value">{{ selectedBooking.user.firstName }} {{ selectedBooking.user.lastName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email</span>
                <span class="value">{{ selectedBooking.user.email }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="detail-section" v-if="selectedBooking.payment">
            <h3 class="section-label">Payment</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Method</span>
                <span class="value">{{ selectedBooking.payment.method || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Payment Status</span>
                <span :class="['status-badge', `status-${selectedBooking.payment.status || 'pending'}`]">{{ selectedBooking.payment.status || 'Pending' }}</span>
              </div>
            </div>
          </div>

          <!-- Rejection Reason -->
          <div class="detail-section rejection" v-if="selectedBooking.status === 'cancelled' && selectedBooking.rejectionReason">
            <h3 class="section-label"><i class="ri-error-warning-line"></i> Rejection Reason</h3>
            <p>{{ selectedBooking.rejectionReason }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="selectedBooking.status === 'confirmed'" class="btn-pay" @click="handlePayNow(selectedBooking.id); closeDetailModal()">
            <i class="ri-bank-card-line"></i> Pay Now
          </button>
          <button class="btn-close-modal" @click="closeDetailModal">Close</button>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <RatingModal
      v-if="ratingBooking && ratingBooking.bookingItems[0]?.room?.hotel?.id"
      :hotel-id="ratingBooking.bookingItems[0].room.hotel.id"
      :booking-id="ratingBooking.id"
      :hotel-name="ratingBooking.bookingItems[0]?.room?.hotel?.name || 'Hotel'"
      :hotel-location="ratingBooking.bookingItems[0]?.room?.hotel?.location || ''"
      :hotel-image="getHotelImage(ratingBooking)"
      :existing-rating="bookingRatingData"
      @close="closeRatingModal"
      @rated="handleRated"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useBookingStore, type BookingRecord } from '@/stores/bookingStore'
import { useRatingStore, type Rating } from '@/stores/ratingStore'
import { useRouter } from 'vue-router'
import background from '@/assets/Background2.png'
import RatingModal from '@/components/rating/RatingModal.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default defineComponent({
  name: 'MyBookings',
  components: { RatingModal },
  setup() {
    const bookingStore = useBookingStore()
    const ratingStore = useRatingStore()
    const router = useRouter()
    const backgroundHeader = { backgroundImage: `url(${background})` }
    const selectedBooking = ref<BookingRecord | null>(null)
    const ratingBooking = ref<BookingRecord | null>(null)
    const bookingRatingData = ref<Rating | null>(null)
    const bookingRatings = ref<Record<string, Rating>>({})

    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'N/A'
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    const formatDateTime = (dateStr: string) => {
      if (!dateStr) return 'N/A'
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const calculateNights = (checkIn: string, checkOut: string) => {
      if (!checkIn || !checkOut) return 1
      const start = new Date(checkIn)
      const end = new Date(checkOut)
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 1
    }

    const getHotelImage = (booking: BookingRecord) => {
      const hotel = booking.bookingItems?.[0]?.room?.hotel
      if (hotel?.images && hotel.images.length > 0) {
        const img = hotel.images[0]
        if (img) {
          return img.startsWith('http') ? img : `${API_URL}${img}`
        }
      }
      return '/placeholder-hotel.jpg'
    }

    const openDetailModal = (booking: BookingRecord) => {
      selectedBooking.value = booking
    }

    const closeDetailModal = () => {
      selectedBooking.value = null
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

    const openRatingModal = async (booking: BookingRecord) => {
      const hotelId = booking.bookingItems?.[0]?.room?.hotel?.id
      if (!hotelId) {
        console.error('Cannot open rating modal: Hotel ID not found in booking')
        return
      }
      
      // Clear previous rating data first
      bookingRatingData.value = null
      
      // Fetch fresh rating data for this booking
      await ratingStore.fetchRatingByBookingId(booking.id)
      bookingRatingData.value = ratingStore.bookingRating
      
      // Only show modal after data is loaded
      ratingBooking.value = booking
    }

    const closeRatingModal = () => {
      ratingBooking.value = null
      bookingRatingData.value = null
    }

    const viewRating = async (booking: BookingRecord) => {
      const hotelId = booking.bookingItems?.[0]?.room?.hotel?.id
      if (!hotelId) {
        console.error('Cannot view rating: Hotel ID not found in booking')
        return
      }
      
      // Fetch the rating for this booking
      await ratingStore.fetchRatingByBookingId(booking.id)
      bookingRatingData.value = ratingStore.bookingRating
      
      // Open modal to view rating
      ratingBooking.value = booking
    }

    const handleRated = (rating: Rating) => {
      // Rating submitted successfully - store it in our lookup
      if (ratingBooking.value) {
        bookingRatings.value[ratingBooking.value.id] = rating
      }
      closeRatingModal()
      // Refresh bookings to update UI
      bookingStore.fetchMyBookings()
    }

    const fetchBookingRatings = async () => {
      // Fetch ratings for all completed bookings
      const completedBookings = bookingStore.bookings.filter(b => b.status === 'completed')
      for (const booking of completedBookings) {
        await ratingStore.fetchRatingByBookingId(booking.id)
        if (ratingStore.bookingRating) {
          bookingRatings.value[booking.id] = ratingStore.bookingRating
        }
      }
    }

    onMounted(async () => {
      await bookingStore.fetchMyBookings()
      // After fetching bookings, check which ones have ratings
      await fetchBookingRatings()
    })

    return { 
      bookingStore, 
      backgroundHeader, 
      formatDate,
      formatDateTime,
      calculateNights,
      getHotelImage,
      selectedBooking,
      openDetailModal,
      closeDetailModal,
      handleCancel, 
      handlePayNow,
      ratingBooking,
      bookingRatingData,
      bookingRatings,
      openRatingModal,
      closeRatingModal,
      viewRating,
      handleRated,
    }
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

.hero-banner {
  height: 180px;
  background-position: center;
  background-size: cover;
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
  gap: 24px;
}

.booking-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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

.completed-info {
  background: #e8f4fd;
  color: #0056b3;
  border-bottom: 1px solid #b8daff;
}

.card-body {
  padding: 20px;
}

/* Hotel Section */
.hotel-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.hotel-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.hotel-info {
  flex: 1;
}

.hotel-name {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a1a1a;
}

.hotel-location {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Stay Duration */
.stay-duration {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.date-box {
  text-align: center;
}

.date-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.date-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.nights-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #003580;
  font-weight: 600;
}

.nights-indicator i {
  font-size: 1.2rem;
}

/* Rooms Section */
.rooms-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #333;
  margin: 0 0 12px 0;
}

.section-title i {
  color: #003580;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.room-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.room-number {
  width: 28px;
  height: 28px;
  background: #003580;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: bold;
  flex-shrink: 0;
}

.room-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-name {
  font-weight: 500;
  color: #1a1a1a;
}

.room-price {
  font-weight: 700;
  color: #003580;
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
  font-size: 1.4rem;
  font-weight: 800;
  color: #003580;
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

.btn-rate {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #1a1a1a;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-rate:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
}

.btn-rate i {
  font-size: 1rem;
}

.btn-view-rate {
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-view-rate:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.btn-view-rate i {
  font-size: 1rem;
}

/* View Details Button */
.btn-detail {
  background: white;
  color: #003580;
  border: 1.5px solid #003580;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-detail:hover {
  background: #003580;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  background: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #eee;
  color: #333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 0.8rem;
  color: #888;
}

.info-item .value {
  font-weight: 500;
  color: #1a1a1a;
}

.info-item .value.price {
  font-weight: 700;
  color: #003580;
  font-size: 1.2rem;
}

/* Hotel Detail in Modal */
.hotel-detail {
  display: flex;
  gap: 16px;
}

.hotel-detail-image {
  width: 120px;
  height: 90px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.hotel-detail-info h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.hotel-detail-info p {
  margin: 4px 0;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hotel-detail-info i {
  color: #003580;
}

/* Stay Duration in Modal */
.stay-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 10px;
}

.date-detail {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-detail i {
  font-size: 1.4rem;
  color: #003580;
}

.date-detail .label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
}

.date-detail .value {
  font-weight: 600;
  color: #1a1a1a;
}

.nights-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #003580;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}

.nights-detail span {
  font-size: 1.2rem;
  font-weight: 700;
}

.nights-detail small {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* Rooms List in Modal */
.rooms-detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-detail-item {
  background: #f8f9fa;
  padding: 14px;
  border-radius: 8px;
  border-left: 3px solid #003580;
}

.room-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-num {
  width: 30px;
  font-weight: 700;
  color: #003580;
}

.room-type {
  flex: 1;
  font-weight: 500;
  color: #1a1a1a;
}

.room-price-detail {
  font-weight: 700;
  color: #003580;
}

.room-detail-meta {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #666;
}

.room-detail-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.room-detail-meta i {
  color: #003580;
}

/* Rejection Section */
.detail-section.rejection {
  background: #fff5f5;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.detail-section.rejection .section-label {
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-section.rejection p {
  margin: 0;
  color: #7f1d1d;
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-footer .btn-pay {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-close-modal {
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #d1d5db;
}
</style>
