/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import api from '../utils/api'

export interface CategoryRatings {
  service: number
  facilities: number
  comfort: number
  value: number
  location: number
}

export interface Rating {
  id: string
  hotelId: string
  userId: number
  service: number
  facilities: number
  comfort: number
  value: number
  location: number
  overallScore: number
  comment: string | null
  createdAt: string
  user?: {
    id: number
    firstName: string
    lastName: string
    profileImage?: string
  }
  hotel?: {
    id: string
    name: string
  }
}

export interface RatingSummary {
  avgRating: number
  totalRatings: number
  categoryAverages: CategoryRatings
}

export interface HotelRatingsResponse {
  ratings: Rating[]
  summary: RatingSummary
}

export interface CreateRatingPayload {
  hotelId: string
  service: number
  facilities: number
  comfort: number
  value: number
  location: number
  comment?: string
}

export const useRatingStore = defineStore('rating', {
  state: () => ({
    // Current hotel ratings
    hotelRatings: [] as Rating[],
    ratingSummary: null as RatingSummary | null,
    
    // User's rating for current hotel
    userRating: null as Rating | null,
    
    // User's all ratings
    myRatings: [] as Rating[],
    
    // Loading states
    isLoading: false,
    isSubmitting: false,
    error: null as string | null,
  }),

  getters: {
    hasUserRated: (state) => state.userRating !== null,
    
    formattedCategoryAverages: (state) => {
      if (!state.ratingSummary) return null
      return state.ratingSummary.categoryAverages
    },
  },

  actions: {
    async fetchHotelRatings(hotelId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await api.get<HotelRatingsResponse>(`/ratings/hotel/${hotelId}`)
        this.hotelRatings = response.data.ratings
        this.ratingSummary = response.data.summary
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch ratings'
        console.error('Error fetching hotel ratings:', err)
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserRatingForHotel(hotelId: string) {
      try {
        const response = await api.get<Rating | null>(`/ratings/hotel/${hotelId}/user`)
        this.userRating = response.data
      } catch (err: any) {
        // User hasn't rated yet - that's fine
        this.userRating = null
        console.error('Error fetching hotel ratings:', err)
      }
    },

    async fetchMyRatings() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await api.get<Rating[]>('/ratings/my-ratings')
        this.myRatings = response.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to fetch your ratings'
        console.error('Error fetching my ratings:', err)
      } finally {
        this.isLoading = false
      }
    },

    async submitRating(payload: CreateRatingPayload): Promise<Rating | null> {
      this.isSubmitting = true
      this.error = null
      
      try {
        const response = await api.post<Rating>('/ratings', payload)
        this.userRating = response.data
        
        // Refresh hotel ratings to get updated summary
        await this.fetchHotelRatings(payload.hotelId)
        
        return response.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to submit rating'
        console.error('Error submitting rating:', err)
        return null
      } finally {
        this.isSubmitting = false
      }
    },

    async updateRating(ratingId: string, payload: Partial<CreateRatingPayload>): Promise<Rating | null> {
      this.isSubmitting = true
      this.error = null
      
      try {
        const response = await api.patch<Rating>(`/ratings/${ratingId}`, payload)
        this.userRating = response.data
        
        // Refresh hotel ratings if hotelId is available
        if (payload.hotelId) {
          await this.fetchHotelRatings(payload.hotelId)
        }
        
        return response.data
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to update rating'
        console.error('Error updating rating:', err)
        return null
      } finally {
        this.isSubmitting = false
      }
    },

    async deleteRating(ratingId: string, hotelId?: string): Promise<boolean> {
      this.isSubmitting = true
      this.error = null
      
      try {
        await api.delete(`/ratings/${ratingId}`)
        this.userRating = null
        
        // Refresh hotel ratings if hotelId is available
        if (hotelId) {
          await this.fetchHotelRatings(hotelId)
        }
        
        // Remove from myRatings list
        this.myRatings = this.myRatings.filter(r => r.id !== ratingId)
        
        return true
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Failed to delete rating'
        console.error('Error deleting rating:', err)
        return false
      } finally {
        this.isSubmitting = false
      }
    },

    clearState() {
      this.hotelRatings = []
      this.ratingSummary = null
      this.userRating = null
      this.error = null
    },
  },
})
