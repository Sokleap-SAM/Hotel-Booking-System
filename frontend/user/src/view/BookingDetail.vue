<template>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.8.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="booking-page-container">
    <header class="blue-header" :style="backgroundHeader">
      <div class="nav-bar">
        <div class="logo">CamBook.com</div>
        <button class="profile-btn">
          <i class="ri-user-line"></i>
        </button>
      </div>
    </header>
    <main class="main-content">
      <div class="hotel-info-row">
        <div class="title-group">
          <nav class="breadcrumbs">Home > Siem Reap > Angkor Village Hotel</nav>
          <h1 class="hotel-name">Angkor Village Hotel</h1>
        </div>

        <div class="action-group">
          <button class="icon-btn"><i class="ri-heart-line"></i></button>
          <button class="icon-btn"><i class="ri-share-line"></i></button>
          <button class="book-now-btn">Booking</button>
        </div>
      </div>

      <div class="media-grid">
        <PhotoGallery class="gallery-section" />
        <MapCard class="map-section" :rating="4.5" :mapUrl="mockMapLink" />
      </div>

      <BookingDescription :descriptionData="mockDescription" />

      <GuestReviews :overallScore="9.7" totalReviews="1,244" :categories="mockRatings" />

      <AvailabilitySection
        bookingDates="Sat, Dec 20 --- Sun, Dec 21"
        guestConfig="2 adults : 0 children . 1 room"
        :rooms="mockRooms"
      />
    </main>
    <FooterScreen />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import background from '@/assets/Background2.png'

// Import Child Components from src/components/BookingDetail/
import PhotoGallery from '@/components/BookingDetail/PhotoGallery.vue'
import MapCard from '@/components/BookingDetail/MapCard.vue'
import BookingDescription from '@/components/BookingDetail/BookingDescription.vue'
import GuestReviews from '@/components/BookingDetail/GuestReviews.vue'
import AvailabilitySection from '@/components/BookingDetail/AvailabilitySection.vue'
import FooterScreen from '@/components/homepage/FooterScreen.vue'

export default defineComponent({
  name: 'BookingPage',
  components: {
    PhotoGallery,
    MapCard,
    BookingDescription,
    GuestReviews,
    AvailabilitySection,
    FooterScreen,
  },
  setup() {
    // Dynamic Header Background
    const backgroundHeader = {
      backgroundImage: `url(${background})`,
    }

    // --- MOCK DATA FOR FUTURE NESTJS INTEGRATION ---
    const mockMapLink = ref(
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.0258123!2d103.856!3d13.36!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDIxJzM2LjAiTiAxMDPCsDUxJzIxLjYiRQ!5e0!3m2!1sen!2skh!4v123456789',
    )

    const mockDescription = ref({
      title:
        'Get the celebrity treatment with world-class service at Angkor Village Hotel - Small Luxury Hotels of the World',
      paragraphs: [
        'This boutique hotel offers a quiet stay with Khmer-style architecture and landscaped gardens. It features a freeform outdoor pool, an open-air restaurant serving authentic Khmer dishes, and a bar.',
        'Rooms are spacious with wooden interiors, garden or lotus pond views, and modern comforts like tea/coffee facilities, a safe, and rain showers.',
      ],
      highlight: 'Couples especially love the location, rating it 9.8/10 for a two-person trip.',
    })

    const mockRatings = ref([
      { label: 'Staff', score: 9.9, icon: 'ri-group-line' },
      { label: 'Facilities', score: 9.6, icon: 'ri-hotel-line' },
      { label: 'Comfort', score: 9.6, icon: 'ri-hotel-bed-line' },
      { label: 'Value for money', score: 9.9, icon: 'ri-money-dollar-circle-line' },
      { label: 'Location', score: 9.6, icon: 'ri-map-pin-line' },
      { label: 'WiFi', score: 9.6, icon: 'ri-wifi-line' },
    ])

    const mockRooms = ref([
      {
        name: '2 twin beds',
        description:
          'The garden view twin room is located on the ground floor and overlooks our beautiful garden...',
        maxGuests: 2,
        price: 50,
        finalPrice: 35,
        discount: 30,
        breakfast: true,
        stock: 1,
      },
      {
        name: '1 queen bed',
        description:
          'Our traditionally Khmer designed garden view room offers a comfortable and spacious stay...',
        maxGuests: 2,
        price: 80,
        finalPrice: 56,
        discount: 30,
        breakfast: true,
        stock: 3,
      },
    ])

    return {
      backgroundHeader,
      mockMapLink,
      mockDescription,
      mockRatings,
      mockRooms,
    }
  },
})
</script>

<style scoped>
.booking-page-container {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Lato', sans-serif;
}

/* 1. Header Styles */
.blue-header {
  height: 280px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  padding: 20px 80px;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 2.2rem;
  font-weight: bold;
  color: white;
}

.profile-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-btn i {
  font-size: 22px;
  color: #0d4798;
}

/* 2. Overlap Layout */
.main-content {
  max-width: 1250px;
  margin: 10px auto 0; /* Creates the Design Overlap */
  padding: 0 40px;
  position: relative;
  z-index: 10;
}

/* 3. Info & Action Styles */
.hotel-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 25px;
}

.breadcrumbs {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 5px;
}

.hotel-name {
  font-size: 2.6rem;
  font-weight: 800;
  margin: 0;
  color: #000;
}

.action-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
}

.book-now-btn {
  background-color: #1a73e8;
  color: white;
  padding: 12px 35px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
}

/* 4. Layout Grids */
.media-grid {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

@media (max-width: 1024px) {
  .media-grid {
    grid-template-columns: 1fr;
  }
  .blue-header {
    padding: 20px 30px;
  }
  .main-content {
    padding: 0 20px;
  }
  .hotel-name {
    font-size: 2rem;
  }
}
</style>
