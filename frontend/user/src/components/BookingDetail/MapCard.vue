<template>
  <div class="map-card">
    <div class="card-header">
      <h2 class="title">Rating</h2>
      <div class="rating-box">
        <span class="star">★</span>
        <span class="score">{{ rating }}</span>
      </div>
    </div>

    <div class="map-frame">
      <div class="map-placeholder">
        <i class="ri-map-pin-line"></i>
        <p class="map-text">View hotel location on Google Maps</p>
      </div>

      <div class="map-overlay">
        <a :href="mapUrl" target="_blank" rel="noopener noreferrer" class="btn-show-map">
          <i class="ri-external-link-line"></i> Show on map
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  rating: {
    type: Number,
    default: 4.5,
  },
  mapUrl: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.map-card {
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.rating-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
}

.star {
  color: #ffcc00;
}

.map-frame {
  position: relative;
  flex-grow: 1;
  min-height: 200px;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.map-placeholder i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.map-text {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.05); /* Light tint */
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none; /* Allows clicking the map through the overlay if needed */
}

.btn-show-map {
  pointer-events: auto; /* Re-enable clicking for the button */
  background: #006ce4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-show-map:hover {
  background: #0056b3;
}
</style>
