<template>
  <div class="cards-container">
    <div class="summary-card card-revenue">
      <div class="card-icon">💰</div>
      <div class="card-content">
        <span class="card-label">Total Revenue</span>
        <span class="card-value">${{ formatNumber(totalRevenue) }}</span>
      </div>
    </div>

    <div class="summary-card card-users">
      <div class="card-icon">👥</div>
      <div class="card-content">
        <span class="card-label">Total Users</span>
        <span class="card-value">{{ formatNumber(totalUsers) }}</span>
      </div>
    </div>

    <div class="summary-card card-bookings">
      <div class="card-icon">📋</div>
      <div class="card-content">
        <span class="card-label">Pending Bookings</span>
        <span class="card-value">{{ formatNumber(pendingBookings) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalRevenue: number
  totalUsers: number
  pendingBookings: number
}>()

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #E5E5E5;
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.card-revenue {
  border-left: 4px solid #4CAF50;
}

.card-users {
  border-left: 4px solid #2196F3;
}

.card-bookings {
  border-left: 4px solid #FF9800;
}

@media (max-width: 900px) {
  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
