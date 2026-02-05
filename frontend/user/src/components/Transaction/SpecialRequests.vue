<template>
  <div class="special-requests-container">
    <div class="requests-card">
      <h3 class="card-title">Special requests</h3>
      <p class="description">
        Special requests can't be guaranteed, but the property will do its best to meet your needs.
        You can always make a special request after your booking is complete.
      </p>
      <p class="instruction">Please write your requests in English. (optional)</p>

      <textarea v-model="requestsData.text" class="request-textarea" rows="4"></textarea>
    </div>

    <div class="button-wrapper">
      <button @click="goTohandleNext" class="next-btn">
        Next: Final details <i class="ri-arrow-right-s-line"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'SpecialRequests',
  setup() {
    // Reactive data ready for NestJS POST request
    const requestsData = reactive({
      text: '',
    })

    const router = useRouter()
    const goTohandleNext = () => {
      console.log('Sending to Backend:', requestsData.text)
      router.push('/LastPayment')
      // Future: axios.post('/bookings/requests', requestsData)
    }

    return {
      requestsData,
      goTohandleNext,
    }
  },
})
</script>

<style scoped>
.special-requests-container {
  margin-top: 25px;
  width: 100%;
}

.requests-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 25px;
  background-color: #fff;
}

.card-title {
  margin: 0 0 15px;
  font-size: 1.4rem;
}

.description,
.instruction {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.5;
  margin-bottom: 15px;
}

.request-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #888;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;
}

.button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.next-btn {
  background-color: #006ce4;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.next-btn:hover {
  background-color: #0056b3;
}
</style>
