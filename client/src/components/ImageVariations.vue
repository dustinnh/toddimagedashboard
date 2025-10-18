<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Create Image Variations</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <p class="info-text">
          Create variations of an existing image. Works with DALL-E 2 only.
        </p>

        <!-- Upload Image -->
        <div class="form-group">
          <label>Upload Image</label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            @change="handleImageUpload"
            ref="fileInput"
          />
          <span class="form-hint">PNG or JPEG, must be square, max 4MB</span>
        </div>

        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Upload preview" />
        </div>

        <!-- Settings -->
        <div v-if="imageFile" class="form-group">
          <label>Size</label>
          <select v-model="settings.size">
            <option value="256x256">256×256 ($0.016)</option>
            <option value="512x512">512×512 ($0.018)</option>
            <option value="1024x1024">1024×1024 ($0.020)</option>
          </select>
        </div>

        <div v-if="imageFile" class="form-group">
          <label>Number of Variations</label>
          <input type="number" v-model.number="settings.n" min="1" max="10" />
          <span class="form-hint">Generate multiple variations to choose from</span>
        </div>

        <div v-if="imageFile" class="cost-estimate">
          Estimated Cost: ${{ estimatedCost.toFixed(3) }}
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="secondary">Cancel</button>
        <button
          @click="createVariations"
          :disabled="!imageFile || loading"
        >
          {{ loading ? 'Creating...' : 'Create Variations' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const emit = defineEmits(['close', 'created']);

const imageFile = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);
const loading = ref(false);
const error = ref(null);

const settings = ref({
  size: '1024x1024',
  n: 3
});

const estimatedCost = computed(() => {
  const pricing = {
    '256x256': 0.016,
    '512x512': 0.018,
    '1024x1024': 0.020
  };
  return (pricing[settings.value.size] || 0.020) * settings.value.n;
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Check file size (4MB limit for DALL-E 2)
  if (file.size > 4 * 1024 * 1024) {
    error.value = 'File size must be less than 4MB';
    return;
  }

  imageFile.value = file;
  error.value = null;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function createVariations() {
  if (!imageFile.value) return;

  loading.value = true;
  error.value = null;

  try {
    const formData = new FormData();
    formData.append('image', imageFile.value);
    formData.append('size', settings.value.size);
    formData.append('n', settings.value.n);

    const response = await axios.post('/api/edit/variations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      emit('created', response.data);
      emit('close');
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create variations';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.btn-close {
  background: none;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  font-size: 1.5rem;
  line-height: 1;
}

.info-text {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.image-preview {
  margin: 1rem 0;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  border-radius: var(--radius);
  border: 2px solid var(--border-color);
}

.cost-estimate {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--radius);
  font-weight: 600;
  text-align: center;
  margin-top: 1rem;
}
</style>
