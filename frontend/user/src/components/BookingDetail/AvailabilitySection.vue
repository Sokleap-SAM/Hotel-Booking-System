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
          :min-range="1"
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

      <div class="guest-group" @click="showGuestDropdown = !showGuestDropdown">
        <i class="ri-user-line"></i>
        <div class="guest-display">
          <span>{{ adults }} adult{{ adults > 1 ? 's' : '' }} : {{ children }} children . {{ roomCount }} room{{ roomCount > 1 ? 's' : '' }}</span>
        </div>
        <div v-if="showGuestDropdown" class="guest-dropdown" @click.stop>
          <div class="guest-row">
            <span>Adults</span>
            <div class="counter">
              <button @click="adults = Math.max(1, adults - 1)">-</button>
              <span>{{ adults }}</span>
              <button @click="adults = Math.min(10, adults + 1)">+</button>
            </div>
          </div>
          <div class="guest-row">
            <span>Children</span>
            <div class="counter">
              <button @click="children = Math.max(0, children - 1)">-</button>
              <span>{{ children }}</span>
              <button @click="children = Math.min(10, children + 1)">+</button>
            </div>
          </div>
          <div class="guest-row">
            <span>Rooms</span>
            <div class="counter">
              <button @click="roomCount = Math.max(1, roomCount - 1)">-</button>
              <span>{{ roomCount }}</span>
              <button @click="roomCount = Math.min(10, roomCount + 1)">+</button>
            </div>
          </div>
          <button class="done-btn" @click="showGuestDropdown = false">Done</button>
        </div>
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
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import RoomTable from './RoomTable.vue';
import { useRoomStore } from '@/stores/roomStores';

const router = useRouter();
const roomStore = useRoomStore();

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
  availableRooms?: number;
  totalRooms?: number;
  bookedRooms?: number;
  stock?: number;
  images?: string[];
  amenities?: Amenity[];
  type?: string;
}

interface FormattedRoom {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  maxGuests: number;
  maxOccupancy: number;
  price: number;
  finalPrice: number;
  discount: number;
  discountPercentage: number;
  breakfast: boolean;
  stock: number;
  available: number;
  totalRooms: number;
  bookedRooms: number;
  images: string[];
  amenities: Amenity[];
  type: string;
}

const props = defineProps<{
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
const showGuestDropdown = ref(false);

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
  return props.rooms.map((room: Room) => ({
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
    stock: room.availableRooms ?? room.available ?? room.stock ?? 0,
    available: room.availableRooms ?? room.available ?? room.stock ?? 0,
    totalRooms: room.totalRooms ?? room.available ?? room.stock ?? 0,
    bookedRooms: room.bookedRooms ?? 0,
    images: room.images || [],
    amenities: room.amenities || [],
    type: room.type || 'Standard',
  }));
});

// Total guests count
const totalGuests = computed(() => adults.value + children.value);

// Filter rooms based on guest count - only show rooms that can accommodate all guests
const filteredRooms = computed(() => {
  return formattedRooms.value.filter((room: FormattedRoom) => room.maxOccupancy >= totalGuests.value);
});

// Fetch rooms with availability when dates or guests change
const fetchRoomsWithAvailability = async () => {
  if (!props.hotelId || !dateRange.value[0] || !dateRange.value[1]) return;
  
  try {
    await roomStore.fetchRoomsWithAvailability(
      props.hotelId,
      dateRange.value[0].toISOString(),
      dateRange.value[1].toISOString(),
      totalGuests.value
    );
  } catch (error) {
    console.error('Error fetching rooms with availability:', error);
  }
};

// Watch for date changes and refetch availability
watch(dateRange, () => {
  fetchRoomsWithAvailability();
}, { deep: true });

// Watch for guest count changes and refetch availability
watch([adults, children], () => {
  fetchRoomsWithAvailability();
});

// Handle "Change search" - navigate to booking page with current filters
const handleSearch = () => {
  const query: Record<string, string> = {};
  
  if (props.hotelLocation) {
    query.location = props.hotelLocation;
  }
  if (dateRange.value[0]) {
    query.checkIn = dateRange.value[0].toISOString();
  }
  if (dateRange.value[1]) {
    query.checkOut = dateRange.value[1].toISOString();
  }
  query.adults = String(adults.value);
  query.children = String(children.value);
  query.rooms = String(roomCount.value);

  router.push({ name: 'Bookingpage', query });
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

.guest-group {
  position: relative;
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
  cursor: pointer;
}

.guest-group:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.guest-group i {
  color: #003580;
  font-size: 1.1rem;
}

.guest-display {
  flex: 1;
  font-size: 0.9rem;
}

.guest-dropdown {
  position: absolute;
  top: 55px;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  padding: 15px;
}

.guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #333;
}

.guest-row:last-of-type {
  border-bottom: none;
}

.counter {
  display: flex;
  align-items: center;
  gap: 15px;
}

.counter button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  font-size: 16px;
}

.counter button:hover {
  background: #f0f4fa;
  border-color: #003580;
}

.done-btn {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #003580;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.done-btn:hover {
  background: #002050;
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
