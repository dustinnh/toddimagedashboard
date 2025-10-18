<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Preset</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="edit-preset-name">Preset Name*</label>
          <input
            id="edit-preset-name"
            type="text"
            v-model="editedPreset.name"
            placeholder="e.g., Morning Routine Item"
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label for="edit-preset-category">Category*</label>
          <div class="category-input-group">
            <select
              id="edit-preset-category"
              v-model="editedPreset.category"
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
              <span>Custom category</span>
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
          <label for="edit-preset-notes">Notes (Optional)</label>
          <textarea
            id="edit-preset-notes"
            v-model="editedPreset.notes"
            rows="3"
            placeholder="Add usage tips, like what to replace in brackets [ITEM]"
            maxlength="500"
          ></textarea>
          <span class="form-hint">{{ (editedPreset.notes || '').length }}/500</span>
        </div>

        <div class="preset-preview">
          <h3>Current Settings:</h3>
          <div class="preview-item">
            <strong>Model:</strong> {{ editedPreset.model }}
          </div>
          <div class="preview-item">
            <strong>Size:</strong> {{ editedPreset.size }}
          </div>
          <div class="preview-item">
            <strong>Quality:</strong> {{ editedPreset.quality }}
          </div>
          <div v-if="editedPreset.style" class="preview-item">
            <strong>Style:</strong> {{ editedPreset.style }}
          </div>
          <div class="preview-item">
            <strong>Prompt:</strong> {{ editedPreset.prompt }}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="secondary">Cancel</button>
        <button @click="saveChanges" :disabled="!canSave || loading">
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePresets } from '../composables/usePresets';

const props = defineProps({
  preset: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'saved']);

const { loading, error, updatePreset } = usePresets();

const editedPreset = ref({
  id: props.preset.id,
  name: props.preset.name,
  category: props.preset.category || 'General',
  notes: props.preset.notes || '',
  model: props.preset.model,
  prompt: props.preset.prompt,
  size: props.preset.size,
  quality: props.preset.quality,
  style: props.preset.style,
  n: props.preset.n
});

const useCustomCategory = ref(false);
const customCategory = ref('');

// Check if preset uses a custom category on mount
onMounted(() => {
  const standardCategories = [
    'Visual Schedule',
    'Emotion Cards',
    'Social Stories',
    'Educational',
    'Choice Boards',
    'General'
  ];

  if (!standardCategories.includes(props.preset.category)) {
    useCustomCategory.value = true;
    customCategory.value = props.preset.category;
  }
});

const canSave = computed(() => {
  if (!editedPreset.value.name.trim()) return false;
  if (useCustomCategory.value && !customCategory.value.trim()) return false;
  return true;
});

async function saveChanges() {
  if (!canSave.value) return;

  const updates = {
    name: editedPreset.value.name.trim(),
    category: useCustomCategory.value ? customCategory.value.trim() : editedPreset.value.category,
    notes: editedPreset.value.notes.trim() || undefined
  };

  const result = await updatePreset(editedPreset.value.id, updates);

  if (result.success) {
    emit('saved', result.preset);
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
</style>
