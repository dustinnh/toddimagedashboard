# OpenAI Image Generation Dashboard: Complete Technical Implementation Guide

OpenAI's image generation API offers three distinct models with varying capabilities and pricing structures. **GPT Image 1 emerges as the most capable model** with native inpainting, streaming support, and advanced text rendering, while DALL-E 3 excels at high-quality generation but lacks editing features. Building a local NodeJS + Vue dashboard requires careful attention to API key security, cross-platform file handling, and cost tracking to create a production-ready application.

## Model capabilities and strategic selection

The three available models serve distinct purposes with incompatible feature sets. **GPT Image 1 (gpt-image-1)** is OpenAI's newest model built on GPT-4o architecture, featuring native multimodal processing that accepts both text and image inputs. This model **requires organization verification** and offers the most advanced capabilities: high-fidelity inpainting with soft masking, streaming partial images during generation, typography accuracy supporting ~800 characters, transparent background generation, and built-in C2PA metadata for content provenance. Quality settings include low ($0.02), medium ($0.07), and high ($0.19) for 1024x1024 images, with native support for three aspect ratios: 1024x1024 (square), 1536x1024 (landscape), and 1024x1536 (portrait).

**DALL-E 3 (dall-e-3)** delivers high-quality generation with GPT-4 prompt rewriting that cannot be disabled. It supports standard ($0.04) and HD ($0.08) quality at 1024x1024, with landscape/portrait options at 1024x1792 and 1792x1024 ($0.08 standard, $0.12 HD). The model offers two style modes: "vivid" (hyper-real, cinematic, default) and "natural" (subdued, realistic, better for logos). **Critical limitation: DALL-E 3 only supports n=1** (single image per request) and cannot perform editing or variations.

**DALL-E 2 (dall-e-2)** remains available but is being phased out with no new users accepted. At the lowest cost ($0.016-$0.02 per image), it supports all three operations: generation (1-10 images per request), editing with pixel-level mask replacement, and creating variations from existing images. Images must be square for DALL-E 2, with outputs at 256x256, 512x512, or 1024x1024.

### Feature matrix comparison

| Feature | GPT Image 1 | DALL-E 3 | DALL-E 2 |
|---------|-------------|----------|----------|
| Inpainting/Editing | ✓ Soft mask | ✗ | ✓ Pixel-level |
| Image Variations | ✗ | ✗ | ✓ |
| Batch Generation (n>1) | ✓ (1-10) | ✗ (n=1 only) | ✓ (1-10) |
| Non-Square Images | ✓ | ✓ | ✗ |
| Quality Levels | 3 (low/med/high) | 2 (std/HD) | 1 |
| Style Control | ✗ | ✓ (natural/vivid) | ✗ |
| Streaming | ✓ | ✗ | ✗ |
| Transparency | ✓ | ✗ | ✗ |
| Prompt Rewriting | ✓ (forced) | ✓ (forced) | ✗ |

## Complete API specifications and integration patterns

### Core endpoints and authentication

All requests use the base URL `https://api.openai.com/v1/` with Bearer token authentication. Three primary endpoints handle different operations:

**Image Generation** (`POST /v1/images/generations`) accepts JSON with Content-Type: application/json. Authentication requires the header `Authorization: Bearer {OPENAI_API_KEY}`. This endpoint supports all three models for text-to-image generation.

**Image Editing** (`POST /v1/images/edits`) uses multipart/form-data for uploading images and masks. Only GPT Image 1 and DALL-E 2 support this endpoint; DALL-E 3 cannot perform editing.

**Image Variations** (`POST /v1/images/variations`) creates similar images from an input image, exclusively for DALL-E 2. This endpoint also requires multipart/form-data.

### Generation request parameters

The `model` parameter accepts "gpt-image-1", "dall-e-3", or "dall-e-2" with "dall-e-2" as default. The `prompt` parameter has model-specific limits: 1000 characters for DALL-E 2, 4000 characters for DALL-E 3 and GPT Image 1. Both DALL-E 3 and GPT Image 1 automatically enhance prompts through GPT-4 rewriting that cannot be disabled.

The `size` parameter determines output dimensions with model-specific constraints. DALL-E 2 offers square formats only: "256x256", "512x512", "1024x1024". DALL-E 3 supports "1024x1024", "1792x1024", "1024x1792". GPT Image 1 provides "1024x1024", "1024x1536", "1536x1024". Square images generate fastest across all models.

