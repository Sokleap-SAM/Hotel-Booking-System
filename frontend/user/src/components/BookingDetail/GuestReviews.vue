<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <section class="reviews-container">
    <h3 class="section-title">Guest reviews</h3>

    <!-- Loading State -->
    <div v-if="ratingStore.isLoading" class="loading-state">
      <p>Loading reviews...</p>
    </div>

    <template v-else>
      <!-- Summary Header -->
      <div class="summary-header">
        <div class="score-badge">{{ displayAvgRating }}</div>
        <div class="summary-info">
          <span class="status">{{ ratingLabel }}</span>
          <span class="count">{{ ratingStore.ratingSummary?.totalRatings || 0 }} reviews</span>
          <a href="#reviews-list" class="link" @click.prevent="scrollToReviews">Read all reviews</a>
        </div>
      </div>

      <!-- Category Ratings Grid -->
      <div class="ratings-grid">
        <div v-for="item in categoryItems" :key="item.label" class="rating-card">
          <div class="label-group">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </div>

          <div class="circle-box">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path
                class="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle"
                :stroke-dasharray="`${item.score * 10}, 100`"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">{{ item.score }}</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- Write Review Button -->
      <div class="write-review-section">
        <button 
          v-if="!showRatingForm && !ratingStore.hasUserRated" 
          class="write-review-btn"
          @click="showRatingForm = true"
        >
          <i class="ri-edit-line"></i> Write a Review
        </button>
        <p v-else-if="ratingStore.hasUserRated" class="already-rated">
          <i class="ri-check-line"></i> You have already reviewed this hotel
        </p>
      </div>

      <!-- Rating Form -->
      <RatingForm 
        v-if="showRatingForm"
        :hotelId="hotelId"
        @submitted="onRatingSubmitted"
        @cancel="showRatingForm = false"
      />

      <!-- Reviews List -->
      <div id="reviews-list" class="reviews-list-section">
        <h4 class="reviews-list-title">What guests are saying</h4>
        
        <div v-if="ratingStore.hotelRatings.length === 0" class="no-reviews">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>

        <div v-else class="reviews-list">
          <div v-for="rating in ratingStore.hotelRatings" :key="rating.id" class="review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <img 
                    v-if="rating.user?.profileImage" 
                    :src="getProfileImageUrl(rating.user.profileImage)" 
                    :alt="rating.user?.firstName"
                  />
                  <i v-else class="ri-user-line"></i>
                </div>
                <div class="reviewer-details">
                  <span class="reviewer-name">{{ rating.user?.firstName }} {{ rating.user?.lastName }}</span>
                  <span class="review-date">{{ formatDate(rating.createdAt) }}</span>
                </div>
              </div>
              <div class="review-score">{{ rating.overallScore }}</div>
            </div>
            
            <p v-if="rating.comment" class="review-comment">{{ rating.comment }}</p>
            
            <div class="review-categories">
              <span class="category-tag">Staff: {{ rating.staff }}</span>
              <span class="category-tag">Facilities: {{ rating.facilities }}</span>
              <span class="category-tag">Comfort: {{ rating.comfort }}</span>
              <span class="category-tag">Value: {{ rating.value }}</span>
              <span class="category-tag">Location: {{ rating.location }}</span>
              <span class="category-tag">WiFi: {{ rating.wifi }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRatingStore } from '@/stores/ratingStore'
import { useAuthStore } from '@/stores/auth'
import RatingForm from './RatingForm.vue'

const props = defineProps<{
  hotelId: string
}>()

const ratingStore = useRatingStore()
const authStore = useAuthStore()
const showRatingForm = ref(false)

const displayAvgRating = computed(() => {
  return ratingStore.ratingSummary?.avgRating?.toFixed(1) || '0.0'
})

const ratingLabel = computed(() => {
  const avg = ratingStore.ratingSummary?.avgRating || 0
  if (avg >= 4.5) return 'Exceptional'
  if (avg >= 4.0) return 'Excellent'
  if (avg >= 3.5) return 'Very Good'
  if (avg >= 3.0) return 'Good'
  if (avg >= 2.0) return 'Fair'
  return 'No rating'
})

const categoryItems = computed(() => {
  const cats = ratingStore.ratingSummary?.categoryAverages
  return [
    { label: 'Staff', score: cats?.staff || 0, icon: 'ri-group-line' },
    { label: 'Facilities', score: cats?.facilities || 0, icon: 'ri-hotel-line' },
    { label: 'Comfort', score: cats?.comfort || 0, icon: 'ri-hotel-bed-line' },
    { label: 'Value', score: cats?.value || 0, icon: 'ri-money-dollar-circle-line' },
    { label: 'Location', score: cats?.location || 0, icon: 'ri-map-pin-line' },
    { label: 'WiFi', score: cats?.wifi || 0, icon: 'ri-wifi-line' }
  ]
})

const getProfileImageUrl = (image: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  if (image.startsWith('http')) return image
  return `${apiUrl}/uploads/profiles/${image}`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const scrollToReviews = () => {
  const el = document.getElementById('reviews-list')
  el?.scrollIntoView({ behavior: 'smooth' })
}

const onRatingSubmitted = () => {
  showRatingForm.value = false
}

const loadRatings = async () => {
  if (props.hotelId) {
    await ratingStore.fetchHotelRatings(props.hotelId)
    if (authStore.isAuthenticated) {
      await ratingStore.fetchUserRatingForHotel(props.hotelId)
    }
  }
}

onMounted(() => {
  loadRatings()
})

watch(() => props.hotelId, () => {
  loadRatings()
})
</script>

<style scoped>
.reviews-container {
  font-family: 'Lato', sans-serif;
  margin-top: 40px;
  padding-bottom: 40px;
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 15px;
}

.summary-header {
  font-size: 36px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.score-badge {
  background: #003580;
  color: white;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem;
}

.summary-info {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 600;
}

.link {
  color: #006ce4;
  text-decoration: none;
  font-weight: 400;
  margin-left: 5px;
}

/* Grid Layout */
.ratings-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
}

.rating-card {
  font-size: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.label-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 32px;
}

/* Circular Progress Styling */
.circle-box {
  width: 160px;
  height: 150px;
}

.circular-chart {
  display: block;
  margin: 10px auto;
  max-width: 100%;
  max-height: 100%;
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 2.8;
}

.circle {
  fill: none;
  stroke-width: 2.8;
  stroke: #0000ff; /* Blue color from your design */
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.percentage {
  fill: #333;
  font-family: sans-serif;
  font-size: 0.5rem;
  font-weight: 800;
  text-anchor: middle;
}

/* Loading State */
.loading-state {
  padding: 40px;
  text-align: center;
  color: #666;
}

/* Write Review Section */
.write-review-section {
  margin: 30px 0;
}

.write-review-btn {
  background: #003580;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.write-review-btn:hover {
  background: #00224f;
}

.already-rated {
  color: #28a745;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Reviews List Section */
.reviews-list-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.reviews-list-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 12px;
  color: #666;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-avatar i {
  font-size: 24px;
  color: #666;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: 600;
  font-size: 16px;
}

.review-date {
  font-size: 13px;
  color: #666;
}

.review-score {
  background: #003580;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 18px;
}

.review-comment {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
}

.review-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  background: #f0f4ff;
  color: #003580;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .ratings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rating-card {
    font-size: 20px;
  }
  
  .label-group {
    font-size: 20px;
  }
  
  .circle-box {
    width: 100px;
    height: 100px;
  }
}
</style>
