<template>
  <div class="image-gallery card">
    <div class="card-header">
      <h2>Generated Images</h2>
      <span v-if="images.length > 0" class="badge badge-primary">
        {{ images.length }} image{{ images.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <div v-if="images.length === 0" class="empty-state">
      <p>No images generated yet</p>
      <p class="text-secondary">Generate your first image using the panel on the left</p>
    </div>

    <div v-else class="gallery-grid">
      <div
        v-for="image in images"
        :key="image.filename"
        class="gallery-item"
        @click="openPreview(image)"
      >
        <div class="image-wrapper">
          <img :src="image.url" :alt="image.metadata?.prompt || 'Generated image'" />
        </div>
        <div class="image-info">
          <div class="image-model">
            <span class="badge">{{ image.metadata?.model }}</span>
            <span class="badge">{{ image.metadata?.size }}</span>
          </div>
          <div v-if="image.metadata?.presetName" class="image-preset">
            {{ image.metadata.presetName }}
          </div>
          <div class="image-prompt">
            {{ truncateText(image.metadata?.prompt, 60) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="previewImage" class="modal-overlay" @click.self="closePreview">
      <div class="preview-modal">
        <div class="preview-header">
          <h3>Image Preview</h3>
          <button @click="closePreview" class="btn-close">✕</button>
        </div>

        <div class="preview-body">
          <img :src="previewImage.url" :alt="previewImage.metadata?.prompt || 'Preview'" />

          <div class="preview-details">
            <div class="detail-group">
              <strong>Model:</strong> {{ previewImage.metadata?.model }}
            </div>
            <div class="detail-group">
              <strong>Size:</strong> {{ previewImage.metadata?.size }}
            </div>
            <div v-if="previewImage.metadata?.quality" class="detail-group">
              <strong>Quality:</strong> {{ previewImage.metadata?.quality }}
            </div>
            <div v-if="previewImage.metadata?.style" class="detail-group">
              <strong>Style:</strong> {{ previewImage.metadata?.style }}
            </div>
            <div v-if="previewImage.metadata?.presetName" class="detail-group">
              <strong>Preset:</strong> {{ previewImage.metadata?.presetName }}
            </div>
            <div class="detail-group">
              <strong>Generated:</strong>
              {{ formatDate(previewImage.metadata?.generatedAt) }}
            </div>
            <div class="detail-group">
              <strong>Prompt:</strong>
              <p>{{ previewImage.metadata?.prompt }}</p>
            </div>
            <div v-if="previewImage.metadata?.revisedPrompt" class="detail-group">
              <strong>AI Revised Prompt:</strong>
              <p class="text-secondary">{{ previewImage.metadata?.revisedPrompt }}</p>
            </div>
          </div>
        </div>

        <div class="preview-footer">
          <a
            :href="previewImage.url"
            :download="previewImage.filename"
            class="btn-download"
          >
            Download Image
          </a>
          <button @click="closePreview" class="secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  images: {
    type: Array,
    default: () => []
  }
});

const previewImage = ref(null);

function truncateText(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

function openPreview(image) {
  previewImage.value = image;
}

function closePreview() {
  previewImage.value = null;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state p:first-child {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.gallery-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.gallery-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 0.875rem;
}

.image-model {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.image-preset {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.image-prompt {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Preview Modal */
.preview-modal {
  background: var(--bg-primary);
  border-radius: var(--radius);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.preview-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  font-size: 1.5rem;
  line-height: 1;
}

.btn-close:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.preview-body {
  padding: 1.25rem;
}

.preview-body img {
  width: 100%;
  height: auto;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.detail-group {
  font-size: 0.875rem;
}

.detail-group strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.detail-group p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.preview-footer {
  padding: 1.25rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-download {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--success-color);
  color: white;
  text-decoration: none;
  display: inline-block;
}

.btn-download:hover {
  background: #059669;
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
