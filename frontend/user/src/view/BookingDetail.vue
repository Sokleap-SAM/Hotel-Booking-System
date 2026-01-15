<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <div class="bookingpage" :style="backgroundHeader">
    <div class="RowHeader">
      <div class="title">CamBook.com</div>
      <button class="Profile">
        <i class="ri-user-line"></i>
      </button>
    </div>

  </div>
</template>

<script lang="ts">
  import background from '@/assets/Background2.png'

  export default {
    name: 'BookingPage',
    setup() {
      const backgroundHeader = {
        backgroundImage: `url(${background})`
      }

      return {
        backgroundHeader,
      }
    },
  }
</script>

<style scoped>
.bookingpage {
  /* 1. Set a specific height to 'cut' the bottom of the image */
  height: 250px;

  /* 2. Anchor the image to the TOP so the sky and temple tops stay visible */
  background-position: center 50%;

  /* 3. Scale the image to cover the entire width of the header */
  background-size: cover;

  /* 4. Prevent the image from repeating if the container is wider than the image */
  background-repeat: no-repeat;

  /* Optional: Alignment for your logo and icons */
  display: flex;
  align-items: flex-start; /* Keeps content at the top */
  padding: 20px 80px;
  width: 100%;
  font-family: 'Lato', sans-serif;
}
.RowHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  font-family: 'Lato', sans-serif;
}
.Profile {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
}
.Profile:hover {
  background-color: #5a70d4;
  cursor: pointer;
}
.Profile i {
  font-size: 24px;
  color: #0D4798;
  line-height: 50px;
  text-align: center;
  display: block;
}
</style>
