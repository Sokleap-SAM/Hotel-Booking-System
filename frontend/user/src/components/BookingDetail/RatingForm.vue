<template>
  <div class="rating-form-container">
    <h4 class="form-title">Share your experience</h4>
    
    <div class="categories-grid">
      <div v-for="category in categories" :key="category.key" class="category-input">
        <label>
          <i :class="category.icon"></i>
          {{ category.label }}
        </label>
        <div class="slider-container">
          <input
            type="range"
            :min="1"
            :max="10"
            step="0.5"
            v-model.number="formData[category.key]"
          />
          <span class="slider-value">{{ formData[category.key] }}</span>
        </div>
      </div>
    </div>

    <div class="comment-section">
      <label for="comment">Your review (optional)</label>
      <textarea
        id="comment"
        v-model="formData.comment"
        placeholder="Tell us about your experience at this hotel..."
        rows="4"
      ></textarea>
    </div>

    <div class="overall-preview">
      <span>Your overall rating:</span>
      <span class="overall-score">{{ calculatedOverall }}</span>
      <span class="overall-scale">/ 5</span>
    </div>

    <div class="form-actions">
      <button type="button" class="cancel-btn" @click="$emit('cancel')">Cancel</button>
      <button 
        type="button" 
        class="submit-btn" 
        @click="submitRating"
        :disabled="ratingStore.isSubmitting"
      >
        <span v-if="ratingStore.isSubmitting">Submitting...</span>
        <span v-else>Submit Review</span>
      </button>
    </div>

    <p v-if="ratingStore.error" class="error-message">{{ ratingStore.error }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRatingStore } from '@/stores/ratingStore'

const props = defineProps<{
  hotelId: string
}>()

const emit = defineEmits<{
  (e: 'submitted'): void
  (e: 'cancel'): void
}>()

const ratingStore = useRatingStore()

const categories = [
  { key: 'service', label: 'Service', icon: 'ri-customer-service-2-line' },
  { key: 'facilities', label: 'Facilities', icon: 'ri-hotel-line' },
  { key: 'comfort', label: 'Comfort', icon: 'ri-hotel-bed-line' },
  { key: 'value', label: 'Value for money', icon: 'ri-money-dollar-circle-line' },
  { key: 'location', label: 'Location', icon: 'ri-map-pin-line' },
]

const formData = reactive({
  service: 7,
  facilities: 7,
  comfort: 7,
  value: 7,
  location: 7,
  comment: ''
})

const calculatedOverall = computed(() => {
  const avg = (formData.service + formData.facilities + formData.comfort + formData.value + formData.location) / 5
  return (avg / 2).toFixed(1)
})

const submitRating = async () => {
  const result = await ratingStore.submitRating({
    hotelId: props.hotelId,
    service: formData.service,
    facilities: formData.facilities,
    comfort: formData.comfort,
    value: formData.value,
    location: formData.location,
    comment: formData.comment || undefined
  })
  
  if (result) {
    emit('submitted')
  }
}
</script>

<style scoped>
.rating-form-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.category-input label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
}

.category-input label i {
  color: #003580;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-container input[type="range"] {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #ddd;
  border-radius: 3px;
  outline: none;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #003580;
  cursor: pointer;
}

.slider-container input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #003580;
  cursor: pointer;
  border: none;
}

.slider-value {
  background: #003580;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  min-width: 40px;
  text-align: center;
}

.comment-section {
  margin-bottom: 20px;
}

.comment-section label {
  display: block;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
}

.comment-section textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.comment-section textarea:focus {
  outline: none;
  border-color: #003580;
}

.overall-preview {
  background: white;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 16px;
}

.overall-score {
  font-size: 28px;
  font-weight: 700;
  color: #003580;
}

.overall-scale {
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 12px 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f0f0f0;
}

.submit-btn {
  padding: 12px 24px;
  border: none;
  background: #003580;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #00224f;
}

.submit-btn:disabled {
  background: #999;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
