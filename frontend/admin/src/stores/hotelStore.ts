/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';
import api from '@/utils/api';
import { toRaw } from 'vue';
const fieldLabels: Record<string, string> = {
  name: 'Hotel Name',
  shortDescription: 'Short Description',
  longDescription: 'Full Description',
  location: 'Location',
  googleMapUrl: 'Map Link',
  phoneNumber: 'Phone Number',
  email: 'Email',
  amenityIds: 'Amenities',
  images: 'Images'
};

export const useHotelStore = defineStore('hotel', {
  state: () => ({
    hotels: [] as any[],
    amenitiesList: [] as any[],
    isLoading: false,
    searchQuery: '',
    statusFilter: 'all' as 'all' | 'active' | 'inactive',
  }),

  getters: {
    filteredHotels: (state) => {
      let result = state.hotels;

      // Filter by status
      if (state.statusFilter === 'active') {
        result = result.filter((hotel) => hotel.isActive === true);
      } else if (state.statusFilter === 'inactive') {
        result = result.filter((hotel) => hotel.isActive === false);
      }

      // Filter by search query
      const query = state.searchQuery.toLowerCase().trim();
      if (query) {
        result = result.filter((hotel) => {
          const name = (hotel.name || '').toLowerCase();
          const email = (hotel.email || '').toLowerCase();
          return name.includes(query) || email.includes(query);
        });
      }

      return result;
    },

    totalCount: (state) => state.hotels.length,
    activeCount: (state) => state.hotels.filter((h) => h.isActive === true).length,
    inactiveCount: (state) => state.hotels.filter((h) => h.isActive === false).length,

    formattedHotels: (state) => {
      return state.hotels.map(hotel => ({
        ...hotel,
        roomCount: hotel.rooms?.length || 0,
        displayAmenities: [
          ...(hotel.amenities?.map((a: any) => a.name) || [])
        ].join(', ')
      }));
    }
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    setStatusFilter(status: 'all' | 'active' | 'inactive') {
      this.statusFilter = status;
    },

    async updateHotelStatus(id: string, isActive: boolean) {
      try {
        const { data } = await api.patch(`/hotels/${id}/status`, { isActive });
        // Update local state
        const hotel = this.hotels.find((h) => h.id === id);
        if (hotel) {
          hotel.isActive = isActive;
        }
        return { success: true, data };
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Failed to update hotel status';
        return { success: false, message };
      }
    },

    prepareFormData(data: any) {
      const formData = new FormData();

      const fields = ['name', 'destination', 'shortDescription', 'longDescription', 'location', 'googleMapUrl', 'phoneNumber', 'email'];
      fields.forEach(f => {
        if (data[f] !== undefined) {
          const value = typeof data[f] === 'string' ? data[f].trim() : data[f];
          formData.append(f, value || '');
        }
      });

      if (Array.isArray(data.amenityIds)) {
        data.amenityIds.forEach((id: string | number) => {
          formData.append('amenityIds', id.toString());
        });
      }

      if (Array.isArray(data.images)) {
        data.images.forEach((item: any) => {
          if (item instanceof File) {
            formData.append('images', item);
          } else if (typeof item === 'string' && item.trim() !== '') {
            formData.append('existingImages', item);
          }
        });
      }
      return formData;
    },

    async createHotel(data: any) {
      this.isLoading = true;
      try {
        const formData = this.prepareFormData(toRaw(data));
        await api.post('/hotels', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        await this.fetchHotels();
        return { success: true };
      } catch (error: any) {
        return this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async updateHotel(id: string, data: any) {
      this.isLoading = true;
      try {
        const formData = this.prepareFormData(toRaw(data));
        await api.patch(`/hotels/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await this.fetchHotels();
        return { success: true };
      } catch (error: any) {
        return this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async getHotelForEdit(id: string) {
      try {
        const hotel = await this.getHotelById(id);

        if (hotel) {
          return {
            ...hotel,
            amenityIds: hotel.amenities?.map((a: any) => a.id) || [],
            images: hotel.images || [],
            existingImages: hotel.images || []
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting hotel for edit:', error);
        return null;
      }
    },

    async fetchHotels() {
      this.isLoading = true;

      try {
        const { data } = await api.get('/hotels/admin/all');
        this.hotels = data;
      } catch (error) {
        console.error("Fetch hotels error:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async getHotelById(id: string) {
      try {
        const { data } = await api.get(`/hotels/admin/${id}`);
        return data;
      } catch (error) {
        console.error('Error getting hotel:', error);
        return null;
      }
    },

    async fetchAmenitiesByCategory(category: string) {
      try {
        const { data } = await api.get(`/amenities/category/${category}`);
        this.amenitiesList = data;
      } catch (error) {
        console.error('Error fetching amenities:', error);
        this.amenitiesList = [];
      }
    },

    async deleteHotel(id: string) {
      this.isLoading = true;

      try {
        await api.delete(`/hotels/${id}`);
        await this.fetchHotels();

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to delete hotel'
        };
      } finally {
        this.isLoading = false;
      }
    },

    handleError(error: any) {
      const rawMessages = error.response?.data?.message || error.response?.data?.errors;
      const fieldErrors: Record<string, string> = {};

      const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages || 'Server Error'];

      messages.forEach((msg: string) => {
        const m = msg.toLowerCase();
        let formattedMsg = msg;

        Object.keys(fieldLabels).forEach(key => {
          if (m.includes(key.toLowerCase())) {
            formattedMsg = msg.replace(new RegExp(key, 'gi'), fieldLabels[key] || '');
          }
        });

        if (m.includes('name')) fieldErrors.name = formattedMsg;
        else if (m.includes('short')) fieldErrors.shortDescription = formattedMsg;
        else if (m.includes('long')) fieldErrors.longDescription = formattedMsg;
        else if (m.includes('email')) fieldErrors.email = formattedMsg;
        else if (m.includes('amenit')) fieldErrors.amenityIds = formattedMsg;
        else if (m.includes('phone')) fieldErrors.phoneNumber = formattedMsg;
        else if (m.includes('location')) fieldErrors.location = formattedMsg;
        else if (m.includes('google')) fieldErrors.googleMapUrl = formattedMsg;
        else if (m.includes('image')) fieldErrors.images = formattedMsg;
      });

      return {
        success: false,
        errors: fieldErrors,
        message: fieldErrors.name || 'Please check the form for errors.'
      };
    },
  }
});