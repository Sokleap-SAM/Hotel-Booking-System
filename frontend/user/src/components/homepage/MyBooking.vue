<template>
  <div class="positionHotel">
    <div class="title">My Booking</div>

    <div class="container">
      <h2 class="booking-text">Haven’t Booking yet?</h2>

      <div class="button-wrapper">
        <button class="explore-btn">Explore Now</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.positionHotel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  padding-left: 80px;
  padding-right: 20px;
}

.title {
  flex: 0 0 100%;
  font-size: 32px;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: 10px;
}

/* Container size kept exactly as your previous code */
.container {
  flex: 0 0 auto;
  border-radius: 20px;
  margin-bottom: 30px;
  background-color: #eaeaea; /* Light grey from image */
  padding: 30px; /* Adjusted padding for internal spacing */
  width: 440px; /* Original Width */
  height: 440px; /* Original Height */

  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Spaced text top, button bottom */
  box-sizing: border-box;
  font-family: 'Lato', sans-serif;
}

.booking-text {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  color: #000;
  line-height: 1.1;
}

.button-wrapper {
  display: flex;
  justify-content: flex-end; /* Pushes button to the right */
}

.explore-btn {
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  background-color: #1a73e8; /* Blue color from image */
  color: white;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.explore-btn:hover {
  background-color: #1557b0;
  cursor: pointer;
}
</style>
