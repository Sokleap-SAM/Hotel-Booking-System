<template>
  <main class="page-container">
    <header class="header">
      <h1>Amenities</h1>

      <div class="header-actions">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by amenity name"
            class="search-input"
            @input="updateSearch"
          />
        </div>
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn" title="Clear search">
          ×
        </button>

        <button class="add-btn" @click="showCreateModal = true">
          + Add Amenity
        </button>
      </div>
    </header>

    <!-- Category Filter Tabs -->
    <div class="filter-tabs">
      <button
        :class="['tab-btn', { active: amenityStore.categoryFilter === 'all' }]"
        @click="amenityStore.setCategoryFilter('all')"
      >
        All ({{ amenityStore.totalCount }})
      </button>
      <button
        :class="['tab-btn', { active: amenityStore.categoryFilter === 'hotel' }]"
        @click="amenityStore.setCategoryFilter('hotel')"
      >
        Hotel Amenities ({{ amenityStore.hotelCount }})
      </button>
      <button
        :class="['tab-btn', { active: amenityStore.categoryFilter === 'room' }]"
        @click="amenityStore.setCategoryFilter('room')"
      >
        Room Amenities ({{ amenityStore.roomCount }})
      </button>
    </div>

    <div class="search-info" v-if="showSearchInfo">
      {{ searchInfoText }}
    </div>

    <!-- Amenities Table -->
    <table class="amenity-table">
      <thead>
        <tr>
          <th>Amenity Name</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="amenityStore.isLoading">
          <td colspan="3" style="text-align: center;">Loading data from server...</td>
        </tr>

        <tr v-else-if="amenityStore.filteredAmenities.length === 0 && searchQuery">
          <td colspan="3" style="text-align: center; padding: 40px; color: #666;">
            No amenities found matching "{{ searchQuery }}"
          </td>
        </tr>

        <tr v-else-if="amenityStore.filteredAmenities.length === 0">
          <td colspan="3" style="text-align: center; padding: 40px; color: #666;">
            No amenities available. Click "Add Amenity" to create one.
          </td>
        </tr>

        <tr v-for="amenity in amenityStore.filteredAmenities" :key="amenity.id" v-else>
          <td>{{ amenity.name }}</td>
          <td>
            <span :class="['category-badge', `badge-${amenity.category}`]">
              {{ amenity.category === 'hotel' ? 'Hotel' : 'Room' }}
            </span>
          </td>
          <td class="action-cell">
            <button class="more-btn" @click="toggleMenu(amenity.id)">
              more
            </button>
            <ActionMenu
              v-if="activeAmenityId === amenity.id"
              :options="menuOptions"
              @close="closeMenu"
              @action="(action: string) => handleAction(action, amenity)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Create Amenity Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="closeCreateModal">
      <div class="modal-card">
        <h2>Add New Amenity</h2>

        <div class="form-group">
          <label>Amenity Name</label>
          <input
            v-model="newAmenityName"
            type="text"
            placeholder="Enter amenity name"
            class="form-input"
            @keyup.enter="createAmenity"
          />
        </div>

        <div class="form-group">
          <label>Category</label>
          <select v-model="newAmenityCategory" class="form-input">
            <option value="hotel">Hotel Amenity</option>
            <option value="room">Room Amenity</option>
          </select>
        </div>

        <p v-if="createError" class="error-text">{{ createError }}</p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeCreateModal">Cancel</button>
          <button class="btn-create" @click="createAmenity" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ActionMenu from '../components/ActionMenu.vue'
import { useAmenityStore } from '../stores/amenityStore'
import type { Amenity } from '../stores/amenityStore'

const amenityStore = useAmenityStore()
const searchQuery = ref('')
const activeAmenityId = ref<number | null>(null)

// Create modal state
const showCreateModal = ref(false)
const newAmenityName = ref('')
const newAmenityCategory = ref<'hotel' | 'room'>('hotel')
const createError = ref('')
const isCreating = ref(false)

const menuOptions = [
  { label: 'Delete', value: 'delete' },
  { label: 'Back', value: 'back' },
]

onMounted(() => {
  amenityStore.fetchAmenities()
})

const updateSearch = () => {
  amenityStore.setSearchQuery(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  amenityStore.setSearchQuery('')
}

const showSearchInfo = computed(() => {
  return searchQuery.value.trim() !== ''
})

const searchInfoText = computed(() => {
  const total = amenityStore.amenities.length
  const filtered = amenityStore.filteredAmenities.length

  if (!searchQuery.value.trim()) {
    return `Showing all ${total} amenities`
  }

  if (filtered === 0) {
    return `No amenities found matching "${searchQuery.value}"`
  }

  return `Found ${filtered} of ${total} amenities matching "${searchQuery.value}"`
})

const toggleMenu = (id: number) => {
  activeAmenityId.value = activeAmenityId.value === id ? null : id
}

const closeMenu = () => {
  activeAmenityId.value = null
}

const handleAction = async (action: string, amenity: Amenity) => {
  if (action === 'delete') {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${amenity.name}"?\n\n` +
      `⚠️ WARNING: This will also delete ALL hotels that contain this amenity!\n\n` +
      `This action cannot be undone!`
    )

    if (confirmDelete) {
      const result = await amenityStore.deleteAmenity(amenity.id)
      if (result.success) {
        const deletedHotels = (result.data as { deletedHotels: number })?.deletedHotels || 0
        if (deletedHotels > 0) {
          alert(`Amenity "${amenity.name}" deleted along with ${deletedHotels} hotel(s).`)
        } else {
          alert(`Amenity "${amenity.name}" deleted successfully.`)
        }
      } else {
        alert(result.message || 'Failed to delete amenity.')
      }
    }
  }

  activeAmenityId.value = null
}

const createAmenity = async () => {
  if (!newAmenityName.value.trim()) {
    createError.value = 'Amenity name is required'
    return
  }

  isCreating.value = true
  createError.value = ''

  const result = await amenityStore.createAmenity(
    newAmenityName.value.trim(),
    newAmenityCategory.value,
  )

  if (result.success) {
    closeCreateModal()
  } else {
    createError.value = result.message || 'Failed to create amenity'
  }

  isCreating.value = false
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newAmenityName.value = ''
  newAmenityCategory.value = 'hotel'
  createError.value = ''
}
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

.clear-search-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.add-btn {
  background-color: #0D4798;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}

.add-btn:hover {
  background-color: #0a3674;
}

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

.search-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.amenity-table {
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

.category-badge {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-hotel {
  background: #e3f2fd;
  color: #0D4798;
}

.badge-room {
  background: #e8f5e9;
  color: #2e7d32;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 12px;
  padding: 35px;
  width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.modal-card h2 {
  margin: 0 0 25px;
  font-size: 1.4rem;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #0D4798;
}

.error-text {
  color: #cc0000;
  font-size: 13px;
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  color: #666;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-create {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #0D4798;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.btn-create:hover:not(:disabled) {
  background: #0a3674;
}

.btn-create:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
