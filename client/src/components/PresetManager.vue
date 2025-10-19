<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Load Preset</h2>
        <div class="header-actions">
          <button @click="showKeyboardHelp = !showKeyboardHelp" class="btn-help" title="Keyboard shortcuts">
            ⌨️
          </button>
          <button @click="$emit('close')" class="btn-close">✕</button>
        </div>
      </div>

      <!-- Keyboard Shortcuts Help -->
      <div v-if="showKeyboardHelp" class="keyboard-help">
        <h4>Keyboard Shortcuts</h4>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <kbd>Esc</kbd> <span>Close dialog</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>F</kbd> <span>Focus search</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>E</kbd> <span>Export presets</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>I</kbd> <span>Import presets</span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="text-center">
          <span class="loading"></span> Loading presets...
        </div>

        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Recent Presets Quick Access -->
        <div v-if="!loading && !error && recentPresets.length > 0" class="recent-presets">
          <h3>Recently Used</h3>
          <div class="recent-list">
            <div
              v-for="preset in recentPresets"
              :key="preset.id"
              class="recent-item"
              @click="selectPreset(preset)"
              :title="preset.prompt"
            >
              <div class="recent-icon">⚡</div>
              <div class="recent-info">
                <div class="recent-name">{{ preset.name }}</div>
                <span class="badge-small">{{ preset.model }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div v-if="!loading && !error" class="preset-controls">
          <div class="search-bar">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search presets by name or prompt..."
              class="search-input"
            />
          </div>

          <div class="filter-bar">
            <label class="filter-label">Category:</label>
            <select v-model="selectedCategory" class="filter-select">
              <option value="">All Categories</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ getCategoryInfo(cat).icon }} {{ cat }}
              </option>
            </select>

            <label class="filter-label">Model:</label>
            <select v-model="selectedModel" class="filter-select">
              <option value="">All Models</option>
              <option value="gpt-image-1">GPT Image 1</option>
              <option value="dall-e-3">DALL-E 3</option>
              <option value="dall-e-2">DALL-E 2</option>
            </select>

            <label class="filter-label">Sort:</label>
            <select v-model="sortBy" class="filter-select">
              <option value="name">Name</option>
              <option value="recent">Recently Used</option>
              <option value="popular">Most Used</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div v-if="filteredGroupedPresets && Object.keys(filteredGroupedPresets).length > 0">
          <div v-for="(presets, category) in filteredGroupedPresets" :key="category" class="preset-category">
            <h3 class="category-header" :style="{ borderColor: getCategoryInfo(category).color }">
              <span class="category-icon">{{ getCategoryInfo(category).icon }}</span>
              <span class="category-name">{{ category }}</span>
              <span class="category-count">({{ presets.length }})</span>
            </h3>
            <div class="preset-list">
              <div
                v-for="preset in presets"
                :key="preset.id"
                class="preset-item"
                @click="selectPreset(preset)"
              >
                <div class="preset-info">
                  <div class="preset-name">{{ preset.name }}</div>
                  <div class="preset-meta">
                    <span class="badge">{{ preset.model }}</span>
                    <span class="badge">{{ preset.size }}</span>
                    <span v-if="preset.usageCount" class="preset-usage">
                      Used {{ preset.usageCount }} times
                    </span>
                  </div>
                  <div v-if="preset.notes" class="preset-notes">
                    {{ preset.notes }}
                  </div>
                  <div class="preset-prompt">{{ truncatePrompt(preset.prompt) }}</div>
                </div>
                <div class="preset-actions">
                  <button
                    @click.stop="duplicatePreset(preset)"
                    class="btn-action small secondary"
                    title="Duplicate this preset"
                  >
                    Duplicate
                  </button>
                  <button
                    @click.stop="editPreset(preset)"
                    class="btn-action small secondary"
                    title="Edit this preset"
                  >
                    Edit
                  </button>
                  <button
                    @click.stop="deletePresetConfirm(preset)"
                    class="btn-action small danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center no-results">
          <p v-if="searchQuery || selectedCategory || selectedModel">
            No presets match your filters. Try adjusting your search or filters.
          </p>
          <p v-else>
            No presets found. Create your first preset after generating an image!
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-left">
          <button @click="exportPresets" class="secondary small" title="Export all presets to a file">
            Export All
          </button>
          <button @click="triggerImport" class="secondary small" title="Import presets from a file">
            Import
          </button>
          <input
            ref="importInput"
            type="file"
            accept=".json"
            @change="importPresets"
            style="display: none"
          />
        </div>
        <button @click="$emit('close')" class="secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePresets } from '../composables/usePresets';
import axios from 'axios';

const emit = defineEmits(['close', 'load', 'edit', 'duplicate']);

const { presets, loading, error, loadPresets, deletePreset, incrementUsage, savePreset } = usePresets();

// Category icons data
const categoryIcons = ref({});

// Filter and search state
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedModel = ref('');
const sortBy = ref('name');

// Import file input ref
const importInput = ref(null);

// Show keyboard shortcuts help
const showKeyboardHelp = ref(false);

// Keyboard shortcut handler
function handleKeyDown(event) {
  // Escape to close
  if (event.key === 'Escape') {
    emit('close');
    return;
  }

  // Ctrl/Cmd + F to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault();
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.focus();
    return;
  }

  // Ctrl/Cmd + E to export
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault();
    exportPresets();
    return;
  }

  // Ctrl/Cmd + I to import
  if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault();
    triggerImport();
    return;
  }
}

