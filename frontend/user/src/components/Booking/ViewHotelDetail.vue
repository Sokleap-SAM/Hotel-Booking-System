<template>
  <div class="list-container">
    <div class="tabs-header">
      <button class="tab-btn active">Top Booking</button>
      <button class="tab-btn">Best reviewed</button>
    </div>

    <div class="hotel-cards" @click="goToBookingDetail">
      <div v-for="hotel in hotels" :key="hotel.id" class="card">
        <div class="image-wrapper">
          <img :src="hotel.imageUrl" :alt="hotel.name" class="hotel-image" />
        </div>

        <div class="details">
          <h2 class="hotel-name">{{ hotel.name }}</h2>
          <p class="description">{{ hotel.description }}</p>

          <div class="rating">
            <span class="star">⭐</span>
            <span class="score">{{ hotel.rating }}</span>
          </div>

          <div class="price-tag">From US${{ hotel.price }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import angkorImage from '@/assets/Angkorwat.png';
import pubStreetImage from '@/assets/Pubstreet.png';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ViewHotelDetail',
  setup() {
    const hotels = ref([
      {
        id: 1,
        name: 'Angkor Village Hotel',
        description: 'Stay close to Angkor Wat at a peaceful hotel with clean rooms, friendly staff, and beautiful views. You can relax by the pool, enjoy tasty food, and get help with temple tours.',
        rating: 4.5,
        price: 50,
        // 2. Assign the imported variable here
        imageUrl: angkorImage
      },
      {
        id: 2,
        name: 'Koulen Central Hotel',
        description: 'Experience modern comfort in the heart of Siem Reap. Featuring a stunning rooftop pool and within walking distance to Pub Street, this hotel is perfect for city explorers.',
        rating: 4.0,
        price: 30,
        // 2. Assign the imported variable here
        imageUrl: pubStreetImage
      },
    ]);
    
    const router = useRouter();
    const goToBookingDetail = () => {
      router.push('/BookingDetail');
    }

    return {
      hotels,
      goToBookingDetail,
    };
  }
});
</script>

<style scoped>
/* Keeping your existing styles */
.list-container {
  position: absolute;
  top: 380px;
  left: 35%;
  width: 60%;
  padding-bottom: 50px;
}

.tabs-header {
  display: flex;
  background-color: #e0e0e0;
  border-radius: 25px;
  padding: 5px;
  margin-bottom: 20px;
  gap: 5px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
}

.tab-btn.active {
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
  background-color: white;
  gap: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #1a73e8; /* Highlight color on hover */
}

.image-wrapper {
  flex: 0 0 320px;
}

.hotel-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.hotel-name {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.description {
  font-size: 15px;
  color: #444;
  line-height: 1.5;
  margin-bottom: 15px;
}

.price-tag {
  margin-top: auto;
  font-weight: bold;
  font-size: 14px;
}
</style>