Quality settings vary significantly. DALL-E 3 uses `quality` with "standard" (default, faster) or "hd" (enhanced detail, ~10 seconds slower, higher cost). GPT Image 1 offers three tiers: "low" (~$0.02, fastest), "medium" (~$0.07, balanced), "high" (~$0.19, default, maximum detail). DALL-E 2 has no quality parameter.

The `n` parameter controls batch size: DALL-E 2 and GPT Image 1 support 1-10 images per request, while DALL-E 3 requires n=1. The `response_format` parameter accepts "url" (temporary link expiring in 24 hours) or "b64_json" (base64-encoded image data). **Important: GPT Image 1 always returns base64 regardless of this parameter.**

GPT Image 1 exclusive parameters include `background` ("transparent", "opaque", "auto"), `output_format` ("PNG" or "JPEG"), `output_compression` (0-100), `moderation` ("auto" or "low"), `stream` (boolean for partial images), `partial_images` (1-3 intermediate images when streaming), and `input_fidelity` (preservation level for unmasked areas during editing).

DALL-E 3 exclusive parameters include `style` with "natural" (subdued, realistic, better for logos) or "vivid" (default, hyper-real, cinematic).

### Complete request examples

**GPT Image 1 Generation:**
```json
{
  "model": "gpt-image-1",
  "prompt": "A detailed professional photograph of a modern smartphone on a minimalist desk",
  "quality": "medium",
  "size": "1024x1024",
  "n": 2,
  "background": "transparent",
  "output_format": "PNG",
  "output_compression": 80,
  "stream": false
}
```

**DALL-E 3 Generation:**
```json
{
  "model": "dall-e-3",
  "prompt": "A serene mountain landscape at sunset with dramatic clouds",
  "quality": "hd",
  "style": "natural",
  "size": "1792x1024",
  "n": 1,
  "response_format": "b64_json"
}
```

**DALL-E 2 Batch Generation:**
```json
{
  "model": "dall-e-2",
  "prompt": "Professional product photography of a leather wallet",
  "size": "1024x1024",
  "n": 5,
  "response_format": "url"
}
```

### Response structure and handling

Standard responses include a `created` timestamp and `data` array containing image objects. URL responses provide temporary links:

```json
{
  "created": 1729252800,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revised_prompt": "A detailed professional photograph showing..."
    }
  ]
}
```

Base64 responses return encoded image data directly:

```json
{
  "created": 1729252800,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA...",
      "revised_prompt": "Enhanced prompt used for generation"
    }
  ]
}
```

The `revised_prompt` field appears for DALL-E 3 and GPT Image 1, showing the GPT-4 enhanced prompt actually used. URLs expire after 24 hours and must be downloaded immediately for permanent storage.

## Inpainting and editing technical specifications

Inpainting allows targeted editing of specific image regions using masks. **Only GPT Image 1 and DALL-E 2 support editing**—DALL-E 3 cannot perform inpainting or any editing operations.

### Mask requirements and creation

Masks must be **PNG format with alpha channel** where fully transparent pixels (alpha = 0) indicate regions to edit/regenerate and opaque pixels (alpha = 255) remain unchanged. The mask must have identical dimensions to the input image. File size limits are 50 MB for GPT Image 1 and 4 MB for DALL-E 2, with DALL-E 2 requiring square images.

**Critical technical detail:** Black-and-white masks must be converted to alpha channel format. The alpha channel value (0-255) determines transparency, not RGB color values. Intermediate alpha values may produce unpredictable results.

Creating masks programmatically:

```python
from PIL import Image

# Convert black/white image to alpha mask
mask = Image.open("mask_bw.png").convert("L")  # Grayscale
mask_rgba = mask.convert("RGBA")
mask_rgba.putalpha(mask)  # Use grayscale as alpha channel
mask_rgba.save("mask_alpha.png", format="PNG")
```

### Inpainting approach differences

GPT Image 1 uses a **soft mask** approach that regenerates the entire image with mask guidance. This provides more flexible, coherent scene integration but may slightly alter unmasked regions. The `input_fidelity` parameter controls preservation effort, with higher values better maintaining unmasked areas, especially faces.

DALL-E 2 employs **pixel-level replacement** at mask boundaries, offering more precise preservation of unmasked areas. It uses discrete mask regions with hard boundaries for editing.

### Editing endpoint usage

Editing requests use multipart/form-data format:

