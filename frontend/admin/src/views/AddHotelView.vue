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

      <div class="form-group full-width">
        <label>Destination</label>
        <div class="select-wrapper">
          <select v-model="form.destination" :class="['custom-select', { 'input-error': errors.destination }]" required>
            <option value="" disabled>Select a destination</option>
            <option v-for="dest in destinations" :key="dest" :value="dest">{{ dest }}</option>
          </select>
        </div>
        <span v-if="errors.destination" class="error-text">{{ errors.destination }}</span>
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
          <label>Google Map URL (Embed)</label>
          <input v-model="form.googleMapUrl" type="url" :class="{ 'input-error': errors.googleMapUrl }"
            placeholder="https://www.google.com/maps/embed?pb=..." />
          <span class="helper-text">For Google Map URL: Please copy the src URL from iframe from Google Map</span>
          <span v-if="errors.googleMapUrl" class="error-text">{{ errors.googleMapUrl }}</span>
        </div>
      </div>

      <div class="form-group full-width">
        <label>Amenities</label>
        <div class="amenities-container" :class="{ 'error-border': errors.amenityIds }">
          <div class="form-group full-width">
            <div class="amenities-list">
              <div v-for="amenity in hotelStore.amenitiesList" :key="amenity.id" class="checkbox-item">
                <input type="checkbox" :id="'am-' + amenity.id" :value="amenity.id" v-model="form.amenityIds" />
                <label :for="'am-' + amenity.id">{{ amenity.name }}</label>
              </div>
            </div>
          </div>
        </div>
        <span v-if="errors.amenityIds" class="error-text">{{ errors.amenityIds }}</span>
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
          <input v-model="form.phoneNumber" type="text" required :class="{ 'input-error': errors.phoneNumber }" />
          <span v-if="errors.phoneNumber" class="error-text">{{ errors.phoneNumber }}</span>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required :class="{ 'input-error': errors.email }" />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="create-btn" :disabled="hotelStore.isLoading">{{ hotelStore.isLoading ?
          'Creating...'
          :
          'Create Hotel' }}</button>
        <button type="button" class="cancel-btn" @click="$router.back()">Cancel</button>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useHotelStore } from '@/stores/hotelStore';
import backIcon from '@/assets/icons/back-icon.svg';
import { useRouter } from 'vue-router';
import { validateHotelForm } from '@/utils/hotel-validator';

const hotelStore = useHotelStore();
const imagePreviews = ref<string[]>([]);
const errors = ref<Record<string, string>>({});
const router = useRouter();

const destinations = [
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Takéo',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Phnom Penh',
  'Preah Sihanouk',
  'Preah Vihear',
  'Prey Veng',
  'Pursat',
  'Ratanakiri',
  'Siem Reap',
  'Stung Treng',
  'Svay Rieng',
  'Takeo',
  'Tboung Khmum',
];

const form = ref({
  name: '',
  destination: '',
  shortDescription: '',
  longDescription: '',
  location: '',
  googleMapUrl: '',
  phoneNumber: '',
  email: '',
  amenityIds: [] as number[],
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

  const validation = validateHotelForm(form.value);

  if (!validation.isValid) {
    errors.value = validation.errors;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const result = await hotelStore.createHotel(form.value);

  if (result.success) {
    router.push('/manage_hotel&room');
  } else {
    errors.value = 'errors' in result ? { ...result.errors } : {};
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

watch(form, () => {
  if (Object.keys(errors.value).length > 0) {
    const validation = validateHotelForm(form.value);
    errors.value = validation.errors;
  }
}, { deep: true });
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
  min-height: 100vh;
  overflow: visible;
}

.form-header {
  display: flex;
  align-items: center;
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
  gap: 24px;
  overflow: visible;
}

.form-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  width: 100%;
}

label {
  font-weight: 600;
  font-size: 16px;
  color: #333;
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

.select-wrapper {
  position: relative;
  width: 100%;
  z-index: 1;
}

.select-wrapper::after {
  content: '\25BC';
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
  font-size: 12px;
}

select.custom-select {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid #D9D9D9;
  font-size: 16px;
  border-radius: 12px;
  outline: none;
  background-color: white;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color: #333;
  font-family: inherit;
  direction: ltr;
}

select.custom-select:focus {
  border-color: #0D4798;
  box-shadow: 0 0 0 3px rgba(13, 71, 152, 0.1);
}

select.custom-select option {
  padding: 10px;
  background-color: white;
  color: #333;
  direction: ltr;
}

select.custom-select option:hover {
  background-color: #f0f4ff;
}

select.custom-select option:disabled {
  color: #999;
}

.amenities-container {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
}

.amenities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
  margin-bottom: 20px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-item label {
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
}

.help-text {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
  font-style: italic;
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
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-layer:hover {
  background: rgba(200, 0, 0, 1);
}

.section-title {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #0D4798;
  font-weight: 700;
}

.form-actions {
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-top: 20px;
}

.create-btn {
  background: #0D4798;
  color: white;
  padding: 15px 20px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.create-btn:hover {
  background-color: #07316d;
}

.create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.cancel-btn:hover {
  background-color: #cc0000;
}

.loading-state {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.helper-text {
  color: #666;
  font-size: 0.75rem;
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

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .page-container {
    padding: 20px;
  }
}
</style>
