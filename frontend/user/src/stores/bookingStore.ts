import { defineStore } from 'pinia'
import api from '../utils/api'

export interface RoomSelection {
  roomId: string
  roomName: string
  quantity: number
  pricePerNight: number
  discount: number
}

export interface HotelInfo {
  id: string
  name: string
  location: string
  images: string[]
}

export interface PriceBreakdownItem {
  roomId: string
  roomName: string
  pricePerNight: number
  nights: number
  discount: number
  quantity: number
  itemTotal: number
}

export interface PriceBreakdown {
  items: PriceBreakdownItem[]
  subtotal: number
  tax: number
  total: number
}

export interface BookingRecord {
  id: string
  userId: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: string
  rejectionReason?: string
  guestPhone?: string
  createdAt: string
  user?: {
    firstName?: string
    lastName?: string
    email?: string
  }
  payment?: {
    method?: string
    status?: string
  }
  bookingItems: {
    id: string
    roomId: string
    roomName?: string
    hotelName?: string
    checkIn: string
    checkOut: string
    priceAtBooking: number
    room?: {
      id: string
      name: string
      images?: string[]
      capacity?: number
      size?: number
      hotel?: {
        id?: string
        name: string
        location?: string
        images?: string[]
        phone?: string
      }
    }
  }[]
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    // Current booking flow state
    hotelInfo: null as HotelInfo | null,
    checkInDate: '' as string,
    checkOutDate: '' as string,
    roomSelections: {} as Record<string, RoomSelection>,
    priceBreakdown: null as PriceBreakdown | null,
    isCalculating: false,

    // Guest details for booking
    guestDetails: {
      dateOfBirth: '' as string,
      phone: '' as string,
    },

    // User's booking history
    bookings: [] as BookingRecord[],
    userBookings: [] as BookingRecord[],
    currentBooking: null as BookingRecord | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    hasSelectedRooms: (state) => {
      return Object.values(state.roomSelections).some((r) => r.quantity > 0)
    },

    totalSelectedRooms: (state) => {
      return Object.values(state.roomSelections).reduce(
        (sum, r) => sum + r.quantity,
        0,
      )
    },

