<template>
  <main class="page-container">
    <header class="header">
      <h1>Dashboard</h1>
    </header>

    <!-- KPI Cards -->
    <KpiCards
      :total-revenue="dashboardStore.totalRevenue"
      :total-users="dashboardStore.totalUsers"
      :pending-bookings="dashboardStore.pendingBookings"
    />

    <!-- Trend Charts -->
    <TrendCharts
      :monthly-revenue="dashboardStore.monthlyRevenue"
      :booking-stats="dashboardStore.bookingStats"
    />

    <!-- Hotel Revenue Table Section -->
    <div class="hotel-section">
      <div class="section-header">
        <h2>Hotel Revenue</h2>
        <div class="header-actions">
          <div class="search-wrapper">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by hotel name or email"
              class="search-input"
              @input="updateSearch"
            />
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          :class="['tab-btn', { active: dashboardStore.sortBy === 'highest-revenue' }]"
          @click="dashboardStore.setSortBy('highest-revenue')"
        >
          Highest Revenue
        </button>
        <button
          :class="['tab-btn', { active: dashboardStore.sortBy === 'lowest-revenue' }]"
          @click="dashboardStore.setSortBy('lowest-revenue')"
        >
          Lowest Revenue
        </button>
        <button
          :class="['tab-btn', { active: dashboardStore.sortBy === 'highest-avg' }]"
          @click="dashboardStore.setSortBy('highest-avg')"
        >
          Highest Avg Revenue
        </button>
        <button
          :class="['tab-btn', { active: dashboardStore.sortBy === 'lowest-avg' }]"
          @click="dashboardStore.setSortBy('lowest-avg')"
        >
          Lowest Avg Revenue
        </button>
      </div>

      <!-- Hotel Table -->
      <table class="hotel-table">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>Email</th>
            <th>Total Revenue</th>
            <th>Avg Monthly Revenue</th>
            <th>Room Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="dashboardStore.isLoading">
            <td colspan="5" style="text-align: center;">Loading data from server...</td>
          </tr>

          <tr v-else-if="dashboardStore.filteredHotelRevenues.length === 0 && searchQuery">
            <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
              No hotels found matching "{{ searchQuery }}"
            </td>
          </tr>

          <tr v-else-if="dashboardStore.filteredHotelRevenues.length === 0">
            <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
              No hotel data available.
            </td>
          </tr>

          <tr v-for="hotel in dashboardStore.filteredHotelRevenues" :key="hotel.id" v-else>
            <td>{{ hotel.name }}</td>
            <td>{{ hotel.email }}</td>
            <td>${{ formatNumber(hotel.totalRevenue) }}</td>
            <td>${{ formatNumber(hotel.averageMonthlyRevenue) }}</td>
            <td>{{ hotel.roomCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Error Message -->
    <div v-if="dashboardStore.error" class="error-message">
      {{ dashboardStore.error }}
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDashboardStore } from '../stores/dashboardStore'
import KpiCards from '@/components/dashboard/KpiCards.vue'
import TrendCharts from '@/components/dashboard/TrendCharts.vue'

const dashboardStore = useDashboardStore()
const searchQuery = ref('')

onMounted(() => {
  dashboardStore.fetchDashboardData()
})

const updateSearch = () => {
  dashboardStore.setSearchQuery(searchQuery.value)
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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

/* Hotel Revenue Section */
.hotel-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #E5E5E5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1a1a1a;
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

/* Filter Tabs - Same style as Amenity */
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

/* Hotel Table - Same style as Amenity */
.hotel-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000;
}

.hotel-table th {
  background: #0D4798;
  color: white;
  text-align: left;
  padding: 15px;
  border-bottom: 3px solid #000000;
}

.hotel-table td {
  padding: 18px 15px;
  border-bottom: 1px solid #D9D9D9;
}

/* Error Message */
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}
</style>
