<template>
  <div class="filter-container">
    <div class="filter-content">

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
import { defineComponent, ref, onMounted} from 'vue';
import { useHotelStore, type SortOption } from '@/stores/hotelStores';

export default defineComponent({
  name: 'FilterComponent',
  setup() {
    const hotelStores = useHotelStore();
    const selectedSort = ref<SortOption>('default');
    const selectedAmenities = ref<number[]>([]);
    const selectedBedTypes = ref<number[]>([]);

    onMounted(async () => {

      await Promise.all([
        hotelStores.fetchAmenitiesByCategory('hotel'),
        hotelStores.fetchBedTypes()
      ]);
    });

    const handleSortChange = async () => {
      // When sort changes, apply the combined filter with current selections
      await hotelStores.fetchHotelsByCombinedFilters(
        selectedAmenities.value,
        selectedBedTypes.value,
        selectedSort.value
      );
    };

    const applyFilters = async () => {
      // Use combined endpoint to apply all filters together
      await hotelStores.fetchHotelsByCombinedFilters(
        selectedAmenities.value,
        selectedBedTypes.value,
        selectedSort.value
      );
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
    };
  },
});
</script>

<style scoped>
.filter-container {
  /* Positioning Logic */
  position: sticky;
  top: 90px;
  align-self: flex-start;
  z-index: 100;

  display: flex;
  flex-direction: column;
  background-color: #DFDFDF;
  width: 304px;
  min-width: 304px;
  height: auto;
  max-height: calc(100vh - 120px);
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
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
