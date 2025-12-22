<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="container">
    <div class="circle">
      <i class="ri-lock-line"></i>
    </div>
    <h2>Forgot Password?</h2>
    <span>No worries! Enter yoru email address</span>
    <span>below and we'll verify your name</span>
    <div class="input-group">
      <label>Email Address</label>
      <input type="email" id="email" placeholder="Enter your email" />
    </div>
  </div>
</template>

<script lang="ts"></script>

<style scoped>
.container {
  width: 450px;
  font-family: 'Lato', sans-serif;
  padding: 40px 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.29);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.container h2 {
  font-size: 32px;
  color: white;
}
.container h3 {
  font-size: 20px;
  color: white;
}
.container span {
  color: white;
  margin-top: 5px;
  font-size: 16px;
}
.circle {
  width: min(40vw, 140px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.29);
  backdrop-filter: blur(10px);
  display: flex; /* center icon */
  align-items: center;
  justify-content: center;
  color: #fff;
}
.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0 20px;
  margin-bottom: 15px;
}
.input-group label {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  margin-left: 5px;
  color: white;
}
.circle i {
  font-size: 40px;
}
</style>
