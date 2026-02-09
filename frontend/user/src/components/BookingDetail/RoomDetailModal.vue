<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-container">
      <button class="close-btn-top" @click="$emit('close')">
        <i class="ri-close-line"></i>
      </button>

      <div class="modal-layout">
        <div class="gallery-col">
          <div class="main-img-wrapper">
            <img :src="mainImage" alt="Room Main View" class="main-img" @error="handleImageError" />
          </div>
          <div class="thumb-grid">
            <img 
              v-for="(thumb, index) in thumbnails" 
              :key="index" 
              :src="thumb" 
              class="thumb-img"
              :class="{ active: selectedThumbIndex === index }"
              @click="selectImage(index)"
              @error="handleThumbError($event)"
            />
          </div>
        </div>

        <div class="details-col">
          <div class="tag-row">
            <span class="info-tag"><i class="ri-door-open-line"></i> {{ room?.type || 'Standard' }}</span>
            <span class="info-tag"><i class="ri-group-line"></i> Max {{ room?.maxGuests || room?.maxOccupancy || 2 }} guests</span>
            <span class="info-tag" v-if="room?.available"><i class="ri-checkbox-circle-line"></i> {{ room.available }} available</span>
          </div>

          <h2 class="section-title">{{ room?.name || 'Room' }}</h2>
          
          <div class="price-info">
            <span class="current-price">USD ${{ finalPrice }}</span>
            <span class="original-price" v-if="(room?.discount ?? 0) > 0">USD ${{ room?.price }}</span>
            <span class="discount-badge" v-if="(room?.discount ?? 0) > 0">{{ room?.discount }}% OFF</span>
          </div>
          
          <p class="rating-subtext" v-if="(room?.stock ?? 0) < 5 && (room?.stock ?? 0) > 0">
            <i class="ri-alarm-warning-line"></i> Only {{ room?.stock }} rooms left!
          </p>

          <p class="description">
            {{ room?.longDescription || room?.description || 'No description available for this room.' }}
          </p>

          <div class="amenities-section" v-if="(room?.amenities?.length ?? 0) > 0">
            <div class="amenity-group">
              <h4><i class="ri-service-line"></i> Room Amenities</h4>
              <div class="amenity-tags">
                <span class="amenity-tag" v-for="amenity in room?.amenities" :key="amenity.id">
                  <i class="ri-checkbox-circle-fill"></i> {{ amenity.name }}
                </span>
              </div>
            </div>
          </div>

          <div class="room-details-grid">
            <div class="detail-item" v-if="room?.type">
              <i class="ri-hotel-bed-line"></i>
              <div>
                <span class="detail-label">Room Type</span>
                <span class="detail-value">{{ room.type }}</span>
              </div>
            </div>
            <div class="detail-item">
              <i class="ri-group-line"></i>
              <div>
                <span class="detail-label">Max Occupancy</span>
                <span class="detail-value">{{ room?.maxGuests || room?.maxOccupancy || 2 }} persons</span>
              </div>
            </div>
            <div class="detail-item" v-if="room?.available !== undefined">
              <i class="ri-calendar-check-line"></i>
              <div>
                <span class="detail-label">Availability</span>
                <span class="detail-value">{{ room.available }} rooms</span>
              </div>
            </div>
          </div>

          <div class="booking-actions">
            <div class="total-price">
              <span class="label">Total Price</span>
              <span class="amount">USD ${{ finalPrice }}</span>
              <span class="tax-note">Includes taxes and fees</span>
            </div>
            <button class="btn-primary">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref } from 'vue'
import defaultRoomImage from '@/assets/hotel1.jpg'

interface Amenity {
  id: number;
  name: string;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  longDescription?: string;
  type?: string;
  maxGuests?: number;
  maxOccupancy?: number;
  price: number;
  finalPrice?: number;
  discount?: number;
  discountPercentage?: number;
  available?: number;
  stock?: number;
  images?: string[];
  amenities?: Amenity[];
}

