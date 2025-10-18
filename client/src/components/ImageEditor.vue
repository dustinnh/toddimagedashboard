<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="editor-modal">
      <div class="modal-header">
        <h2>Edit Image (Inpainting)</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Step 1: Upload Image -->
        <div class="editor-section">
          <h3>1. Upload Image</h3>
          <input
            type="file"
            accept="image/png,image/jpeg"
            @change="handleImageUpload"
            ref="fileInput"
          />
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Upload preview" />
          </div>
        </div>

        <!-- Step 2: Draw Mask -->
        <div v-if="imagePreview" class="editor-section">
          <h3>2. Draw Mask (Paint areas to edit)</h3>
          <div class="canvas-controls">
            <button @click="clearMask" class="small secondary">Clear Mask</button>
            <label>
              Brush Size:
              <input type="range" v-model="brushSize" min="5" max="50" />
              {{ brushSize }}px
            </label>
          </div>
          <div class="canvas-container">
            <canvas
              ref="imageCanvas"
              class="image-canvas"
            ></canvas>
            <canvas
              ref="maskCanvas"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              class="mask-canvas"
            ></canvas>
          </div>
          <div class="mask-instructions">
            <p class="form-hint">
              <strong>Paint in RED over the areas you want to edit/change.</strong>
              The unpainted areas will stay the same.
            </p>
          </div>
        </div>

        <!-- Step 3: Settings -->
        <div v-if="imagePreview" class="editor-section">
          <h3>3. Editing Settings</h3>

          <div class="form-group">
            <label>Model</label>
            <select v-model="settings.model">
              <option value="gpt-image-1">GPT Image 1 (Soft Mask)</option>
              <option value="dall-e-2">DALL-E 2 (Precise)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Prompt (Describe what you want)</label>
            <textarea
              v-model="settings.prompt"
              rows="3"
              placeholder="Describe the entire image including what you want in the masked area..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Size</label>
            <select v-model="settings.size">
              <option value="1024x1024">1024×1024 (Square)</option>
              <option value="1024x1536">1024×1536 (Portrait)</option>
              <option value="1536x1024">1536×1024 (Landscape)</option>
            </select>
          </div>

          <div v-if="settings.model === 'gpt-image-1'" class="form-group">
            <label>Quality</label>
            <select v-model="settings.quality">
              <option value="low">Low ($0.02)</option>
              <option value="medium">Medium ($0.07)</option>
              <option value="high">High ($0.19)</option>
            </select>
          </div>

          <div v-if="settings.model === 'gpt-image-1'" class="form-group">
            <label>Input Fidelity</label>
            <input
              type="range"
              v-model.number="settings.input_fidelity"
              min="0"
              max="1"
              step="0.1"
            />
            <div class="fidelity-value">{{ settings.input_fidelity.toFixed(1) }}</div>

            <div class="fidelity-info">
              <p class="info-title">Controls preservation of unmasked areas:</p>
              <ul class="info-list">
                <li><strong>0.0-0.4 (Low):</strong> More creative, may alter unmasked areas</li>
                <li><strong>0.5-0.7 (Medium):</strong> Balanced preservation with natural blending</li>
                <li><strong>0.8-1.0 (High):</strong> Maximum preservation - keeps faces, text, and fine details unchanged</li>
              </ul>
              <p class="info-note">💡 Use higher values when editing photos with faces or important details that must stay exactly the same.</p>
            </div>
          </div>

          <div class="cost-estimate">
            Estimated Cost: ${{ estimatedCost.toFixed(3) }}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="secondary">Cancel</button>
        <button
          @click="editImage"
          :disabled="!canEdit || loading"
        >
          {{ loading ? 'Editing...' : 'Edit Image' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import axios from 'axios';

const emit = defineEmits(['close', 'edited']);

const imageFile = ref(null);
const imagePreview = ref(null);
const imageCanvas = ref(null);
const maskCanvas = ref(null);
const maskContext = ref(null);
const isDrawing = ref(false);
const brushSize = ref(20);
const fileInput = ref(null);
const loading = ref(false);
const error = ref(null);

const settings = ref({
  model: 'gpt-image-1',
  prompt: '',
  size: '1024x1024',
  quality: 'medium',
  input_fidelity: 0.7
});

const canEdit = computed(() => {
  return imageFile.value && settings.value.prompt.trim().length > 0;
});

const estimatedCost = computed(() => {
  const pricing = {
    'gpt-image-1': { low: 0.02, medium: 0.07, high: 0.19 },
    'dall-e-2': { '1024x1024': 0.02 }
  };

  if (settings.value.model === 'gpt-image-1') {
    return pricing['gpt-image-1'][settings.value.quality] || 0.07;
  } else {
    return 0.02;
  }
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  imageFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
    nextTick(() => {
      initializeCanvas();
    });
  };
  reader.readAsDataURL(file);
}

function initializeCanvas() {
  const imgCanvas = imageCanvas.value;
  const maskCnv = maskCanvas.value;
  if (!imgCanvas || !maskCnv) return;

  const img = new Image();
  img.onload = () => {
    // Set both canvas sizes to match image
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    maskCnv.width = img.width;
    maskCnv.height = img.height;

    // Set canvas display size
    const maxWidth = 600;
    const scale = Math.min(1, maxWidth / img.width);
    const displayWidth = img.width * scale;
    const displayHeight = img.height * scale;

    imgCanvas.style.width = `${displayWidth}px`;
    imgCanvas.style.height = `${displayHeight}px`;
    maskCnv.style.width = `${displayWidth}px`;
    maskCnv.style.height = `${displayHeight}px`;

    // Draw image on the background canvas
    const imgContext = imgCanvas.getContext('2d');
    imgContext.drawImage(img, 0, 0);

    // Set up mask canvas for drawing with semi-transparent red
    maskContext.value = maskCnv.getContext('2d');
    maskContext.value.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red for visibility
    maskContext.value.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    maskContext.value.lineWidth = brushSize.value;
    maskContext.value.lineCap = 'round';
    maskContext.value.lineJoin = 'round';
  };
  img.src = imagePreview.value;
}

function startDrawing(event) {
  isDrawing.value = true;
  const rect = maskCanvas.value.getBoundingClientRect();
  const scaleX = maskCanvas.value.width / rect.width;
  const scaleY = maskCanvas.value.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  maskContext.value.beginPath();
  maskContext.value.moveTo(x, y);
}

function draw(event) {
  if (!isDrawing.value) return;

  const rect = maskCanvas.value.getBoundingClientRect();
  const scaleX = maskCanvas.value.width / rect.width;
  const scaleY = maskCanvas.value.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  maskContext.value.lineWidth = brushSize.value;
  maskContext.value.lineTo(x, y);
  maskContext.value.stroke();
}

function stopDrawing() {
  isDrawing.value = false;
}

function clearMask() {
  if (maskContext.value) {
    maskContext.value.clearRect(0, 0, maskCanvas.value.width, maskCanvas.value.height);
  }
}

async function editImage() {
  if (!canEdit.value) return;

  loading.value = true;
  error.value = null;

  try {
    const formData = new FormData();
    formData.append('image', imageFile.value);
    formData.append('prompt', settings.value.prompt);
    formData.append('model', settings.value.model);
    formData.append('size', settings.value.size);
    formData.append('quality', settings.value.quality);

    // Add input_fidelity for GPT Image 1
    if (settings.value.model === 'gpt-image-1') {
      formData.append('input_fidelity', settings.value.input_fidelity);
    }

    // Add mask if drawn - convert red overlay to proper alpha mask
    const canvas = maskCanvas.value;
    const imageData = maskContext.value.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawing = imageData.data.some(pixel => pixel !== 0);

    if (hasDrawing) {
      // Create a proper alpha mask: transparent where user painted, opaque elsewhere
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');

      // Fill with opaque white (areas to keep)
      maskCtx.fillStyle = 'rgba(255, 255, 255, 1)';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      // Get the red overlay pixels
      const overlayData = maskCtx.createImageData(canvas.width, canvas.height);

      // Convert red pixels to transparent (areas to edit)
      for (let i = 0; i < imageData.data.length; i += 4) {
        const red = imageData.data[i];
        const alpha = imageData.data[i + 3];

        if (red > 0 && alpha > 0) {
          // Red pixel = area to edit = transparent in mask
          overlayData.data[i] = 0;
          overlayData.data[i + 1] = 0;
          overlayData.data[i + 2] = 0;
          overlayData.data[i + 3] = 0; // Fully transparent
        } else {
          // No red = area to keep = opaque in mask
          overlayData.data[i] = 255;
          overlayData.data[i + 1] = 255;
          overlayData.data[i + 2] = 255;
          overlayData.data[i + 3] = 255; // Fully opaque
        }
      }

      maskCtx.putImageData(overlayData, 0, 0);

      const maskBlob = await new Promise(resolve => maskCanvas.toBlob(resolve, 'image/png'));
      formData.append('mask', maskBlob, 'mask.png');
    }

    const response = await axios.post('/api/edit/inpaint', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      emit('edited', response.data);
      emit('close');
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Edit failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.editor-modal {
  background: var(--bg-primary);
  border-radius: var(--radius);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.btn-close {
  background: none;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  font-size: 1.5rem;
  line-height: 1;
}

.editor-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.editor-section:last-child {
  border-bottom: none;
}

.editor-section h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.image-preview {
  margin-top: 1rem;
  max-width: 400px;
}

.image-preview img {
  width: 100%;
  border-radius: var(--radius);
}

.canvas-container {
  position: relative;
  display: inline-block;
  border: 2px solid var(--primary-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.image-canvas {
  display: block;
  max-width: 100%;
}

.mask-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  max-width: 100%;
}

.canvas-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.mask-instructions {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 0, 0, 0.05);
  border-left: 3px solid #ff0000;
  border-radius: 4px;
}

.mask-instructions .form-hint {
  margin: 0;
  color: var(--text-primary);
}

.canvas-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.canvas-controls input[type="range"] {
  width: 120px;
}

.cost-estimate {
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  font-weight: 600;
  text-align: center;
}

.fidelity-value {
  text-align: center;
  font-weight: 600;
  color: var(--primary-color);
  margin-top: 0.5rem;
  font-size: 1rem;
}

.fidelity-info {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border-left: 3px solid var(--primary-color);
  font-size: 0.875rem;
}

.info-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem 0;
}

.info-list li {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.info-list li strong {
  color: var(--primary-color);
}

.info-note {
  margin: 0;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.8125rem;
}
</style>
