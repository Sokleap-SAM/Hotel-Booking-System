<template>
  <div class="list-container">
    <div class="tabs-header">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'top-booking' }"
        @click="handleTabChange('top-booking')"
      >Top Booking</button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'best-reviewed' }"
        @click="handleTabChange('best-reviewed')"
      >Best reviewed</button>
    </div>

    <div v-if="hotelStores.isLoading" class="loading">Loading hotels...</div>

    <div v-else-if="hotelStores.hotels.length === 0" class="no-results">
      No hotels found matching your criteria.
    </div>

    <div v-else class="hotel-cards">
      <div v-for="hotel in hotelStores.hotels" :key="hotel.id" class="card" @click="goToBookingDetail(hotel.id)">
        <div class="image-wrapper">
          <img :src="getHotelImage(hotel)" :alt="hotel.name" class="hotel-image" />
        </div>

        <div class="details">
          <h2 class="hotel-name">{{ hotel.name }}</h2>
          <p class="description">{{ hotel.shortDescription || hotel.longDescription }}</p>

          <div class="rating">
            <span class="star">⭐</span>
            <span class="score">{{ hotel.avgRating || 'N/A' }}</span>
          </div>

          <div v-if="hasDiscount(hotel)" class="discount-tag">
            Up to {{ getHighestDiscount(hotel) }}% OFF
          </div>

          <div class="price-tag">From US${{ getLowestPrice(hotel) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHotelStore } from '@/stores/hotelStores';
import defaultHotelImage from '@/assets/Angkorwat.png';

export default defineComponent({
  name: 'ViewHotelDetail',
  setup() {
    const router = useRouter();
    const hotelStores = useHotelStore();
    const activeTab = ref('top-booking');

    onMounted(async () => {
      await hotelStores.fetchHotelsByHighestDiscount();
    });

    const handleTabChange = async (tab: string) => {
      if (activeTab.value === tab) return;
      activeTab.value = tab;

      if (tab === 'top-booking') {
        await hotelStores.fetchHotelsByHighestDiscount();
      } else if (tab === 'best-reviewed') {
        await hotelStores.fetchHotelsByHighestRating();
      }
    };

    const getHotelImage = (hotel: any) => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      if (hotel.images && hotel.images.length > 0) {
        return `${apiUrl}${hotel.images[0]}`;
      }
      return defaultHotelImage;
    };

    const getLowestPrice = (hotel: any) => {
      if (hotel.rooms && hotel.rooms.length > 0) {
        const prices = hotel.rooms.map((room: any) => room.price || 0);
        return Math.min(...prices);
      }
      return 'N/A';
    };

    const hasDiscount = (hotel: any) => {
      return hotel.rooms?.some((room: any) => room.discountPercentage > 0);
    };

    const getHighestDiscount = (hotel: any) => {
      if (hotel.rooms && hotel.rooms.length > 0) {
        const discounts = hotel.rooms.map((room: any) => room.discountPercentage || 0);
        return Math.max(...discounts);
      }
      return 0;
    };

    const goToBookingDetail = (hotelId: number) => {
      router.push(`/BookingDetail/${hotelId}`);
    };

    return {
      hotelStores,
      activeTab,
      handleTabChange,
      getHotelImage,
      getLowestPrice,
      hasDiscount,
      getHighestDiscount,
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
