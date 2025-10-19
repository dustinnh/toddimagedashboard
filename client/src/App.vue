<template>
  <div class="app">
    <header class="app-header">
      <div class="container header-content">
        <div class="header-text">
          <h1>Todd Image Dashboard</h1>
          <p class="subtitle">AI-Powered Educational Image Generation</p>
        </div>
        <div class="header-actions">
          <a href="/INSTALL.html" target="_blank" class="btn-install-guide" title="Installation Guide">
            📖 Install Guide
          </a>
          <button @click="showWizard = true" class="btn-quick-start" title="Quick Start Guide">
            🚀 Quick Start
          </button>
          <button @click="showSettings = true" class="btn-settings" title="Settings">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <div class="dashboard-layout">
          <!-- Left Panel: Generation Controls -->
          <div class="control-panel">
            <GeneratePanel
              @image-generated="handleImageGenerated"
              @cost-update="handleCostUpdate"
            />
          </div>

          <!-- Right Panel: Gallery and Stats -->
          <div class="content-panel">
            <UsageDisplay
              :session-cost="sessionCost"
              :session-images="sessionImages"
              class="mb-2"
            />

            <!-- Additional Tools -->
            <div class="tools-bar card mb-2">
              <h3>Additional Tools</h3>
              <div class="tools-buttons">
                <button @click="showEditor = true" class="secondary">
                  🎨 Edit Image (Inpainting)
                </button>
                <button @click="showVariations = true" class="secondary">
                  🔄 Create Variations
                </button>
              </div>
            </div>

            <ImageGallery
              :images="generatedImages"
              @refresh="refreshStats"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <WelcomeWizard
      v-if="showWizard"
      @close="showWizard = false"
      @open-settings="handleOpenSettingsFromWizard"
    />

    <SettingsModal
      v-if="showSettings"
      @close="showSettings = false"
      @saved="handleSettingsSaved"
    />

    <ImageEditor
      v-if="showEditor"
      @close="showEditor = false"
      @edited="handleEdited"
    />

    <ImageVariations
      v-if="showVariations"
      @close="showVariations = false"
      @created="handleVariationsCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import GeneratePanel from './components/GeneratePanel.vue';
import ImageGallery from './components/ImageGallery.vue';
import UsageDisplay from './components/UsageDisplay.vue';
import ImageEditor from './components/ImageEditor.vue';
import ImageVariations from './components/ImageVariations.vue';
import SettingsModal from './components/SettingsModal.vue';
import WelcomeWizard from './components/WelcomeWizard.vue';
import { useUsageTracking } from './composables/useUsageTracking';

const generatedImages = ref([]);
const sessionCost = ref(0);
const sessionImages = ref(0);
const showEditor = ref(false);
const showVariations = ref(false);
const showSettings = ref(false);
const showWizard = ref(false);

const { loadSessionStats } = useUsageTracking();

// Load existing images from server
const loadExistingImages = async () => {
  try {
    const response = await axios.get('/api/images');
    if (response.data.success && response.data.images) {
      generatedImages.value = response.data.images;
    }
  } catch (error) {
    console.error('Error loading existing images:', error);
  }
};

// Check if this is first time user and show wizard
onMounted(() => {
  const wizardCompleted = localStorage.getItem('wizard_completed');
  const apiKey = localStorage.getItem('openai_api_key');

  // Show wizard for first-time users (no wizard completed flag)
  if (!wizardCompleted) {
    setTimeout(() => {
      showWizard.value = true;
    }, 500);
  }
  // If wizard was completed but no API key, show settings
  else if (!apiKey) {
    setTimeout(() => {
      showSettings.value = true;
    }, 500);
  }
});

onMounted(async () => {
  await refreshStats();
  await loadExistingImages();
});

const handleImageGenerated = (result) => {
  if (result.success && result.images) {
    // Add new images to the beginning of the array
    generatedImages.value.unshift(...result.images);
    refreshStats();
  }
};

const handleCostUpdate = (cost) => {
  sessionCost.value += cost;
};

const refreshStats = async () => {
  const stats = await loadSessionStats();
  if (stats) {
    sessionCost.value = stats.total_cost || 0;
    sessionImages.value = stats.images_generated || 0;
  }
};

const handleEdited = (result) => {
  if (result.success && result.images) {
    generatedImages.value.unshift(...result.images);
    sessionCost.value += result.cost;
    refreshStats();
  }
};

const handleVariationsCreated = (result) => {
  if (result.success && result.images) {
    generatedImages.value.unshift(...result.images);
    sessionCost.value += result.cost;
    refreshStats();
  }
};

const handleSettingsSaved = () => {
  // Refresh stats or perform any necessary updates
  console.log('Settings saved');
};

const handleOpenSettingsFromWizard = () => {
  // Close wizard and open settings
  showWizard.value = false;
  setTimeout(() => {
    showSettings.value = true;
  }, 100);
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-text {
  flex: 1;
}

.app-header h1 {
  color: white;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-install-guide,
.btn-quick-start,
.btn-settings {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  text-decoration: none;
}

.btn-install-guide:hover,
.btn-quick-start:hover,
.btn-settings:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .btn-install-guide,
  .btn-quick-start,
  .btn-settings {
    flex: 1;
    justify-content: center;
    min-width: 140px;
  }
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 2rem;
  align-items: start;
}

.control-panel {
  position: sticky;
  top: 2rem;
}

.content-panel {
  min-height: 600px;
}

.tools-bar h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.tools-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.tools-buttons button {
  width: 100%;
}

@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .control-panel {
    position: static;
  }
}
</style>
