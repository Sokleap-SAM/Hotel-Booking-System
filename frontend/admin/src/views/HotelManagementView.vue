<template>
  <main class="page-container">
    <header class="header">
      <h1>Hotel List</h1>

      <div class="header-actions">
        <div class="search-wrapper">
          <input v-model="searchQuery" type="text" placeholder="Search by hotel name or email" class="search-input"
            @input="updateSearch" />
        </div>

        <button class="add-hotel-btn" @click="addHotel">
          + Add Hotel
        </button>
      </div>
    </header>

    <!-- Status Filter Tabs -->
    <div class="filter-tabs">
      <button
        :class="['tab-btn', { active: statusFilter === 'all' }]"
        @click="setStatusFilter('all')"
      >
        All ({{ hotelStore.totalCount }})
      </button>
      <button
        :class="['tab-btn', { active: statusFilter === 'active' }]"
        @click="setStatusFilter('active')"
      >
        Active ({{ hotelStore.activeCount }})
      </button>
      <button
        :class="['tab-btn', { active: statusFilter === 'inactive' }]"
        @click="setStatusFilter('inactive')"
      >
        Inactive ({{ hotelStore.inactiveCount }})
      </button>
    </div>

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
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="hotelStore.isLoading">
          <td colspan="6" style="text-align: center;">Loading data from server...</td>
        </tr>

        <tr v-else-if="hotelStore.filteredHotels.length === 0 && searchQuery">
          <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
            No hotels found matching "{{ searchQuery }}"
          </td>
        </tr>

        <tr v-else-if="hotelStore.filteredHotels.length === 0">
          <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
            No hotels available. Click "Add Hotel" to create your first hotel.
          </td>
        </tr>

        <tr v-for="hotel in hotelStore.filteredHotels" :key="hotel.email" v-else>
          <td>{{ hotel.name }}</td>
          <td>{{ hotel.email }}</td>
          <td>{{ hotel.phoneNumber }}</td>
          <td>{{ hotel.rooms?.length || 0 }}</td>
          <td>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="hotel.isActive"
                @change="toggleHotelStatus(hotel)"
              />
              <span class="slider"></span>
            </label>
            <span :class="['status-text', hotel.isActive ? 'active' : 'inactive']">
              {{ hotel.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
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
import { useToast } from '@/composables/useToast';

const hotelStore = useHotelStore();
const toast = useToast();
const searchQuery = ref('');
const activeHotelId = ref<string | null>(null);
const statusFilter = ref<'all' | 'active' | 'inactive'>('all');
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

const setStatusFilter = (status: 'all' | 'active' | 'inactive') => {
  statusFilter.value = status;
  hotelStore.setStatusFilter(status);
};

const toggleHotelStatus = async (hotel: { id: string; isActive: boolean }) => {
  const newStatus = !hotel.isActive;
  const result = await hotelStore.updateHotelStatus(hotel.id, newStatus);
  if (!result.success) {
    toast.error('Status Update Failed', `Failed to update hotel status: ${result.message}`);
  }
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
        toast.success('Hotel Deleted', `"${hotel.name}" deleted successfully!`);
      } else {
        toast.error('Delete Failed', 'Failed to delete hotel. Please try again.');
      }
    }
  } else if (action === 'edit') {
    router.push(`/manage_hotel&room/edit/${hotel.id}`);
  } else if (action === 'manage') {
    console.log("Managing rooms for hotel:", hotel.id);
    router.push(`/manage_hotel&room/${hotel.id}/rooms`);
  }

  activeHotelId.value = null;
};
</script>

<style scoped>
.page-container {
  padding: 50px;
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
  max-width: 100%;
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
  border: none;
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

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 20px;
  border: 2px solid #D9D9D9;
  border-radius: 25px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #0D4798;
  color: #0D4798;
}

.tab-btn.active {
  background-color: #0D4798;
  color: white;
  border-color: #0D4798;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  vertical-align: middle;
  margin-right: 10px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #22c55e;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.status-text.active {
  color: #22c55e;
}

.status-text.inactive {
  color: #ef4444;
}

/* Search Info */
.search-info {
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
}
</style>