// Load category icons
async function loadCategoryIcons() {
  try {
    const response = await axios.get('/api/category-icons');
    categoryIcons.value = response.data.categoryIcons || {};
  } catch (err) {
    console.warn('Could not load category icons:', err);
    categoryIcons.value = {};
  }
}

// Get category info (icon, color, description)
const getCategoryInfo = (categoryName) => {
  return categoryIcons.value[categoryName] || {
    icon: '📁',
    color: '#6B7280',
    description: categoryName
  };
};

onMounted(async () => {
  await loadPresets();
  await loadCategoryIcons();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Get available categories from presets
const availableCategories = computed(() => {
  const categories = [...new Set(presets.value.map(p => p.category || 'General'))];
  return categories.sort();
});

// Get recently used presets (top 5, most recent first)
const recentPresets = computed(() => {
  return [...presets.value]
    .filter(p => p.lastUsedAt)
    .sort((a, b) => (b.lastUsedAt || '').localeCompare(a.lastUsedAt || ''))
    .slice(0, 5);
});

// Filter and sort presets
const filteredPresets = computed(() => {
  let filtered = [...presets.value];

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.prompt.toLowerCase().includes(query) ||
      (p.notes && p.notes.toLowerCase().includes(query))
    );
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value);
  }

  // Apply model filter
  if (selectedModel.value) {
    filtered = filtered.filter(p => p.model === selectedModel.value);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return (b.lastUsedAt || b.createdAt || '').localeCompare(a.lastUsedAt || a.createdAt || '');
      case 'popular':
        return (b.usageCount || 0) - (a.usageCount || 0);
      case 'newest':
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      default:
        return 0;
    }
  });

  return filtered;
});

// Group filtered presets by category
const filteredGroupedPresets = computed(() => {
  const grouped = {};
  filteredPresets.value.forEach(preset => {
    const category = preset.category || 'General';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(preset);
  });
  return grouped;
});

function truncatePrompt(prompt, length = 100) {
  if (prompt.length <= length) return prompt;
  return prompt.substring(0, length) + '...';
}

function selectPreset(preset) {
  incrementUsage(preset.id);
  emit('load', preset);
}

async function deletePresetConfirm(preset) {
  if (confirm(`Delete preset "${preset.name}"?`)) {
    await deletePreset(preset.id);
  }
}

function editPreset(preset) {
  emit('edit', preset);
}

async function duplicatePreset(preset) {
  const newName = prompt(`Enter name for the duplicate:`, `${preset.name} (Copy)`);

  if (!newName || newName.trim() === '') return;

  const duplicate = {
    ...preset,
    name: newName.trim(),
    id: undefined, // Will be generated by backend
    createdAt: undefined,
    usageCount: 0,
    lastUsedAt: undefined
  };

  await savePreset(duplicate);
  await loadPresets();
}

function exportPresets() {
  if (presets.value.length === 0) {
    alert('No presets to export');
    return;
  }

  // Create export data with metadata
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    presets: presets.value.map(p => ({
      name: p.name,
      category: p.category,
      model: p.model,
      prompt: p.prompt,
      size: p.size,
      quality: p.quality,
      style: p.style,
      n: p.n,
      notes: p.notes
    }))
  };

  // Create and download JSON file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `presets-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`Exported ${exportData.presets.length} presets`);
}

function triggerImport() {
  importInput.value?.click();
}

async function importPresets(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Validate import data
    if (!importData.presets || !Array.isArray(importData.presets)) {
      alert('Invalid preset file format');
      return;
    }

    // Ask for confirmation
    const confirmed = confirm(
      `Import ${importData.presets.length} presets?\n\n` +
      'Duplicates will be skipped. This action cannot be undone.'
    );

    if (!confirmed) return;

    // Import each preset
    let imported = 0;
    let skipped = 0;

    for (const preset of importData.presets) {
      try {
        await savePreset(preset);
        imported++;
      } catch (err) {
        console.warn(`Skipped preset "${preset.name}":`, err.message);
        skipped++;
      }
    }

    await loadPresets();

    alert(
      `Import complete!\n\n` +
      `Imported: ${imported}\n` +
      `Skipped: ${skipped}`
    );

  } catch (err) {
    console.error('Import error:', err);
    alert(`Failed to import presets: ${err.message}`);
  } finally {
    // Reset file input
    event.target.value = '';
  }
}
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-help {
  background: none;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  font-size: 1.25rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  border-radius: var(--radius);
  transition: all 0.2s;
}

.btn-help:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.btn-close {
  background: none;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  font-size: 1.5rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  border-radius: var(--radius);
  transition: all 0.2s;
}

.btn-close:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

.keyboard-help {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.keyboard-help h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.shortcut-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.shortcut-item kbd {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.shortcut-item span {
  opacity: 0.9;
}

.preset-category {
  margin-bottom: 2rem;
}

.preset-category:last-child {
  margin-bottom: 0;
}

.preset-category h3 {
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.category-name {
  font-weight: 600;
}

.category-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preset-item {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.preset-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  background: var(--bg-secondary);
}

.preset-info {
  flex: 1;
}

.preset-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.preset-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.preset-usage {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.preset-notes {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.preset-prompt {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.preset-controls {
  margin-bottom: 1.5rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.9375rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.no-results {
  padding: 2rem;
  color: var(--text-secondary);
}

.preset-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-action {
  flex-shrink: 0;
  min-width: 80px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  gap: 0.5rem;
}

.recent-presets {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.recent-presets h3 {
  font-size: 1rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recent-list {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
  white-space: nowrap;
}

.recent-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.recent-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.recent-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.recent-name {
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-small {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  display: inline-block;
  align-self: flex-start;
}
</style>
