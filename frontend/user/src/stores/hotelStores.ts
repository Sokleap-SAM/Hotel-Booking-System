import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000' })
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fieldLabels: Record<string, string> = {
  name: 'Hotel Name',
  shortDescription: 'Short Description',
  longDescription: 'Full Description',
  location: 'Location',
  googleMapUrl: 'Map Link',
  phoneNumber: 'Phone Number',
  email: 'Email',
  amenityIds: 'Amenities',
  images: 'Images',
  custom_amenities: 'Custom Amenities',
}

export const useHotelStore = defineStore('hotel', {
  state: () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hotels: [] as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    amenitiesList: [] as any[],
    isLoading: false,
    searchQuery: '',
  }),

  getters: {
    filteredHotels: (state) => {
      const query = state.searchQuery.toLowerCase().trim()

      if (!query) {
        return state.hotels
      }

      return state.hotels.filter((hotel) => {
        const name = (hotel.name || '').toLowerCase()
        const email = (hotel.email || '').toLowerCase()

        return name.includes(query) || email.includes(query)
      })
    },

    formattedHotels: (state) => {
      return state.hotels.map((hotel) => ({
        ...hotel,
        roomCount: hotel.rooms?.length || 0,
        displayAmenities: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(hotel.amenities?.map((a: any) => a.name) || []),
          ...(hotel.custom_amenities ? [hotel.custom_amenities] : []),
        ].join(', '),
      }))
    },
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    async fetchHotels() {
      this.isLoading = true

      try {
        const { data } = await api.get('/hotels')
        this.hotels = data
      } catch (error) {
        console.error('Fetch hotels error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async getHotelById(id: string) {
      try {
        const { data } = await api.get(`/hotels/${id}`)
        return data
      } catch (error) {
        console.error('Error getting hotel:', error)
        return null
      }
    },

    async fetchAmenitiesByCategory(category: string) {
      try {
        const { data } = await api.get(`/amenities/category/${category}`)
        this.amenitiesList = data
      } catch (error) {
        console.error('Error fetching amenities:', error)
        this.amenitiesList = []
      }
    },
  },
})
