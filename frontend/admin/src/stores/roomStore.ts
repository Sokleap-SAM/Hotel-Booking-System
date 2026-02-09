import { defineStore } from 'pinia';
import api from '@/utils/api';
import { type AxiosError } from 'axios';
import { toRaw } from 'vue';

interface ApiErrorResponse {
  message?: string | string[];
  errors?: string[];
}

type ApiError = AxiosError<ApiErrorResponse>;

export interface BedType {
  id: number;
  name: string;
}

export interface RoomBed {
  bedTypeId: number;
  quantity: number;
  bedType?: BedType;
}

export interface Amenity {
  id: number;
  name: string;
  category?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address?: string;
}

export interface Room {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  available: number;
  price: number;
  maxOccupancy: number;
  discountPercentage: number;
  images: string[];
  amenities: Amenity[];
  roomBeds: RoomBed[];
  hotelId: string;
  hotel?: Hotel;
  createdAt: Date;
}

export interface RoomFormData {
  name: string;
  shortDescription: string;
  longDescription: string;
  available: number;
  price: number;
  maxOccupancy: number;
  discountPercentage: number;
  images: (File | string)[];
  amenityIds: number[];
  roomBeds: RoomBed[];
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
  hotelId: 'Hotel',
};

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [] as Room[],
    currentRoom: null as Room | null,
    amenitiesList: [] as Amenity[],
    bedTypesList: [] as BedType[],
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
        const hotelName = (room.hotel?.name || '').toLowerCase();

        return name.includes(query) || hotelName.includes(query);
      });
    },

    formattedRooms: (state) => {
      return state.rooms.map((room) => ({
        ...room,
        displayPrice: `$${Number(room.price).toFixed(2)}`,
        displayAmenities: [
          ...(room.amenities?.map((a) => a.name) || [])
        ].join(', '),
        discountedPrice:
          room.discountPercentage > 0
            ? `$${(Number(room.price) * (1 - room.discountPercentage / 100)).toFixed(2)}`
            : null,
      }));
    },
  },

  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    prepareFormData(data: RoomFormData) {
      const formData = new FormData();

      // String fields
      formData.append('name', data.name || '');
      formData.append('shortDescription', data.shortDescription || '');
      formData.append('longDescription', data.longDescription || '');
      formData.append('hotelId', data.hotelId || '');

      // Numeric fields
      formData.append('available', String(data.available ?? 0));
      formData.append('price', String(data.price ?? 0));
      formData.append('maxOccupancy', String(data.maxOccupancy ?? 0));
      formData.append('discountPercentage', String(data.discountPercentage ?? 0));

      if (Array.isArray(data.amenityIds)) {
        data.amenityIds.forEach((id: string | number) => {
          formData.append('amenityIds', id.toString());
        });
      }

      // Handle roomBeds array
      if (Array.isArray(data.roomBeds) && data.roomBeds.length > 0) {
        const validBeds = data.roomBeds.filter(
          (bed: RoomBed) => bed.bedTypeId && bed.quantity > 0
        );
        formData.append('roomBeds', JSON.stringify(validBeds));
      }

      if (Array.isArray(data.images)) {
        data.images.forEach((item: File | string) => {
          if (item instanceof File) {
            formData.append('images', item);
          } else if (typeof item === 'string' && item.trim() !== '') {
            formData.append('existingImages[]', item);
          }
        });
      }

      return formData;
    },

    async createRoom(data: RoomFormData) {
      this.isLoading = true;
      try {
        const formData = this.prepareFormData(toRaw(data) as RoomFormData);
        const response = await api.post('/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return { success: true, data: response.data };
      } catch (error) {
        return this.handleError(error as ApiError);
      } finally {
        this.isLoading = false;
      }
    },

    async updateRoom(id: string, data: RoomFormData) {
      this.isLoading = true;
      try {
        const formData = this.prepareFormData(toRaw(data) as RoomFormData);
        const response = await api.patch(`/rooms/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return { success: true, data: response.data };
      } catch (error) {
        return this.handleError(error as ApiError);
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
            amenityIds: room.amenities?.map((a: Amenity) => a.id) || [],
            images: room.images || [],
            existingImages: room.images || [],
            roomBeds: room.roomBeds?.map((rb: RoomBed) => ({
              bedTypeId: rb.bedTypeId || rb.bedType?.id,
              quantity: rb.quantity,
            })) || [],
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

    async fetchBedTypes() {
      try {
        const { data } = await api.get('/bed-types');
        this.bedTypesList = data;
      } catch (error) {
        console.error('Error fetching bed types:', error);
        this.bedTypesList = [];
      }
    },

    async deleteRoom(id: string) {
      this.isLoading = true;
      try {
        await api.delete(`/rooms/${id}`);

        this.rooms = this.rooms.filter((room) => room.id !== id);

        return { success: true };
      } catch (error) {
        const axiosError = error as ApiError;
        return {
          success: false,
          error: axiosError.response?.data?.message || 'Failed to delete room',
        };
      } finally {
        this.isLoading = false;
      }
    },

    handleError(error: ApiError) {
      const rawMessages = error.response?.data?.message || error.response?.data?.errors;
      const fieldErrors: Record<string, string> = {};

      const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages || 'Server Error'];

      messages.forEach((msg: string) => {
        const m = msg.toLowerCase();
        let formattedMsg = msg;

        Object.keys(fieldLabels).forEach((key) => {
          if (m.includes(key.toLowerCase())) {
            const label = fieldLabels[key];
            if (label) {
              formattedMsg = msg.replace(new RegExp(key, 'gi'), label);
            }
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
