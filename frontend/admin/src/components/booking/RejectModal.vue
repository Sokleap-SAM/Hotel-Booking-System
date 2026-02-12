<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h2>Reject Booking</h2>
      <p>Please provide a reason for rejection:</p>
      <textarea
        v-model="reason"
        placeholder="Enter rejection reason..."
        rows="4"
      ></textarea>
      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">Cancel</button>
        <button 
          class="confirm-reject-btn" 
          @click="$emit('confirm', reason)" 
          :disabled="!reason.trim()"
        >
          Confirm Rejection
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  (e: 'close'): void
  (e: 'confirm', reason: string): void
}>()

const reason = ref('')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  margin: 0 0 10px;
  color: #333;
}

.modal p {
  color: #666;
  margin-bottom: 15px;
}

.modal textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  box-sizing: border-box;
}

.modal textarea:focus {
  outline: none;
  border-color: #0D4798;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.confirm-reject-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}

.confirm-reject-btn:hover:not(:disabled) {
  background: #c82333;
}

.confirm-reject-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
