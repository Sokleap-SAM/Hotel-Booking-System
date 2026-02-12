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
            <i class="ri-group-fill" v-for="n in room.maxOccupancy" :key="n"></i>
          </td>
          <td class="col-price">
            <div class="price-box">
              <span class="price-val">USD${{ room.price }}</span>
              <br />
              <span class="tax-note">Includes taxes and fees</span>
              <br />
              <span class="discount-badge" v-if="room.discountPercentage">{{ room.discountPercentage }}% off</span>
            </div>
          </td>
          <td class="col-choice">
            <ul class="benefit-list">
              <li class="green" v-if="room.breakfast">● Very good breakfast included</li>
              <li class="green">● Free cancellation</li>
              <li class="red" v-if="room.available < 5">● We have {{ room.available }} left</li>
            </ul>
          </td>
          <td class="col-select">
            <select
              class="room-dropdown"
              :value="getRoomQuantity(room.id)"
              @change="handleRoomSelection(room, $event)"
            >
              <option v-for="n in (room.available + 1)" :key="n - 1" :value="n - 1">
                {{ n - 1 }}
              </option>
            </select>
          </td>
          <td class="col-action">
            <div class="booking-summary" v-if="getRoomQuantity(room.id) > 0">
              <p class="summary-text">{{ getRoomQuantity(room.id) }} room(s) for</p>
              <div class="price-container">
                <span class="original-price-strike" v-if="room.discountPercentage">
                  USD${{ (room.price * getRoomQuantity(room.id) * nights).toFixed(2) }}
                </span>
                <span class="final-price">
                  USD${{ calculateRoomTotal(room).toFixed(2) }}
                </span>
              </div>
              <p class="tax-note">{{ nights }} night(s)</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Booking Summary Footer -->
    <div class="booking-footer" v-if="hasSelectedRooms">
      <div class="summary-container">
        <!-- Room Details -->
        <div class="room-details-section">
          <div v-for="(selection, roomId) in bookingStore.roomSelections" :key="roomId" class="room-item">
            <div class="room-item-left">
              <span class="room-item-name">{{ selection.roomName }}</span>
              <span class="room-item-info">{{ selection.quantity }} room(s) × {{ nights }} night(s)</span>
            </div>
            <div class="room-item-right">
              <span class="original-price" v-if="selection.discount > 0">
                USD${{ (selection.pricePerNight * selection.quantity * nights).toFixed(2) }}
              </span>
              <span class="discounted-price">
                USD${{ (selection.pricePerNight * (1 - selection.discount / 100) * selection.quantity * nights).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Price Summary -->
        <div class="price-summary-section">
          <div class="price-row">
            <span class="price-label">{{ totalSelectedRooms }} room(s) selected</span>
            <span class="price-label">{{ nights }} night(s)</span>
          </div>
          <div class="price-row subtotal-row">
            <span class="price-label">Subtotal (after discount):</span>
            <span class="price-value">USD${{ displaySubtotal }}</span>
          </div>
          <div class="price-row tax-row">
            <span class="price-label">Tax (10%):</span>
            <span class="price-value">USD${{ displayTax }}</span>
          </div>
          <div class="price-row total-row">
            <span class="total-label">Total:</span>
            <span class="total-value">USD${{ displayTotal }}</span>
          </div>
        </div>
      </div>
      
      <button class="btn-reserve" @click="handleReserve" :disabled="isCalculating">
        <span v-if="isCalculating">Calculating...</span>
        <span v-else>Reserve Now</span>
      </button>
    </div>

    <RoomDetailModal v-if="isModalOpen && activeRoom" :room="activeRoom" @close="isModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
//import { useBookingStore } from '@/stores/bookingStore'
import RoomDetailModal from './RoomDetailModal.vue'

interface Room {
  id: string
  name: string
  description?: string
  shortDescription?: string
  price: number
  maxOccupancy: number
  available: number
  discountPercentage?: number
  breakfast?: boolean
}

const props = defineProps<{
  rooms: Room[]
  hotelId?: string
  hotelName?: string
  hotelLocation?: string
  hotelImages?: string[]
  checkInDate?: string
  checkOutDate?: string
}>()

const emit = defineEmits<{
  (e: 'reserve'): void
}>()

const router = useRouter()
const bookingStore = useBookingStore()

// State for Modal
const isModalOpen = ref(false)
const activeRoom = ref<Room | null>(null)

// Local room selections (roomId -> quantity)
const roomSelections = ref<Record<string, number>>({})

// Computed
const nights = computed(() => {
  if (!props.checkInDate || !props.checkOutDate) return 1
  const start = new Date(props.checkInDate)
  const end = new Date(props.checkOutDate)
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 1
})

const hasSelectedRooms = computed(() => bookingStore.hasSelectedRooms)
const totalSelectedRooms = computed(() => bookingStore.totalSelectedRooms)
const displaySubtotal = computed(() => bookingStore.displaySubtotal)
const displayTax = computed(() => bookingStore.displayTaxAmount)
const displayTotal = computed(() => bookingStore.displayTotalPrice)
const isCalculating = computed(() => bookingStore.isCalculating)

// Methods
const openDetail = (room: Room) => {
  activeRoom.value = room
  isModalOpen.value = true
}

const getRoomQuantity = (roomId: string): number => {
  return roomSelections.value[roomId] || 0
}

const calculateRoomTotal = (room: Room): number => {
  const quantity = getRoomQuantity(room.id)
  const pricePerNight = Number(room.price)
  const discount = room.discountPercentage || 0
  const discountedPrice = pricePerNight * (1 - discount / 100)
  return discountedPrice * quantity * nights.value
}

const handleRoomSelection = async (room: Room, event: Event) => {
  const target = event.target as HTMLSelectElement
  const quantity = parseInt(target.value, 10)

  roomSelections.value[room.id] = quantity

  // Update store
  bookingStore.updateRoomSelection(
    room.id,
    room.name,
    quantity,
    Number(room.price),
    room.discountPercentage || 0
  )

  // Recalculate price
  if (props.checkInDate && props.checkOutDate) {
    await bookingStore.calculatePrice()
  }
}

const handleReserve = () => {
  // Navigate to transaction payment page
  router.push({ name: 'TransactionPayment' })
  emit('reserve')
}

// Initialize store with hotel info and dates
onMounted(() => {
  // Clear any previous selections
  bookingStore.clearSelections()
  roomSelections.value = {}
  
  if (props.hotelId && props.hotelName) {
    bookingStore.setHotelInfo({
      id: props.hotelId,
      name: props.hotelName,
      location: props.hotelLocation || '',
      images: props.hotelImages || []
    })
  }

  if (props.checkInDate && props.checkOutDate) {
    bookingStore.setDates(props.checkInDate, props.checkOutDate)
  }
})

// Watch for date changes from props
watch(
  () => [props.checkInDate, props.checkOutDate],
  ([newCheckIn, newCheckOut]) => {
    if (newCheckIn && newCheckOut) {
      bookingStore.setDates(newCheckIn as string, newCheckOut as string)
      if (bookingStore.hasSelectedRooms) {
        bookingStore.calculatePrice()
      }
    }
  }
)
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

/* Booking Footer */
.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 2px solid #003580;
  gap: 20px;
}

.summary-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Room Details Section */
.room-details-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.room-item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.room-item-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #333;
}

.room-item-info {
  font-size: 0.85rem;
  color: #666;
}

.room-item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.room-item-right .original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 0.85rem;
}

.room-item-right .discounted-price {
  font-weight: 700;
  font-size: 1rem;
  color: #003580;
}

/* Price Summary Section */
.price-summary-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.price-row.subtotal-row {
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.price-row.total-row {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 2px solid #003580;
}

.price-label {
  color: #666;
  font-weight: 500;
}

.price-value {
  font-weight: 600;
  color: #333;
}

.total-label {
  font-weight: bold;
  color: #003580;
  font-size: 1.1rem;
}

.total-value {
  font-weight: 800;
  color: #003580;
  font-size: 1.3rem;
}

.btn-reserve {
  background: linear-gradient(135deg, #003580 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 53, 128, 0.3);
  align-self: center;
}

.btn-reserve:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3 0%, #003580 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 53, 128, 0.4);
}

.btn-reserve:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
