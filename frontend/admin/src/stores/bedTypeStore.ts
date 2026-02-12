import { defineStore } from 'pinia'
import api from '@/utils/api'

export interface BedType {
  id: number
  name: string
  createdAt: string
}

interface BedTypeState {
  bedTypes: BedType[]
  isLoading: boolean
  searchQuery: string
}

export const useBedTypeStore = defineStore('bedType', {
  state: (): BedTypeState => ({
    bedTypes: [],
    isLoading: false,
    searchQuery: '',
  }),

  getters: {
    filteredBedTypes: (state) => {
      if (!state.searchQuery.trim()) {
        return state.bedTypes
      }
      const query = state.searchQuery.toLowerCase()
      return state.bedTypes.filter((bt) => bt.name.toLowerCase().includes(query))
    },

    totalCount: (state) => state.bedTypes.length,
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    async fetchBedTypes() {
      this.isLoading = true
      try {
        const { data } = await api.get<BedType[]>('/bed-types')
        this.bedTypes = data
      } catch (error) {
        console.error('Failed to fetch bed types:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createBedType(name: string) {
      try {
        const { data } = await api.post<BedType>('/bed-types', { name })
        this.bedTypes.push(data)
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to create bed type'
        return { success: false, message }
      }
    },

    async updateBedType(id: number, name: string) {
      try {
        const { data } = await api.patch<BedType>(`/bed-types/${id}`, { name })
        const index = this.bedTypes.findIndex((bt) => bt.id === id)
        if (index !== -1) {
          this.bedTypes[index] = data
        }
        return { success: true, data }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to update bed type'
        return { success: false, message }
      }
    },

    async deleteBedType(id: number) {
      try {
        await api.delete(`/bed-types/${id}`)
        this.bedTypes = this.bedTypes.filter((bt) => bt.id !== id)
        return { success: true }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        const message = axiosError.response?.data?.message || 'Failed to delete bed type'
        return { success: false, message }
      }
    },
  },
})
