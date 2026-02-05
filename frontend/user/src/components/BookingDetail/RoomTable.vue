<template>
  <div class="table-wrapper">
    <table class="room-table">
      <thead>
        <tr>
          <th class="col-type">Room type</th>
          <th class="col-guests">Number of guests</th>
          <th class="col-price">Today's Price</th>
          <th class="col-choice">Your choice</th>
          <th class="col-select">Select Rooms</th>
          <th class="col-action"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(room, index) in rooms" :key="index">
          <td class="col-type">
            <div class="room-info">
              <a href="javascript:void(0)" class="view-link" @click="openDetail(room)">
                View Room
              </a>
              <h4 class="room-name">● {{ room.name }} <i class="ri-hotel-bed-line"></i></h4>
              <p class="room-desc">{{ room.description }}</p>
            </div>
          </td>
          <td class="col-guests">
            <i class="ri-group-fill" v-for="n in room.maxGuests" :key="n"></i>
          </td>
          <td class="col-price">
            <div class="price-box">
              <span class="price-val">USD${{ room.price }}</span>
              <br />
              <span class="tax-note">Includes taxes and fees</span>
              <br />
              <span class="discount-badge" v-if="room.discount">{{ room.discount }}% off</span>
            </div>
          </td>
          <td class="col-choice">
            <ul class="benefit-list">
              <li class="green" v-if="room.breakfast">● Very good breakfast included</li>
              <li class="green">● Free cancellation</li>
              <li class="red" v-if="room.stock < 5">● We have {{ room.stock }} left</li>
            </ul>
          </td>
          <td class="col-select">
            <select class="room-dropdown">
              <option>0</option>
              <option selected>1</option>
            </select>
          </td>
          <td class="col-action">
            <div class="booking-summary">
              <p class="summary-text">1 room for</p>
              <div class="price-container">
                <span class="original-price-strike">USD${{ room.price }}</span>
                <span class="final-price">USD${{ room.finalPrice }}</span>
              </div>
              <p class="tax-note">Include tax and fee</p>
              <button class="btn-table-book" @click="goToPayment">Booking now</button>
              <p class="small-note">● It only takes 2 minutes</p>
              <p class="small-note">● You won't be charged yet</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <RoomDetailModal v-if="isModalOpen" :room="activeRoom" @close="isModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RoomDetailModal from './RoomDetailModal.vue'
import { useRouter } from 'vue-router'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineProps<{ rooms: any[] }>()

// State for Modal
const isModalOpen = ref(false)
const activeRoom = ref(null)

const router = useRouter()
const goToPayment = () => {
  router.push({ name: 'TransactionPayment' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const openDetail = (room: any) => {
  activeRoom.value = room
  isModalOpen.value = true
}
</script>

<style scoped>
.table-wrapper {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
  font-family: 'Lato', sans-serif;
}
.tax-note {
  font-size: 13px;
  color: #555;
}
.small-note {
  font-size: 12px;
  color: #777;
}
.room-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  background: white;
}
.room-table th {
  background: #4f7cac;
  color: white;
  padding: 12px;
  border: 1px solid #ddd;
}
.room-table td {
  padding: 15px;
  border: 1px solid #ddd;
  vertical-align: top;
}
.view-link {
  color: #006ce4;
  font-size: 0.75rem;
  text-decoration: none;
  cursor: pointer;
  font-weight: bold;
}
.view-link:hover {
  text-decoration: underline;
}
.room-name {
  font-weight: 800;
  margin: 10px 0;
}
.price-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #000;
}
.discount-badge {
  background: #22bb33;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 5px;
  display: inline-block;
}
.btn-table-book {
  width: 100%;
  background: #003580;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.benefit-list {
  list-style: none;
  padding: 0;
  font-size: 0.85rem;
}
.green {
  color: #228b22;
  font-weight: 600;
}
.red {
  color: #cc0000;
  font-weight: 600;
}
/* Container to keep prices on the same line or nicely spaced */
.price-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

/* The red strikethrough effect */
.original-price-strike {
  color: #cc0000; /* Red color for the text and line */
  text-decoration: line-through;
  text-decoration-thickness: 2px; /* Makes the line more visible like the image */
  font-weight: bold;
  font-size: 1rem;
}

/* The final price style */
.final-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: #000;
}

/* Ensure the summary text and tax note are consistent */
.summary-text {
  margin-bottom: 5px;
  font-weight: bold;
}
</style>
