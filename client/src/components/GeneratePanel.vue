<template>
  <div class="generate-panel card">
    <h2>Generate Images</h2>

    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Tips Panel -->
    <TipsPanel />

    <!-- Model Selection -->
    <div class="form-group">
      <label for="model">
        AI Model
        <button @click="showModelInfo = !showModelInfo" class="btn-info" type="button" title="Learn about models">
          {{ showModelInfo ? 'ℹ️ Hide Info' : 'ℹ️ Model Info' }}
        </button>
      </label>
      <select id="model" v-model="settings.model" @change="updateModelOptions">
        <option value="dall-e-3">DALL-E 3 (High Quality)</option>
        <option value="gpt-image-1">GPT Image 1 (Newest, Editing)</option>
        <option value="dall-e-2">DALL-E 2 (Budget)</option>
      </select>
      <span class="form-hint">{{ modelDescriptions[settings.model] }}</span>

      <!-- Model Info Panel -->
      <div v-if="showModelInfo" class="model-info-panel">
        <div class="info-header">
          <span class="info-icon">{{ modelInfo[settings.model].icon }}</span>
          <h4>{{ modelInfo[settings.model].name }}</h4>
        </div>
        <p class="info-description">{{ modelInfo[settings.model].description }}</p>

        <div class="info-section">
          <strong>✓ Best For:</strong>
          <ul>
            <li v-for="use in modelInfo[settings.model].bestFor" :key="use">{{ use }}</li>
          </ul>
        </div>

        <div class="info-section">
          <strong>💰 Pricing:</strong>
          <p>{{ modelInfo[settings.model].pricing }}</p>
        </div>

        <div class="info-section">
          <strong>⚡ Key Features:</strong>
          <ul>
            <li v-for="feature in modelInfo[settings.model].features" :key="feature">{{ feature }}</li>
          </ul>
        </div>

        <div v-if="modelInfo[settings.model].tips" class="info-section info-tips">
          <strong>💡 Tips:</strong>
          <p>{{ modelInfo[settings.model].tips }}</p>
        </div>
      </div>
    </div>

    <!-- Prompt -->
    <div class="form-group">
      <label for="prompt">Prompt</label>
      <textarea
        id="prompt"
        v-model="settings.prompt"
        :maxlength="promptLimit"
        rows="5"
        placeholder="Describe the image you want to generate..."
      ></textarea>
      <span class="char-count">{{ settings.prompt.length }}/{{ promptLimit }}</span>
    </div>

    <!-- Size -->
    <div class="form-group">
      <label for="size">Image Size</label>
      <select id="size" v-model="settings.size">
        <option v-for="size in availableSizes" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>

    <!-- Quality (for DALL-E 3 and GPT Image 1) -->
    <div v-if="settings.model !== 'dall-e-2'" class="form-group">
      <label for="quality">Quality</label>
      <select id="quality" v-model="settings.quality">
        <option v-for="qual in availableQualities" :key="qual.value" :value="qual.value">
          {{ qual.label }} ({{ qual.cost }})
        </option>
      </select>
    </div>

    <!-- Advanced Options (GPT Image 1 only) -->
    <div v-if="settings.model === 'gpt-image-1'" class="advanced-options">
      <h3 class="options-title">Advanced Options</h3>

      <div class="form-group">
        <label for="background">Background</label>
        <select id="background" v-model="settings.background">
          <option value="auto">Auto (Default)</option>
          <option value="transparent">Transparent</option>
          <option value="opaque">Opaque</option>
        </select>
        <span class="form-hint">Background transparency mode</span>
      </div>

      <div class="form-group">
        <label for="output_format">Output Format</label>
        <select id="output_format" v-model="settings.output_format">
          <option value="png">PNG (Lossless)</option>
          <option value="jpeg">JPEG (Compressed)</option>
        </select>
      </div>

      <div v-if="settings.output_format === 'jpeg'" class="form-group">
        <label for="output_compression">Compression Quality</label>
        <input
          id="output_compression"
          type="range"
          v-model.number="settings.output_compression"
          min="0"
          max="100"
        />
        <div class="compression-value">{{ settings.output_compression }}%</div>
        <span class="form-hint">Lower values = smaller file size</span>
      </div>
    </div>

    <!-- Style (DALL-E 3 only) -->
    <div v-if="settings.model === 'dall-e-3'" class="form-group">
      <label for="style">Style</label>
      <select id="style" v-model="settings.style">
        <option value="natural">Natural (Realistic, Subdued)</option>
        <option value="vivid">Vivid (Dramatic, Cinematic)</option>
      </select>
    </div>

    <!-- Number of Images (not for DALL-E 3) -->
    <div v-if="settings.model !== 'dall-e-3'" class="form-group">
      <label for="n">Number of Images</label>
      <input
        id="n"
        type="number"
        v-model.number="settings.n"
        min="1"
        :max="maxImages"
      />
      <span class="form-hint">Generate multiple variations to choose the best one</span>
    </div>

    <!-- Cost Estimate -->
    <div class="cost-box">
      <div class="cost-label">Estimated Cost:</div>
      <div class="cost-value">${{ estimatedCost.toFixed(3) }}</div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button @click="generateImage" :disabled="loading || !canGenerate" class="btn-primary">
        <span v-if="loading" class="loading"></span>
        {{ loading ? 'Generating...' : 'Generate' }}
      </button>
      <button @click="showPresets = true" class="secondary">
        Load Preset
      </button>
      <button @click="showSavePreset = true" :disabled="!settings.prompt" class="secondary">
        Save Preset
      </button>
    </div>

    <!-- Preset Modal -->
    <PresetManager
      v-if="showPresets"
      @close="showPresets = false"
      @load="loadPreset"
      @edit="handleEditPreset"
    />

    <!-- Save Preset Modal -->
    <SavePresetModal
      v-if="showSavePreset"
      :settings="settings"
      @close="showSavePreset = false"
      @saved="handlePresetSaved"
    />

    <!-- Edit Preset Modal -->
    <EditPresetModal
      v-if="showEditPreset && editingPreset"
      :preset="editingPreset"
      @close="showEditPreset = false"
      @saved="handlePresetEdited"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useImageGeneration } from '../composables/useImageGeneration';
