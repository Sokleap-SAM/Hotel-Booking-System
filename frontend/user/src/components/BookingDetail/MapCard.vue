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
      <iframe
        :src="mapUrl"
        width="100%"
        height="100%"
        style="border: 0"
        :allowfullscreen="true"
        loading="lazy"
      >
      </iframe>

      <div class="map-overlay">
        <button class="btn-show-map">Show on map</button>
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
    // // Default placeholder map link
    // default: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.0258123!2d103.856!3d13.36!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDIxJzM2LjAiTiAxMDPCsDUxJzIxLjYiRQ!5e0!3m2!1sen!2skh!4v123456789"
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
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
