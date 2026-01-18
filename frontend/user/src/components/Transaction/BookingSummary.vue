<template>
  <div class="summary-container">
    <div class="card hotel-card">
      <img :src="hotel.image" :alt="hotel.name" class="hotel-img" />
      <div class="card-content">
        <h2 class="hotel-title">{{ hotel.name }}</h2>
        <p class="hotel-address">{{ hotel.address }}</p>
        <div class="rating-badge">
          <span class="score">{{ hotel.rating }}</span>
          <span class="label">{{ hotel.ratingStatus }} - {{ hotel.reviewCount }} reviews</span>
        </div>
      </div>
    </div>

    <div class="card price-card">
      <div class="total-row">
        <span class="total-label">Total</span>
        <div class="price-details">
          <span class="old-price">USD${{ hotel.originalPrice }}</span>
          <span class="current-price">USD${{ hotel.discountPrice }}</span>
        </div>
      </div>
      <p class="tax-info">Includes taxes and fees</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
// Import local image if you have one in assets, otherwise use mock string
// import hotelImage from '@/assets/hotel-sample.jpg'
import angkorwat from '@/assets/Angkorwat.png';

export default defineComponent({
  name: 'BookingSummary',
  setup() {
    // Mock Data: In the future, this will be fetched via axios from NestJS
    const hotel = ref({
      name: 'Angkor Village Hotel',
      address: 'Wat Boo Road, Siem Reap, Cambodia',
      image: angkorwat,
      rating: 9.7,
      ratingStatus: 'Exceptional',
      reviewCount: 1244,
      originalPrice: 100,
      discountPrice: 70,
    })

    return {
      hotel,
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
  background-color: #f2f2f2;
  padding: 20px;
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
.old-price {
  color: #d4111e;
  text-decoration: line-through;
  display: block;
  text-align: right;
  font-size: 0.9rem;
}
.current-price {
  font-size: 1.6rem;
  font-weight: bold;
}
.tax-info {
  text-align: right;
  font-size: 0.8rem;
  color: #444;
  margin-top: 5px;
}
</style>
