<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="booking-page-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading hotel details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="ri-error-warning-line"></i>
      <p>{{ error }}</p>
      <button @click="loadHotelData">Try Again</button>
    </div>

    <!-- Main Content -->
    <template v-else-if="hotel">
      <div class="hero-banner" :style="backgroundHeader"></div>

      <main class="main-content">

        <div class="hotel-info-row">
          <div class="title-group">
            <nav class="breadcrumbs">Home > {{ hotel.name }}</nav>
            <h1 class="hotel-name">{{ hotel.name }}</h1>
          </div>
        </div>

        <div class="media-grid">
          <PhotoGallery class="gallery-section" :images="hotel.images" />
          <MapCard
            class="map-section"
            :rating="hotel.avgRating"
            :mapUrl="hotel.googleMapUrl"
          />
        </div>

        <BookingDescription :descriptionData="descriptionData" />

        <GuestReviews :hotelId="hotel.id" />

        <AvailabilitySection
          :rooms="rooms"
          :isLoading="roomsLoading"
          :hotelId="hotel.id"
          :hotelName="hotel.name"
          :hotelLocation="hotel.location"
          :hotelImages="hotel.images"
        />

      </main>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import background from '@/assets/Background2.png';
import { useHotelStore } from '@/stores/hotelStores';
import { useRoomStore } from '@/stores/roomStores';

// Import Child Components from src/components/BookingDetail/
import PhotoGallery from '@/components/BookingDetail/PhotoGallery.vue';
import MapCard from '@/components/BookingDetail/MapCard.vue';
import BookingDescription from '@/components/BookingDetail/BookingDescription.vue';
import GuestReviews from '@/components/BookingDetail/GuestReviews.vue';
import AvailabilitySection from '@/components/BookingDetail/AvailabilitySection.vue';

interface Hotel {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  location: string;
  googleMapUrl: string;
  images: string[];
  avgRating: number;
  totalRating: number;
  amenities?: { id: number; name: string }[];
  phoneNumber: string;
  email: string;
  status: 'active' | 'inactive' | 'suspend';
  createdAt: Date;
}

export default defineComponent({
  name: 'BookingPage',
  components: {
    PhotoGallery,
    MapCard,
    BookingDescription,
    GuestReviews,
    AvailabilitySection,
  },
  props: {
    hotelId: {
      type: String,
      required: false,
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const hotelStore = useHotelStore();
    const roomStore = useRoomStore();

    // State
    const hotel = ref<Hotel | null>(null);
    const isLoading = ref(true);
    const error = ref<string | null>(null);

    // Dynamic Header Background
    const backgroundHeader = {
      backgroundImage: `url(${background})`
    };

    // Navigation
    const goToHome = () => {
      router.push('/home');
    };
    const rooms = computed(() => roomStore.rooms);
    const roomsLoading = computed(() => roomStore.isLoading);

    const descriptionData = computed(() => ({
      title: hotel.value?.shortDescription || '',
      paragraphs: hotel.value?.longDescription ? [hotel.value.longDescription] : [],
      highlight: '',
      location: hotel.value?.location || '',
      phoneNumber: hotel.value?.phoneNumber || '',
      email: hotel.value?.email || '',
      amenities: hotel.value?.amenities || []
    }));

    // Load hotel and rooms data
    const loadHotelData = async () => {
      const id = props.hotelId || (route.params.hotelId as string);

      if (!id) {
        error.value = 'No hotel ID provided';
        isLoading.value = false;
        return;
      }

      isLoading.value = true;
      error.value = null;

      try {
        // Fetch hotel details
        const hotelData = await hotelStore.getHotelById(id);
        if (!hotelData) {
          throw new Error('Hotel not found');
        }
        hotel.value = hotelData;

        // Fetch rooms for this hotel
        await roomStore.fetchRoomsByHotel(id);
      } catch (err) {
        console.error('Error loading hotel data:', err);
        error.value = 'Failed to load hotel details. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      loadHotelData();
    });

    return {
      hotel,
      rooms,
      roomsLoading,
      isLoading,
      error,
      backgroundHeader,
      descriptionData,
      loadHotelData,
      goToHome,
    };
  }
});
</script>

<style scoped>
.booking-page-container {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Lato', sans-serif;
}

/* 1. Hero Banner Styles */
.hero-banner {
  height: 200px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* 2. Overlap Layout */
.main-content {
  max-width: 1250px;
  margin: 10px auto 0; /* Creates the Design Overlap */
  padding: 0 40px;
  position: relative;
  z-index: 10;
}

/* 3. Info & Action Styles */
.hotel-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 25px;
}

.breadcrumbs {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 5px;
}

.hotel-name {
  font-size: 2.6rem;
  font-weight: 800;
  margin: 0;
  color: #000;
}

.action-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
}

.book-now-btn {
  background-color: #1a73e8;
  color: white;
  padding: 12px 35px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
}

/* 4. Layout Grids */
.media-grid {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

@media (max-width: 1024px) {
  .media-grid { grid-template-columns: 1fr; }
  .blue-header { padding: 20px 30px; }
  .main-content { padding: 0 20px; }
  .hotel-name { font-size: 2rem; }
}

/* Loading & Error States */
.loading-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  margin-top: 15px;
  color: #666;
  font-size: 1.1rem;
}

.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.error-container i {
  font-size: 60px;
  color: #e74c3c;
  margin-bottom: 15px;
}

.error-container p {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.error-container button {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.error-container button:hover {
  background: #1557b0;
}
</style>
