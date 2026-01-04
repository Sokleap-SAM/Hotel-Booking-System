<template>
  <main class="page-container">
    <header class="form-header">
      <button class="back-btn" @click="$router.back()">
        <img :src="backIcon" alt="Go back" class="btn-icon" />
      </button>
      <h1>Add New Hotel</h1>
    </header>

    <form @submit.prevent="handleCreate" class="hotel-form">
      <h2 class="section-title">Hotel Information</h2>
      <div class="form-group full-width">
        <label>Hotel Name</label>
        <input v-model="form.name" type="text" placeholder="e.g. Grand Palace" required
          :class="{ 'input-error': errors.name }" />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Short Description</label>
          <input v-model="form.shortDescription" type="text" placeholder="Short description... " required
            :class="{ 'input-error': errors.shortDescription }" />
          <span v-if="errors.shortDescription" class="error-text">{{ errors.shortDescription }}</span>
        </div>
        <div class="form-group">
          <label>Full Description</label>
          <input v-model="form.longDescription" type="text" placeholder="Full description..." required
            :class="{ 'input-error': errors.longDescription }" />
          <span v-if="errors.longDescription" class="error-text">{{ errors.longDescription }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Location</label>
          <input v-model="form.location" type="text" required :class="{ 'input-error': errors.location }" />
          <span v-if="errors.location" class="error-text">{{ errors.location }}</span>
        </div>
        <div class="form-group">
          <label>Map link</label>
          <input v-model="form.googleMapUrl" type="url" :class="{ 'input-error': errors.googleMapUrl }" />
          <span v-if="errors.googleMapUrl" class="error-text">{{ errors.googleMapUrl }}</span>
        </div>
      </div>

      <div class="form-group full-width">
        <label>Amenities</label>
        <div class="amenities-list" :class="{ 'error-border': errors.amenityIds }" >
          <div v-for="amenity in hotelStore.amenitiesList" :key="amenity.id" class="checkbox-item" >
            <input type="checkbox" :id="'am-' + amenity.id" :value="amenity.id" v-model="form.amenityIds" />
            <label :for="'am-' + amenity.id">{{ amenity.name }}</label>
          </div>
        </div>
        <span v-if="errors.amenityIds" class="error-text">{{ errors.amenityIds }}</span>
      </div>

      <div class="form-group full-width">
        <label>Custom Amenities</label>
        <div class="custom-input-wrapper">
          <input v-model="form.custom_amenities" type="text"
            placeholder="(e.g., Infinity Pool, Private Beach, Helicopter Pad)"
            :class="{ 'input-error': errors.custom_amenities }" />
          <p class="help-text">Note: You can select amenities above AND add custom amenities too</p>
          <span v-if="errors.custom_amenities" class="error-text">{{ errors.custom_amenities }}</span>
        </div>
      </div>

      <div class="form-group full-width">
        <label>Hotel Images</label>
        <div class="image-upload-grid" :class="{ 'grid-error': errors.images }">
          <div v-for="(img, index) in imagePreviews" :key="index" class="preview-card">
            <img :src="img" />
            <button type="button" class="remove-layer" @click="removeImage(index)">x</button>
          </div>

          <label class="upload-box">
            <input type="file" multiple accept="image/*" @change="handleFiles" hidden />
            <span class="upload-icon">+</span>
            <span class="upload-text">Upload</span>
          </label>
        </div>
        <span v-if="errors.images" class="error-text">{{ errors.images }}</span>
      </div>

      <h2 class="section-title">Contact Info</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Phone Number</label>
          <input v-model="form.phoneNumber" type="text" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required :class="{ 'input-error': errors.email }" />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="hotelStore.isLoading">{{ hotelStore.isLoading ? 'Saving...' :
          'Create Hotel' }}</button>
        <button type="button" class="cancel-btn" @click="$router.back()">Cancel</button>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useHotelStore } from '@/stores/hotelStore';
import backIcon from '@/assets/icons/back-icon.svg';
import { useRouter } from 'vue-router';

const hotelStore = useHotelStore();
const imagePreviews = ref<string[]>([]);
const errors = ref<Record<string, string>>({});
const router = useRouter();

const form = ref({
  name: '',
  shortDescription: '',
  longDescription: '',
  location: '',
  googleMapUrl: '',
  phoneNumber: '',
  email: '',
  amenityIds: [] as number[],
  custom_amenities: '',
  images: [] as (File | string)[],
});

onMounted(() => hotelStore.fetchAmenitiesByCategory('hotel'));

const handleFiles = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  
  files.forEach(file => {
    form.value.images.push(file);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        imagePreviews.value.push(result);
      }
    };
    
    reader.readAsDataURL(file);
  });
  target.value = '';
};

const removeImage = (index: number) => {
  form.value.images.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const handleCreate = async () => {
  errors.value = {};

  if (!form.value.images || form.value.images.length === 0) {
    errors.value.images = 'At least one hotel image is required';
    return;
  }
  
  const result = await hotelStore.createHotel(form.value);

  if (result.success) {
    router.push('/manage_hotel&room');
  } else {
    errors.value = { ...result.errors };
  }
};
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  align-items: center;
  font-family: 'Lato', sans-serif;
}

.form-header {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.back-btn {
  background-color: white;
  border: none;
  cursor: pointer;
}

.hotel-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  width: 100%;
}

label {
  font-weight: bold;
  font-size: 18px;
}

input {
  padding: 12px;
  border: 1px solid #D9D9D9;
  font-size: 16px;
  border-radius: 12px;
  outline: none;
}

input:focus {
  border-color: #0D4798;
}

.amenities-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  padding: 20px;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.custom-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-text {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
  font-style: italic;
}

.add-btn {
  background: #0D4798;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 20px;
  cursor: pointer;
  font-weight: bold;
}

.image-upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.upload-box {
  width: 120px;
  height: 120px;
  border: 2px dashed #D9D9D9;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #919090;
}

.preview-card {
  width: 120px;
  height: 120px;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
}

.preview-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-layer {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.section-title {
  margin-top: 20px;
  font-size: 24px;
  color: #0D4798;
}

.form-actions {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.save-btn {
  background: #0D4798;
  color: white;
  padding: 15px 20px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.cancel-btn {
  background: #FF0000;
  color: white;
  padding: 15px 25px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.input-error {
  border-color: #dc2626;
  background-color: #fff5f5;
}

.error-border {
  border: 2px solid #dc2626 !important;
  border-radius: 12px;
  background-color: #fff5f5;
  padding: 10px;
}

.grid-error {
  border: 2px dashed #dc2626 !important;
  background-color: #fff5f5;
  padding: 15px;
  border-radius: 15px;
}
</style>
