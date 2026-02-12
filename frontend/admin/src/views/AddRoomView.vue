<template>
    <main class="page-container">
        <header class="form-header">
            <button class="back-btn" @click="$router.back()">
                <img :src="backIcon" alt="Go back" class="btn-icon" />
            </button>
            <h1>Add New Room</h1>
        </header>

        <form @submit.prevent="handleCreate" class="room-form">
            <h2 class="section-title">Room Information</h2>

            <div class="form-group full-width">
                <label>Room Name</label>
                <input v-model="form.name" type="text" placeholder="e.g. Deluxe Suite" required
                    :class="{ 'input-error': errors.name }" />
                <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Short Description</label>
                    <input v-model="form.shortDescription" type="text" placeholder="Short description..." required
                        :class="{ 'input-error': errors.shortDescription }" />
                    <span v-if="errors.shortDescription" class="error-text">{{ errors.shortDescription }}</span>
                </div>
                <div class="form-group">
                    <label>Full Description</label>
                    <input v-model="form.longDescription" type="text" placeholder="Full description..." required
                        :class="{ 'input-error': errors.longDescription }" />
                    <span v-if="errors.longDescription" class="error-text">{{ errors.longDescription }}</span>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Units Available</label>
                    <input v-model.number="form.available" type="number" min="1" max="50" required
                        :class="{ 'input-error': errors.available }" />
                    <span v-if="errors.available" class="error-text">{{ errors.available }}</span>
                </div>
                <div class="form-group">
                    <label>Price per Night ($)</label>
                    <input v-model.number="form.price" type="number" step="0.25" min="0" required
                        :class="{ 'input-error': errors.price }" />
                    <span v-if="errors.price" class="error-text">{{ errors.price }}</span>
                </div>
                <div class="form-group">
                    <label>Max Occupancy</label>
                    <input v-model.number="form.maxOccupancy" type="number" min="1" max="10" required
                        :class="{ 'input-error': errors.maxOccupancy }" />
                    <span v-if="errors.maxOccupancy" class="error-text">{{ errors.maxOccupancy }}</span>
                </div>
                <div class="form-group">
                    <label>Discount (%)</label>
                    <input v-model.number="form.discountPercentage" type="number" min="0" max="100"
                        :class="{ 'input-error': errors.discountPercentage }" />
                    <span v-if="errors.discountPercentage" class="error-text">{{ errors.discountPercentage }}</span>
                </div>
            </div>

            <div class="form-group full-width">
                <label>Bed Configuration</label>
                <div class="bed-types-container" :class="{ 'error-border': errors.roomBeds }">
                    <div v-for="(bed, index) in form.roomBeds" :key="index" class="bed-row">
                        <select v-model="bed.bedTypeId" class="bed-select">
                            <option value="" disabled>Select Bed Type</option>
                            <option v-for="bedType in roomStore.bedTypesList" :key="bedType.id" :value="bedType.id">
                                {{ bedType.name }}
                            </option>
                        </select>
                        <div class="quantity-input">
                            <label>Qty:</label>
                            <input v-model.number="bed.quantity" type="number" min="1" max="10" />
                        </div>
                        <button type="button" class="remove-bed-btn" @click="removeBed(index)"
                            :disabled="form.roomBeds.length === 1">×</button>
                    </div>
                    <button type="button" class="add-bed-btn" @click="addBed">
                        + Add Another Bed Type
                    </button>
                </div>
                <span v-if="errors.roomBeds" class="error-text">{{ errors.roomBeds }}</span>
            </div>

            <div class="form-group full-width">
                <label>Amenities</label>
                <div class="amenities-container" :class="{ 'error-border': errors.amenityIds }">
                    <div class="form-group full-width">
                        <div class="amenities-list">
                            <div v-for="amenity in roomStore.amenitiesList" :key="amenity.id" class="checkbox-item">
                                <input type="checkbox" :id="'am-' + amenity.id" :value="amenity.id"
                                    v-model="form.amenityIds" />
                                <label :for="'am-' + amenity.id">{{ amenity.name }}</label>
                            </div>
                        </div>
                    </div>
                </div>
                <span v-if="errors.amenityIds" class="error-text">{{ errors.amenityIds }}</span>
            </div>

            <div class="form-group full-width">
                <label>Room Images</label>
                <div class="image-upload-grid" :class="{ 'grid-error': errors.images }">
                    <div v-for="(img, index) in imagePreviews" :key="index" class="preview-card">
                        <img :src="img" />
                        <button type="button" class="remove-layer" @click="removeImage(index)">x</button>
                    </div>

                    <label class="upload-box">
                        <input type="file" multiple accept="image/*" @change="handleFiles" hidden />
                        <span class="upload-icon">+</span>
                        <span class="upload-text">Upload</span>
                    </label>
                </div>
                <span v-if="errors.images" class="error-text">{{ errors.images }}</span>
            </div>

            <div class="form-actions">
                <button type="submit" class="create-btn" :disabled="roomStore.isLoading">
                    {{ roomStore.isLoading ? 'Creating...' : 'Create Room' }}
                </button>
                <button type="button" class="cancel-btn" @click="$router.back()">Cancel</button>
            </div>
        </form>
    </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoomStore } from '@/stores/roomStore';
