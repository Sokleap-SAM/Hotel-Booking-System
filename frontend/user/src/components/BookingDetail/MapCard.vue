<template>
  <div class="map-card">
    <div v-if="!isValidEmbedUrl" class="error-message">
      ⚠️ Invalid map URL. Please use a Google Maps embed URL.
    </div>
    <iframe v-else :src="mapUrl" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" ></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  rating: {
    type: Number,
    default: 4.5,
  },
  mapUrl: {
    type: String,
    default: '',
  },
})

// Only accept embed URLs - they work directly without transformation
const isValidEmbedUrl = computed(() => {
  const url = props.mapUrl;
  if (!url) return false;
  
  // Check if it's a valid Google Maps embed URL
  return url.includes('google.com/maps/embed') || url.includes('output=embed');
})
</script>

<style scoped>
.map-card {
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  background: white;
  flex-direction: column;
  min-height: 300px;
}

.error-message {
  padding: 20px;
  text-align: center;
  color: #d32f2f;
  font-size: 14px;
  line-height: 1.6;
}

iframe {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: none;
}
</style>
