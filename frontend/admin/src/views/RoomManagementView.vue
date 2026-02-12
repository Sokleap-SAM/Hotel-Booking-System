<template>
  <div class="container">
    <div class="header">
      <button @click="$router.push('/manage_hotel&room')" class="back-link">
        <span class="arrow">←</span>
      </button>
      <h1>{{ hotelName }}</h1>
    </div>

    <div class="action-bar">
      <button @click="navigateToAddRoom" class="add-btn">Add new room</button>
    </div>

    <div v-if="roomStore.isLoading" class="loading-state">Loading rooms...</div>

    <div v-else-if="roomStore.rooms.length === 0" class="empty-state">
      <p>No rooms found for this hotel.</p>
    </div>

    <div v-else class="room-list">
      <RoomCard
        v-for="room in roomStore.rooms"
        :key="room.id"
        :room="room"
        @edit="navigateToEditRoom"
        @delete="handleDeleteRoom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoomStore } from '@/stores/roomStore';
import { useHotelStore } from '@/stores/hotelStore';
import RoomCard from '@/components/room/RoomCard.vue';

const route = useRoute();
const router = useRouter();
const roomStore = useRoomStore();
const hotelStore = useHotelStore();

const hotelId = route.params.id as string;
const hotelName = ref('Rooms');

onMounted(async () => {
  await roomStore.fetchRoomsByHotel(hotelId);
  
  const hotel = await hotelStore.getHotelById(hotelId);
  if (hotel) {
    hotelName.value = hotel.name;
  }
});

const navigateToAddRoom = () => {
  router.push({ name: 'add-room', params: { id: hotelId } });
};

const navigateToEditRoom = (roomId: string) => {
  router.push({ name: 'edit-room', params: { id: hotelId, roomId } });
};

const handleDeleteRoom = async (roomId: string, roomName: string) => {
  if (confirm(`Are you sure you want to delete "${roomName}"?`)) {
    const result = await roomStore.deleteRoom(roomId);
    if (!result.success) {
      alert(result.error || 'Failed to delete room');
    }
  }
};
</script>

<style scoped>
.container {
  padding: 40px;
  background-color: #fff;
  font-family: sans-serif;
}

.header {
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
  gap: 20px;
}

.back-link {
  cursor: pointer;
  border: none;
  background-color: #FFFFFF;
}

.arrow {
  font-size: 28px;
  font-weight: 300;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.action-bar {
  margin-bottom: 30px;
}

.add-btn {
  background-color: #e8ebf0;
  border: 1px solid #e5e7eb;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}
</style>