```bash
curl https://api.openai.com/v1/images/edits \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -F "image=@original.png" \
  -F "mask=@mask.png" \
  -F "prompt=Replace the sky with a dramatic sunset" \
  -F "model=gpt-image-1" \
  -F "size=1024x1024" \
  -F "quality=high" \
  -F "n=1"
```

The `prompt` should describe the complete desired final image, not just the edits. If no mask is provided, image transparency is used as the implicit mask (DALL-E 2 only).

## Rate limits and pricing structure

OpenAI employs a **five-tier usage system** that automatically upgrades based on spending history and account age. Understanding these limits is crucial for production planning.

### Usage tier progression

| Tier | Requirements | Monthly Limit | DALL-E 3 IPM |
|------|--------------|---------------|--------------|
| Free | Allowed geography | $100 | 1 |
| Tier 1 | $5 spent | $100 | 5-7 |
| Tier 2 | $50 spent + 7 days | $500 | 15 |
| Tier 3 | $100 spent + 7 days | $1,000 | 15 |
| Tier 4 | $250 spent + 14 days | $5,000 | 50+ |
| Tier 5 | $1,000 spent + 30 days | $10,000 | 50+ |

**GPT Image 1 requires Tier 1 minimum** ($5 spent + 24-48 hours processing). Rate limits measure five dimensions simultaneously: requests per minute (RPM), requests per day (RPD), tokens per minute (TPM), tokens per day (TPD), and images per minute (IPM). Hitting any single limit triggers rate limiting.

### Cost analysis and optimization

**DALL-E 2** offers the lowest costs: 256x256 at $0.016, 512x512 at $0.018, 1024x1024 at $0.02 per image. However, it's being phased out.

**DALL-E 3** standard quality costs $0.04 (1024x1024), $0.08 (landscape/portrait). HD quality doubles these: $0.08 (1024x1024), $0.12 (landscape/portrait).

**GPT Image 1** uses token-based pricing with approximate per-image costs: low quality ~$0.01, medium ~$0.04, high ~$0.17 for square 1024x1024 images. Token rates are $5/1M text input tokens, $10/1M image input tokens, $40/1M image output tokens.

For a book creation workflow requiring consistency, **DALL-E 3 standard quality at $0.04 per image offers the best balance** of quality and cost. GPT Image 1 medium quality provides similar pricing with additional editing capabilities.

### Rate limit handling

Rate limit errors return HTTP 429 with detailed information:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded for images per minute. Limit: 15/1min. Current: 16/1min.",
    "type": "rate_limit_error"
  }
}
```

Implement exponential backoff with jitter for retry logic. **Important: Unsuccessful requests count toward rate limits**—continuous retries without delays will fail.

### Usage tracking API

OpenAI provides programmatic usage tracking through dedicated endpoints launched December 2024:

```
GET https://platform.openai.com/v1/usage
GET https://platform.openai.com/v1/costs
```

These endpoints support filtering by API key, project ID, user ID, and model with minute/hour/day granularity. Export up to 60 days of historical data. The web dashboard at `https://platform.openai.com/account/usage` offers real-time tracking with Cost and Activity views.

## NodeJS backend architecture

A secure proxy pattern keeps API keys server-side while providing a clean interface for the Vue frontend. This architecture prevents key exposure, enables rate limiting, and facilitates usage tracking.

### Express.js proxy implementation

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Image generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { model, prompt, size, quality, style, n = 1 } = req.body;
    
    const payload = {
      model: model || 'dall-e-3',
      prompt: prompt,
      size: size || '1024x1024',
      n: n
    };
    
    // Add model-specific parameters
    if (model === 'dall-e-3') {
      if (quality) payload.quality = quality;
      if (style) payload.style = style;
    } else if (model === 'gpt-image-1') {
      if (quality) payload.quality = quality;
    }
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Save images locally
    const savedImages = await saveImagesLocally(response.data.data);
    
    // Track usage
    await trackUsage({
      model,
      size,
      quality,
      n,
      cost: calculateCost(model, size, quality, n)
    });
    
    res.json({
      success: true,
      images: savedImages,
      revised_prompt: response.data.data[0].revised_prompt
    });
    
  } catch (error) {
    console.error('Generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Generation failed'
    });
  }
});