export default {
  props: {
    room: {
      type: Object as () => Room,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const selectedThumbIndex = ref(0)
    
    const roomImages = computed(() => {
      if (props.room?.images && props.room.images.length > 0) {
        return props.room.images.map((img: string) => {
          // Handle full URLs
          if (img.startsWith('http')) return img
          // Handle paths starting with /uploads/
          if (img.startsWith('/uploads/')) return `http://localhost:3000${img}`
          // Handle paths starting with uploads/
          if (img.startsWith('uploads/')) return `http://localhost:3000/${img}`
          // Default case - assume it's a relative path
          return `http://localhost:3000/uploads/rooms/${img}`
        })
      }
      return [defaultRoomImage]
    })
    
    const mainImage = computed(() => {
      return roomImages.value[selectedThumbIndex.value] || defaultRoomImage
    })
    
    const thumbnails = computed(() => {
      return roomImages.value.slice(0, 8)
    })
    
    const finalPrice = computed(() => {
      if (props.room?.finalPrice) return props.room.finalPrice
      if (props.room?.discount && props.room?.price) {
        return Math.round(props.room.price * (1 - props.room.discount / 100))
      }
      if (props.room?.discountPercentage && props.room?.price) {
        return Math.round(props.room.price * (1 - props.room.discountPercentage / 100))
      }
      return props.room?.price || 0
    })
    
    const selectImage = (index: number) => {
      selectedThumbIndex.value = index
    }
    
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement
      img.src = defaultRoomImage
    }
    
    const handleThumbError = (event: Event) => {
      const img = event.target as HTMLImageElement
      img.src = defaultRoomImage
    }
    
    return {
      mainImage,
      thumbnails,
      finalPrice,
      selectedThumbIndex,
      selectImage,
      handleImageError,
      handleThumbError,
    }
  }
}
</script>

<style scoped>
/* 1. Backdrop / Mask */
.modal-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

/* 2. Main Container - Fixed Height is crucial for scrolling */
.modal-container {
  background-color: #fff;
  width: 100%;
  max-width: 1000px;
  height: 90vh; /* Limits modal to 90% of screen height */
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevents the whole modal from growing/scrolling */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 3. Close Button Position */
.close-btn-top {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  z-index: 10;
  color: #333;
}

/* 4. Content Layout */
.modal-layout {
  display: flex;
  height: 100%; /* Fill the 90vh container */
  padding: 30px;
  gap: 30px;
  overflow: hidden; /* Keeps images on the left stable */
}

/* 5. Left Column: Images */
.gallery-col {
  flex: 1.2;
  display: flex;
  flex-direction: column;
}

.main-img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 12px;
}

.thumb-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 15px;
}

.thumb-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.thumb-img:hover {
  border-color: #006ce4;
}

.thumb-img.active {
  border-color: #003580;
}

/* 6. Right Column: Information (THIS ENABLES SCROLLING) */
.details-col {
  flex: 1;
  overflow-y: auto; /* Enables vertical scroll for text only */
  padding-right: 15px; /* Space for the scrollbar */
}

/* Tags Style */
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.info-tag {
  border: 1px solid #ccc;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
}

/* Text Styling */
.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #1a1a1a;
}

/* Price Info */
.price-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.current-price {
  font-size: 24px;
  font-weight: 800;
  color: #003580;
}

.original-price {
  font-size: 16px;
  color: #888;
  text-decoration: line-through;
}

.discount-badge {
  background: #00a550;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.rating-subtext {
  font-size: 14px;
  color: #e74c3c;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.description {
  font-size: 15px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 25px;
}

/* Amenities Layout */
.amenities-section {
  margin-bottom: 25px;
}

.amenity-group h4 {
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a1a1a;
}

.amenity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.amenity-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e8f4fd;
  border-radius: 6px;
  font-size: 13px;
  color: #003580;
}

.amenity-tag i {
  color: #00a550;
}

.custom-amenities {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

/* Room Details Grid */
.room-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item i {
  font-size: 24px;
  color: #003580;
}

.detail-item div {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #888;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Booking Actions */
.booking-actions {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 10px;
}

.total-price {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.total-price .label {
  font-size: 14px;
  color: #666;
}

.total-price .amount {
  font-size: 28px;
  font-weight: 800;
  color: #003580;
}

.total-price .tax-note {
  font-size: 12px;
  color: #888;
}

/* 7. Action Button */
.btn-primary {
  width: 100%;
  background-color: #003580; /* Booking Navy Blue */
  color: white;
  border: none;
  padding: 16px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background-color: #00224f;
}

/* 8. Custom Scrollbar Styling (Webkit) */
.details-col::-webkit-scrollbar {
  width: 6px;
}

.details-col::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.details-col::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.details-col::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-layout {
    flex-direction: column;
    overflow-y: auto;
  }
  
  .gallery-col {
    flex: none;
  }
  
  .details-col {
    overflow-y: visible;
    padding-right: 0;
  }
}
</style>
