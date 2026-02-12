<template>
  <main class="page-container">
    <header class="header">
      <h1>Bill Management</h1>

      <div class="header-actions">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by Trans ID, Booking ID, or Email"
            class="search-input"
            @input="updateSearch"
          />
        </div>
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn" title="Clear search">
          ×
        </button>
      </div>
    </header>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-value">${{ formatCurrency(paymentStore.totalRevenue) }}</div>
        <div class="summary-label">Total Revenue</div>
      </div>
      <div class="summary-card">
        <div class="summary-value">{{ paymentStore.totalCount }}</div>
        <div class="summary-label">Total Transactions</div>
      </div>
      <div class="summary-card success">
        <div class="summary-value">{{ paymentStore.completedCount }}</div>
        <div class="summary-label">Completed</div>
      </div>
      <div class="summary-card warning">
        <div class="summary-value">{{ paymentStore.pendingCount }}</div>
        <div class="summary-label">Pending</div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        :class="['tab-btn', { active: paymentStore.statusFilter === 'all' }]"
        @click="paymentStore.setStatusFilter('all')"
      >
        All ({{ paymentStore.totalCount }})
      </button>
      <button
        :class="['tab-btn', { active: paymentStore.statusFilter === 'completed' }]"
        @click="paymentStore.setStatusFilter('completed')"
      >
        Completed ({{ paymentStore.completedCount }})
      </button>
      <button
        :class="['tab-btn', { active: paymentStore.statusFilter === 'pending' }]"
        @click="paymentStore.setStatusFilter('pending')"
      >
        Pending ({{ paymentStore.pendingCount }})
      </button>
      <button
        :class="['tab-btn', { active: paymentStore.statusFilter === 'failed' }]"
        @click="paymentStore.setStatusFilter('failed')"
      >
        Failed ({{ paymentStore.failedCount }})
      </button>

      <div class="filter-divider"></div>

      <select v-model="methodFilter" class="method-filter" @change="updateMethodFilter">
        <option value="all">All Payment Methods</option>
        <option value="khqr">KHQR ({{ paymentStore.khqrCount }})</option>
        <option value="stripe">Stripe ({{ paymentStore.stripeCount }})</option>
      </select>
    </div>

    <div class="search-info" v-if="showSearchInfo">
      {{ searchInfoText }}
    </div>

    <!-- Transactions Table -->
    <table class="transaction-table">
      <thead>
        <tr>
          <th>Trans ID</th>
          <th>Booking ID</th>
          <th>Payment Type</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="paymentStore.isLoading">
          <td colspan="7" style="text-align: center;">Loading transactions...</td>
        </tr>

        <tr v-else-if="paymentStore.filteredPayments.length === 0 && searchQuery">
          <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
            No transactions found matching "{{ searchQuery }}"
          </td>
        </tr>

        <tr v-else-if="paymentStore.filteredPayments.length === 0">
          <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
            No transactions available.
          </td>
        </tr>

        <tr v-for="payment in paymentStore.filteredPayments" :key="payment.id" v-else>
          <td class="trans-id">{{ truncateId(payment.id) }}</td>
          <td class="booking-id">{{ truncateId(payment.bookingId) }}</td>
          <td>
            <span :class="['method-badge', `badge-${payment.paymentMethod}`]">
              {{ payment.paymentMethod === 'khqr' ? 'KHQR' : 'Stripe' }}
            </span>
          </td>
          <td class="amount">${{ formatCurrency(payment.amount) }}</td>
          <td>{{ formatDate(payment.createdAt) }}</td>
          <td>
            <span :class="['status-badge', `status-${payment.status}`]">
              {{ capitalizeFirst(payment.status) }}
            </span>
          </td>
          <td>
            <button class="view-btn" @click="viewDetails(payment.id)">
              View Detail
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Payment Detail Modal -->
    <PaymentDetailModal
      v-if="showDetailModal"
      :payment="paymentStore.selectedPayment"
      :is-loading="isLoadingDetails"
      @close="closeDetailModal"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePaymentStore } from '../stores/paymentStore'
import PaymentDetailModal from '../components/payment/PaymentDetailModal.vue'

const paymentStore = usePaymentStore()
const searchQuery = ref('')
const methodFilter = ref<'all' | 'khqr' | 'stripe'>('all')
const showDetailModal = ref(false)
const isLoadingDetails = ref(false)

onMounted(() => {
  paymentStore.fetchAllPayments()
})

const updateSearch = () => {
  paymentStore.setSearchQuery(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  paymentStore.setSearchQuery('')
}

const updateMethodFilter = () => {
  paymentStore.setMethodFilter(methodFilter.value)
}

const showSearchInfo = computed(() => {
  return searchQuery.value.trim() !== ''
})

const searchInfoText = computed(() => {
  const total = paymentStore.payments.length
  const filtered = paymentStore.filteredPayments.length

  if (!searchQuery.value.trim()) {
    return `Showing all ${total} transactions`
  }

  if (filtered === 0) {
    return `No transactions found matching "${searchQuery.value}"`
  }

  return `Found ${filtered} of ${total} transactions matching "${searchQuery.value}"`
})

const viewDetails = async (paymentId: string) => {
  isLoadingDetails.value = true
  showDetailModal.value = true
  try {
    await paymentStore.fetchPaymentDetails(paymentId)
  } catch {
    alert('Failed to load payment details')
    showDetailModal.value = false
  } finally {
    isLoadingDetails.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  paymentStore.clearSelectedPayment()
}

const truncateId = (id: string) => {
  if (!id) return '-'
  return id.length > 12 ? `${id.substring(0, 8)}...` : id
}

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
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

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.summary-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.summary-card.success {
  border-color: #4caf50;
  background: #f1f8e9;
}

.summary-card.warning {
  border-color: #ff9800;
  background: #fff8e1;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 5px;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
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

.filter-divider {
  width: 1px;
  height: 30px;
  background: #D9D9D9;
  margin: 0 10px;
}

.method-filter {
  padding: 8px 16px;
  border: 2px solid #D9D9D9;
  border-radius: 25px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  outline: none;
  cursor: pointer;
}

.method-filter:focus {
  border-color: #0D4798;
}

.search-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

/* Table */
.transaction-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000;
  background: white;
}

.transaction-table th {
  background: #0D4798;
  color: white;
  text-align: left;
  padding: 15px;
  border-bottom: 3px solid #000000;
  font-weight: 600;
}

.transaction-table td {
  padding: 15px;
  border-bottom: 1px solid #D9D9D9;
}

.trans-id,
.booking-id {
  font-family: monospace;
  font-size: 13px;
  color: #555;
}

.amount {
  font-weight: 600;
  color: #1a1a1a;
}

/* Method Badges */
.method-badge {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-khqr {
  background: #fff3e0;
  color: #e65100;
}

.badge-stripe {
  background: #e3f2fd;
  color: #1565c0;
}

/* Status Badges */
.status-badge {
  padding: 4px 14px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pending {
  background: #fff8e1;
  color: #f57c00;
}

.status-processing {
  background: #e3f2fd;
  color: #1976d2;
}

.status-completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-failed {
  background: #ffebee;
  color: #c62828;
}

.status-refunded {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* View Button */
.view-btn {
  background: #0D4798;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}

.view-btn:hover {
  background: #0a3674;
}
</style>
