<template>
  <div class="card">
    <div class="card-body">
      <div class="image-section">
        <img :src="roomImage" :alt="room.name" />
      </div>

      <div class="content-section">
        <h2>{{ room.name }}</h2>
        <p v-if="room.shortDescription" class="short-desc">{{ room.shortDescription }}</p>
        
        <div class="details">
          <div class="detail-row">
            <span class="label">Price:</span>
            <span class="value">
              <template v-if="room.discountPercentage > 0">
                <span class="original-price">${{ Number(room.price).toFixed(2) }}</span>
                <span class="discounted-price">${{ discountedPrice }}</span>
              </template>
              <template v-else>
                ${{ Number(room.price).toFixed(2) }}
              </template>
            </span>
          </div>
          
          <div class="detail-row">
            <span class="label">Available:</span>
            <span class="value">{{ room.available }} rooms</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Max Occupancy:</span>
            <span class="value">{{ room.maxOccupancy }} guests</span>
          </div>
          
          <div v-if="bedTypesDisplay" class="detail-row">
            <span class="label">Beds:</span>
            <span class="value">{{ bedTypesDisplay }}</span>
          </div>
          
          <div v-if="amenitiesDisplay" class="detail-row amenities-row">
            <span class="label">Amenities:</span>
            <span class="value amenities-list">{{ amenitiesDisplay }}</span>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <span v-if="room.discountPercentage > 0" class="discount-badge">
          {{ room.discountPercentage }}% OFF
        </span>
        <button @click="$emit('edit', room.id)" class="edit-btn">Edit</button>
        <button @click="$emit('delete', room.id, room.name)" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Room } from '@/stores/roomStore'

const props = defineProps<{
  room: Room
}>()

defineEmits<{
  (e: 'edit', roomId: string): void
  (e: 'delete', roomId: string, roomName: string): void
}>()

const roomImage = computed(() => {
  if (props.room.images && props.room.images.length > 0) {
    const img = props.room.images[0]
    if (img) {
      return img.startsWith('http') ? img : `http://localhost:3000${img}`
    }
  }
  return 'https://via.placeholder.com/220x140?text=No+Image'
})

const discountedPrice = computed(() => {
  const price = Number(props.room.price)
  const discount = props.room.discountPercentage || 0
  return (price * (1 - discount / 100)).toFixed(2)
})

const bedTypesDisplay = computed(() => {
  if (!props.room.roomBeds || props.room.roomBeds.length === 0) return ''
  return props.room.roomBeds
    .filter(rb => rb.quantity > 0)
    .map(rb => `${rb.quantity}x ${rb.bedType?.name || 'Bed'}`)
    .join(', ')
})

const amenitiesDisplay = computed(() => {
  const items: string[] = []
  
  if (props.room.amenities && props.room.amenities.length > 0) {
    items.push(...props.room.amenities.map(a => a.name))
  }
  
  return items.slice(0, 5).join(', ') + (items.length > 5 ? ` +${items.length - 5} more` : '')
})
</script>

<style scoped>
.card {
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 24px;
  background-color: #FFFFFF;
}

.card-body {
  display: flex;
  align-items: flex-start;
  gap: 25px;
}

.image-section {
  width: 220px;
  height: 160px;
  flex-shrink: 0;
}

.image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.content-section {
  flex-grow: 1;
  min-width: 0;
}

.content-section h2 {
  font-size: 20px;
  margin: 0 0 8px 0;
  font-weight: bold;
  color: #1a1a1a;
}

.short-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  font-size: 14px;
}

.label {
  color: #888;
  min-width: 110px;
}

.value {
  color: #333;
  font-weight: 500;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 8px;
}

.discounted-price {
  color: #16a34a;
  font-weight: 600;
}

.amenities-row {
  align-items: flex-start;
}

.amenities-list {
  line-height: 1.4;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.discount-badge {
  background-color: #16a34a;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.edit-btn {
  background-color: #e8ebf0;
  border: none;
  padding: 10px 30px;
  border-radius: 15px;
  cursor: pointer;
  min-width: 100px;
  font-weight: 500;
}

.delete-btn {
  background-color: #fc2020;
  border: none;
  color: white;
  padding: 10px 30px;
  border-radius: 15px;
  cursor: pointer;
  min-width: 100px;
  font-weight: 500;
}

.edit-btn:hover {
  background-color: #d1d5db;
}

.delete-btn:hover {
  background-color: #cc0000;
}
</style>
