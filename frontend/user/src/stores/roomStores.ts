import { defineStore } from 'pinia'
import api from '../utils/api'

export interface Room {
  id: string
  name: string
  shortDescription: string
  longDescription: string
  type: string
  available: number
  price: number
  maxOccupancy: number
  discountPercentage: number
  images: string[]
  amenities: { id: number; name: string }[]
  custom_amenities?: string
  hotelId: string
}

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [] as Room[],
    currentRoom: null as Room | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    availableRooms: (state) => state.rooms.filter((room) => room.available > 0),
    
    roomsByType: (state) => (type: string) =>
      state.rooms.filter((room) => room.type === type),
  },

  actions: {
    async fetchRoomsByHotel(hotelId: string) {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get(`/rooms/hotel/${hotelId}`)
        this.rooms = data
        return data
      } catch (error) {
        console.error('Fetch rooms error:', error)
        this.error = 'Failed to fetch rooms'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchRoomById(id: string) {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get(`/rooms/${id}`)
        this.currentRoom = data
        return data
      } catch (error) {
        console.error('Fetch room error:', error)
        this.error = 'Failed to fetch room'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async fetchAvailableRooms() {
      this.isLoading = true
      this.error = null
      try {
        const { data } = await api.get('/rooms/available')
        this.rooms = data
        return data
      } catch (error) {
        console.error('Fetch available rooms error:', error)
        this.error = 'Failed to fetch available rooms'
        return []
      } finally {
        this.isLoading = false
      }
    },

    async fetchRoomsWithAvailability(
      hotelId: string,
      checkIn: string,
      checkOut: string,
      guests?: number
    ) {
      this.isLoading = true
      this.error = null
      try {
        const queryParams = new URLSearchParams()
        queryParams.append('checkIn', checkIn)
        queryParams.append('checkOut', checkOut)
        if (guests) queryParams.append('guests', String(guests))

        const { data } = await api.get(
          `/rooms/hotel/${hotelId}/availability?${queryParams.toString()}`
        )
        this.rooms = data
        return data
      } catch (error) {
        console.error('Fetch rooms with availability error:', error)
        this.error = 'Failed to fetch rooms'
        // Fallback to regular fetch
        return this.fetchRoomsByHotel(hotelId)
      } finally {
        this.isLoading = false
      }
    },

    clearRooms() {
      this.rooms = []
      this.currentRoom = null
      this.error = null
    },
  },
})
