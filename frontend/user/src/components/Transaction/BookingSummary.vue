<template>
  <div class="summary-container">
    <div class="card hotel-card">
      <img :src="hotelImage" :alt="hotelName" class="hotel-img" />
      <div class="card-content">
        <h2 class="hotel-title">{{ hotelName }}</h2>
        <p class="hotel-address">{{ hotelLocation }}</p>
        <p class="stay-dates" v-if="bookingStore.checkInDate">
          <i class="ri-calendar-line"></i>
          {{ formatDate(bookingStore.checkInDate) }} — {{ formatDate(bookingStore.checkOutDate) }}
          <span class="nights-badge">{{ bookingStore.nights }} night(s)</span>
        </p>
        <p class="rooms-info" v-if="bookingStore.totalSelectedRooms > 0">
          <i class="ri-hotel-bed-line"></i>
          {{ bookingStore.totalSelectedRooms }} room(s) selected
        </p>
      </div>
    </div>

    <!-- Price breakdown -->
    <div class="card price-card" v-if="bookingStore.priceBreakdown">
      <div class="breakdown-items">
        <div v-for="item in bookingStore.priceBreakdown.items" :key="item.roomId" class="breakdown-row">
          <span class="item-name">{{ item.roomName }}</span>
          <span class="item-detail">{{ item.nights }} night(s) × USD${{ item.pricePerNight.toFixed(2) }}</span>
          <span class="item-price">USD${{ item.itemTotal.toFixed(2) }}</span>
        </div>
      </div>
      <hr class="divider" />
      <div class="subtotal-row">
        <span>Subtotal</span>
        <span>USD${{ bookingStore.displaySubtotal }}</span>
      </div>
      <div class="tax-row">
        <span>Tax (10%)</span>
        <span>USD${{ bookingStore.displayTaxAmount }}</span>
      </div>
      <hr class="divider" />
      <div class="total-row">
        <span class="total-label">Total</span>
        <span class="current-price">USD${{ bookingStore.displayTotalPrice }}</span>
      </div>
      <p class="tax-info">Includes taxes and fees</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useBookingStore } from '@/stores/bookingStore'
import angkorwat from '@/assets/Angkorwat.png'

export default defineComponent({
  name: 'BookingSummary',
  setup() {
    const bookingStore = useBookingStore()

    const hotelName = computed(() => bookingStore.hotelInfo?.name || 'Hotel')
    const hotelLocation = computed(() => bookingStore.hotelInfo?.location || '')
    const hotelImage = computed(() => {
    const images = bookingStore.hotelInfo?.images
      if (images && images.length > 0) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        return images[0].startsWith('http') ? images[0] : `${apiUrl}${images[0]}`
      }
      return angkorwat
    })

    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    return {
      bookingStore,
      hotelName,
      hotelLocation,
      hotelImage,
      formatDate,
    }
  },
})
</script>

<style scoped>
.summary-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}
.hotel-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.card-content {
  padding: 15px;
}
.hotel-title {
  margin: 0;
  font-size: 1.4rem;
  color: #1a1a1a;
}
.hotel-address {
  font-size: 0.9rem;
  color: #666;
  margin: 5px 0 15px;
}
.rating-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}
.score {
  background: #003580;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
.label {
  font-size: 0.9rem;
  font-weight: 500;
}
.price-card {
  background-color: #f5f5f5;
  padding: 20px;
}
.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}
.breakdown-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-name {
  font-weight: 600;
  font-size: 0.95rem;
}
.item-detail {
  font-size: 0.8rem;
  color: #666;
}
.item-price {
  font-weight: 600;
  text-align: right;
}
.divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}
.subtotal-row,
.tax-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 5px;
}
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.total-label {
  font-size: 1.5rem;
  font-weight: bold;
}
.current-price {
  font-size: 1.6rem;
  font-weight: bold;
  color: #003580;
}
.tax-info {
  text-align: right;
  font-size: 0.8rem;
  color: #444;
  margin-top: 5px;
}
.stay-dates,
.rooms-info {
  font-size: 0.9rem;
  color: #555;
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.nights-badge {
  background: #003580;
  color: white;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
