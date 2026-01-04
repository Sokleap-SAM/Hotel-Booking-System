<template>
  <div class="logo-screen">
    <div class="hooktext">
      <div>Find Place to Stay?</div>
      <div>Search for hotels here</div>
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
  align-items: flex-end;
  justify-content: flex-start;

  padding-bottom: 80px;
  padding-left: 40px;
}

.hooktext {
  color: #0D4798;
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
}
</style>
