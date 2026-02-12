<template>
  <div class="charts-container">
    <!-- Bar Chart - Monthly Revenue -->
    <div class="chart-card">
      <h3>Monthly Revenue ({{ currentYear }})</h3>
      <div class="chart-wrapper">
        <Bar :data="barChartData" :options="barChartOptions" />
      </div>
    </div>

    <!-- Pie Chart - Booking Status -->
    <div class="chart-card">
      <h3>Booking Status</h3>
      <div class="chart-wrapper pie-chart-wrapper">
        <Pie :data="pieChartData" :options="pieChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'
import type { MonthlyRevenue, BookingStats } from '@/stores/dashboardStore'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const props = defineProps<{
  monthlyRevenue: MonthlyRevenue[]
  bookingStats: BookingStats
}>()

const currentYear = new Date().getFullYear()

// Bar Chart Data
const barChartData = computed(() => ({
  labels: props.monthlyRevenue.map((m) => m.month),
  datasets: [
    {
      label: 'Revenue ($)',
      backgroundColor: '#0D4798',
      data: props.monthlyRevenue.map((m) => m.revenue),
      borderRadius: 4,
    },
  ],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number | null } }) => {
          const value = context.parsed.y ?? 0
          return `$${value.toLocaleString()}`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number | string) => `$${Number(value).toLocaleString()}`,
      },
    },
  },
}

// Pie Chart Data
const pieChartData = computed(() => ({
  labels: ['Completed', 'Pending', 'Cancelled'],
  datasets: [
    {
      data: [
        props.bookingStats.completed,
        props.bookingStats.pending,
        props.bookingStats.cancelled,
      ],
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
      borderWidth: 0,
    },
  ],
}))

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
      },
    },
  },
}
</script>

<style scoped>
.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #E5E5E5;
}

.chart-card h3 {
  margin: 0 0 20px;
  font-size: 16px;
  color: #1a1a1a;
}

.chart-wrapper {
  height: 300px;
}

.pie-chart-wrapper {
  height: 280px;
}

@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>
