import { defineStore } from 'pinia';
import axios from 'axios';
import { toRaw } from 'vue';

const api = axios.create({ baseURL: 'http://localhost:3000' });
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
  custom_amenities: 'Custom Amenities'
};

export const useHotelStore = defineStore('hotel', {
  state: () => ({
    hotels: [] as any[],
    amenitiesList: [] as any[],
    isLoading: false,
    searchQuery: '',
  }),

  getters: {
    filteredHotels: (state) => {
      const query = state.searchQuery.toLowerCase().trim();

      if (!query) {
        return state.hotels;
      }

      return state.hotels.filter((hotel) => {
        const name = (hotel.name || '').toLowerCase();
        const email = (hotel.email || '').toLowerCase();

        return name.includes(query) || email.includes(query);
      });
    },

    formattedHotels: (state) => {
      return state.hotels.map(hotel => ({
        ...hotel,
        roomCount: hotel.rooms?.length || 0,
        displayAmenities: [
          ...(hotel.amenities?.map((a: any) => a.name) || []),
          ...(hotel.custom_amenities ? [hotel.custom_amenities] : [])
        ].join(', ')
      }));
    }
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    prepareFormData(data: any) {
      const formData = new FormData();

      const fields = ['name', 'shortDescription', 'longDescription', 'location', 'googleMapUrl', 'phoneNumber', 'email'];
      fields.forEach(f => {
        if (data[f] !== undefined) formData.append(f, data[f] || '');
      });

      if (Array.isArray(data.amenityIds)) {
        data.amenityIds.forEach((id: string | number) => {
          formData.append('amenityIds', id.toString());
        });
      }

      const cleanCustom = data.custom_amenities
        ? data.custom_amenities.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '').join(', ')
        : '';
      formData.append('custom_amenities', cleanCustom);

      if (Array.isArray(data.images)) {
        data.images.forEach((item: any) => {
          if (item instanceof File) {
            formData.append('images', item);
          } else if (typeof item === 'string' && item.trim() !== '') {
            formData.append('existingImages[]', item);
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
            custom_amenities: hotel.custom_amenities || '',
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
        const { data } = await api.get('/hotels');
        this.hotels = data;
      } catch (error) {
        console.error("Fetch hotels error:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async getHotelById(id: string) {
      try {
        const { data } = await api.get(`/hotels/${id}`);
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
            formattedMsg = msg.replace(new RegExp(key, 'gi'), fieldLabels[key]);
          }
        });

        if (m.includes('name')) fieldErrors.name = formattedMsg;
        else if (m.includes('short')) fieldErrors.shortDescription = formattedMsg;
        else if (m.includes('long')) fieldErrors.longDescription = formattedMsg;
        else if (m.includes('email')) fieldErrors.email = formattedMsg;
        else if (m.includes('amenit')) fieldErrors.amenityIds = formattedMsg;
        else if (m.includes('custom')) fieldErrors.custom_amenities = formattedMsg;
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