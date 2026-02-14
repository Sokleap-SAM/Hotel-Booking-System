import { defineStore } from 'pinia'
import api from '@/utils/api'

export interface BookingItem {
  id: string
  roomId: string
  checkIn: string
  checkOut: string
  priceAtBooking: number
  room: {
    id: string
    name: string
    hotel: {
      id: string
      name: string
    }
  }
}

export interface Booking {
  id: string
  userId: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'failed'
  rejectionReason?: string
  guestPhone?: string
  createdAt: string
  confirmedAt?: string
  paymentExpiresAt?: string
  bookingItems: BookingItem[]
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

interface BookingState {
  bookings: Booking[]
  isLoading: boolean
  error: string | null
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    bookings: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    upcomingBookings: (state) =>
      state.bookings.filter((b) => b.status === 'pending'),

    historyBookings: (state) =>
      state.bookings.filter((b) => b.status !== 'pending'),
  },

  actions: {
    async fetchAllBookings() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get<Booking[]>('/bookings/admin/all')
        this.bookings = data
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Failed to fetch bookings'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async approveBooking(bookingId: string) {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.patch<Booking>(`/bookings/admin/${bookingId}/approve`)
        const index = this.bookings.findIndex((b) => b.id === bookingId)
        if (index !== -1) {
          this.bookings[index] = data
        }
        return data
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Failed to approve booking'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async rejectBooking(bookingId: string, reason: string) {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.patch<Booking>(`/bookings/admin/${bookingId}/reject`, { reason })
        const index = this.bookings.findIndex((b) => b.id === bookingId)
        if (index !== -1) {
          this.bookings[index] = data
        }
        return data
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Failed to reject booking'
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})
