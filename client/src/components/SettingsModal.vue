<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Settings</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div class="settings-section">
          <h3>OpenAI API Configuration</h3>
          <p class="section-description">
            Enter your OpenAI API key to use the image generation features.
            Your key is stored securely in your browser and is never shared.
          </p>

          <div class="form-group">
            <label for="api-key">
              OpenAI API Key*
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                class="help-link"
                title="Get your API key from OpenAI"
              >
                (Get API Key)
              </a>
            </label>
            <div class="api-key-input-group">
              <input
                id="api-key"
                :type="showApiKey ? 'text' : 'password'"
                v-model="apiKey"
                placeholder="sk-proj-..."
                class="api-key-input"
                :class="{ 'has-value': apiKey }"
              />
              <button
                @click="showApiKey = !showApiKey"
                class="btn-toggle-visibility"
                type="button"
                :title="showApiKey ? 'Hide API key' : 'Show API key'"
              >
                {{ showApiKey ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="form-hint">
              Your API key starts with "sk-" and can be found at
              <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a>
            </span>
          </div>

          <div class="api-key-status">
            <div v-if="hasApiKey" class="status-indicator status-success">
              <span class="status-icon">✓</span>
              <span>API key is configured</span>
            </div>
            <div v-else class="status-indicator status-warning">
              <span class="status-icon">⚠</span>
              <span>No API key configured - image generation will not work</span>
            </div>
          </div>

          <div class="api-key-info">
            <h4>Where to get your API key:</h4>
            <ol>
              <li>Go to <a href="https://platform.openai.com/signup" target="_blank">OpenAI Platform</a></li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to <strong>API Keys</strong> in the left sidebar</li>
              <li>Click <strong>Create new secret key</strong></li>
              <li>Copy the key and paste it above</li>
            </ol>

            <div class="info-note">
              <strong>Important:</strong> Your API key is billed by OpenAI based on usage.
              Keep your key secure and never share it with others.
            </div>
          </div>
        </div>

        <div class="settings-section">
          <h3>Cost Tracking</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Spent (Session)</div>
              <div class="stat-value">${{ sessionCost.toFixed(3) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Images Generated</div>
              <div class="stat-value">{{ imageCount }}</div>
            </div>
          </div>
          <button @click="resetStats" class="secondary small">
            Reset Session Stats
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="secondary">Cancel</button>
        <button @click="saveSettings" :disabled="saving || !apiKey.trim()">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['close', 'saved']);

const apiKey = ref('');
const showApiKey = ref(false);
const saving = ref(false);
const error = ref(null);
const successMessage = ref(null);
const sessionCost = ref(0);
const imageCount = ref(0);

const hasApiKey = computed(() => {
  return apiKey.value && apiKey.value.trim().length > 0;
});

onMounted(() => {
  loadSettings();
  loadStats();
});

function loadSettings() {
  try {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      apiKey.value = stored;
    }
  } catch (err) {
    console.error('Error loading API key:', err);
  }
}

function loadStats() {
  try {
    // Check for various possible stat storage keys
    const cost = localStorage.getItem('session_cost') || localStorage.getItem('sessionCost') || '0';
    const count = localStorage.getItem('image_count') || localStorage.getItem('sessionImages') || '0';

    sessionCost.value = parseFloat(cost);
    imageCount.value = parseInt(count);
  } catch (err) {
    console.error('Error loading stats:', err);
    sessionCost.value = 0;
    imageCount.value = 0;
  }
}

function saveSettings() {
  error.value = null;
  successMessage.value = null;
  saving.value = true;

  try {
    // Validate API key format
    const key = apiKey.value.trim();
    if (!key.startsWith('sk-')) {
      error.value = 'Invalid API key format. OpenAI keys start with "sk-"';
      saving.value = false;
      return;
    }

    // Save to localStorage
    localStorage.setItem('openai_api_key', key);

    successMessage.value = 'Settings saved successfully!';

    // Emit saved event
    emit('saved');

    // Close after 1 second
    setTimeout(() => {
      emit('close');
    }, 1000);

  } catch (err) {
    error.value = 'Failed to save settings: ' + err.message;
  } finally {
    saving.value = false;
  }
}

function resetStats() {
  if (confirm('Reset session statistics? This cannot be undone.')) {
    localStorage.setItem('session_cost', '0');
    localStorage.setItem('image_count', '0');
    sessionCost.value = 0;
    imageCount.value = 0;
  }
}
</script>

<style scoped>
.modal {
  max-width: 600px;
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

.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.settings-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.section-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.help-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.help-link:hover {
  text-decoration: underline;
}

.api-key-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.api-key-input {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
}

.api-key-input.has-value {
  border-color: var(--primary-color);
}

.btn-toggle-visibility {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
}

.btn-toggle-visibility:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

.api-key-status {
  margin-top: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.status-success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-warning {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.status-icon {
  font-size: 1rem;
}

.api-key-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border-left: 3px solid var(--primary-color);
}

.api-key-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.api-key-info ol {
  margin: 0 0 1rem 1.5rem;
  padding: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.api-key-info ol li {
  margin-bottom: 0.25rem;
}

.api-key-info a {
  color: var(--primary-color);
  text-decoration: none;
}

.api-key-info a:hover {
  text-decoration: underline;
}

.info-note {
  padding: 0.75rem;
  background: rgba(234, 179, 8, 0.1);
  border-radius: 4px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.info-note strong {
  color: #ca8a04;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
</style>
