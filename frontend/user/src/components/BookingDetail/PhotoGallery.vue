<template>
  <div class="gallery-container">
    <div class="main-image">
      <img :src="localImages[0]" alt="Hotel Main View" />
    </div>

    <div class="thumbnails">
      <div v-for="(img, index) in localImages.slice(1, 3)" :key="index" class="thumb-wrapper">
        <img :src="img" alt="Hotel Detail" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Replace these with your actual filenames in src/assets/
import hotel1 from '@/assets/Angkorwat.png';
import hotel2 from '@/assets/hotel1.jpg';
import hotel3 from '@/assets/Pubstreet.png';

const localImages = [hotel1, hotel2, hotel3];
</script>

<style scoped>
.gallery-container {
  display: flex;
  gap: 10px;
  height: 400px; /* Fixed height to keep it clean */
}

.main-image {
  flex: 2; /* Takes up 2/3 of the space */
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
}

.thumbnails {
  flex: 1; /* Takes up 1/3 of the space */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.thumb-wrapper {
  height: calc(50% - 5px);
}

.thumb-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
}
</style>
