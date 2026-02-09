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
          format="MM/dd/yyyy"
          auto-apply
          :teleport="true"
        >
          <template #input-icon>
            <i class="ri-calendar-line calendar-icon"></i>
          </template>
        </VueDatePicker>
      </div>

      <div class="guest-group">
        <i class="ri-user-line"></i>
        <select v-model="adults" class="guest-select">
          <option v-for="n in 10" :key="n" :value="n">{{ n }} adult{{ n > 1 ? 's' : '' }}</option>
        </select>
        <span class="separator">:</span>
        <select v-model="children" class="guest-select">
          <option v-for="n in 11" :key="n - 1" :value="n - 1">{{ n - 1 }} children</option>
        </select>
        <span class="separator">.</span>
        <select v-model="roomCount" class="guest-select">
          <option v-for="n in 10" :key="n" :value="n">{{ n }} room{{ n > 1 ? 's' : '' }}</option>
        </select>
      </div>

      <button class="change-search-btn" @click="handleSearch">Change search</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="rooms-loading">
      <div class="spinner"></div>
      <p>Loading rooms...</p>
    </div>

    <!-- Empty State - No rooms at all -->
    <div v-else-if="rooms.length === 0" class="no-rooms">
      <i class="ri-hotel-bed-line"></i>
      <p>No rooms available for this hotel</p>
    </div>

    <!-- No matching rooms for guest count -->
    <div v-else-if="filteredRooms.length === 0" class="no-rooms">
      <i class="ri-user-line"></i>
      <p>No rooms available for {{ totalGuests }} guest{{ totalGuests > 1 ? 's' : '' }}</p>
      <p class="hint">Try reducing the number of guests or search for a different hotel</p>
    </div>

    <!-- Rooms Table -->
    <RoomTable 
      v-else 
      :rooms="filteredRooms"
      :hotel-id="hotelId"
      :hotel-name="hotelName"
      :hotel-location="hotelLocation"
      :hotel-images="hotelImages"
      :check-in-date="checkInDateString"
      :check-out-date="checkOutDateString"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import RoomTable from './RoomTable.vue';

const router = useRouter();

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
  type?: string;
}

const props = defineProps<{
  guestConfig: string;
  rooms: Room[];
  isLoading?: boolean;
  hotelId?: string;
  hotelName?: string;
  hotelLocation?: string;
  hotelImages?: string[];
}>();

const today = new Date();
today.setHours(7, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const dateRange = ref([today, tomorrow]);

// Guest selection
const adults = ref(2);
const children = ref(0);
const roomCount = ref(1);

// Convert dates to string format for the RoomTable
const checkInDateString = computed(() => {
  if (!dateRange.value?.[0]) return '';
  return dateRange.value[0].toISOString().split('T')[0];
});

const checkOutDateString = computed(() => {
  if (!dateRange.value?.[1]) return '';
  return dateRange.value[1].toISOString().split('T')[0];
});

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
    type: room.type || 'Standard',
  }));
});

// Total guests count
const totalGuests = computed(() => adults.value + children.value);

// Filter rooms based on guest count - only show rooms that can accommodate all guests
const filteredRooms = computed(() => {
  return formattedRooms.value.filter(room => room.maxOccupancy >= totalGuests.value);
});

const handleSearch = () => {
  // Navigate back to home to search for other hotels
  router.push({ name: 'home' });
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

.guest-group {
  flex: 1;
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #333;
  height: 46px;
}

.guest-group i {
  color: #003580;
  font-size: 1.1rem;
}

.guest-select {
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  padding: 4px;
}

.guest-select:focus {
  outline: none;
}

.separator {
  color: #666;
}

.room-count {
  font-size: 0.9rem;
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

.no-rooms .hint {
  font-size: 0.9rem;
  color: #999;
  margin-top: 8px;
}
</style>