import backIcon from '@/assets/icons/back-icon.svg';
import { useRoute, useRouter } from 'vue-router';
import { validateRoomForm } from '@/utils/room-validator';

const route = useRoute();
const router = useRouter();
const roomStore = useRoomStore();
const imagePreviews = ref<string[]>([]);
const errors = ref<Record<string, string>>({});

const hotelId = route.params.id as string;

const form = ref({
    name: '',
    shortDescription: '',
    longDescription: '',
    available: 1,
    price: 0,
    maxOccupancy: 2,
    discountPercentage: 0,
    amenityIds: [] as number[],
    images: [] as (File | string)[],
    roomBeds: [{ bedTypeId: 0, quantity: 1 }] as { bedTypeId: number; quantity: number }[],
    hotelId: hotelId,
});

onMounted(async () => {
    await Promise.all([
        roomStore.fetchAmenitiesByCategory('room'),
        roomStore.fetchBedTypes()
    ]);
});

const addBed = () => {
    form.value.roomBeds.push({ bedTypeId: 0, quantity: 1 });
};

const removeBed = (index: number) => {
    if (form.value.roomBeds.length > 1) {
        form.value.roomBeds.splice(index, 1);
    }
};

const handleFiles = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files) return;

    const files = Array.from(target.files);

    files.forEach(file => {
        form.value.images.push(file);
        const reader = new FileReader();

        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
                imagePreviews.value.push(result);
            }
        };

        reader.readAsDataURL(file);
    });
    target.value = '';
};

const removeImage = (index: number) => {
    form.value.images.splice(index, 1);
    imagePreviews.value.splice(index, 1);
};

const handleCreate = async () => {
    errors.value = {};

    const validation = validateRoomForm(form.value);

    if (!validation.isValid) {
        errors.value = validation.errors;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const result = await roomStore.createRoom(form.value);

    if (result.success) {
        router.push('/manage_hotel&room');
    } else {
        errors.value = { ...result.errors };
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

watch(form, () => {
    if (Object.keys(errors.value).length > 0) {
        const validation = validateRoomForm(form.value);
        errors.value = validation.errors;
    }
}, { deep: true });
</script>

<style scoped>
.page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
    font-family: 'Lato', sans-serif;
    box-sizing: border-box;
}

.form-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
}

.back-btn {
    background-color: white;
    border: none;
    cursor: pointer;
}

.room-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-row {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.form-row .form-group {
    flex: 1;
    min-width: 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.full-width {
    width: 100%;
}

label {
    font-weight: 600;
    font-size: 16px;
    color: #333;
}

input,
select {
    padding: 12px;
    border: 1px solid #D9D9D9;
    font-size: 16px;
    border-radius: 12px;
    outline: none;
}

input:focus,
select:focus {
    border-color: #0D4798;
}

select {
    cursor: pointer;
    appearance: auto;
}

.amenities-container {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
}

.amenities-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 32px;
    margin-bottom: 20px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 150px;
}

.checkbox-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.checkbox-item label {
    font-weight: 500;
    font-size: 15px;
    cursor: pointer;
}

.help-text {
    color: #666;
    font-size: 14px;
    margin-top: 5px;
    font-style: italic;
}

.image-upload-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 10px;
}

.upload-box {
    width: 120px;
    height: 120px;
    border: 2px dashed #D9D9D9;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #919090;
}

.preview-card {
    width: 120px;
    height: 120px;
    position: relative;
    border-radius: 15px;
    overflow: hidden;
}

.preview-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.remove-layer {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(255, 0, 0, 0.8);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-layer:hover {
    background: rgba(200, 0, 0, 1);
}

.section-title {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #0D4798;
    font-weight: 700;
}

.form-actions {
    display: flex;
    flex-direction: row;
    gap: 15px;
    margin-top: 20px;
}

.create-btn {
    background: #0D4798;
    color: white;
    padding: 15px 20px;
    border-radius: 15px;
    border: none;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
}

.create-btn:hover {
    background-color: #07316d;
}

.create-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.cancel-btn {
    background: #FF0000;
    color: white;
    padding: 15px 25px;
    border-radius: 15px;
    border: none;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
}

.cancel-btn:hover {
    background-color: #cc0000;
}

.loading-state {
    text-align: center;
    padding: 40px;
    font-size: 18px;
    color: #666;
}

.error-text {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
}

.input-error {
    border-color: #dc2626;
    background-color: #fff5f5;
}

.error-border {
    border: 2px solid #dc2626 !important;
    border-radius: 12px;
    background-color: #fff5f5;
    padding: 10px;
}

.grid-error {
    border: 2px dashed #dc2626 !important;
    background-color: #fff5f5;
    padding: 15px;
    border-radius: 15px;
}

.bed-types-container {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.bed-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.bed-select {
    flex: 1;
    min-width: 150px;
}

.quantity-input {
    display: flex;
    align-items: center;
    gap: 8px;
}

.quantity-input input {
    width: 70px;
    text-align: center;
}

.remove-bed-btn {
    background: #ff4444;
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-bed-btn:hover:not(:disabled) {
    background: #cc0000;
}

.remove-bed-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.add-bed-btn {
    background: #0D4798;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    align-self: flex-start;
}

.add-bed-btn:hover {
    background: #0a3a7d;
}

@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
    }

    .page-container {
        padding: 20px;
    }
}
</style>