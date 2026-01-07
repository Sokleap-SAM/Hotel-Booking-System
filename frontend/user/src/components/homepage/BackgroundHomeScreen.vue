<template>
  <div class="logo-screen">
    <div class="hooktext">
      <div>Find Place to Stay?</div>
      <div>Search for hotels here</div>
    </div>
    <div class="container">
      <button class="location">
        <i class="ri-map-pin-fill"></i>
        Where to Stay?
      </button>
      <button class="calender">
        <i class="ri-calendar-2-line"></i>
        Check in-out date
      </button>
      <button class="guestAndRoom">
        <i class="ri-user-3-line"></i>
        Guests & Rooms
      </button>
      <button class="search">
        <i class="ri-search-line"></i>
        Search
      </button>
    </div>
  </div>
</template>

<style scoped>
.logo-screen {
  background-image: url('@/assets/Logo_Background.png');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100vh;
  font-family: 'Lato', sans-serif;

  display: flex;
  flex-direction: column;

  /* 1. Push content to the bottom */
  justify-content: flex-end;

  /* 2. Align content to the left */
  align-items: flex-start;

  /* 3. Spacing from the edges */
  padding-bottom: 80px;
  padding-left: 60px;

  /* 4. Gap between the text and the white bar */
  gap: 20px;
}

.hooktext {
  color: #0d4798;
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
  text-shadow: 0px 1px 2px rgba(255, 255, 255, 0.5);
}

.container {
  background-color: rgba(255, 255, 255, 0.4);
  width: 85%;
  height: 100px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 6.5%;
}
.container button {
  align-items: center;
  font-weight: bold;
  justify-content: center;
}
.location {
  font-size: 20px;
  border: none;
  gap: 10px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 20%;
  height: 60px;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
}
.calender {
  font-size: 20px;
  border: none;
  gap: 10px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 20%;
  height: 60px;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
}
.guestAndRoom {
  font-size: 20px;
  border: none;
  gap: 10px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 20%;
  height: 60px;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
}
.location:hover ,
.calender:hover ,
.guestAndRoom:hover {
  background-color: #1967D3;
  color: white;
}
.search:hover {
  background-color: white;
  color: #1967D3;
}
.search {
  font-size: 20px;
  border: none;
  gap: 10px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 20%;
  height: 60px;
  background-color: #1967D3;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}
</style>
