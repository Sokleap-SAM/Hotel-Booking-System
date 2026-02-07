import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000' })

export interface Amenity {
  id: number
  name: string
  category: 'hotel' | 'room'
}

export const useAmenityStore = defineStore('amenity', {
  state: () => ({
    amenities: [] as Amenity[],
    isLoading: false,
    searchQuery: '',
    categoryFilter: 'all' as 'all' | 'hotel' | 'room',
  }),

  getters: {
    filteredAmenities: (state) => {
      let result = state.amenities

      // Filter by category
      if (state.categoryFilter !== 'all') {
        result = result.filter((a) => a.category === state.categoryFilter)
      }

      // Filter by search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        result = result.filter((a) => a.name.toLowerCase().includes(query))
      }

      return result
    },

    totalCount: (state) => state.amenities.length,

    hotelCount: (state) => state.amenities.filter((a) => a.category === 'hotel').length,

    roomCount: (state) => state.amenities.filter((a) => a.category === 'room').length,
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    setCategoryFilter(category: 'all' | 'hotel' | 'room') {
      this.categoryFilter = category
    },

    async fetchAmenities() {
      this.isLoading = true
      try {
        const { data } = await api.get('/amenities')
        this.amenities = data
      } catch (error) {
        console.error('Failed to fetch amenities:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createAmenity(name: string, category: 'hotel' | 'room') {
      try {
        const { data } = await api.post('/amenities', { name, category })
        this.amenities.push(data)
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to create amenity'
        return { success: false, message }
      }
    },

    async deleteAmenity(id: number) {
      try {
        const { data } = await api.delete(`/amenities/${id}`)
        this.amenities = this.amenities.filter((a) => a.id !== id)
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to delete amenity'
        return { success: false, message }
      }
    },
  },
})
