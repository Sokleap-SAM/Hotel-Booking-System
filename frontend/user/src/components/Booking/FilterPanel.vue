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
          <input type="radio" name="sort" value="highest-rating" v-model="selectedSort" @change="handleSortChange" />
          Best Rating
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
        <div class="filter-actions" v-if="hotelStores.amenitiesList.length > 0">
          <button class="apply-btn" @click="applyAmenityFilter">Apply</button>
          <button class="clear-btn" @click="clearFilters">Clear All</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useHotelStore, type SortOption } from '@/stores/hotelStores';

export default defineComponent({
  name: 'FilterComponent',
  setup() {
    const hotelStores = useHotelStore();
    const selectedSort = ref<SortOption>('default');
    const selectedAmenities = ref<number[]>([]);

    onMounted(async () => {
      await hotelStores.fetchAmenitiesByCategory('hotel');
    });

    const handleSortChange = async () => {
      await hotelStores.applySort(selectedSort.value);
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
      await hotelStores.fetchHotels();
    };

    return {
      hotelStores,
      selectedSort,
      selectedAmenities,
      handleSortChange,
      applyAmenityFilter,
      clearFilters,
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
  height: 550px;
  border-radius: 10px;
  padding: 20px;
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
  background-color: #ccc;
}

.loading-text {
  font-size: 13px;
  color: #666;
  font-style: italic;
}
</style>
