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
      <div v-for="room in roomStore.rooms" :key="room.id" class="card">
        <div class="card-body">
          <div class="image-section">
            <img :src="getRoomImage(room)" :alt="room.name" />
          </div>

          <div class="content-section">
            <h2>{{ room.name }}</h2>
            <div class="details">
              <p>Type: {{ room.type }}</p>
              <p>Price: ${{ Number(room.price).toFixed(2) }}</p>
              <p>Available: {{ room.available }}</p>
              <p>Max Occupancy: {{ room.maxOccupancy }}</p>
              <p v-if="room.discountPercentage > 0" class="discount">
                Discount: {{ room.discountPercentage }}%
              </p>
            </div>
          </div>

          <div class="actions-section">
            <button @click="navigateToEditRoom(room.id)" class="edit-btn">Edit</button>
            <button @click="handleDeleteRoom(room.id, room.name)" class="delete-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoomStore, type Room } from '@/stores/roomStore';
import { useHotelStore } from '@/stores/hotelStore';

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

const getRoomImage = (room: Room) => {
  if (room.images && room.images.length > 0) {
    const img = room.images[0];
    if (img) {
      return img.startsWith('http') ? img : `http://localhost:3000${img}`;
    }
  }
  return 'https://via.placeholder.com/220x140?text=No+Image';
};

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

.card {
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 24px;
  background-color: #FFFFFF;
}

.card-body {
  display: flex;
  align-items: center;
  gap: 25px;
}

.image-section {
  width: 220px;
  height: 140px;
  flex-shrink: 0;
}

.image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.content-section {
  flex-grow: 1;
}

.content-section h2 {
  font-size: 20px;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.details p{
  margin: 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #666;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-btn {
  background-color: #e8ebf0;
  border: none;
  padding: 10px 30px;
  border-radius: 15px;
  cursor: pointer;
  min-width: 100px;
}

.delete-btn {
  background-color: #fc2020;
  border: none;
  color: white;
  padding: 10px 30px;
  border-radius: 15px;
  cursor: pointer;
  min-width: 100px;
}

.edit-btn:hover {
  background-color: #d1d5db;
}

.delete-btn:hover {
  background-color: #cc0000;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.discount {
  color: #16a34a;
  font-weight: bold;
}

</style>