import TipsPanel from './TipsPanel.vue';
import PresetManager from './PresetManager.vue';
import SavePresetModal from './SavePresetModal.vue';
import EditPresetModal from './EditPresetModal.vue';

const emit = defineEmits(['image-generated', 'cost-update']);

const { loading, error, generate, clearError } = useImageGeneration();

const showPresets = ref(false);
const showSavePreset = ref(false);
const showEditPreset = ref(false);
const editingPreset = ref(null);

const settings = ref({
  model: 'dall-e-3',
  prompt: '',
  size: '1024x1024',
  quality: 'standard',
  style: 'natural',
  n: 1,
  background: 'auto',
  output_format: 'png',
  output_compression: 80
});

const modelConfigs = {
  'gpt-image-1': {
    sizes: ['1024x1024', '1024x1536', '1536x1024'],
    qualities: [
      { value: 'low', label: 'Low', cost: '$0.02' },
      { value: 'medium', label: 'Medium', cost: '$0.07' },
      { value: 'high', label: 'High', cost: '$0.19' }
    ],
    promptLimit: 4000,
    maxImages: 10
  },
  'dall-e-3': {
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    qualities: [
      { value: 'standard', label: 'Standard', cost: '$0.04-$0.08' },
      { value: 'hd', label: 'HD', cost: '$0.08-$0.12' }
    ],
    promptLimit: 4000,
    maxImages: 1
  },
  'dall-e-2': {
    sizes: ['256x256', '512x512', '1024x1024'],
    qualities: [],
    promptLimit: 1000,
    maxImages: 10
  }
};

const showModelInfo = ref(false);

const modelDescriptions = {
  'gpt-image-1': 'Newest model with editing and advanced features',
  'dall-e-3': 'Best quality and most creative, $0.04-$0.12 per image',
  'dall-e-2': 'Most affordable option, $0.016-$0.02 per image'
};

const modelInfo = {
  'gpt-image-1': {
    icon: '🚀',
    name: 'GPT Image 1',
    description: 'The newest and most advanced model from OpenAI with cutting-edge features and excellent accuracy for educational content.',
    bestFor: [
      'Educational diagrams and labeled illustrations',
      'Images with text or labels',
      'Technical and scientific visualizations',
      'Editing existing images (inpainting)',
      'Content that needs precise control'
    ],
    pricing: 'Standard: $0.04 per image | HD: $0.12 per image',
    features: [
      'Advanced editing capabilities with inpainting',
      'Better text rendering in images',
      'Background control (transparent, opaque, auto)',
      'Multiple output formats (PNG, JPEG)',
      'Excellent at following complex prompts'
    ],
    tips: 'Use this for diagrams, posters, or any image that needs text labels. Great for educational materials!'
  },
  'dall-e-3': {
    icon: '🎨',
    name: 'DALL-E 3',
    description: 'High-quality creative model that excels at understanding and following detailed prompts with artistic results.',
    bestFor: [
      'Creative and artistic images',
      'Illustrations and cartoon-style content',
      'Emotion cards and character designs',
      'Social story visuals',
      'When you need the most creative interpretation'
    ],
    pricing: 'Standard: $0.04 per image | HD: $0.08 per image',
    features: [
      'Excellent prompt understanding',
      'Natural or Vivid style options',
      'High creative quality',
      'Great for character consistency',
      'Detailed and nuanced imagery'
    ],
    tips: 'Perfect for creating engaging visuals for children. Use "natural" style for realistic, "vivid" for dramatic.'
  },
  'dall-e-2': {
    icon: '💰',
    name: 'DALL-E 2',
    description: 'Cost-effective model that\'s great for bulk image generation and testing prompts before using more expensive models.',
    bestFor: [
      'Testing prompts before final generation',
      'Creating variations of existing images',
      'Bulk image generation on a budget',
      'Simple icons and visual schedule items',
      'When cost is a primary concern'
    ],
    pricing: 'Standard: $0.016-$0.02 per image (4-5x cheaper than DALL-E 3)',
    features: [
      'Most affordable option',
      'Can generate multiple images at once (up to 10)',
      'Supports variations feature',
      'Good for simple, clear imagery',
      'Fast generation times'
    ],
    tips: 'Great for budget-conscious projects. Test your prompts here first, then regenerate with DALL-E 3 if needed!'
  }
};

