<template>
  <main class="page-container">
    <header class="header">
      <h1>Bed Types</h1>

      <div class="header-actions">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by bed type name"
            class="search-input"
            @input="updateSearch"
          />
        </div>
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn" title="Clear search">
          ×
        </button>

        <button class="add-btn" @click="openCreateModal">
          + Add Bed Type
        </button>
      </div>
    </header>

    <div class="search-info" v-if="showSearchInfo">
      {{ searchInfoText }}
    </div>

    <!-- Bed Types Table -->
    <table class="bed-type-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Bed Type Name</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="bedTypeStore.isLoading">
          <td colspan="4" style="text-align: center;">Loading bed types...</td>
        </tr>

        <tr v-else-if="bedTypeStore.filteredBedTypes.length === 0 && searchQuery">
          <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
            No bed types found matching "{{ searchQuery }}"
          </td>
        </tr>

        <tr v-else-if="bedTypeStore.filteredBedTypes.length === 0">
          <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
            No bed types available. Click "Add Bed Type" to create one.
          </td>
        </tr>

        <tr v-for="bedType in bedTypeStore.filteredBedTypes" :key="bedType.id" v-else>
          <td>{{ bedType.id }}</td>
          <td>{{ bedType.name }}</td>
          <td>{{ formatDate(bedType.createdAt) }}</td>
          <td class="action-cell">
            <button class="more-btn" @click="toggleMenu(bedType.id)">
              more
            </button>
            <ActionMenu
              v-if="activeMenuId === bedType.id"
              :options="menuOptions"
              @close="closeMenu"
              @action="(action: string) => handleAction(action, bedType)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Create Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="closeCreateModal">
      <div class="modal-card">
        <h2>Add New Bed Type</h2>

        <div class="form-group">
          <label>Bed Type Name</label>
          <input
            v-model="newBedTypeName"
            type="text"
            placeholder="e.g., King Size, Queen Size, Twin"
            class="form-input"
            :class="{ 'input-error': formError }"
            @keyup.enter="createBedType"
          />
          <span v-if="formError" class="error-text">{{ formError }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeCreateModal">Cancel</button>
          <button class="btn-create" @click="createBedType" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="closeEditModal">
      <div class="modal-card">
        <h2>Edit Bed Type</h2>

        <div class="form-group">
          <label>Bed Type Name</label>
          <input
            v-model="editBedTypeName"
            type="text"
            placeholder="Enter bed type name"
            class="form-input"
            :class="{ 'input-error': formError }"
            @keyup.enter="updateBedType"
          />
          <span v-if="formError" class="error-text">{{ formError }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeEditModal">Cancel</button>
          <button class="btn-create" @click="updateBedType" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ActionMenu from '../components/ActionMenu.vue'
import { useBedTypeStore, type BedType } from '../stores/bedTypeStore'
import { useToast } from '@/composables/useToast'

const bedTypeStore = useBedTypeStore()
const toast = useToast()
const searchQuery = ref('')
const activeMenuId = ref<number | null>(null)

// Create modal state
const showCreateModal = ref(false)
const newBedTypeName = ref('')
const formError = ref('')
const isSubmitting = ref(false)

// Edit modal state
const showEditModal = ref(false)
const editBedTypeName = ref('')
const editBedTypeId = ref<number | null>(null)

const menuOptions = [
  { label: 'Edit', value: 'edit' },
  { label: 'Delete', value: 'delete' },
  { label: 'Back', value: 'back' },
]

onMounted(() => {
  bedTypeStore.fetchBedTypes()
})

const updateSearch = () => {
  bedTypeStore.setSearchQuery(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  bedTypeStore.setSearchQuery('')
}

const showSearchInfo = computed(() => {
  return searchQuery.value.trim() !== ''
})

const searchInfoText = computed(() => {
  const total = bedTypeStore.bedTypes.length
  const filtered = bedTypeStore.filteredBedTypes.length

  if (!searchQuery.value.trim()) {
    return `Showing all ${total} bed types`
  }

  if (filtered === 0) {
    return `No bed types found matching "${searchQuery.value}"`
  }

  return `Found ${filtered} of ${total} bed types matching "${searchQuery.value}"`
})

const toggleMenu = (id: number) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const closeMenu = () => {
  activeMenuId.value = null
}

const handleAction = async (action: string, bedType: BedType) => {
  if (action === 'edit') {
    openEditModal(bedType)
  } else if (action === 'delete') {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${bedType.name}"?\n\n` +
      `⚠️ WARNING: This may affect rooms that use this bed type!\n\n` +
      `This action cannot be undone!`
    )

    if (confirmDelete) {
      const result = await bedTypeStore.deleteBedType(bedType.id)
      if (result.success) {
        toast.success('Bed Type Deleted', `"${bedType.name}" deleted successfully.`)
      } else {
        toast.error('Delete Failed', result.message || 'Failed to delete bed type.')
      }
    }
  }

  activeMenuId.value = null
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Create Modal Functions
const openCreateModal = () => {
  showCreateModal.value = true
  newBedTypeName.value = ''
  formError.value = ''
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newBedTypeName.value = ''
  formError.value = ''
}

const createBedType = async () => {
  if (!newBedTypeName.value.trim()) {
    formError.value = 'Bed type name is required'
    return
  }

  isSubmitting.value = true
  formError.value = ''

  const result = await bedTypeStore.createBedType(newBedTypeName.value.trim())

  if (result.success) {
    closeCreateModal()
    toast.success('Bed Type Created', 'New bed type created successfully!')
  } else {
    const errorResult = result as { errors?: Record<string, string>; message?: string }
    formError.value = errorResult.errors?.name || errorResult.message || 'Failed to create bed type'
  }

  isSubmitting.value = false
}

// Edit Modal Functions
const openEditModal = (bedType: BedType) => {
  showEditModal.value = true
  editBedTypeId.value = bedType.id
  editBedTypeName.value = bedType.name
  formError.value = ''
}

const closeEditModal = () => {
  showEditModal.value = false
  editBedTypeId.value = null
  editBedTypeName.value = ''
  formError.value = ''
}

const updateBedType = async () => {
  if (!editBedTypeName.value.trim()) {
    formError.value = 'Bed type name is required'
    return
  }

  if (!editBedTypeId.value) return

  isSubmitting.value = true
  formError.value = ''

  const result = await bedTypeStore.updateBedType(editBedTypeId.value, editBedTypeName.value.trim())

  if (result.success) {
    closeEditModal()
    toast.success('Bed Type Updated', 'Bed type updated successfully!')
  } else {
    const errorResult = result as { errors?: Record<string, string>; message?: string }
    formError.value = errorResult.errors?.name || errorResult.message || 'Failed to update bed type'
  }

  isSubmitting.value = false
}
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
  cursor: pointer;
  border: none;
}

.add-btn:hover {
  background-color: #0a3674;
}

.search-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

/* Table */
.bed-type-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000;
}

.bed-type-table th {
  background: #0D4798;
  color: white;
  text-align: left;
  padding: 15px;
  border-bottom: 3px solid #000000;
}

.bed-type-table td {
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

/* Modal */
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

.input-error {
  border-color: #cc0000 !important;
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
