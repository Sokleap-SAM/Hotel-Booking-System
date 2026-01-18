<script setup lang="ts">

</script>

<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <footer class="footer">
    <div class="footer-section">
      <h3>CONTACT DETAILS</h3>
      <p>Tel: +(855) 112233445</p>
      <p>Mov: +(855) 973344561</p>
      <p>E-mail: CamBook.System@gmail.com</p>
    </div>

    <div class="footer-section">
      <h3>Support & Legal</h3>
      <ul>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms & Conditions</a></li>
        <li><a href="#">FAQ</a></li>
        <li><a href="#">Contact Us</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h3>Social Media and Language</h3>
      <div class="icons">
        <i class="ri-facebook-circle-line"></i>
        <i class="ri-threads-line"></i>
      </div>
      <div class="language">
        <img src="https://flagcdn.com/w40/gb.png" alt="UK Flag" />
        <img src="https://flagcdn.com/w20/kh.png" alt="Cambodia Flag" />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  background-color: #007bff;
  color: white;
  padding: 20px;
  flex-wrap: wrap;
  font-family: 'Lato', sans-serif;
}

.footer-section {
  flex: 1;
  min-width: 200px;
  margin: 10px;
}

.footer-section h3 {
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 6px;
}

.footer-section a {
  color: white;
  text-decoration: none;
}

.footer-section a:hover {
  text-decoration: underline;
}

.icons i {
  font-size: 1.5rem;
  margin-right: 10px;
}

.language img {
  margin-left: 10px;
  width: 30px;
  margin-top: 10px;
}
</style>
