<template>
  <div class="payment-upload-container">
    <h3>Confirm payment</h3>

    <div class="info-banner">
      <span class="info-icon">ⓘ</span>
      <p>Please upload your payment proof used for the payment.</p>
    </div>

    <div
      class="drop-zone"
      :class="{ 'is-dragging': isDragging, 'has-error': errorMessage }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        type="file"
        ref="fileInput"
        class="hidden-input"
        accept="image/*,application/pdf"
        @change="handleFileSelect"
      />

      <div class="upload-content" v-if="!selectedFile">
        <h2>Drag your file or browse</h2>
        <p>You can upload one file, up to a maximum size of 1 MB</p>
      </div>

      <div class="file-preview" v-else>
        <span class="file-icon">📄</span>
        <div class="file-details">
          <p class="file-name">{{ selectedFile.name }}</p>
          <p class="file-size">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
        </div>
        <button class="remove-btn" @click.stop="clearFile">✕</button>
      </div>
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// --- State Management ---
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const errorMessage = ref('')

const MAX_SIZE_MB = 1
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// --- Methods ---
const triggerFileInput = () => {
  fileInput.value?.click()
}

const validateAndSetFile = (file: File) => {
  errorMessage.value = ''

  if (file.size > MAX_SIZE_BYTES) {
    errorMessage.value = `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`
    return
  }

  selectedFile.value = file
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    validateAndSetFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file) {
      validateAndSetFile(file)
    }
  }
}

const clearFile = () => {
  selectedFile.value = null
  errorMessage.value = ''
  // Reset the input value so the same file can be re-selected if needed
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// --- Exposed for Parent Component ---
defineExpose({
  selectedFile,
  clearFile,
  errorMessage,
})
</script>

<style scoped>
.payment-upload-container {
  font-family: Arial, sans-serif;
  width: 100%;
  margin: 20px 0;
}

h3 {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.info-banner {
  display: flex;
  align-items: center;
  background-color: #e5e7eb;
  padding: 12px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.info-icon {
  margin-right: 10px;
  font-weight: bold;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.drop-zone.is-dragging {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.drop-zone.has-error {
  border-color: #ef4444;
}

.hidden-input {
  display: none;
}

.upload-content h2 {
  font-size: 1.25rem;
  margin-bottom: 10px;
  color: #111;
}
.upload-content p {
  font-size: 0.9rem;
  color: #666;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.file-name {
  font-weight: bold;
  margin: 0;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-size {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
}

.remove-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 10px;
}
</style>
