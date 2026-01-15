<template>
  <div class="positionHotel">
    <div class="container">
      <h2 class="booking-text">Client FeebBack</h2>

      <div class="features-row">
        <div class="container2">
          <i class="ri-lock-fill"></i>
          <p class="feature-label">Secure Payment</p>
        </div>

        <div class="container2">
          <i class="ri-coin-line"></i>
          <p class="feature-label">Best Price</p>
        </div>

        <div class="container2">
          <i class="ri-checkbox-fill"></i>
          <p class="feature-label">Fast Service</p>
        </div>

        <div class="container2">
          <i class="ri-customer-service-2-fill"></i>
          <p class="feature-label">24/7 Support</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.positionHotel {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

/* Main Grey Outer Container */
.container {
  border-radius: 20px;
  background-color: #eaeaea;
  padding: 40px;
  width: 1320px;
  height: 527px;

  display: flex;
  flex-direction: column;
  align-items: center; /* Centers the title and the row */
  gap: 10px;
  box-sizing: border-box;
}

.booking-text {
  font-size: 42px;
  font-weight: 700;
  color: #000;
  margin-top: 20px;
}

/* This is the key change: Row layout for the cards */
.features-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  gap: 20px;
}

/* Individual White Feature Cards */
.container2 {
  background-color: white;
  border-radius: 25px;
  flex: 1; /* Makes all cards equal width */
  height: 350px; /* Specific height for the cards */
  display: flex;
  flex-direction: column; /* Stack Icon over Text */
  justify-content: center;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s;
}

.container2:hover {
  transform: translateY(-5px);
  cursor: pointer;
}

.container2 i {
  font-size: 100px; /* Slightly smaller to fit label */
  color: #0e4da4; /* Deep blue from image */
}

.feature-label {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0;
}
</style>
