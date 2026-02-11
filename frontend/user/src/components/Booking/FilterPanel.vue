<template>
  <div class="filter-container">
    <div class="filter-content">
      <!-- Destination Section -->
      <div class="destination-section" @click="showDestinationDropdown = !showDestinationDropdown">
        <i class="ri-search-line"></i>
        <div class="destination-content">
          <span class="destination-label">Destination</span>
          <span class="destination-value">{{ destination || 'Select location' }}</span>
        </div>
        <div v-if="showDestinationDropdown" class="destination-dropdown" @click.stop>
          <div 
            v-for="loc in locations" 
            :key="loc" 
            class="destination-item"
            @click="selectDestination(loc)"
          >
            {{ loc }}
          </div>
        </div>
      </div>

      <h3 class="filter-header">Filter by:</h3>

      <!-- Sort Options -->
      <div class="filter-group">
        <p class="group-title">Sort By</p>
        <label>
          <input type="radio" name="sort" value="default" v-model="selectedSort" @change="handleSortChange" />
          Default
        </label>
        <label>
          <input type="radio" name="sort" value="lowest-price" v-model="selectedSort" @change="handleSortChange" />
          Lowest Price
        </label>
        <label>
          <input type="radio" name="sort" value="highest-price" v-model="selectedSort" @change="handleSortChange" />
          Highest Price
        </label>
        <label>
          <input type="radio" name="sort" value="highest-discount" v-model="selectedSort" @change="handleSortChange" />
          Biggest Discount
        </label>
      </div>

      <!-- Amenities Filter -->
      <div class="filter-group">
        <p class="group-title">Amenities</p>
        <div v-if="hotelStores.amenitiesList.length === 0" class="loading-text">
          Loading amenities...
        </div>
        <label v-for="amenity in hotelStores.amenitiesList" :key="amenity.id">
          <input
            type="checkbox"
            :value="amenity.id"
            v-model="selectedAmenities"
          />
          {{ amenity.name }}
        </label>
      </div>

      <!-- Bed Type Filter -->
      <div class="filter-group">
        <p class="group-title">Bed Type</p>
        <div v-if="hotelStores.bedTypesList.length === 0" class="loading-text">
          Loading bed types...
        </div>
        <label v-for="bedType in hotelStores.bedTypesList" :key="bedType.id">
          <input
            type="checkbox"
            :value="bedType.id"
            v-model="selectedBedTypes"
          />
          {{ bedType.name }}
        </label>
        <div class="filter-actions" v-if="hotelStores.amenitiesList.length > 0">
          <button class="apply-btn" @click="applyFilters">Apply</button>
          <button class="clear-btn" @click="clearFilters">Clear All</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHotelStore, type SortOption } from '@/stores/hotelStores';

export default defineComponent({
  name: 'FilterComponent',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const hotelStores = useHotelStore();
    const selectedSort = ref<SortOption>('default');
    const selectedAmenities = ref<number[]>([]);
    const selectedBedTypes = ref<number[]>([]);

    // Destination state
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
    ];
    const destination = ref('');
    const showDestinationDropdown = ref(false);

    const selectDestination = async (loc: string) => {
      destination.value = loc;
      showDestinationDropdown.value = false;
      
      // Update URL query
      const query = { ...route.query, destination: loc };
      router.replace({ query });
      
      // Trigger search with destination filter
      await hotelStores.searchHotelsWithAvailability({
        destination: loc,
        checkIn: route.query.checkIn as string,
        checkOut: route.query.checkOut as string,
      });
    };

    onMounted(async () => {
      // Initialize destination from query
      if (route.query.destination) {
        destination.value = String(route.query.destination);
      }

      await Promise.all([
        hotelStores.fetchAmenitiesByCategory('hotel'),
        hotelStores.fetchBedTypes()
      ]);
    });

    const handleSortChange = async () => {
      await hotelStores.applySort(selectedSort.value);
    };

    const applyFilters = async () => {
      applyAmenityFilter();
      applyBedTypeFilter();
    };

    const applyBedTypeFilter = async () => {
      if (selectedBedTypes.value.length > 0) {
        await hotelStores.fetchHotelsByBedType(selectedBedTypes.value);
      } else {
        await hotelStores.applySort(selectedSort.value);
      }
    };

    const applyAmenityFilter = async () => {
      if (selectedAmenities.value.length > 0) {
        await hotelStores.fetchHotelsByAmenities(selectedAmenities.value);
      } else {
        await hotelStores.applySort(selectedSort.value);
      }
    };

    const clearFilters = async () => {
      selectedSort.value = 'default';
      selectedAmenities.value = [];
      selectedBedTypes.value = [];
      await hotelStores.fetchHotels();
    };

    return {
      hotelStores,
      selectedSort,
      selectedAmenities,
      selectedBedTypes,
      handleSortChange,
      applyFilters,
      clearFilters,
      // Destination
      locations,
      destination,
      showDestinationDropdown,
      selectDestination,
    };
  },
});
</script>

<style scoped>
.filter-container {
  /* Positioning Logic */
  position: absolute;
  top: 380px;
  left: 10%;
  z-index: 100;

  display: flex;
  flex-direction: column;
  background-color: #DFDFDF;
  width: 304px;
  height: auto;
  max-height: 700px;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box; /* Ensures padding doesn't increase width */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #333;
  text-align: left;
}

.filter-header {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #bcbcbc;
  padding-bottom: 10px;
}

/* Destination Section Styles */
.destination-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.destination-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.destination-section i {
  font-size: 1.5rem;
  color: #1a73e8;
}

.destination-content {
  display: flex;
  flex-direction: column;
}

.destination-label {
  font-weight: bold;
  font-size: 14px;
  color: #000;
}

.destination-value {
  font-size: 13px;
  color: #1a73e8;
}

.destination-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 101;
  max-height: 200px;
  overflow-y: auto;
}

.destination-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.destination-item:hover {
  background-color: #f0f4fa;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 5px 0;
}

label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

label:hover {
  opacity: 0.7;
}

input[type="radio"], input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.apply-btn, .clear-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.apply-btn {
  background-color: #1a73e8;
  color: white;
}

.apply-btn:hover {
  background-color: #1557b0;
}

.clear-btn {
  background-color: #e0e0e0;
  color: #333;
}

.clear-btn:hover {
  color: white;
  background-color: #ff0000;
}

.loading-text {
  font-size: 13px;
  color: #666;
  font-style: italic;
}
</style>