// Image editing endpoint
app.post('/api/edit', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mask', maxCount: 1 }
]), async (req, res) => {
  try {
    const { prompt, model, size, quality } = req.body;
    const imagePath = req.files['image'][0].path;
    const maskPath = req.files['mask']?.[0]?.path;
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    if (maskPath) {
      formData.append('mask', fs.createReadStream(maskPath));
    }
    formData.append('prompt', prompt);
    formData.append('model', model || 'gpt-image-1');
    formData.append('size', size || '1024x1024');
    if (quality) formData.append('quality', quality);
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    );
    
    // Cleanup uploaded files
    fs.unlinkSync(imagePath);
    if (maskPath) fs.unlinkSync(maskPath);
    
    const savedImages = await saveImagesLocally(response.data.data);
    
    res.json({ success: true, images: savedImages });
    
  } catch (error) {
    console.error('Edit error:', error);
    res.status(500).json({ success: false, error: 'Edit failed' });
  }
});

// Helper: Save images to local filesystem
async function saveImagesLocally(imageData) {
  const imagesDir = path.join(__dirname, 'Images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const saved = [];
  
  for (const img of imageData) {
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
    const filepath = path.join(imagesDir, filename);
    
    if (img.b64_json) {
      // Handle base64 data
      const buffer = Buffer.from(img.b64_json, 'base64');
      fs.writeFileSync(filepath, buffer);
    } else if (img.url) {
      // Download from URL
      const response = await axios.get(img.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filepath, response.data);
    }
    
    saved.push({
      filename: filename,
      path: filepath,
      localUrl: `/images/${filename}`
    });
  }
  
  return saved;
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Retry logic with exponential backoff

```javascript
const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on 429 (rate limit) or 5xx errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) 
      || error.response?.status === 429
      || (error.response?.status >= 500);
  },
  onRetry: (retryCount, error) => {
    console.log(`Retry attempt ${retryCount}: ${error.message}`);
  }
});
```

### API key security implementation

Store API keys in `.env` file (never commit to version control):

```bash
# .env
OPENAI_API_KEY=sk-proj-your-actual-key-here
PORT=3000
```

Add to `.gitignore`:

```
.env
.env.local
node_modules/
Images/
uploads/
```

Load environment variables:

```javascript
require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY not found in environment variables');
  process.exit(1);
}
```

## Vue.js frontend architecture

The frontend provides an intuitive interface for image generation with preset management and cost tracking. Component-based architecture ensures maintainability and reusability.

### Component structure

```
src/
├── components/
│   ├── ImageGenerator.vue       # Main generation interface
│   ├── ModelSelector.vue         # Choose between models
│   ├── ParameterControls.vue     # Size, quality, style controls
│   ├── ImageEditor.vue           # Inpainting interface
│   ├── ImageGallery.vue          # Display generated images
│   ├── ImagePreview.vue          # Individual image with actions
│   ├── PresetManager.vue         # Save/load presets
│   └── UsageTracker.vue          # Cost and usage display
├── composables/
│   ├── useImageGeneration.js     # API integration
│   ├── usePresets.js             # Preset management
│   └── useUsageTracking.js       # Usage statistics
├── stores/
│   ├── imageStore.js             # Pinia store for images
│   └── settingsStore.js          # App configuration
└── App.vue
```

### Main generation component

```vue
<template>
  <div class="dashboard">
    <div class="controls-panel">
      <h1>OpenAI Image Generation Dashboard</h1>
      
      <!-- Model Selection -->
      <div class="model-selector">
        <label>Model:</label>
        <select v-model="settings.model" @change="updateAvailableOptions">
          <option value="gpt-image-1">GPT Image 1 (Newest, Editing)</option>
          <option value="dall-e-3">DALL-E 3 (High Quality)</option>
          <option value="dall-e-2">DALL-E 2 (Budget, Variations)</option>
        </select>
      </div>
      
      <!-- Prompt Input -->
      <div class="prompt-section">
        <label>Prompt:</label>
        <textarea 
          v-model="settings.prompt"
          :maxlength="getPromptLimit()"
          rows="4"
          placeholder="Describe the image you want to generate..."
        />
        <span class="char-count">{{ settings.prompt.length }}/{{ getPromptLimit() }}</span>
      </div>
      
      <!-- Size Selection -->
      <div class="size-selector">
        <label>Size:</label>
        <select v-model="settings.size">
          <option v-for="size in availableSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
      
      <!-- Quality Settings -->
      <div v-if="settings.model !== 'dall-e-2'" class="quality-selector">
        <label>Quality:</label>
        <select v-model="settings.quality">
          <option v-for="qual in availableQualities" :key="qual.value" :value="qual.value">
            {{ qual.label }} ({{ qual.cost }})
          </option>
        </select>
      </div>
      
      <!-- Style Settings (DALL-E 3 only) -->
      <div v-if="settings.model === 'dall-e-3'" class="style-selector">
        <label>Style:</label>
        <select v-model="settings.style">
          <option value="vivid">Vivid (Dramatic, Cinematic)</option>
          <option value="natural">Natural (Realistic, Subdued)</option>
        </select>
      </div>
      
      <!-- Batch Size -->
      <div v-if="settings.model !== 'dall-e-3'" class="batch-selector">
        <label>Number of Images:</label>
        <input 
          type="number" 
          v-model.number="settings.n" 
          min="1" 
          :max="settings.model === 'dall-e-2' ? 10 : 10"
        />
      </div>
      
      <!-- Actions -->
      <div class="actions">
        <button @click="generateImage" :disabled="loading || !settings.prompt">
          {{ loading ? 'Generating...' : 'Generate Image' }}
        </button>
        <button @click="savePreset" :disabled="!settings.prompt">
          Save as Preset
        </button>
        <button @click="showPresets = true">
          Load Preset
        </button>
      </div>
      
      <!-- Cost Estimate -->
      <div class="cost-estimate">
        <strong>Estimated Cost:</strong> ${{ estimatedCost.toFixed(3) }}
      </div>
      
      <!-- Error Display -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
    
    <!-- Image Gallery -->
    <div class="gallery-panel">
      <UsageTracker :total-cost="totalCost" :total-images="totalImages" />
      <ImageGallery :images="generatedImages" @edit="openEditor" />
    </div>
    
    <!-- Preset Modal -->
    <PresetManager 
      v-if="showPresets" 
      @close="showPresets = false"
      @load="loadPreset"
    />
    
    <!-- Image Editor Modal -->
    <ImageEditor
      v-if="editingImage"
      :image="editingImage"
      @close="editingImage = null"
      @save="handleEditedImage"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useImageGeneration } from '@/composables/useImageGeneration';
import { usePresets } from '@/composables/usePresets';
import ImageGallery from '@/components/ImageGallery.vue';
import UsageTracker from '@/components/UsageTracker.vue';
import PresetManager from '@/components/PresetManager.vue';
import ImageEditor from '@/components/ImageEditor.vue';

const { generate, loading, error } = useImageGeneration();
const { savePreset: savePresetToStorage, loadPresets } = usePresets();

const settings = ref({
  model: 'dall-e-3',
  prompt: '',
  size: '1024x1024',
  quality: 'standard',
  style: 'vivid',
  n: 1
});

const generatedImages = ref([]);
const showPresets = ref(false);
const editingImage = ref(null);
const totalCost = ref(0);
const totalImages = ref(0);

// Model-specific options
const modelConfigs = {
  'gpt-image-1': {
    sizes: ['1024x1024', '1024x1536', '1536x1024'],
    qualities: [
      { value: 'low', label: 'Low', cost: '$0.02' },
      { value: 'medium', label: 'Medium', cost: '$0.07' },
      { value: 'high', label: 'High', cost: '$0.19' }
    ],
    promptLimit: 4000
  },
  'dall-e-3': {
    sizes: ['1024x1024', '1024x1792', '1792x1024'],
    qualities: [
      { value: 'standard', label: 'Standard', cost: '$0.04' },
      { value: 'hd', label: 'HD', cost: '$0.08' }
    ],
    promptLimit: 4000
  },
  'dall-e-2': {
    sizes: ['256x256', '512x512', '1024x1024'],
    qualities: [],
    promptLimit: 1000
  }
};

const availableSizes = computed(() => modelConfigs[settings.value.model].sizes);
const availableQualities = computed(() => modelConfigs[settings.value.model].qualities);

const estimatedCost = computed(() => {
  const model = settings.value.model;
  const size = settings.value.size;
  const quality = settings.value.quality;
  const n = settings.value.n;
  
  const pricing = {
    'gpt-image-1': {
      'low': 0.02,
      'medium': 0.07,
      'high': 0.19
    },
    'dall-e-3': {
      'standard': size === '1024x1024' ? 0.04 : 0.08,
      'hd': size === '1024x1024' ? 0.08 : 0.12
    },
    'dall-e-2': {
      '256x256': 0.016,
      '512x512': 0.018,
      '1024x1024': 0.020
    }
  };
  
  if (model === 'dall-e-2') {
    return pricing[model][size] * n;
  } else {
    return (pricing[model][quality] || 0) * n;
  }
});

function getPromptLimit() {
  return modelConfigs[settings.value.model].promptLimit;
}

function updateAvailableOptions() {
  const config = modelConfigs[settings.value.model];
  settings.value.size = config.sizes[0];
  if (config.qualities.length > 0) {
    settings.value.quality = config.qualities[0].value;
  }
}

async function generateImage() {
  const result = await generate(settings.value);
  
  if (result.success) {
    generatedImages.value.unshift(...result.images);
    totalCost.value += estimatedCost.value;
    totalImages.value += settings.value.n;
  }
}

function savePreset() {
  const presetName = prompt('Enter preset name:');
  if (presetName) {
    savePresetToStorage({
      name: presetName,
      ...settings.value
    });
  }
}

function loadPreset(preset) {
  settings.value = { ...preset };
  showPresets.value = false;
}

function openEditor(image) {
  editingImage.value = image;
}

function handleEditedImage(editedImage) {
  generatedImages.value.unshift(editedImage);
  editingImage.value = null;
}
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  height: 100vh;
  padding: 2rem;
}

.controls-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.prompt-section textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.char-count {
  font-size: 0.875rem;
  color: #666;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

button {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #0066cc;
  color: white;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #0052a3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cost-estimate {
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}

.error-message {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
}
</style>
```

### Image generation composable

```javascript
// composables/useImageGeneration.js
import { ref } from 'vue';
import axios from 'axios';

export function useImageGeneration() {
  const loading = ref(false);
  const error = ref(null);
  
  const generate = async (settings) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/api/generate', settings);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error?.message || 'Generation failed';
      console.error('Generation error:', err);
      return { success: false };
    } finally {
      loading.value = false;
    }
  };
  
  const edit = async (imageFile, maskFile, prompt, settings) => {
    loading.value = true;
    error.value = null;
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (maskFile) formData.append('mask', maskFile);
      formData.append('prompt', prompt);
      formData.append('model', settings.model);
      formData.append('size', settings.size);
      if (settings.quality) formData.append('quality', settings.quality);
      
      const response = await axios.post('/api/edit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Edit failed';
      return { success: false };
    } finally {
      loading.value = false;
    }
  };
  
  return { generate, edit, loading, error };
}
```

## Template and preset management system

A robust preset system enables consistent image generation across a book creation workflow. Store presets locally using JSON files on the backend and localStorage on the frontend.

### Backend preset storage

```javascript
// presetManager.js
const fs = require('fs');
const path = require('path');

class PresetManager {
  constructor(presetsPath = './presets.json') {
    this.presetsPath = presetsPath;
    this.ensureFile();
  }
  
  ensureFile() {
    if (!fs.existsSync(this.presetsPath)) {
      fs.writeFileSync(this.presetsPath, JSON.stringify([], null, 2));
    }
  }
  
  loadPresets() {
    const data = fs.readFileSync(this.presetsPath, 'utf8');
    return JSON.parse(data);
  }
  
  savePreset(preset) {
    const presets = this.loadPresets();
    
    preset.id = Date.now().toString();
    preset.createdAt = new Date().toISOString();
    
    // Check for duplicate names
    const existing = presets.find(p => p.name === preset.name);
    if (existing) {
      throw new Error('Preset name already exists');
    }
    
    presets.push(preset);
    fs.writeFileSync(this.presetsPath, JSON.stringify(presets, null, 2));
    
    return preset;
  }
  
  updatePreset(id, updates) {
    const presets = this.loadPresets();
    const index = presets.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Preset not found');
    }
    
    presets[index] = { ...presets[index], ...updates, updatedAt: new Date().toISOString() };
    fs.writeFileSync(this.presetsPath, JSON.stringify(presets, null, 2));
    
    return presets[index];
  }
  
  deletePreset(id) {
    const presets = this.loadPresets();
    const filtered = presets.filter(p => p.id !== id);
    
    if (filtered.length === presets.length) {
      throw new Error('Preset not found');
    }
    
    fs.writeFileSync(this.presetsPath, JSON.stringify(filtered, null, 2));
  }
  
  getPresetsByCategory(category) {
    const presets = this.loadPresets();
    return presets.filter(p => p.category === category);
  }
}

module.exports = PresetManager;
```

### Preset API endpoints

```javascript
// Add to server.js
const PresetManager = require('./presetManager');
const presetManager = new PresetManager();

app.get('/api/presets', (req, res) => {
  try {
    const presets = presetManager.loadPresets();
    res.json({ success: true, presets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/presets', (req, res) => {
  try {
    const preset = presetManager.savePreset(req.body);
    res.json({ success: true, preset });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/presets/:id', (req, res) => {
  try {
    const preset = presetManager.updatePreset(req.params.id, req.body);
    res.json({ success: true, preset });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/presets/:id', (req, res) => {
  try {
    presetManager.deletePreset(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});
```

### Preset data structure

```json
{
  "id": "1729252800123",
  "name": "Book Cover - Fantasy Style",
  "category": "book-covers",
  "model": "dall-e-3",
  "prompt": "A dramatic fantasy book cover featuring [TITLE], epic lighting, detailed illustration",
  "size": "1024x1792",
  "quality": "hd",
  "style": "vivid",
  "n": 1,
  "notes": "Use for fantasy genre book covers. Replace [TITLE] with actual title.",
  "createdAt": "2025-10-18T10:30:00Z",
  "usageCount": 45,
  "averageCost": 0.12
}
```

## Usage tracking and cost estimation

Implementing comprehensive usage tracking enables budget management and cost optimization. Track every API call with associated costs for accurate reporting.

### SQLite-based usage tracker

```javascript
// usageTracker.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class UsageTracker {
  constructor(dbPath = './usage.db') {
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }
  
  init() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        model TEXT NOT NULL,
        operation TEXT NOT NULL,
        size TEXT NOT NULL,
        quality TEXT,
        style TEXT,
        n INTEGER DEFAULT 1,
        cost REAL NOT NULL,
        prompt_preview TEXT,
        success INTEGER DEFAULT 1,
        error_message TEXT
      )
    `);
    
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON usage(timestamp)
    `);
    
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_model ON usage(model)
    `);
  }
  
  trackUsage(params, success = true, errorMessage = null) {
    return new Promise((resolve, reject) => {
      const cost = this.calculateCost(params);
      
      this.db.run(
        `INSERT INTO usage (
          timestamp, model, operation, size, quality, style, n, cost,
          prompt_preview, success, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          new Date().toISOString(),
          params.model,
          params.operation || 'generation',
          params.size,
          params.quality,
          params.style,
          params.n || 1,
          cost,
          params.prompt?.substring(0, 200),
          success ? 1 : 0,
          errorMessage
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }
  
  calculateCost(params) {
    const { model, size, quality, n = 1 } = params;
    
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
  }
  
  getStats(startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as total_images, SUM(cost) as total_cost, AVG(cost) as avg_cost FROM usage WHERE success = 1';
      const params = [];
      
      if (startDate) {
        query += ' AND timestamp >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND timestamp <= ?';
        params.push(endDate);
      }
      
      this.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  getStatsByModel() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT model, COUNT(*) as count, SUM(cost) as total_cost
         FROM usage WHERE success = 1
         GROUP BY model`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
  
  getRecentUsage(limit = 100) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM usage ORDER BY timestamp DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
  
  close() {
    this.db.close();
  }
}

module.exports = UsageTracker;
```

### Usage tracking endpoints

```javascript
// Add to server.js
const UsageTracker = require('./usageTracker');
const usageTracker = new UsageTracker();

app.get('/api/usage/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await usageTracker.getStats(startDate, endDate);
    const byModel = await usageTracker.getStatsByModel();
    
    res.json({
      success: true,
      stats: {
        ...stats,
        byModel: byModel
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/usage/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const recent = await usageTracker.getRecentUsage(limit);
    res.json({ success: true, usage: recent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Cross-platform deployment considerations

Ensuring the application works seamlessly across Windows, Mac, and Linux requires careful attention to file paths, permissions, and platform-specific behaviors.

### Path handling best practices

Always use Node's `path` module for cross-platform compatibility:

```javascript
const path = require('path');

// CORRECT: Cross-platform
const imagesDir = path.join(__dirname, 'Images');
const filePath = path.join(imagesDir, filename);

// WRONG: Platform-specific
const imagesDir = __dirname + '/Images';  // Fails on Windows
const imagesDir = __dirname + '\\Images'; // Fails on Unix
```

### Directory creation with proper permissions

```javascript
const fs = require('fs');
const path = require('path');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { 
      recursive: true,
      mode: 0o755 // Read/execute for all, write for owner
    });
  }
}

// Create all necessary directories
const directories = ['Images', 'uploads', 'temp'];
directories.forEach(dir => {
  ensureDirectory(path.join(__dirname, dir));
});
```

### Platform-specific configuration

```javascript
// config.js
const os = require('os');
const path = require('path');

const config = {
  platform: os.platform(),
  homeDir: os.homedir(),
  tempDir: os.tmpdir(),
  
  getDataDir() {
    switch (this.platform) {
      case 'win32':
        return path.join(process.env.APPDATA, 'ImageDashboard');
      case 'darwin':
        return path.join(this.homeDir, 'Library', 'Application Support', 'ImageDashboard');
      default: // Linux and others
        return path.join(this.homeDir, '.imagedashboard');
    }
  }
};

module.exports = config;
```

### Packaging for desktop deployment

For distributing as a desktop application, use Electron or similar:

```javascript
// package.json additions for Electron
{
  "scripts": {
    "start": "node server.js",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "nodemon server.js",
    "client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "electron": "electron .",
    "package-win": "electron-builder --win",
    "package-mac": "electron-builder --mac",
    "package-linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.example.imagedashboard",
    "productName": "Image Dashboard",
    "directories": {
      "output": "dist"
    },
    "files": [
      "server.js",
      "client/dist/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": "nsis"
    },
    "mac": {
      "target": "dmg"
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

## Implementation roadmap and final recommendations

### Phase 1: Core functionality (Week 1-2)
1. Set up Express.js backend with environment variable configuration
2. Implement image generation endpoint with GPT Image 1 and DALL-E 3 support
3. Create Vue.js frontend with basic generation interface
4. Implement local image saving to Images/ folder
5. Add error handling and retry logic with exponential backoff

### Phase 2: Advanced features (Week 3-4)
1. Add image editing endpoint with file upload support (multer)
2. Implement mask creation tools in frontend
3. Build preset management system with JSON storage
4. Create usage tracking with SQLite database
5. Add cost estimation and display

### Phase 3: Polish and optimization (Week 5)
1. Implement DALL-E 2 support for variations and legacy compatibility
2. Add batch generation with progress tracking
3. Create image gallery with filtering and search
4. Add export functionality for images and usage reports
5. Cross-platform testing and bug fixes

### Technology stack summary

**Backend:**
- Express.js 4.x for web server
- axios with axios-retry for API calls
- multer for file uploads
- sqlite3 or better-sqlite3 for usage tracking
- dotenv for environment configuration
- fs-extra for enhanced filesystem operations

**Frontend:**
- Vue 3 with Composition API
- Vuetify or Tailwind CSS for UI components
- Pinia for state management
- axios for API communication
- Modern JavaScript (ES6+)

**Development:**
- nodemon for hot reloading backend
- Vite for Vue.js development
- ESLint for code quality
- concurrently for running multiple processes

### Security checklist for production

✓ Store API keys exclusively in .env files never committed to version control  
✓ Implement backend proxy pattern to hide keys from frontend  
✓ Add .env to .gitignore along with Images/, uploads/, and node_modules/  
✓ Use HTTPS in production with proper SSL certificates  
✓ Implement rate limiting on API endpoints to prevent abuse  
✓ Validate and sanitize all user inputs  
✓ Set proper CORS configuration restricting allowed origins  
✓ Add request size limits to prevent DOS attacks  
✓ Implement user authentication if sharing with multiple users  
✓ Regularly rotate API keys and monitor usage for anomalies

### Cost optimization strategies

For book creation workflows requiring many images, consider these optimization approaches:

**Use DALL-E 3 standard quality** ($0.04 per 1024x1024 image) as the default for most use cases. Reserve HD quality for hero images or covers where exceptional detail is critical.

**Implement preset templates** with proven prompts that generate consistent results, reducing failed generations and retries. Track success rates per preset and iterate on underperforming templates.

**Batch similar generations** together to maximize efficiency. Generate multiple variations in a single session when exploring concepts, then select the best result rather than iterating one at a time.

**Use GPT Image 1 medium quality** ($0.07) when editing capabilities are needed, as it offers the best balance of quality and cost for iterative workflows. Reserve high quality ($0.19) for final production images.

**Cache and reuse** generated images whenever possible. Build a library of background elements, objects, and scenes that can be referenced rather than regenerated.

This comprehensive technical implementation plan provides everything needed to build a production-ready OpenAI image generation dashboard. The modular architecture allows incremental development while maintaining security, cross-platform compatibility, and cost awareness throughout the application lifecycle.