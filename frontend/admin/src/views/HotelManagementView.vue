<template>
  <main class="page-container">
    <header class="header">
      <h1>Hotel List</h1>

      <div class="header-actions">
        <div class="search-wrapper">
          <input v-model="searchQuery" type="text" placeholder="Search by hotel name or email" class="search-input"
            @input="updateSearch" />
        </div>
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn" title="Clear search">
          ×
        </button>

        <button class="add-hotel-btn" @click="addHotel">
          + Add Hotel
        </button>
      </div>
    </header>

    <div class="search-info" v-if="showSearchInfo">
      {{ searchInfoText }}
    </div>

    <table class="hotel-table">
      <thead>
        <tr>
          <th>Hotel Name</th>
          <th>Email</th>
          <th>Phone Number</th>
          <th>Total Room</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="hotelStore.isLoading">
          <td colspan="5" style="text-align: center;">Loading data from server...</td>
        </tr>

        <tr v-else-if="hotelStore.filteredHotels.length === 0 && searchQuery">
          <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
            No hotels found matching "{{ searchQuery }}"
          </td>
        </tr>

        <tr v-else-if="hotelStore.filteredHotels.length === 0">
          <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
            No hotels available. Click "Add Hotel" to create your first hotel.
          </td>
        </tr>

        <tr v-for="hotel in hotelStore.filteredHotels" :key="hotel.email" v-else>
          <td>{{ hotel.name }}</td>
          <td>{{ hotel.email }}</td>
          <td>{{ hotel.phoneNumber }}</td>
          <td>{{ hotel.rooms?.length || 0 }}</td>
          <td class="action-cell">
            <button class="more-btn" @click="toggleMenu(hotel)">
              more
            </button>

            <ActionMenu v-if="activeHotelId === hotel.id" :options="menuOptions" @close="closeMenu"
              @action="handleAction" />
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ActionMenu from '../components/ActionMenu.vue';
import { useHotelStore } from '../stores/hotelStore';
import router from '@/router';

const hotelStore = useHotelStore();
const searchQuery = ref('');
const activeHotelId = ref<string | null>(null);
const menuOptions = [
  { label: 'Manage rooms', value: 'manage' },
  { label: 'Edit', value: 'edit' },
  { label: 'Delete', value: 'delete' },
  { label: 'Back', value: 'back' },
];
onMounted(() => {
  hotelStore.fetchHotels();
});

const updateSearch = () => {
  hotelStore.setSearchQuery(searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = '';
  hotelStore.setSearchQuery('');
};

const showSearchInfo = computed(() => {
  return searchQuery.value.trim() !== '';
});

const searchInfoText = computed(() => {
  const total = hotelStore.hotels.length;
  const filtered = hotelStore.filteredHotels.length;

  if (!searchQuery.value.trim()) {
    return `Showing all ${total} hotels`;
  }

  if (filtered === 0) {
    return `No hotels found matching "${searchQuery.value}"`;
  }

  return `Found ${filtered} of ${total} hotels matching "${searchQuery.value}"`;
});

const toggleMenu = (hotel: any) => {
  if (activeHotelId.value === hotel.id) {
    activeHotelId.value = null;
  } else {
    activeHotelId.value = hotel.id;
  }
};

const closeMenu = () => {
  activeHotelId.value = null;
};

const addHotel = () => {
  router.push('/manage_hotel&room/add');
};

const handleAction = async (action: string) => {
  if (!activeHotelId.value) return;

  const hotel = hotelStore.hotels.find(h => h.id === activeHotelId.value);
  if (!hotel) return;

  if (action === 'delete') {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${hotel.name}"?\n\nThis action cannot be undone!`
    );

    if (confirmDelete) {
      const result = await hotelStore.deleteHotel(hotel.id);
      if (result.success) {
        alert(`Hotel "${hotel.name}" deleted successfully!`);
      } else {
        alert(`Failed to delete hotel. Please try again.`);
      }
    }
  } else if (action === 'edit') {
    router.push(`/manage_hotel&room/edit/${hotel.id}`);
  } else if (action === 'manage') {
    console.log("Managing rooms for hotel:", hotel.id);
  }

  activeHotelId.value = null;
};
</script>

<style scoped>
.page-container {
  padding: 50px;
  font-family: 'Lato', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-input {
  padding: 10px 20px;
  width: 300px;
  border-radius: 25px;
  border: 1px solid #D9D9D9;
  outline: none;
  font-size: 14px;
}

.search-input:focus {
  border-color: #0D4798;
}

.add-hotel-btn {
  background-color: #0D4798;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}

.add-hotel-btn:hover {
  background-color: #0a3674;
}

.hotel-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000;
}

th {
  background: #0D4798;
  color: white;
  text-align: left;
  padding: 15px;
  border-bottom: 3px solid #000000;
}

td {
  padding: 18px 15px;
  border-bottom: 1px solid #D9D9D9;
}

.more-btn {
  background: #D9D9D9;
  border: none;
  padding: 6px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.action-cell {
  position: relative;
}
</style>