    nights: (state) => {
      if (!state.checkInDate || !state.checkOutDate) return 1
      const start = new Date(state.checkInDate)
      const end = new Date(state.checkOutDate)
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      )
      return diff > 0 ? diff : 1
    },

    displaySubtotal: (state) => {
      return state.priceBreakdown?.subtotal.toFixed(2) ?? '0.00'
    },

    displayTaxAmount: (state) => {
      return state.priceBreakdown?.tax.toFixed(2) ?? '0.00'
    },

    displayTotalPrice: (state) => {
      return state.priceBreakdown?.total.toFixed(2) ?? '0.00'
    },

    // Build the DTO payload for API calls
    bookingPayload: (state) => {
      const selections = Object.values(state.roomSelections).filter(
        (r) => r.quantity > 0,
      )
      const roomSelections: { roomId: string; checkIn: string; checkOut: string }[] = []

      for (const sel of selections) {
        // One booking item per quantity unit
        for (let i = 0; i < sel.quantity; i++) {
          roomSelections.push({
            roomId: sel.roomId,
            checkIn: state.checkInDate,
            checkOut: state.checkOutDate,
          })
        }
      }

      return {
        roomSelections,
        guestDateOfBirth: state.guestDetails.dateOfBirth || undefined,
        guestPhone: state.guestDetails.phone?.replace(/[^0-9]/g, '') || undefined,
      }
    },
  },

  actions: {
    setHotelInfo(info: HotelInfo) {
      this.hotelInfo = info
    },

    setDates(checkIn: string, checkOut: string) {
      this.checkInDate = checkIn
      this.checkOutDate = checkOut
    },

    clearSelections() {
      this.roomSelections = {}
      this.priceBreakdown = null
    },

    updateRoomSelection(
      roomId: string,
      roomName: string,
      quantity: number,
      pricePerNight: number,
      discount: number,
    ) {
      if (quantity <= 0) {
        delete this.roomSelections[roomId]
      } else {
        this.roomSelections[roomId] = {
          roomId,
          roomName,
          quantity,
          pricePerNight,
          discount,
        }
      }
    },

    async calculatePrice() {
      if (!this.hasSelectedRooms || !this.checkInDate || !this.checkOutDate) {
        this.priceBreakdown = null
        return
      }

      this.isCalculating = true
      try {
        const { data } = await api.post('/bookings/calculate-price', this.bookingPayload)
        this.priceBreakdown = data as PriceBreakdown
      } catch (error) {
        console.error('Price calculation error:', error)
        // Fallback: calculate locally
        this.calculatePriceLocally()
      } finally {
        this.isCalculating = false
      }
    },

    calculatePriceLocally() {
      const items: PriceBreakdownItem[] = []
      let subtotal = 0

      for (const sel of Object.values(this.roomSelections)) {
        if (sel.quantity <= 0) continue
        const discountedPrice = sel.pricePerNight * (1 - sel.discount / 100)
        const itemTotal = discountedPrice * sel.quantity * this.nights

        items.push({
          roomId: sel.roomId,
          roomName: sel.roomName,
          pricePerNight: discountedPrice,
          nights: this.nights,
          discount: sel.discount,
          quantity: sel.quantity,
          itemTotal: Math.round(itemTotal * 100) / 100,
        })

        subtotal += itemTotal
      }

      // 10% tax on subtotal
      const tax = subtotal * 0.1
      this.priceBreakdown = {
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round((subtotal + tax) * 100) / 100,
      }
    },

    async createBooking() {
      if (!this.hasSelectedRooms) {
        throw new Error('No rooms selected')
      }

      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.post('/bookings', this.bookingPayload)
        this.currentBooking = data as BookingRecord
        return data
      } catch (error: unknown) {
        console.error('Create booking error:', error)
        const axiosError = error as { response?: { data?: { message?: string } } }
        this.error = axiosError.response?.data?.message || 'Failed to create booking'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchMyBookings() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get('/bookings')
        this.bookings = data as BookingRecord[]
        return data
      } catch (error) {
        console.error('Fetch bookings error:', error)
        this.error = 'Failed to fetch bookings'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchBookingById(id: string) {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get(`/bookings/${id}`)
        this.currentBooking = data as BookingRecord
        return data
      } catch (error) {
        console.error('Fetch booking error:', error)
        this.error = 'Failed to fetch booking'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserBookings() {
      this.isLoading = true
      this.error = null

      try {
        const { data } = await api.get('/bookings')
        this.userBookings = data as BookingRecord[]
        return this.userBookings
      } catch (error) {
        this.error = 'Failed to fetch your bookings'
        console.error('Fetch user bookings error:', error)
        return []
      } finally {
        this.isLoading = false
      }
    },

    async loadBookingForPayment(bookingId: string) {
      const booking = await this.fetchBookingById(bookingId)
      if (!booking) return null

      // Populate store state from existing booking for payment
      const firstItem = booking.bookingItems[0]
      if (firstItem?.room?.hotel) {
        this.hotelInfo = {
          id: firstItem.room.hotel.id || '',
          name: firstItem.room.hotel.name,
          location: firstItem.room.hotel.location || '',
          images: firstItem.room.hotel.images || [],
        }
      } else if (firstItem?.hotelName) {
        // Use snapshot data if hotel was deleted
        this.hotelInfo = {
          id: '',
          name: firstItem.hotelName,
          location: '',
          images: [],
        }
      }

      this.checkInDate = firstItem?.checkIn || ''
      this.checkOutDate = firstItem?.checkOut || ''

      // Build room selections from booking items
      this.roomSelections = {}
      for (const item of booking.bookingItems) {
        const roomId = item.roomId
        if (!this.roomSelections[roomId]) {
          this.roomSelections[roomId] = {
            roomId,
            roomName: item.room?.name || item.roomName || 'Room',
            quantity: 1,
            pricePerNight: Number(item.priceAtBooking) / this.nights,
            discount: 0,
          }
        } else {
          this.roomSelections[roomId].quantity += 1
        }
      }

      // Build price breakdown
      const items = Object.values(this.roomSelections).map((sel) => ({
        roomId: sel.roomId,
        roomName: sel.roomName,
        pricePerNight: sel.pricePerNight,
        nights: this.nights,
        discount: sel.discount,
        quantity: sel.quantity,
        itemTotal: sel.pricePerNight * sel.quantity * this.nights,
      }))

      const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0)
      const tax = subtotal * 0.1

      this.priceBreakdown = {
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Number(booking.totalPrice),
      }

      return booking
    },

    async cancelBooking(id: string) {
      this.isLoading = true
      try {
        const { data } = await api.patch(`/bookings/${id}/cancel`)
        // Update in local list
        const index = this.bookings.findIndex((b) => b.id === id)
        if (index !== -1) {
          this.bookings[index] = data as BookingRecord
        }
        if (this.currentBooking?.id === id) {
          this.currentBooking = data as BookingRecord
        }
        return data
      } catch (error) {
        console.error('Cancel booking error:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    clearBookingFlow() {
      this.hotelInfo = null
      this.checkInDate = ''
      this.checkOutDate = ''
      this.roomSelections = {}
      this.priceBreakdown = null
      this.isCalculating = false
      this.guestDetails = { dateOfBirth: '', phone: '' }
    },

    setGuestDetails(dateOfBirth: string, phone: string) {
      this.guestDetails.dateOfBirth = dateOfBirth
      this.guestDetails.phone = phone
    },
  },
})
