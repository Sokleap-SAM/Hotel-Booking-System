<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="rating-modal">
      <div class="modal-header">
        <h2>Rate Your Stay</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Hotel Info -->
        <div class="hotel-info">
          <div class="hotel-image" :style="{ backgroundImage: `url(${hotelImage})` }"></div>
          <div class="hotel-details">
            <h3>{{ hotelName }}</h3>
            <p v-if="hotelLocation"><i class="ri-map-pin-line"></i> {{ hotelLocation }}</p>
          </div>
        </div>

        <!-- Already Rated Message -->
        <div v-if="hasExistingRating" class="already-rated">
          <i class="ri-checkbox-circle-fill"></i>
          <p>You have already rated this hotel. Thank you for your feedback!</p>
          <div class="existing-rating">
            <span class="overall-score">{{ existingRating?.overallScore }}</span>
            <span class="out-of">/5</span>
          </div>
        </div>

        <!-- Rating Form -->
        <div v-else class="rating-form">
          <p class="form-intro">How was your experience? Rate each category from 1 to 10.</p>

          <div class="rating-categories">
            <div class="category" v-for="category in categories" :key="category.key">
              <div class="category-header">
                <i :class="category.icon"></i>
                <span>{{ category.label }}</span>
              </div>
              <div class="rating-slider">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  v-model.number="ratings[category.key]"
                  class="slider"
                />
                <span class="rating-value">{{ ratings[category.key] }}</span>
              </div>
            </div>
          </div>

          <div class="comment-section">
            <label for="comment">Your Review (Optional)</label>
            <textarea
              id="comment"
              v-model="comment"
              placeholder="Share your experience at this hotel..."
              rows="4"
            ></textarea>
          </div>

          <div class="overall-preview">
            <span class="label">Overall Score:</span>
            <span class="score">{{ calculateOverallScore.toFixed(1) }}</span>
            <span class="out-of">/5</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button
          v-if="!hasExistingRating"
          class="btn-submit"
          @click="submitRating"
          :disabled="isSubmitting"
        >
          <i v-if="isSubmitting" class="ri-loader-4-line spinning"></i>
          <span v-else>Submit Rating</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, type PropType } from 'vue'
import { useRatingStore, type Rating } from '@/stores/ratingStore'

interface RatingValues {
  staff: number
  facilities: number
  comfort: number
  value: number
  location: number
  wifi: number
}

export default defineComponent({
  name: 'RatingModal',
  props: {
    hotelId: {
      type: String,
      required: true,
    },
    hotelName: {
      type: String,
      required: true,
    },
    hotelLocation: {
      type: String,
      default: '',
    },
    hotelImage: {
      type: String,
      default: '/placeholder-hotel.jpg',
    },
    existingRating: {
      type: Object as PropType<Rating | null>,
      default: null,
    },
  },
  emits: ['close', 'rated'],
  setup(props, { emit }) {
    const ratingStore = useRatingStore()

    const categories = [
      { key: 'staff' as keyof RatingValues, label: 'Staff', icon: 'ri-user-smile-line' },
      { key: 'facilities' as keyof RatingValues, label: 'Facilities', icon: 'ri-building-2-line' },
      { key: 'comfort' as keyof RatingValues, label: 'Comfort', icon: 'ri-hotel-bed-line' },
      { key: 'value' as keyof RatingValues, label: 'Value for Money', icon: 'ri-money-dollar-circle-line' },
      { key: 'location' as keyof RatingValues, label: 'Location', icon: 'ri-map-pin-line' },
      { key: 'wifi' as keyof RatingValues, label: 'Free WiFi', icon: 'ri-wifi-line' },
    ]

    const ratings = ref<RatingValues>({
      staff: 7,
      facilities: 7,
      comfort: 7,
      value: 7,
      location: 7,
      wifi: 7,
    })

    const comment = ref('')
    const isSubmitting = ref(false)

    const hasExistingRating = computed(() => props.existingRating !== null)

    const calculateOverallScore = computed(() => {
      const sum =
        ratings.value.staff +
        ratings.value.facilities +
        ratings.value.comfort +
        ratings.value.value +
        ratings.value.location +
        ratings.value.wifi
      const avgCategoryScore = sum / 6
      // Convert 1-10 scale to 1-5 scale
      return avgCategoryScore / 2
    })

    const submitRating = async () => {
      isSubmitting.value = true
      try {
        const result = await ratingStore.submitRating({
          hotelId: props.hotelId,
          staff: ratings.value.staff,
          facilities: ratings.value.facilities,
          comfort: ratings.value.comfort,
          value: ratings.value.value,
          location: ratings.value.location,
          wifi: ratings.value.wifi,
          comment: comment.value || undefined,
        })

        if (result) {
          emit('rated', result)
          emit('close')
        }
      } catch (error) {
        console.error('Error submitting rating:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      categories,
      ratings,
      comment,
      isSubmitting,
      hasExistingRating,
      calculateOverallScore,
      submitRating,
    }
  },
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.rating-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #1a1a1a;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
}

.close-btn i {
  font-size: 20px;
  color: #666;
}

.modal-body {
  padding: 24px;
}

/* Hotel Info */
.hotel-info {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.hotel-image {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.hotel-details h3 {
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.hotel-details p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Already Rated */
.already-rated {
  text-align: center;
  padding: 30px 20px;
}

.already-rated i {
  font-size: 50px;
  color: #4caf50;
}

.already-rated p {
  color: #666;
  margin: 15px 0;
}

.existing-rating {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.existing-rating .overall-score {
  font-size: 2.5rem;
  font-weight: bold;
  color: #003580;
}

.existing-rating .out-of {
  font-size: 1.2rem;
  color: #999;
}

/* Rating Form */
.form-intro {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 0.95rem;
}

.rating-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.category {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 14px 16px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.category-header i {
  font-size: 18px;
  color: #003580;
}

.category-header span {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.rating-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #003580;
  cursor: pointer;
  transition: transform 0.1s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #003580;
  cursor: pointer;
  border: none;
}

.rating-value {
  min-width: 28px;
  text-align: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: #003580;
}

/* Comment Section */
.comment-section {
  margin-bottom: 20px;
}

.comment-section label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.comment-section textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.comment-section textarea:focus {
  outline: none;
  border-color: #003580;
}

/* Overall Preview */
.overall-preview {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #e8f0fe;
  border-radius: 10px;
}

.overall-preview .label {
  color: #333;
  font-weight: 500;
}

.overall-preview .score {
  font-size: 1.8rem;
  font-weight: bold;
  color: #003580;
}

.overall-preview .out-of {
  color: #666;
  font-size: 1rem;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-submit {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #003580;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #00264d;
}

.btn-submit:disabled {
  background: #99b3cc;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 540px) {
  .rating-modal {
    max-width: 100%;
    margin: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .hotel-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .hotel-image {
    width: 100px;
    height: 70px;
  }
}
</style>
