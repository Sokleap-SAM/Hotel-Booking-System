<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <section class="reviews-container">
    <h3 class="section-title">Guest reviews</h3>

    <div class="summary-header">
      <div class="score-badge">{{ overallScore }}</div>
      <div class="summary-info">
        <span class="status">Exceptional</span>
        <span class="count">{{ totalReviews }} reviews</span>
        <a href="#" class="link">Read all reviews</a>
      </div>
    </div>

    <div class="ratings-grid">
      <div v-for="item in categories" :key="item.label" class="rating-card">
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
  </section>
</template>

<script setup lang="ts">
interface RatingCategory {
  label: string
  score: number
  icon: string
}

defineProps<{
  overallScore: number
  totalReviews: string
  categories: RatingCategory[]
}>()
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
</style>
