<template>
  <main class="page-container">
    <header class="header">
      <h1>User Management</h1>

      <div class="header-actions">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email"
            class="search-input"
            @input="handleSearch"
          />
        </div>

        <button class="add-user-btn" @click="addUser">
          + Add User
        </button>
      </div>
    </header>

    <!-- Status Filter Tabs -->
    <div class="filter-tabs">
      <button
        :class="['tab-btn', { active: statusFilter === 'all' }]"
        @click="setStatusFilter('all')"
      >
        All ({{ userStore.totalCount }})
      </button>
      <button
        :class="['tab-btn', { active: statusFilter === 'active' }]"
        @click="setStatusFilter('active')"
      >
        Active ({{ userStore.activeCount }})
      </button>
      <button
        :class="['tab-btn', { active: statusFilter === 'inactive' }]"
        @click="setStatusFilter('inactive')"
      >
        Inactive ({{ userStore.inactiveCount }})
      </button>
    </div>

    <div class="search-info" v-if="showSearchInfo">
      {{ searchInfoText }}
    </div>

    <!-- Users Table -->
    <table class="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Provider</th>
          <th>Roles</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="userStore.isLoading">
          <td colspan="7" style="text-align: center;">Loading data from server...</td>
        </tr>

        <tr v-else-if="userStore.filteredUsers.length === 0 && searchQuery">
          <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
            No users found matching "{{ searchQuery }}"
          </td>
        </tr>

        <tr v-else-if="userStore.filteredUsers.length === 0">
          <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
            No users available. Click "Add User" to create one.
          </td>
        </tr>

        <tr v-for="user in userStore.filteredUsers" :key="user.id" v-else>
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span :class="['provider-badge', user.provider === 'google' ? 'badge-google' : 'badge-local']">
              {{ user.provider === 'google' ? 'Google' : 'Local' }}
            </span>
          </td>
          <td>
            <span
              v-for="(roleName, index) in getRoleNames(user)"
              :key="index"
              :class="['role-badge', `badge-${roleName}`]"
            >
              {{ roleName }}
            </span>
          </td>
          <td>
            <label class="toggle-switch" :class="{ 'disabled-toggle': user.id === authStore.user?.id }">
              <input
                type="checkbox"
                :checked="user.isActive"
                @change="toggleUserStatus(user)"
                :disabled="user.id === authStore.user?.id"
              />
              <span class="slider"></span>
            </label>
            <span :class="['status-text', user.isActive ? 'active' : 'inactive']">
              {{ user.isActive ? 'Active' : 'Inactive' }}
            </span>
            <span v-if="user.id === authStore.user?.id" class="self-indicator">(You)</span>
          </td>
          <td>{{ formatDate(user.createdAt) }}</td>
          <td class="action-cell">
            <button class="more-btn" @click="toggleMenu(user.id)">
              more
            </button>
            <ActionMenu
              v-if="activeUserId === user.id"
              :options="menuOptions"
              @close="closeMenu"
              @action="(action: string) => handleAction(action, user)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination" v-if="userStore.pagination.totalPages > 1">
      <button
        @click="changePage(userStore.pagination.page - 1)"
        :disabled="userStore.pagination.page <= 1"
        class="page-btn"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ userStore.pagination.page }} of {{ userStore.pagination.totalPages }}
      </span>
      <button
        @click="changePage(userStore.pagination.page + 1)"
        :disabled="userStore.pagination.page >= userStore.pagination.totalPages"
        class="page-btn"
      >
        Next
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ActionMenu from '../components/ActionMenu.vue'
import { useUserStore } from '../stores/userStore'
import { useAuthStore } from '../stores/authStore'
import type { User } from '../stores/userStore'

const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const activeUserId = ref<number | null>(null)

const menuOptions = [
  { label: 'Edit', value: 'edit' },
  { label: 'Delete', value: 'delete' },
  { label: 'Back', value: 'back' },
]

