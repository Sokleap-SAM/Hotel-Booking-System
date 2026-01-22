import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000' })

export type SortOption = 'default' | 'lowest-price' | 'highest-price' | 'highest-rating' | 'highest-discount'

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
    currentSort: 'default' as SortOption,
    selectedAmenityIds: [] as number[],
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
        this.currentSort = 'default'
      } catch (error) {
        console.error('Fetch hotels error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchHotelsByLowestPrice() {
      this.isLoading = true
      try {
        const { data } = await api.get('/hotels/filter/lowest-price')
        this.hotels = data
        this.currentSort = 'lowest-price'
      } catch (error) {
        console.error('Fetch hotels by lowest price error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchHotelsByHighestPrice() {
      this.isLoading = true
      try {
        const { data } = await api.get('/hotels/filter/highest-price')
        this.hotels = data
        this.currentSort = 'highest-price'
      } catch (error) {
        console.error('Fetch hotels by highest price error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchHotelsByHighestRating() {
      this.isLoading = true
      try {
        const { data } = await api.get('/hotels/filter/highest-rating')
        this.hotels = data
        this.currentSort = 'highest-rating'
      } catch (error) {
        console.error('Fetch hotels by highest rating error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchHotelsByHighestDiscount() {
      this.isLoading = true
      try {
        const { data } = await api.get('/hotels/filter/highest-discount')
        this.hotels = data
        this.currentSort = 'highest-discount'
      } catch (error) {
        console.error('Fetch hotels by highest discount error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchHotelsByAmenities(amenityIds: number[]) {
      this.isLoading = true
      this.selectedAmenityIds = amenityIds
      try {
        const idsParam = amenityIds.join(',')
        const { data } = await api.get(`/hotels/filter/by-amenities?amenityIds=${idsParam}`)
        this.hotels = data
      } catch (error) {
        console.error('Fetch hotels by amenities error:', error)
      } finally {
        this.isLoading = false
      }
    },

    async applySort(sortOption: SortOption) {
      switch (sortOption) {
        case 'lowest-price':
          await this.fetchHotelsByLowestPrice()
          break
        case 'highest-price':
          await this.fetchHotelsByHighestPrice()
          break
        case 'highest-rating':
          await this.fetchHotelsByHighestRating()
          break
        case 'highest-discount':
          await this.fetchHotelsByHighestDiscount()
          break
        default:
          await this.fetchHotels()
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
