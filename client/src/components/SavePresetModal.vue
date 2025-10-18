<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Save Preset</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="preset-name">Preset Name*</label>
          <input
            id="preset-name"
            type="text"
            v-model="presetName"
            placeholder="e.g., Morning Routine Item"
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label for="preset-category">Category*</label>
          <div class="category-input-group">
            <select
              id="preset-category"
              v-model="presetCategory"
              :disabled="useCustomCategory"
            >
              <option value="Visual Schedule">Visual Schedule</option>
              <option value="Emotion Cards">Emotion Cards</option>
              <option value="Social Stories">Social Stories</option>
              <option value="Educational">Educational</option>
              <option value="Choice Boards">Choice Boards</option>
              <option value="General">General</option>
            </select>
            <label class="custom-category-toggle">
              <input
                type="checkbox"
                v-model="useCustomCategory"
              />
              <span>Create custom category</span>
            </label>
          </div>
          <input
            v-if="useCustomCategory"
            type="text"
            v-model="customCategory"
            placeholder="Enter custom category name"
            class="custom-category-input"
            maxlength="50"
          />
        </div>

        <div class="form-group">
          <label for="preset-notes">Notes (Optional)</label>
          <textarea
            id="preset-notes"
            v-model="presetNotes"
            rows="3"
            placeholder="Add usage tips, like what to replace in brackets [ITEM]"
            maxlength="500"
          ></textarea>
          <span class="form-hint">{{ presetNotes.length }}/500</span>
        </div>

        <div class="preset-preview">
          <h3>Preset Settings:</h3>
          <div class="preview-item">
            <strong>Model:</strong> {{ settings.model }}
          </div>
          <div class="preview-item">
            <strong>Size:</strong> {{ settings.size }}
          </div>
          <div class="preview-item">
            <strong>Quality:</strong> {{ settings.quality }}
          </div>
          <div v-if="settings.style" class="preview-item">
            <strong>Style:</strong> {{ settings.style }}
          </div>
          <div class="preview-item">
            <strong>Prompt:</strong> {{ settings.prompt }}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="secondary">Cancel</button>
        <button @click="savePreset" :disabled="!canSave || loading">
          {{ loading ? 'Saving...' : 'Save Preset' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePresets } from '../composables/usePresets';

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'saved']);

const { loading, error, savePreset: savePresetAPI } = usePresets();

const presetName = ref('');
const presetCategory = ref('General');
const presetNotes = ref('');
const useCustomCategory = ref(false);
const customCategory = ref('');

const canSave = computed(() => {
  if (!presetName.value.trim()) return false;
  if (useCustomCategory.value && !customCategory.value.trim()) return false;
  return true;
});

async function savePreset() {
  if (!canSave.value) return;

  const preset = {
    name: presetName.value.trim(),
    category: useCustomCategory.value ? customCategory.value.trim() : presetCategory.value,
    model: props.settings.model,
    prompt: props.settings.prompt,
    size: props.settings.size,
    quality: props.settings.quality,
    style: props.settings.style,
    n: props.settings.n,
    notes: presetNotes.value.trim() || undefined
  };

  const result = await savePresetAPI(preset);

  if (result.success) {
    emit('saved');
    emit('close');
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

.btn-close:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.preset-preview {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius);
  margin-top: 1rem;
}

.preset-preview h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.preview-item {
  font-size: 0.8125rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.preview-item strong {
  color: var(--text-primary);
  display: inline-block;
  min-width: 80px;
}

.category-input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-input-group select {
  flex: 1;
  min-width: 200px;
}

.custom-category-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
}

.custom-category-toggle input[type="checkbox"] {
  cursor: pointer;
}

.custom-category-input {
  margin-top: 0.75rem;
  width: 100%;
}
</style>
