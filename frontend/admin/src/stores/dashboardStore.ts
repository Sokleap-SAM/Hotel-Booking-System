import { defineStore } from 'pinia'
import api from '@/utils/api'

export interface HotelRevenue {
  id: string
  name: string
  email: string
  totalRevenue: number
  averageMonthlyRevenue: number
  roomCount: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
}

export interface BookingStats {
  completed: number
  pending: number
  cancelled: number
}

interface DashboardState {
  totalRevenue: number
  totalUsers: number
  pendingBookings: number
  monthlyRevenue: MonthlyRevenue[]
  bookingStats: BookingStats
  hotelRevenues: HotelRevenue[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  sortBy: 'highest-revenue' | 'lowest-revenue' | 'highest-avg' | 'lowest-avg'
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    totalRevenue: 0,
    totalUsers: 0,
    pendingBookings: 0,
    monthlyRevenue: [],
    bookingStats: { completed: 0, pending: 0, cancelled: 0 },
    hotelRevenues: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    sortBy: 'highest-revenue',
  }),

  getters: {
    filteredHotelRevenues: (state) => {
      let result = [...state.hotelRevenues]

      // Filter by search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        result = result.filter(
          (hotel) =>
            hotel.name.toLowerCase().includes(query) ||
            hotel.email.toLowerCase().includes(query)
        )
      }

      // Sort
      switch (state.sortBy) {
        case 'highest-revenue':
          result.sort((a, b) => b.totalRevenue - a.totalRevenue)
          break
        case 'lowest-revenue':
          result.sort((a, b) => a.totalRevenue - b.totalRevenue)
          break
        case 'highest-avg':
          result.sort((a, b) => b.averageMonthlyRevenue - a.averageMonthlyRevenue)
          break
        case 'lowest-avg':
          result.sort((a, b) => a.averageMonthlyRevenue - b.averageMonthlyRevenue)
          break
      }

      return result
    },
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    setSortBy(sort: 'highest-revenue' | 'lowest-revenue' | 'highest-avg' | 'lowest-avg') {
      this.sortBy = sort
    },

    async fetchDashboardData() {
      this.isLoading = true
      this.error = null

      try {
        // Fetch all data in parallel
        const [paymentsRes, bookingsRes, usersRes, hotelsRes] = await Promise.all([
          api.get('/payments/admin/all'),
          api.get('/bookings/admin/all'),
          api.get('/admin/users/stats'),
          api.get('/hotels'),
        ])

        const payments = paymentsRes.data || []
        const bookings = bookingsRes.data || []
        const userStats = usersRes.data || {}
        const hotels = hotelsRes.data || []

        // Calculate total revenue (completed payments only)
        // Note: amount may come as string from decimal column
        this.totalRevenue = payments
          .filter((p: { status: string }) => p.status === 'completed')
          .reduce((sum: number, p: { amount: number | string }) => sum + parseFloat(String(p.amount || 0)), 0)

        // Total users
        this.totalUsers = userStats.totalUsers || 0

        // Pending bookings
        this.pendingBookings = bookings.filter(
          (b: { status: string }) => b.status === 'pending'
        ).length

        // Booking stats for pie chart
        this.bookingStats = {
          completed: bookings.filter((b: { status: string }) => b.status === 'completed' || b.status === 'confirmed').length,
          pending: bookings.filter((b: { status: string }) => b.status === 'pending').length,
          cancelled: bookings.filter((b: { status: string }) => b.status === 'cancelled').length,
        }

        // Monthly revenue for current year (bar chart)
        const currentYear = new Date().getFullYear()
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        // Initialize all months with 0
        const monthlyData: Record<number, number> = {}
        for (let i = 0; i < 12; i++) {
          monthlyData[i] = 0
        }

        // Sum completed payments by month
        payments
          .filter((p: { status: string; completedAt: string }) => p.status === 'completed' && p.completedAt)
          .forEach((p: { completedAt: string; amount: number | string }) => {
            const date = new Date(p.completedAt)
            if (date.getFullYear() === currentYear) {
              const month = date.getMonth()
              monthlyData[month] = (monthlyData[month] || 0) + parseFloat(String(p.amount || 0))
            }
          })

        this.monthlyRevenue = monthNames.map((month, index) => ({
          month,
          revenue: monthlyData[index] || 0,
        }))

        // Hotel revenues
        this.hotelRevenues = this.calculateHotelRevenues(hotels, bookings, payments)

      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Failed to fetch dashboard data'
        console.error('Dashboard error:', error)
      } finally {
        this.isLoading = false
      }
    },

    calculateHotelRevenues(
      hotels: Array<{ id: string; name: string; email: string; rooms?: Array<{ id: string }> }>,
      bookings: Array<{ 
        id: string; 
        status: string; 
        totalPrice: number | string; 
        createdAt: string;
        bookingItems: Array<{ room: { hotel?: { id: string } } }> 
      }>,
      payments: Array<{ bookingId: string; status: string; amount: number | string; completedAt: string | null }>
    ): HotelRevenue[] {
      const hotelRevenueMap = new Map<string, { 
        totalRevenue: number; 
        monthlyRevenues: Map<string, number>;
        roomCount: number;
      }>()

      // Initialize hotel map
      hotels.forEach((hotel) => {
        hotelRevenueMap.set(hotel.id, {
          totalRevenue: 0,
          monthlyRevenues: new Map(),
          roomCount: hotel.rooms?.length || 0,
        })
      })

      // Calculate revenue from completed payments
      const completedPayments = payments.filter((p) => p.status === 'completed')
      
      completedPayments.forEach((payment) => {
        const booking = bookings.find((b) => b.id === payment.bookingId)
        if (booking && booking.bookingItems?.length > 0) {
          const hotelId = booking.bookingItems[0]?.room?.hotel?.id
          if (hotelId && hotelRevenueMap.has(hotelId)) {
            const hotelData = hotelRevenueMap.get(hotelId)!
            const amount = parseFloat(String(payment.amount || 0))
            hotelData.totalRevenue += amount

            // Track monthly revenue
            if (payment.completedAt) {
              const monthKey = payment.completedAt.substring(0, 7) // YYYY-MM
              const currentMonthly = hotelData.monthlyRevenues.get(monthKey) || 0
              hotelData.monthlyRevenues.set(monthKey, currentMonthly + amount)
            }
          }
        }
      })

      // Convert to array format
      return hotels.map((hotel) => {
        const data = hotelRevenueMap.get(hotel.id) || { 
          totalRevenue: 0, 
          monthlyRevenues: new Map(),
          roomCount: 0,
        }
        
        const monthCount = Math.max(data.monthlyRevenues.size, 1)
        const averageMonthlyRevenue = data.totalRevenue / monthCount

        return {
          id: hotel.id,
          name: hotel.name,
          email: hotel.email,
          totalRevenue: data.totalRevenue,
          averageMonthlyRevenue: Math.round(averageMonthlyRevenue * 100) / 100,
          roomCount: data.roomCount,
        }
      })
    },
  },
})
