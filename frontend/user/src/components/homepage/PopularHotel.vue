<template>
  <div class="positionHotel">
    <div class="title">Popular Hotels</div>

    <div v-for="hotel in hotelStore.hotels" :key="hotel.id" class="container">
      <div class="containerImg" :style="{ backgroundImage: `url(${hotel.image_url})` }"></div>

      <div class="containerDes">
        <div class="des-left">
          <div class="location-info"><i class="ri-map-pin-fill"></i> {{ hotel.location }}</div>

          <div class="rating">
            <i
              v-for="star in 5"
              :key="star"
              :class="star <= (Number(hotel.rating) || 0) ? 'ri-star-fill' : 'ri-star-line'"
            ></i>
            <span>{{ (Number(hotel.rating) || 0).toFixed(1) }}</span>
          </div>

          <div class="price">From {{ hotel.price }}$/night</div>
        </div>

        <button class="explore-btn" @click="goToHotel(hotel.id)">Explore Now</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHotelStore } from '@/stores/hotelStores'
import { onMounted } from 'vue'

const hotelStore = useHotelStore()
onMounted(() => {
  hotelStore.fetchHotels()
})

const goToHotel = (id: number) => {
  console.log('Navigating to hotel ID:', id)
}
</script>

<style scoped>
/* The Parent Wrapper */
.positionHotel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap; /* Allows the title to take the top row and cards the second */
  gap: 20px; /* Space between cards */
  padding-left: 80px; /* Replaces transform for cleaner alignment */
  padding-right: 20px;
}

/* The Title - Forced to take up the full top row */
.title {
  flex: 0 0 100%; /* Makes the title span the entire width */
  font-size: 32px;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: 10px; /* Reduced margin to keep it close to cards */
}

/* The Hotel Card */
.container {
  flex: 0 0 auto; /* Prevents cards from shrinking */
  border-radius: 20px;
  margin-bottom: 30px;
  background-color: #eaeaea;
  padding: 15px;
  width: 350px; /* Reduced width so they fit in a row better */
  height: 440px;

  /* Internal card layout */
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-family: 'Lato', sans-serif;
}

/* Image Section */
.containerImg {
  position: relative;
  width: 100%;
  height: 280px;
  background-size: cover;
  background-position: center;
  border-radius: 15px;
}

/* Badge (Optional/Commented in your HTML) */
.discount-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: #38b48b;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 14px;
}

/* Description Area */
.containerDes {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-family: 'Lato', sans-serif;
}

.des-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rating i {
  color: #ffc107;
  font-size: 18px;
}

/* Button Styling */
.explore-btn {
  margin-top: auto; /* Pushes button to the bottom of the card */
  padding: 12px;
  border-radius: 10px;
  border: none;
  background-color: #38b48b;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}

.explore-btn:hover {
  background-color: #2e9372;
}
</style>
