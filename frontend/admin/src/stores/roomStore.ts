import { defineStore } from 'pinia';
import axios from 'axios';
import { toRaw } from 'vue';

const api = axios.create({ baseURL: 'http://localhost:3000' });

export enum RoomCategory {
  SINGLE = 'Single',
  DOUBLE = 'Double',
  TWIN = 'Twin',
  DELUXE = 'Deluxe',
  SUITE = 'Suite',
  PENTHOUSE = 'Penthouse',
}

export interface Room {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  type: RoomCategory;
  available: number;
  price: number;
  maxOccupancy: number;
  discountPercentage: number;
  images: string[];
  amenities: any[];
  custom_amenities: string;
  hotelId: string;
  hotel?: any;
  createdAt: Date;
}

export interface RoomFormData {
  name: string;
  shortDescription: string;
  longDescription: string;
  type: RoomCategory;
  available: number;
  price: number;
  maxOccupancy: number;
  discountPercentage: number;
  images: (File | string)[];
  amenityIds: number[];
  custom_amenities: string;
  hotelId: string;
}

const fieldLabels: Record<string, string> = {
  name: 'Room Name',
  shortDescription: 'Short Description',
  longDescription: 'Full Description',
  type: 'Room Type',
  available: 'Available Rooms',
  price: 'Price',
  maxOccupancy: 'Max Occupancy',
  discountPercentage: 'Discount Percentage',
  amenityIds: 'Amenities',
  images: 'Images',
  custom_amenities: 'Custom Amenities',
  hotelId: 'Hotel',
};

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [] as Room[],
    currentRoom: null as Room | null,
    amenitiesList: [] as any[],
    isLoading: false,
    searchQuery: '',
  }),

  getters: {
    filteredRooms: (state) => {
      const query = state.searchQuery.toLowerCase().trim();

      if (!query) {
        return state.rooms;
      }

      return state.rooms.filter((room) => {
        const name = (room.name || '').toLowerCase();
        const type = (room.type || '').toLowerCase();
        const hotelName = (room.hotel?.name || '').toLowerCase();

        return name.includes(query) || type.includes(query) || hotelName.includes(query);
      });
    },

    formattedRooms: (state) => {
      return state.rooms.map((room) => ({
        ...room,
        displayPrice: `$${Number(room.price).toFixed(2)}`,
        displayAmenities: [
          ...(room.amenities?.map((a: any) => a.name) || []),
          ...(room.custom_amenities ? [room.custom_amenities] : []),
        ].join(', '),
        discountedPrice:
          room.discountPercentage > 0
            ? `$${(Number(room.price) * (1 - room.discountPercentage / 100)).toFixed(2)}`
            : null,
      }));
    },

    roomCategories: () => Object.values(RoomCategory),
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    prepareFormData(data: any) {
      const formData = new FormData();

      const fields = [
        'name',
        'shortDescription',
        'longDescription',
        'type',
        'hotelId',
      ];

      fields.forEach((f) => {
        if (data[f] !== undefined) formData.append(f, data[f] || '');
      });

      const numericFields = ['available', 'price', 'maxOccupancy', 'discountPercentage'];
      numericFields.forEach((f) => {
        if (data[f] !== undefined) {
          formData.append(f, String(data[f]));
        }
      });

      if (Array.isArray(data.amenityIds)) {
        data.amenityIds.forEach((id: string | number) => {
          formData.append('amenityIds', id.toString());
        });
      }

      const cleanCustom = data.custom_amenities
        ? data.custom_amenities
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s !== '')
            .join(', ')
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

    async createRoom(data: any) {
      this.isLoading = true;
      try {
        const formData = this.prepareFormData(toRaw(data));
        const response = await api.post('/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return { success: true, data: response.data };
      } catch (error: any) {
        return this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async updateRoom(id: string, data: any) {
      this.isLoading = true;
      try {
        const formData = this.prepareFormData(toRaw(data));
        const response = await api.patch(`/rooms/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return { success: true, data: response.data };
      } catch (error: any) {
        return this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async getRoomForEdit(id: string) {
      try {
        const room = await this.getRoomById(id);

        if (room) {
          return {
            ...room,
            amenityIds: room.amenities?.map((a: any) => a.id) || [],
            custom_amenities: room.custom_amenities || '',
            images: room.images || [],
            existingImages: room.images || [],
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting room for edit:', error);
        return null;
      }
    },

    async fetchRooms() {
      this.isLoading = true;
      try {
        const { data } = await api.get('/rooms/available');
        this.rooms = data;
      } catch (error) {
        console.error('Fetch rooms error:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRoomsByHotel(hotelId: string) {
      this.isLoading = true;
      try {
        const { data } = await api.get(`/rooms/hotel/${hotelId}`);
        this.rooms = data;
        return data;
      } catch (error) {
        console.error('Fetch rooms by hotel error:', error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async getRoomById(id: string) {
      try {
        const { data } = await api.get(`/rooms/${id}`);
        this.currentRoom = data;
        return data;
      } catch (error) {
        console.error('Error getting room:', error);
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

    async deleteRoom(id: string) {
      this.isLoading = true;
      try {
        await api.delete(`/rooms/${id}`);

        this.rooms = this.rooms.filter((room) => room.id !== id);

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.message || 'Failed to delete room',
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

        Object.keys(fieldLabels).forEach((key) => {
          if (m.includes(key.toLowerCase())) {
            formattedMsg = msg.replace(new RegExp(key, 'gi'), fieldLabels[key]);
          }
        });

        if (m.includes('name')) fieldErrors.name = formattedMsg;
        else if (m.includes('short')) fieldErrors.shortDescription = formattedMsg;
        else if (m.includes('long')) fieldErrors.longDescription = formattedMsg;
        else if (m.includes('type')) fieldErrors.type = formattedMsg;
        else if (m.includes('available')) fieldErrors.available = formattedMsg;
        else if (m.includes('price')) fieldErrors.price = formattedMsg;
        else if (m.includes('occupancy')) fieldErrors.maxOccupancy = formattedMsg;
        else if (m.includes('discount')) fieldErrors.discountPercentage = formattedMsg;
        else if (m.includes('amenit')) fieldErrors.amenityIds = formattedMsg;
        else if (m.includes('custom')) fieldErrors.custom_amenities = formattedMsg;
        else if (m.includes('image')) fieldErrors.images = formattedMsg;
        else if (m.includes('hotel')) fieldErrors.hotelId = formattedMsg;
      });

      return {
        success: false,
        errors: fieldErrors,
        message: fieldErrors.name || 'Please check the form for errors.',
      };
    },

    clearCurrentRoom() {
      this.currentRoom = null;
    },

    clearRooms() {
      this.rooms = [];
    },
  },
});