const availableSizes = computed(() => modelConfigs[settings.value.model].sizes);
const availableQualities = computed(() => modelConfigs[settings.value.model].qualities);
const promptLimit = computed(() => modelConfigs[settings.value.model].promptLimit);
const maxImages = computed(() => modelConfigs[settings.value.model].maxImages);

const canGenerate = computed(() => {
  return settings.value.prompt.trim().length > 0;
});

const estimatedCost = computed(() => {
  const { model, size, quality, n } = settings.value;

  const pricing = {
    'gpt-image-1': {
      'low': 0.02,
      'medium': 0.07,
      'high': 0.19
    },
    'dall-e-3': {
      '1024x1024': { 'standard': 0.04, 'hd': 0.08 },
      '1024x1792': { 'standard': 0.08, 'hd': 0.12 },
      '1792x1024': { 'standard': 0.08, 'hd': 0.12 }
    },
    'dall-e-2': {
      '256x256': 0.016,
      '512x512': 0.018,
      '1024x1024': 0.020
    }
  };

  let unitCost = 0;

  if (model === 'gpt-image-1') {
    unitCost = pricing[model][quality] || 0.19;
  } else if (model === 'dall-e-3') {
    unitCost = pricing[model][size]?.[quality] || 0.04;
  } else if (model === 'dall-e-2') {
    unitCost = pricing[model][size] || 0.02;
  }

  return unitCost * n;
});

function updateModelOptions() {
  const config = modelConfigs[settings.value.model];
  settings.value.size = config.sizes[0];

  if (config.qualities.length > 0) {
    settings.value.quality = config.qualities[0].value;
  }

  if (settings.value.model === 'dall-e-3') {
    settings.value.n = 1;
  }

  clearError();
}

async function generateImage() {
  clearError();

  const result = await generate(settings.value);

  if (result.success) {
    emit('image-generated', result);
    emit('cost-update', estimatedCost.value);
  }
}

function loadPreset(preset) {
  settings.value = {
    model: preset.model,
    prompt: preset.prompt,
    size: preset.size,
    quality: preset.quality || 'standard',
    style: preset.style || 'natural',
    n: preset.n || 1
  };
  showPresets.value = false;
}

function handlePresetSaved() {
  showSavePreset.value = false;
}

function handleEditPreset(preset) {
  editingPreset.value = preset;
  showPresets.value = false;
  showEditPreset.value = true;
}

function handlePresetEdited() {
  showEditPreset.value = false;
  editingPreset.value = null;
}

// Watch prompt length
watch(() => settings.value.prompt, (newPrompt) => {
  if (newPrompt.length > promptLimit.value) {
    settings.value.prompt = newPrompt.substring(0, promptLimit.value);
  }
});
</script>

<style scoped>
.generate-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.generate-panel h2 {
  margin-bottom: 1.25rem;
}

.cost-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.cost-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.cost-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.actions {
  display: grid;
  gap: 0.75rem;
}

.actions button {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.advanced-options {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  margin-bottom: 1.25rem;
  border: 1px solid var(--border-color);
}

.options-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compression-value {
  text-align: center;
  font-weight: 600;
  color: var(--primary-color);
  margin-top: 0.5rem;
  font-size: 1rem;
}

.advanced-options .form-group {
  margin-bottom: 1rem;
}

.advanced-options .form-group:last-child {
  margin-bottom: 0;
}

/* Model Info Styles */
label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.btn-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-info:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.model-info-panel {
  margin-top: 1rem;
  padding: 1.25rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 2px solid var(--primary-color);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.info-icon {
  font-size: 1.75rem;
}

.info-header h4 {
  font-size: 1.0625rem;
  color: var(--text-primary);
  margin: 0;
}

.info-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.info-section {
  margin-bottom: 1rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-section ul {
  margin: 0;
  padding-left: 1.25rem;
  list-style-type: disc;
}

.info-section li {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
}

.info-section p {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.6;
  margin: 0;
}

.info-tips {
  background: rgba(102, 126, 234, 0.1);
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}

.info-tips p {
  color: var(--text-primary);
  font-style: italic;
}
</style>
