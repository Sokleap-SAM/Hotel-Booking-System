<template>
  <section class="availability-container">
    <h2 class="section-title">Availability</h2>
    <p class="subtitle">Price auto converted to USD$</p>

    <div class="search-bar">
      <div class="datepicker-group">
        <VueDatePicker
          v-model="dateRange"
          range
          :min-date="new Date()"
          :enable-time-picker="false"
          placeholder="Select Check-in - Check-out"
          format="eee, MMM dd"
          auto-apply
          :teleport="true"
        >
          <template #input-icon>
            <i class="ri-calendar-line calendar-icon"></i>
          </template>
        </VueDatePicker>
      </div>

      <div class="input-group">
        <i class="ri-user-line"></i>
        <span>{{ guestConfig }}</span>
      </div>

      <button class="change-search-btn" @click="handleSearch">Change search</button>
    </div>

    <RoomTable :rooms="rooms" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css' // Don't forget the CSS!
import RoomTable from './RoomTable.vue'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  guestConfig: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rooms: any[]
}>()

// Date Range logic: Default to [Today, Tomorrow]
const dateRange = ref([new Date(), new Date(Date.now() + 86400000)])

const handleSearch = () => {
  console.log('Searching for dates:', dateRange.value)
  // This is where you would call your NestJS API in the future
}
</script>

<style scoped>
/* Matching your specific design colors */
.search-bar {
  display: flex;
  background: #f0f4fa;
  padding: 8px;
  border-radius: 8px;
  gap: 10px;
  border: 2px solid #003580;
  align-items: center;
}

.datepicker-group {
  flex: 1.5;
  background: white;
  border-radius: 4px;
}

:deep(.dp__input) {
  border: none !important;
  font-weight: 700;
  font-family: 'Lato', sans-serif;
  color: #333;
  padding: 12px 12px 12px 40px;
}

.calendar-icon {
  margin-left: 12px;
  color: #003580;
  font-size: 1.2rem;
}

.input-group {
  flex: 1;
  background: white;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #333;
  height: 46px;
}

.change-search-btn {
  background: #003580;
  color: white;
  border: none;
  height: 46px;
  padding: 0 30px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
</style>
