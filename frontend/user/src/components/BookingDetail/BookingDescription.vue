<template>
    <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />
  <section class="description-section">
    <h2 class="headline">
      {{ descriptionData.title }}
    </h2>

    <div class="body-text">
      <p v-for="(paragraph, index) in descriptionData.paragraphs" :key="index">
        {{ paragraph }}
      </p>

      <p class="highlight" v-if="descriptionData.highlight">
        {{ descriptionData.highlight }}
      </p>
    </div>

    <!-- Contact Information -->
    <div class="contact-info" v-if="descriptionData.phoneNumber || descriptionData.email || descriptionData.location">
      <h3 class="contact-title">Contact Information</h3>
      <div class="contact-grid">
        <div class="contact-item" v-if="descriptionData.location">
          <i class="ri-map-pin-line"></i>
          <span>{{ descriptionData.location }}</span>
        </div>
        <div class="contact-item" v-if="descriptionData.phoneNumber">
          <i class="ri-phone-line"></i>
          <a :href="'tel:' + descriptionData.phoneNumber">{{ descriptionData.phoneNumber }}</a>
        </div>
        <div class="contact-item" v-if="descriptionData.email">
          <i class="ri-mail-line"></i>
          <a :href="'mailto:' + descriptionData.email">{{ descriptionData.email }}</a>
        </div>
      </div>
    </div>

    <!-- Amenities -->
    <div class="amenities-section" v-if="descriptionData.amenities && descriptionData.amenities.length > 0">
      <h3 class="amenities-title">Amenities</h3>
      <div class="amenities-grid">
        <div class="amenity-tag" v-for="amenity in descriptionData.amenities" :key="amenity.id">
          <i class="ri-checkbox-circle-line"></i>
          {{ amenity.name }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Defining Props makes it easy to replace mock data with Backend data later
interface Amenity {
  id: number;
  name: string;
}

interface DescriptionData {
  title: string;
  paragraphs: string[];
  highlight: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  amenities?: Amenity[];
}

defineProps<{
  descriptionData: DescriptionData
}>();
</script>

<style scoped>
.description-section {
  font-family: 'Lato', sans-serif;
  margin-top: 30px;
  max-width: 100%;
}

.headline {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.body-text p {
  font-size: 32px;
  line-height: 1.7;
  color: #4a4a4a;
  margin-bottom: 15px;
  text-align: justify;
}

.highlight {
  font-weight: 700px;
  color: #4a4a4a;
  /* color: #1a1a1a !important; */
}

/* Contact Information Styles */
.contact-info {
  margin-top: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
}

.contact-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.contact-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #4a4a4a;
}

.contact-item i {
  font-size: 22px;
  color: #006ce4;
}

.contact-item a {
  color: #006ce4;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

/* Amenities Styles */
.amenities-section {
  margin-top: 30px;
}

.amenities-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.amenities-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.amenity-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #e8f4fd;
  border-radius: 8px;
  font-size: 16px;
  color: #003580;
}

.amenity-tag i {
  color: #00a550;
  font-size: 18px;
}

@media (max-width: 768px) {
  .headline {
    font-size: 28px;
  }

  .body-text p {
    font-size: 18px;
  }

  .contact-grid {
    flex-direction: column;
    gap: 15px;
  }

  .contact-item {
    font-size: 16px;
  }
}
</style>
