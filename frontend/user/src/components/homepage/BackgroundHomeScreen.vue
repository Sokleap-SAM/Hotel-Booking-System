<template>
  <div class="logo-screen">
    <div class="hooktext">
      <div>Find Place to Stay?</div>
      <div>Search for hotels here</div>
    </div>
    <div class="container">
      <div class="location" @click="showLocationDropdown = !showLocationDropdown">
        <i class="ri-map-pin-fill"></i>
        <div class="input-content">
          <span class="label">Where to Stay?</span>
          <span class="value" v-if="selectedLocation">{{ selectedLocation }}</span>
        </div>
        <div v-if="showLocationDropdown" class="dropdown">
          <div 
            v-for="loc in locations" 
            :key="loc" 
            class="dropdown-item"
            @click.stop="selectLocation(loc)"
          >
            {{ loc }}
          </div>
        </div>
      </div>
      <div class="calender" @click="showDatePicker = !showDatePicker">
        <i class="ri-calendar-2-line"></i>
        <div class="input-content">
          <span class="label">Check in-out date</span>
          <span class="value" v-if="dateRange[0] && dateRange[1]">
            {{ formatDate(dateRange[0]) }} - {{ formatDate(dateRange[1]) }}
          </span>
        </div>
        <div v-if="showDatePicker" class="date-picker-dropdown" @click.stop>
          <VueDatePicker
            v-model="dateRange"
            range
            :min-date="new Date()"
            :min-range="1"
            :enable-time-picker="false"
            inline
            auto-apply
            @update:model-value="showDatePicker = false"
          />
        </div>
      </div>
      <div class="guestAndRoom" @click="showGuestDropdown = !showGuestDropdown">
        <i class="ri-user-3-line"></i>
        <div class="input-content">
          <span class="label">Guests & Rooms</span>
          <span class="value">{{ adults }} adults · {{ children }} children · {{ rooms }} room{{ rooms > 1 ? 's' : '' }}</span>
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
              <button @click="rooms = Math.max(1, rooms - 1)">-</button>
              <span>{{ rooms }}</span>
              <button @click="rooms = Math.min(10, rooms + 1)">+</button>
            </div>
          </div>
          <button class="done-btn" @click="showGuestDropdown = false">Done</button>
        </div>
      </div>
      <button class="search" @click="handleSearch">
        <i class="ri-search-line"></i>
        Search
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const router = useRouter();

// Locations
const locations = ['Siem Reap', 'Phnom Penh', 'Sihanoukville', 'Battambang', 'Kampot'];
const selectedLocation = ref('');
const showLocationDropdown = ref(false);

// Date picker
const today = new Date();
today.setHours(7, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dateRange = ref<Date[]>([today, tomorrow]);
const showDatePicker = ref(false);

// Guest configuration
const adults = ref(2);
const children = ref(0);
const rooms = ref(1);
const showGuestDropdown = ref(false);

const selectLocation = (loc: string) => {
  selectedLocation.value = loc;
  showLocationDropdown.value = false;
};

const formatDate = (date: Date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const handleSearch = () => {
  const query: Record<string, string> = {};
  
  if (selectedLocation.value) {
    query.location = selectedLocation.value;
  }
  if (dateRange.value[0]) {
    query.checkIn = dateRange.value[0].toISOString();
  }
  if (dateRange.value[1]) {
    query.checkOut = dateRange.value[1].toISOString();
  }
  query.adults = String(adults.value);
  query.children = String(children.value);
  query.rooms = String(rooms.value);
  
  router.push({ name: 'Bookingpage', query });
};
</script>

<style scoped>
.logo-screen {
  background-image: url('@/assets/Logo_Background.png');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100vh;
  font-family: 'Lato', sans-serif;

  display: flex;
  flex-direction: column;

  /* 1. Push content to the bottom */
  justify-content: flex-end;

  /* 2. Align content to the left */
  align-items: flex-start;

  /* 3. Spacing from the edges */
  padding-bottom: 80px;
  padding-left: 60px;

  /* 4. Gap between the text and the white bar */
  gap: 20px;
}

.hooktext {
  color: #0d4798;
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
  text-shadow: 0px 1px 2px rgba(255, 255, 255, 0.5);
}

.container {
  background-color: rgba(255, 255, 255, 0.4);
  width: 85%;
  height: 100px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 2%;
}
.container button {
  align-items: center;
  font-weight: bold;
  justify-content: center;
}
.location,
.calender,
.guestAndRoom {
  position: relative;
  font-size: 16px;
  border: none;
  gap: 10px;

  display: flex;
  align-items: center;

  flex: 1;
  height: 60px;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  padding: 0 15px;
}
.input-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}
.input-content .label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.input-content .value {
  font-size: 12px;
  color: #666;
}
.location:hover,
.calender:hover,
.guestAndRoom:hover {
  background-color: #e8f0fe;
}
.search:hover {
  background-color: white;
  color: #1967d3;
}
.search {
  font-size: 20px;
  border: none;
  gap: 10px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 18%;
  height: 60px;
  background-color: #1967d3;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* Dropdowns */
.dropdown {
  position: absolute;
  top: 70px;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}
.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}
.dropdown-item:hover {
  background-color: #f0f4fa;
}

/* Date Picker Dropdown */
.date-picker-dropdown {
  position: absolute;
  top: 70px;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  padding: 10px;
}

/* Guest Dropdown */
.guest-dropdown {
  position: absolute;
  top: 70px;
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
}
.done-btn {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #1967d3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.done-btn:hover {
  background: #1557b0;
}
</style>
