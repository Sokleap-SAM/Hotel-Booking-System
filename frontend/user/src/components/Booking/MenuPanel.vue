<template>
  <div class="container">
    <div class="search-item" @click="showDestinationDropdown = !showDestinationDropdown">
      <i class="ri-map-pin-line"></i>
      <div class="text-content">
        <span class="label">Destination</span>
        <span class="sub-text">{{ destination || 'Select location' }}</span>
      </div>
      <div v-if="showDestinationDropdown" class="dropdown" @click.stop>
        <div 
          v-for="loc in locations" 
          :key="loc" 
          class="dropdown-item"
          @click="selectDestination(loc)"
        >
          {{ loc }}
        </div>
      </div>
    </div>

    <div class="search-item" @click="showDatePicker = !showDatePicker">
      <i class="ri-calendar-2-line"></i>
      <div class="text-content">
        <span class="label">Date</span>
        <span class="sub-text">{{ formattedDateRange }}</span>
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

    <div class="search-item" @click="showGuestDropdown = !showGuestDropdown">
      <i class="ri-user-line"></i>
      <div class="text-content">
        <span class="sub-text bold">{{ adults }} adults · {{ children }} children · {{ rooms }} room{{ rooms > 1 ? 's' : '' }}</span>
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

    <button class="search-button" @click="handleSearch">Search</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHotelStore } from '@/stores/hotelStores'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

export default defineComponent({
  name: 'SearchBar',
  components: {
    VueDatePicker
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const hotelStore = useHotelStore()

    // Destinations (Cambodian provinces)
    const locations = [
      'Banteay Meanchey',
      'Battambang',
      'Kampong Cham',
      'Kampong Chhnang',
      'Kampong Speu',
      'Kampong Thom',
      'Kampot',
      'Kandal',
      'Kep',
      'Koh Kong',
      'Takéo',
      'Mondulkiri',
      'Oddar Meanchey',
      'Pailin',
      'Phnom Penh',
      'Preah Sihanouk',
      'Preah Vihear',
      'Prey Veng',
      'Pursat',
      'Ratanakiri',
      'Siem Reap',
      'Stung Treng',
      'Svay Rieng',
      'Takeo',
      'Tboung Khmum',
    ]
    const destination = ref('')
    const showDestinationDropdown = ref(false)

    // Date picker
    const today = new Date()
    today.setHours(11, 0, 0, 0) // Check-in time: 11:00
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // Check-out time: 9:00
    const dateRange = ref<Date[]>([today, tomorrow])
    const showDatePicker = ref(false)

    // Ensure static times: check-in at 11:00, check-out at 9:00
    // Also enforce minimum 1-day stay
    const normalizeDateTime = (dates: Date[] | null) => {
      if (!dates || dates.length < 2) return
      if (dates[0]) dates[0].setHours(11, 0, 0, 0)
      if (dates[1]) dates[1].setHours(9, 0, 0, 0)
      
      // Ensure checkout is at least 1 day after checkin
      if (dates[0] && dates[1]) {
        const checkInDay = new Date(dates[0].getFullYear(), dates[0].getMonth(), dates[0].getDate())
        const checkOutDay = new Date(dates[1].getFullYear(), dates[1].getMonth(), dates[1].getDate())
        
        if (checkOutDay <= checkInDay) {
          const nextDay = new Date(checkInDay)
          nextDay.setDate(nextDay.getDate() + 1)
          nextDay.setHours(9, 0, 0, 0)
          dates[1] = nextDay
        }
      }
    }

    watch(dateRange, (newDates) => {
      normalizeDateTime(newDates)
    }, { deep: true })

    // Guest configuration
    const adults = ref(2)
    const children = ref(0)
    const rooms = ref(1)
    const showGuestDropdown = ref(false)

    const formattedDateRange = computed(() => {
      if (!dateRange.value[0] || !dateRange.value[1]) return 'Select Date'
      const formatDate = (date: Date) => 
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return `${formatDate(dateRange.value[0])} - ${formatDate(dateRange.value[1])}`
    })

    const selectDestination = (loc: string) => {
      destination.value = loc
      showDestinationDropdown.value = false
    }

    // Initialize from route query params
    const initializeFromQuery = () => {
      const query = route.query
      if (query.destination) destination.value = String(query.destination)
      if (query.checkIn) dateRange.value[0] = new Date(String(query.checkIn))
      if (query.checkOut) dateRange.value[1] = new Date(String(query.checkOut))
      if (query.adults) adults.value = parseInt(String(query.adults), 10)
      if (query.children) children.value = parseInt(String(query.children), 10)
      if (query.rooms) rooms.value = parseInt(String(query.rooms), 10)
      
      // Validate dates after loading from query params
      normalizeDateTime(dateRange.value)
    }

    const handleSearch = async () => {
      // Update URL with search params
      const query: Record<string, string> = {}
      if (destination.value) query.destination = destination.value
      if (dateRange.value[0]) query.checkIn = dateRange.value[0].toISOString()
      if (dateRange.value[1]) query.checkOut = dateRange.value[1].toISOString()
      query.adults = String(adults.value)
      query.children = String(children.value)
      query.rooms = String(rooms.value)

      // Update route query
      router.replace({ query })

      // Perform search with availability check
      await hotelStore.searchHotelsWithAvailability({
        destination: destination.value || undefined,
        checkIn: dateRange.value[0]?.toISOString(),
        checkOut: dateRange.value[1]?.toISOString(),
        guests: adults.value + children.value,
        rooms: rooms.value,
      })
    }

    onMounted(() => {
      initializeFromQuery()
      // If there are query params, perform initial search
      if (Object.keys(route.query).length > 0) {
        handleSearch()
      } else {
        // Otherwise fetch all hotels
        hotelStore.fetchHotels()
      }
    })

    // Watch for route query changes
    watch(() => route.query, () => {
      initializeFromQuery()
    })

    return {
      locations,
      destination,
      showDestinationDropdown,
      dateRange,
      showDatePicker,
      adults,
      children,
      rooms,
      showGuestDropdown,
      formattedDateRange,
      selectDestination,
      handleSearch,
    }
  },
})
</script>

<style scoped>
.container {
  position: absolute;
  left: 50%;
  bottom: -60px;
  transform: translateX(-50%);

  width: 1234px;
  max-width: calc(100% - 40px);
  height: 121px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 150;

  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
  box-sizing: border-box;
  font-family: 'Lato', sans-serif;
}

.search-item {
  position: relative;
  flex: 1;
  height: 90px;
  background-color: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
  cursor: pointer;
}

.search-item i {
  font-size: 1.8rem;
  color: #555;
}

.search-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #e8f0fe;
}

.text-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: bold;
  font-size: 1.2rem;
  color: #000;
}

.sub-text {
  font-size: 0.9rem;
  color: #555;
}

.bold {
  font-weight: 600;
  color: #000;
}

.search-button {
  flex: 1;
  height: 90px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #1557b0;
}

/* Dropdown Styles */
.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 200;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 5px;
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
  top: 100px;
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
  top: 100px;
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
  background: #1a73e8;
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
