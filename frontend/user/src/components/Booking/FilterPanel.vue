<template>
  <div class="filter-container">
    <div class="filter-content">
      <h3 class="filter-header">Filter by:</h3>

      <div class="filter-group">
        <p class="group-title">Score / Rating</p>
        <label><input type="radio" name="rating" /> 4.5 & up</label>
        <label><input type="radio" name="rating" /> 4 & up</label>
        <label><input type="radio" name="rating" /> 3.5 & up</label>
        <label><input type="radio" name="rating" /> 3 & up</label>
        <label><input type="radio" name="rating" /> Lower than 3</label>
      </div>

      <div class="filter-group">
        <p class="group-title">Duration</p>
        <label><input type="radio" name="duration" /> 1-3 hours</label>
        <label><input type="radio" name="duration" /> Half-day</label>
        <label><input type="radio" name="duration" /> Full-day</label>
        <label><input type="radio" name="duration" /> Multi-day</label>
      </div>

      <div class="filter-group">
        <p class="group-title">Price Range</p>
        <label><input type="radio" name="price" /> Lowest Price</label>
        <label><input type="radio" name="price" /> Mid-range</label>
        <label><input type="radio" name="price" /> Premium</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FilterComponent',
});
</script>

<style scoped>
.filter-container {
  /* Positioning Logic */
  position: absolute;
  top: 380px;
  left: 10%;
  z-index: 100;

  display: flex;
  flex-direction: column;
  background-color: #DFDFDF;
  width: 304px;
  height: 550px;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box; /* Ensures padding doesn't increase width */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #333;
  text-align: left;
}

.filter-header {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #bcbcbc;
  padding-bottom: 10px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-weight: bold;
  font-size: 14px;
  margin: 0 0 5px 0;
}

label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

label:hover {
  opacity: 0.7;
}

input[type="radio"], input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}
</style>