// Debounce timer
let searchTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  await userStore.fetchRoles()
  await userStore.fetchStats()
  await userStore.fetchUsers()
})

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    userStore.setSearchQuery(searchQuery.value)
    userStore.fetchUsers()
  }, 300)
}

const addUser = () => {
  router.push('/users/add');
};

const setStatusFilter = (status: 'all' | 'active' | 'inactive') => {
  statusFilter.value = status
  userStore.setStatusFilter(status)
}

const showSearchInfo = computed(() => {
  return searchQuery.value.trim() !== ''
})

const searchInfoText = computed(() => {
  const total = userStore.totalCount
  const filtered = userStore.filteredUsers.length

  if (!searchQuery.value.trim()) {
    return `Showing all ${total} users`
  }

  if (filtered === 0) {
    return `No users found matching "${searchQuery.value}"`
  }

  return `Found ${filtered} of ${total} users matching "${searchQuery.value}"`
})

const getRoleNames = (user: User) => {
  return user.roles?.map((ur) => ur.role?.name).filter(Boolean) ?? []
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const toggleMenu = (id: number) => {
  activeUserId.value = activeUserId.value === id ? null : id
}

const closeMenu = () => {
  activeUserId.value = null
}

const changePage = (page: number) => {
  userStore.setPage(page)
}

// Toggle user active status
const toggleUserStatus = async (user: User) => {
  const newStatus = !user.isActive
  const action = newStatus ? 'activate' : 'deactivate'

  const confirmed = confirm(
    `Are you sure you want to ${action} user "${user.firstName} ${user.lastName}"?\n\n` +
      (newStatus
        ? 'The user will be able to log in.'
        : 'The user will NOT be able to log in.')
  )

  if (confirmed) {
    const result = await userStore.updateUserStatus(user.id, newStatus)
    if (!result.success) {
      alert(result.message || `Failed to ${action} user.`)
    }
  }
}

const handleAction = async (action: string, user: User) => {
  if (action === 'delete') {
    if (user.id === authStore.user?.id) {
      alert('You cannot delete your own account.')
      activeUserId.value = null
      return
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete "${user.firstName} ${user.lastName}"?\n\n` +
        `This action cannot be undone!`
    )

    if (confirmDelete) {
      const result = await userStore.deleteUser(user.id)
      if (result.success) {
        alert(`User "${user.firstName} ${user.lastName}" deleted successfully.`)
      } else {
        alert(result.message || 'Failed to delete user.')
      }
    }
  } else if (action === 'edit') {
    router.push(`/users/edit/${user.id}`)
  }

  activeUserId.value = null
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

.add-user-btn {
  background-color: #0D4798;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  border: none;
}

.add-user-btn:hover {
  background-color: #0a3674;
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

.search-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

/* Table - matching hotel table design */
.user-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000;
}

.user-table th {
  background: #0D4798;
  color: white;
  text-align: left;
  padding: 15px;
  border-bottom: 3px solid #000000;
}

.user-table td {
  padding: 18px 15px;
  border-bottom: 1px solid #D9D9D9;
}

.provider-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-local {
  background: #e3f2fd;
  color: #0D4798;
}

.badge-google {
  background: #fef3cd;
  color: #856404;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 5px;
}

.badge-admin {
  background: #fee2e2;
  color: #dc2626;
}

.badge-user {
  background: #dbeafe;
  color: #2563eb;
}

.badge-manager {
  background: #fef3c7;
  color: #d97706;
}

.badge-hotelier {
  background: #dcfce7;
  color: #16a34a;
}

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

.action-cell {
  position: relative;
}

.more-btn {
  background: #D9D9D9;
  border: none;
  padding: 6px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.more-btn:hover {
  background: #c0c0c0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.page-btn {
  padding: 10px 20px;
  background: #0D4798;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: #07316d;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* Disabled toggle for self */
.disabled-toggle {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled-toggle .slider {
  cursor: not-allowed;
}

.self-indicator {
  font-size: 12px;
  color: #0D4798;
  font-weight: 600;
  margin-left: 8px;
}
</style>
