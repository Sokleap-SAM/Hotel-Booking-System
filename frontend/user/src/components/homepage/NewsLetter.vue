<template>
  <div class="positionHotel">
    <div class="container">
      <h2 class="booking-text">NewsLetter</h2>
      <h3 class="des">Subscribe to the CamBook newsletter to stay ahead of exclusive offers</h3>

      <div class="subscribe-wrapper">
        <input
          type="email"
          placeholder="Enter your email"
          class="email-input"
        />
        <button class="subscribe-btn">Subcribe</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.positionHotel {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  font-family: 'Lato', sans-serif;
}

.container {
  border-radius: 20px;
  background-color: #0e4da4; /* Darker blue to match image */
  padding: 40px;
  width: 1320px;
  height: 527px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Centers content vertically */
  gap: 20px;
  box-sizing: border-box;
}

.booking-text {
  font-size: 70px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.des {
  font-size: 32px;
  font-weight: 500;
  color: white;
  margin-bottom: 30px;
  text-align: center;
  max-width: 800px;
}

/* Subscription Field Styles */
.subscribe-wrapper {
  display: flex;
  width: 100%;
  max-width: 900px; /* Adjust width as needed */
  height: 90px;
  background-color: white;
  border-radius: 50px; /* Pill shape */
  overflow: hidden; /* Ensures button corners don't overlap border-radius */
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.email-input {
  flex: 1;
  border: none;
  padding: 0 40px;
  font-size: 20px;
  outline: none;
  background: transparent;
}

.subscribe-btn {
  background-color: #000000;
  color: white;
  border: none;
  padding: 0 60px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  margin: 6px; /* Adds small spacing from the edge */
  border-radius: 40px; /* Matching the pill shape */
}

.subscribe-btn:hover {
  background-color: #222222;
  cursor: pointer;
}

/* Placeholder styling */
.email-input::placeholder {
  color: #999;
}
</style>
