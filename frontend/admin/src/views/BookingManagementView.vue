<template>
  <main class="page-container">
    <header class="header">
      <h1>Booking Management</h1>
    </header>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'upcoming' }]" 
        @click="activeTab = 'upcoming'"
      >
        Upcoming ({{ bookingStore.upcomingBookings.length }})
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'history' }]" 
        @click="activeTab = 'history'"
      >
        History ({{ bookingStore.historyBookings.length }})
      </button>

      <select v-if="activeTab === 'history'" v-model="statusFilter" class="status-filter">
        <option value="all">All Status</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <!-- Upcoming Bookings Tab -->
    <UpcomingBookingsTable
      v-if="activeTab === 'upcoming'"
      :bookings="bookingStore.upcomingBookings"
      :is-loading="bookingStore.isLoading"
      @approve="handleApprove"
      @reject="openRejectModal"
    />

    <!-- History Tab -->
    <BookingHistoryTable
      v-if="activeTab === 'history'"
      :bookings="filteredHistoryBookings"
      :is-loading="bookingStore.isLoading"
    />

    <!-- Reject Modal -->
    <RejectModal
      v-if="showRejectModal"
      @close="closeRejectModal"
      @confirm="handleReject"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBookingStore } from '../stores/bookingStore'
import UpcomingBookingsTable from '../components/booking/UpcomingBookingsTable.vue'
import BookingHistoryTable from '../components/booking/BookingHistoryTable.vue'
import RejectModal from '../components/booking/RejectModal.vue'
import { useToast } from '@/composables/useToast'

const bookingStore = useBookingStore()
const toast = useToast()

const activeTab = ref<'upcoming' | 'history'>('upcoming')
const statusFilter = ref('all')
const showRejectModal = ref(false)
const selectedBookingId = ref<string | null>(null)

onMounted(() => {
  bookingStore.fetchAllBookings()
})

const filteredHistoryBookings = computed(() => {
  if (statusFilter.value === 'all') {
    return bookingStore.historyBookings
  }
  return bookingStore.historyBookings.filter(
    (b) => b.status === statusFilter.value
  )
})

const handleApprove = async (bookingId: string) => {
  try {
    await bookingStore.approveBooking(bookingId)
    toast.success('Booking Approved', 'The user can now proceed with payment.')
  } catch {
    toast.error('Approval Failed', 'Failed to approve booking')
  }
}

const openRejectModal = (bookingId: string) => {
  selectedBookingId.value = bookingId
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  selectedBookingId.value = null
}

const handleReject = async (reason: string) => {
  if (!selectedBookingId.value || !reason.trim()) return

  try {
    await bookingStore.rejectBooking(selectedBookingId.value, reason)
    closeRejectModal()
    toast.success('Booking Rejected', 'The booking has been rejected successfully.')
  } catch {
    toast.error('Rejection Failed', 'Failed to reject booking')
  }
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
  margin-bottom: 30px;
}

/* Filter Tabs - matching amenity style */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
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

.status-filter {
  padding: 8px 15px;
  border: 2px solid #D9D9D9;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  outline: none;
  margin-left: auto;
}

.status-filter:focus {
  border-color: #0D4798;
}
</style>
