<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
    rel="stylesheet"
  />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css" rel="stylesheet" />

  <div class="container">
    <h2>Sign up</h2>
    <div class="upload-wrapper">
      <div
        class="drop-zone"
        :class="{ 'is-dragover': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <img v-if="imageUrl" :src="imageUrl" class="preview-image" />
        <div v-else class="placeholder">
          <i class="ri-image-add-line"></i>
          <span>Drop Image</span>
        </div>

        <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" hidden />
      </div>
    </div>
    <div>
      Upload Profile Picture
    </div>
    <div class="name-row">
      <div class="name-column">
        <label>First Name</label>
        <input type="text" placeholder="Enter your firstname" />
      </div>
      <div class="name-column">
        <label>Last Name</label>
        <input type="text" placeholder="Enter your lastname" />
      </div>
    </div>

    <div class="input-group">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="Enter your email" />
    </div>

    <div class="input-group">
      <label for="password">Password</label>
      <div class="password-wrapper">
        <input
          id="password"
          v-model="password"
          :type="passwordFieldType"
          placeholder="Enter your password"
        />
        <i
          :class="passwordFieldType === 'password' ? 'ri-eye-off-line' : 'ri-eye-line'"
          @click="togglePassword('main')"
          class="toggle-icon"
        ></i>
      </div>
    </div>

    <div class="input-group">
      <label for="confirmPassword">Confirm Password</label>
      <div class="password-wrapper">
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          :type="confirmPasswordFieldType"
          placeholder="Enter your password"
        />
        <i
          :class="confirmPasswordFieldType === 'password' ? 'ri-eye-off-line' : 'ri-eye-line'"
          @click="togglePassword('confirm')"
          class="toggle-icon"
        ></i>
      </div>
    </div>

    <button class="btn-signup">Sign up</button>

    <div class="back-link" @click="goToLogin">
      <i class="ri-arrow-left-line"></i>
      <span>Back to login</span>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SignUpScreen',
  setup() {
    const password = ref('')
    const confirmPassword = ref('')
    const passwordFieldType = ref('password')
    const confirmPasswordFieldType = ref('password')
    const imageUrl = ref<string | null>(null)
    const isDragging = ref(false)
    const fileInput = ref<HTMLInputElement | null>(null)

    // Change the type to 'File | undefined'
    const processFile = (file: File | undefined) => {
      if (file && file.type.startsWith('image/')) {
        imageUrl.value = URL.createObjectURL(file)
      }
    }
    const handleDrop = (e: DragEvent) => {
      isDragging.value = false
      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    }

    const handleFileSelect = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        processFile(target.files[0])
      }
    }

    const togglePassword = (type: string) => {
      if (type === 'main') {
        passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
      } else {
        confirmPasswordFieldType.value =
          confirmPasswordFieldType.value === 'password' ? 'text' : 'password'
      }
    }

    const router = useRouter()
    const goToLogin = () => {
      router.push('/login')
    }

    return {
      imageUrl,
      isDragging,
      fileInput,
      handleDrop,
      handleFileSelect,
      goToLogin,
      password,
      confirmPassword,
      passwordFieldType,
      confirmPasswordFieldType,
      togglePassword,
    }
  },
}
</script>

<style scoped>
.container {
  width: 450px;
  font-family: 'Lato', sans-serif;
  padding: 40px 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.29);
  /* backdrop-filter: blur(10px); */
  text-align: center;
  box-sizing: border-box;
}

h2 {
  font-size: 48px;
  margin-bottom: 30px;
  margin-top: 0;
}

.name-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 0 20px;
  margin-bottom: 15px;
}

.name-column {
  display: flex;
  flex-direction: column;
  text-align: left;
  flex: 1;
}
.name-column input {
  font-size: 15px;
}
.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0 20px;
  margin-bottom: 15px;
}

label {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  margin-left: 5px;
}

input {
  width: 100%;
  height: 55px;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.4);
  border: none;
  color: white;
  padding: 0 20px;
  font-size: 16px;
  box-sizing: border-box;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.password-wrapper {
  position: relative;
  width: 100%;
}

.toggle-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #333;
  font-size: 24px;
}

.btn-signup {
  width: 200px;
  height: 55px;
  border-radius: 30px;
  background-color: #2b3ff2;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-top: 20px;
}

.btn-signup:hover {
  background-color: #1c259f;
}

.back-link {
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-size: 16px;
}

.back-link:hover {
  text-decoration: underline;
}

.upload-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.drop-zone {
  /* Dimensions and Shape */
  width: 150px;
  height: 150px;
  border-radius: 50%;

  /* Black Border and Subtle Background */
  border: 2px dashed #000000;
  background-color: rgba(0, 0, 0, 0.05);

  /* Alignment */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* UI/UX */
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

/* Hover/Drag state */
.drop-zone:hover,
.drop-zone.is-dragover {
  background-color: rgba(0, 0, 0, 0.1);
  border-color: #000000;
  border-style: solid; /* Changes dash to solid line on hover */
  transform: scale(1.02);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the image fills the circle without stretching */
  display: block;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #000000; /* Black text */
  font-size: 14px;
  text-align: center;
}

.placeholder i {
  font-size: 32px;
  color: #000000; /* Black icon */
  margin-bottom: 8px;
}

/* Optional: Add a subtle overlay when hovering over an existing image */
.drop-zone:has(.preview-image):hover::after {
  content: 'Change Image';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
</style>
