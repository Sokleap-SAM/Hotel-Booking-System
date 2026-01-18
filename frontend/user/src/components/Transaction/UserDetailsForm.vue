<template>
  <div class="form-wrapper">
    <div class="user-status-bar">
      <div class="avatar-icon">
        <i class="ri-user-fill"></i>
      </div>
      <div class="user-info">
        <p>You are signed in as</p>
        <strong>{{ userData.email }}</strong>
      </div>
    </div>

    <div class="details-card">
      <h2 class="form-title">Enter your details</h2>

      <div class="name-grid">
        <div class="form-group">
          <label>First name</label>
          <input type="text" v-model="formData.firstName" />
        </div>
        <div class="form-group">
          <label>Last name</label>
          <input type="text" v-model="formData.lastName" />
        </div>
      </div>

      <div class="form-group">
        <label>Email address</label>
        <input type="email" v-model="formData.email" />
      </div>

      <div class="form-group">
        <label>Date of Birth</label>
        <div class="date-input-container">
          <input type="date" v-model="formData.dob" class="date-picker" />
        </div>
      </div>

      <div class="form-group">
        <label>Country/Region</label>
        <select v-model="formData.country" class="custom-select">
          <option value="Cambodia">Cambodia</option>
          <option value="Vietnam">Vietnam</option>
          <option value="Thailand">Khmer</option>
        </select>
      </div>

      <div class="form-group">
        <label>Phone number</label>
        <input type="tel" v-model="formData.phone" placeholder="+855..." />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'

export default defineComponent({
  setup() {
    const userData = ref({ email: 'kheangann@gmail.com' })

    const formData = reactive({
      firstName: '',
      lastName: '',
      email: 'kheangann@gmail.com',
      dob: '',
      country: 'Cambodia',
      phone: '',
    })

    return { userData, formData }
  },
})
</script>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.user-status-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.avatar-icon {
  width: 40px;
  height: 40px;
  background: #f2dada;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a37070;
}
.details-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 30px;
}
.form-title {
  margin: 0 0 25px;
  font-size: 1.5rem;
}
.name-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 0.9rem;
}
input,
.custom-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #888;
  border-radius: 4px;
  box-sizing: border-box;
}
.date-picker {
  font-family: inherit;
}
</style>
