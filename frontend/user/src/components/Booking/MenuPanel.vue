<template>
  <div class="container">
    <div class="search-item">
      <i class="ri-search-line"></i>
      <div class="text-content">
        <span class="label">Destination</span>
        <span class="sub-text">Siem Reap</span>
      </div>
    </div>

    <div class="search-item">
      <i class="ri-calendar-2-line"></i>
      <div class="text-content">
        <span class="label">Date</span>
        <span class="sub-text">Select Date</span>
      </div>
    </div>

    <div class="search-item">
      <i class="ri-user-line"></i>
      <div class="text-content">
        <span class="sub-text bold">2 adults · 0 children · 1 room</span>
      </div>
    </div>

    <button class="search-button">Search</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'SearchBar',
})
</script>

<style scoped>
.container {
  position: absolute;
  left: 50%;
  bottom: 0;
  /* Adjusting this back to a reasonable overlap based on your previous request */
  transform: translate(-50%, -400%);

  width: 1234px;
  height: 121px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 10;

  /* Flexbox settings to align the 4 items */
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
  box-sizing: border-box;
  font-family: 'Lato', sans-serif;
}

.search-item {
  flex: 1; /* Makes the 3 info boxes take equal space */
  height: 90px;
  background-color: #f0f0f0; /* Light gray background */
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
}

.search-item i {
  font-size: 1.8rem;
  color: #555;
}

.search-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.text-content {
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: bold;
  font-size: 1.2rem;
  color: #000;
}

.sub-text {
  font-size: 0.9rem;
  color: #555;
}

.bold {
  font-weight: 600;
  color: #000;
}

.search-button {
  flex: 1; /* Matches the width of the other boxes */
  height: 90px;
  background-color: #1a73e8; /* Blue color from image */
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #1557b0;
}
</style>
