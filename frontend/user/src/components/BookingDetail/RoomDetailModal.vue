<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal-container">
      <button class="close-btn-top" @click="$emit('close')">
        <i class="ri-close-line"></i>
      </button> 

      <div class="modal-layout">
        <div class="gallery-col">
          <div class="main-img-wrapper">
            <img :src="mainImage" alt="Room Main View" class="main-img" />
          </div>
          <div class="thumb-grid">
            <img v-for="(thumb, index) in thumbnails" :key="index" :src="thumb" class="thumb-img" />
          </div>
        </div>

        <div class="details-col">
          <div class="tag-row">
            <span class="info-tag"><i class="ri-door-open-line"></i> 1 room</span>
            <span class="info-tag"><i class="ri-expand-diagonal-line"></i> 40 m²</span>
            <span class="info-tag"><i class="ri-temp-cold-line"></i> air conditioning</span>
            <span class="info-tag"><i class="ri-heavy-showers-line"></i> Private bathroom</span>
          </div>

          <h2 class="section-title">Room Size 40 m²</h2>
          <ul class="bed-list">
            <li>2 twin beds</li>
          </ul>
          <p class="rating-subtext">Comfy beds, 9.1 — Based on 344 reviews</p>

          <p class="description">
            {{
              room?.description ||
              'The garden view twin room is located on the ground floor and overlooks our beautiful garden providing a peaceful and serene atmosphere...'
            }}
          </p>

          <div class="amenities-section">
            <div class="amenity-group">
              <h4>Hotel Amenities:</h4>
              <div class="amenity-split">
                <ul>
                  <li>Free Wifi</li>
                  <li>Free Breakfast</li>
                  <li>Private bathroom</li>
                  <li>Gym</li>
                </ul>
                <ul>
                  <li>Swimming Pool</li>
                </ul>
              </div>
            </div>

            <div class="amenity-group">
              <h4>Room Facilities:</h4>
              <div class="amenity-split">
                <ul>
                  <li>Fridge</li>
                  <li>TV</li>
                  <li>Tea/Coffee</li>
                  <li>Towel</li>
                  <li>Bathrobes</li>
                  <li>Slippers</li>
                  <li>Air dryer</li>
                </ul>
                <ul>
                  <li>Toiletries</li>
                  <li>Garden View</li>
                </ul>
              </div>
            </div>
          </div>

          <p class="smoking-text"><strong>Smoking:</strong> No smoking</p>

          <button class="btn-primary">Choose your option</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Import local images from your assets folder
import roomMain from '@/assets/Angkorwat.png'
import thumb1 from '@/assets/hotel1.jpg'
import thumb2 from '@/assets/Pubstreet.png'
import thumb3 from '@/assets/hotel1.jpg'
import thumb4 from '@/assets/hotel1.jpg'

export default {
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  emits: ['close'],
  data() {
    return {
      // Assigning the imported local images to data properties
      mainImage: roomMain,
      thumbnails: [thumb1, thumb2, thumb3, thumb4],
    }
  },
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
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}
.bed-list {
  padding-left: 20px;
  margin-bottom: 10px;
  list-style: disc;
}
.rating-subtext {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}
.description {
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 25px;
}

/* Amenities Layout */
.amenity-group h4 {
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: 600;
}
.amenity-split {
  display: flex;
  margin-bottom: 25px;
}
.amenity-split ul {
  flex: 1;
  padding-left: 20px;
  font-size: 14px;
  list-style: disc;
}
.amenity-split li {
  margin-bottom: 6px;
}

.smoking-text {
  margin: 25px 0;
  font-size: 15px;
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
  margin-top: 10px;
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
</style>
