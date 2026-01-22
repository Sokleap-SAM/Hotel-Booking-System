<template>
  <section class="availability-container">
    <h2 class="section-title">Availability</h2>
    <p class="subtitle">Price auto converted to USD$</p>

    <div class="search-bar">
      <div class="datepicker-group">
        <VueDatePicker
          v-model="dateRange"
          range
          :min-date="new Date()"
          :enable-time-picker="false"
          placeholder="Select Check-in - Check-out"
          format="eee, MMM dd"
          auto-apply
          :teleport="true"
        >
          <template #input-icon>
            <i class="ri-calendar-line calendar-icon"></i>
          </template>
        </VueDatePicker>
      </div>

      <div class="input-group">
        <i class="ri-user-line"></i>
        <span>{{ guestConfig }}</span>
      </div>

      <button class="change-search-btn" @click="handleSearch">Change search</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="rooms-loading">
      <div class="spinner"></div>
      <p>Loading rooms...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="rooms.length === 0" class="no-rooms">
      <i class="ri-hotel-bed-line"></i>
      <p>No rooms available for this hotel</p>
    </div>

    <!-- Rooms Table -->
    <RoomTable v-else :rooms="formattedRooms" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import RoomTable from './RoomTable.vue';

interface Amenity {
  id: number;
  name: string;
}

interface Room {
  id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  longDescription?: string;
  maxOccupancy?: number;
  maxGuests?: number;
  price: number;
  discountPercentage?: number;
  available?: number;
  stock?: number;
  images?: string[];
  amenities?: Amenity[];
  custom_amenities?: string;
  type?: string;
}

const props = defineProps<{
  guestConfig: string;
  rooms: Room[];
  isLoading?: boolean;
}>();

// Date Range logic: Default to [Today, Tomorrow]
const dateRange = ref([new Date(), new Date(Date.now() + 86400000)]);

// Format rooms to match the RoomTable expected structure
const formattedRooms = computed(() => {
  return props.rooms.map(room => ({
    id: room.id,
    name: room.name,
    description: room.shortDescription || room.description || '',
    longDescription: room.longDescription || '',
    maxGuests: room.maxOccupancy || room.maxGuests || 2,
    maxOccupancy: room.maxOccupancy || room.maxGuests || 2,
    price: Number(room.price) || 0,
    finalPrice: room.discountPercentage 
      ? Math.round(Number(room.price) * (1 - room.discountPercentage / 100)) 
      : Number(room.price) || 0,
    discount: room.discountPercentage || 0,
    discountPercentage: room.discountPercentage || 0,
    breakfast: room.amenities?.some((a: Amenity) => a.name?.toLowerCase().includes('breakfast')) || false,
    stock: room.available || room.stock || 0,
    available: room.available || room.stock || 0,
    images: room.images || [],
    amenities: room.amenities || [],
    custom_amenities: room.custom_amenities || '',
    type: room.type || 'Standard',
  }));
});

const handleSearch = () => {
  console.log("Searching for dates:", dateRange.value);
  // Emit event or call API for date-based search
};
</script>

<style scoped>
/* Matching your specific design colors */
.search-bar {
  display: flex;
  background: #f0f4fa;
  padding: 8px;
  border-radius: 8px;
  gap: 10px;
  border: 2px solid #003580;
  align-items: center;
}

.datepicker-group {
  flex: 1.5;
  background: white;
  border-radius: 4px;
}

:deep(.dp__input) {
  border: none !important;
  font-weight: 700;
  font-family: 'Lato', sans-serif;
  color: #333;
  padding: 12px 12px 12px 40px;
}

.calendar-icon {
  margin-left: 12px;
  color: #003580;
  font-size: 1.2rem;
}

.input-group {
  flex: 1;
  background: white;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #333;
  height: 46px;
}

.change-search-btn {
  background: #003580;
  color: white;
  border: none;
  height: 46px;
  padding: 0 30px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

/* Loading State */
.rooms-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}

.rooms-loading .spinner {
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

.rooms-loading p {
  margin-top: 15px;
  color: #666;
}

/* Empty State */
.no-rooms {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}

.no-rooms i {
  font-size: 50px;
  color: #ccc;
  margin-bottom: 15px;
}

.no-rooms p {
  color: #666;
  font-size: 1.1rem;
}
</style>
