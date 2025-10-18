<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal wizard-modal">
      <div class="modal-header">
        <h2>Welcome to Todd Image Dashboard</h2>
        <button @click="handleClose" class="btn-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="wizard-progress">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="progress-step"
            :class="{
              active: currentStep === index,
              completed: currentStep > index
            }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <div class="wizard-content">
          <!-- Step 1: Welcome -->
          <div v-if="currentStep === 0" class="wizard-step">
            <div class="step-icon">👋</div>
            <h3>Welcome to AI Image Generation!</h3>
            <p class="step-description">
              This dashboard helps you create amazing images using AI. Whether you're creating
              educational materials, visual aids, or creative content for your students,
              we'll guide you through every step.
            </p>
            <div class="feature-list">
              <div class="feature-item">
                <span class="feature-icon">🎨</span>
                <div>
                  <strong>Multiple AI Models</strong>
                  <p>Choose from GPT Image 1, DALL-E 3, and DALL-E 2</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📦</span>
                <div>
                  <strong>Pre-made Templates</strong>
                  <p>Use educational presets to get started quickly</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💰</span>
                <div>
                  <strong>Cost Tracking</strong>
                  <p>Monitor your API usage and spending</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: API Key Setup -->
          <div v-if="currentStep === 1" class="wizard-step">
            <div class="step-icon">🔑</div>
            <h3>Set Up Your OpenAI API Key</h3>
            <p class="step-description">
              You'll need an OpenAI API key to generate images. Don't worry - we'll show you
              exactly how to get one!
            </p>

            <div v-if="hasApiKey" class="status-indicator status-success">
              <span class="status-icon">✓</span>
              <span>API key is already configured!</span>
            </div>
            <div v-else class="status-indicator status-warning">
              <span class="status-icon">⚠</span>
              <span>No API key configured yet</span>
            </div>

            <div class="api-key-steps">
              <h4>How to get your API key:</h4>
              <ol>
                <li>Go to <a href="https://platform.openai.com/signup" target="_blank">OpenAI Platform</a></li>
                <li>Sign up or log in to your account</li>
                <li>Navigate to <strong>API Keys</strong> in the sidebar</li>
                <li>Click <strong>Create new secret key</strong></li>
                <li>Copy the key and add it in Settings</li>
              </ol>
              <button v-if="!hasApiKey" @click="openSettings" class="btn-primary">
                🔑 Configure API Key Now
              </button>
            </div>

            <div class="info-note">
              <strong>Note:</strong> Your API key is stored securely in your browser and
              never shared. You'll be billed by OpenAI based on usage.
            </div>
          </div>

          <!-- Step 3: Interface Overview -->
          <div v-if="currentStep === 2" class="wizard-step">
            <div class="step-icon">🖥️</div>
            <h3>Dashboard Overview</h3>
            <p class="step-description">
              Let's take a quick tour of the main interface components.
            </p>

            <div class="interface-guide">
              <div class="guide-item">
                <div class="guide-number">1</div>
                <div class="guide-content">
                  <strong>Control Panel (Left)</strong>
                  <p>This is where you'll configure your image settings:</p>
                  <ul>
                    <li>Choose AI model (GPT Image 1, DALL-E 3, DALL-E 2)</li>
                    <li>Write your prompt (description of what you want)</li>
                    <li>Select image size and quality</li>
                    <li>Load and save presets for quick access</li>
                  </ul>
                </div>
              </div>

              <div class="guide-item">
                <div class="guide-number">2</div>
                <div class="guide-content">
                  <strong>Gallery & Stats (Right)</strong>
                  <p>See your results and track usage:</p>
                  <ul>
                    <li>View generated images in a gallery</li>
                    <li>Download images for your projects</li>
                    <li>Track session costs and image count</li>
                    <li>Access additional tools like image editing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Using Presets -->
          <div v-if="currentStep === 3" class="wizard-step">
            <div class="step-icon">📦</div>
            <h3>Using Presets</h3>
            <p class="step-description">
              Presets are pre-configured settings that make it easy to generate specific
              types of images. Perfect for recurring tasks!
            </p>

            <div class="preset-benefits">
              <div class="benefit-card">
                <span class="benefit-icon">⚡</span>
                <strong>Fast & Easy</strong>
                <p>One click to load all settings</p>
              </div>
              <div class="benefit-card">
                <span class="benefit-icon">🎯</span>
                <strong>Consistent Results</strong>
                <p>Same settings every time</p>
              </div>
              <div class="benefit-card">
                <span class="benefit-icon">📚</span>
                <strong>Organized</strong>
                <p>Group by category and purpose</p>
              </div>
            </div>

            <div class="preset-example">
              <h4>Example: Educational Content Preset</h4>
              <div class="example-box">
                <p><strong>Name:</strong> Science Diagram</p>
                <p><strong>Model:</strong> GPT Image 1</p>
                <p><strong>Category:</strong> Educational</p>
                <p><strong>Prompt Template:</strong> "Educational diagram showing..."</p>
              </div>
              <p class="example-tip">
                <strong>Tip:</strong> After generating images you like, save the settings
                as a preset to reuse them later!
              </p>
            </div>
          </div>

          <!-- Step 5: Prompt Writing Tips -->
          <div v-if="currentStep === 4" class="wizard-step">
            <div class="step-icon">✍️</div>
            <h3>Writing Great Prompts</h3>
            <p class="step-description">
              The quality of your images depends on how you describe them. Here are some
              tips to help you write effective prompts.
            </p>

            <div class="tips-grid">
              <div class="tip-card">
                <h4>✓ Be Specific</h4>
                <p class="tip-good">Good: "A friendly golden retriever puppy sitting in a green meadow with butterflies"</p>
                <p class="tip-bad">Bad: "A dog"</p>
              </div>

              <div class="tip-card">
                <h4>✓ Include Details</h4>
                <p class="tip-good">Good: "Educational diagram of the water cycle, simple style, labeled arrows, bright colors"</p>
                <p class="tip-bad">Bad: "Water cycle"</p>
              </div>

              <div class="tip-card">
                <h4>✓ Specify Style</h4>
                <p class="tip-good">Good: "Cartoon illustration of solar system, child-friendly, colorful, simple shapes"</p>
                <p class="tip-bad">Bad: "Solar system picture"</p>
              </div>

              <div class="tip-card">
                <h4>✓ Use Context</h4>
                <p class="tip-good">Good: "Classroom poster showing parts of a plant, clean design, labels visible"</p>
                <p class="tip-bad">Bad: "Plant parts"</p>
              </div>
            </div>

            <div class="prompt-formula">
              <h4>Simple Formula:</h4>
              <p class="formula-text">
                <strong>[Subject]</strong> + <strong>[Details]</strong> + <strong>[Style]</strong> + <strong>[Purpose]</strong>
              </p>
              <p class="formula-example">
                Example: "A diagram of the human heart, labeled parts, educational illustration, suitable for 10-year-olds"
              </p>
            </div>
          </div>

          <!-- Step 6: Ready to Start -->
          <div v-if="currentStep === 5" class="wizard-step">
            <div class="step-icon">🚀</div>
            <h3>You're All Set!</h3>
            <p class="step-description">
              You now know the basics of using the Todd Image Dashboard. Here's a quick
              recap and some final tips.
            </p>

            <div class="final-checklist">
              <div class="checklist-item" :class="{ checked: hasApiKey }">
                <span class="check-icon">{{ hasApiKey ? '✓' : '○' }}</span>
                <span>API Key configured</span>
              </div>
              <div class="checklist-item checked">
                <span class="check-icon">✓</span>
                <span>Dashboard tour completed</span>
              </div>
              <div class="checklist-item checked">
                <span class="check-icon">✓</span>
                <span>Learned about presets</span>
              </div>
              <div class="checklist-item checked">
                <span class="check-icon">✓</span>
                <span>Prompt writing tips reviewed</span>
              </div>
            </div>

            <div class="next-steps">
              <h4>Suggested First Steps:</h4>
              <ol>
                <li>Try one of the pre-made educational presets</li>
                <li>Experiment with different AI models to see which you prefer</li>
                <li>Start with simple prompts and gradually add more details</li>
                <li>Save your favorite settings as custom presets</li>
              </ol>
            </div>

            <div class="help-reminder">
              <strong>Need Help?</strong> Click the <strong>Quick Start</strong> button
              in the header anytime to review this guide.
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button
          v-if="currentStep > 0"
          @click="previousStep"
          class="secondary"
        >
          ← Previous
        </button>
        <div class="footer-spacer"></div>
        <button
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          class="primary"
        >
          Next →
        </button>
        <button
          v-else
          @click="finish"
          class="primary"
        >
          Get Started! 🎉
        </button>
        <button
          @click="handleClose"
          class="secondary small"
        >
          Skip
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['close', 'open-settings']);

const currentStep = ref(0);

const steps = [
  { label: 'Welcome' },
  { label: 'API Key' },
  { label: 'Interface' },
  { label: 'Presets' },
  { label: 'Prompts' },
  { label: 'Ready' }
];

const hasApiKey = computed(() => {
  const key = localStorage.getItem('openai_api_key');
  return key && key.trim().length > 0;
});

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function openSettings() {
  emit('open-settings');
}

function finish() {
  // Mark wizard as completed
  localStorage.setItem('wizard_completed', 'true');
  emit('close');
}

function handleClose() {
  // Mark wizard as completed even if skipped
  localStorage.setItem('wizard_completed', 'true');
  emit('close');
}
</script>

<style scoped>
.wizard-modal {
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.wizard-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 1.25rem;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.progress-step.completed:not(:last-child)::after {
  background: var(--primary-color);
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.progress-step.active .step-number {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.progress-step.completed .step-number {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.step-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

.progress-step.active .step-label {
  color: var(--primary-color);
  font-weight: 600;
}

.wizard-content {
  min-height: 400px;
}

.wizard-step {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.wizard-step h3 {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
}

.step-description {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-item strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.feature-item p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  margin: 1.5rem 0;
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

.api-key-steps {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius);
  border-left: 3px solid var(--primary-color);
  margin-bottom: 1.5rem;
}

.api-key-steps h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.api-key-steps ol {
  margin: 0 0 1rem 1.5rem;
  padding: 0;
  color: var(--text-secondary);
  line-height: 1.8;
}

.api-key-steps a {
  color: var(--primary-color);
  text-decoration: none;
}

.api-key-steps a:hover {
  text-decoration: underline;
}

.btn-primary {
  width: 100%;
  margin-top: 0.5rem;
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

.interface-guide {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.guide-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.guide-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.guide-content strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 1.0625rem;
}

.guide-content p {
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.guide-content ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

.preset-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.benefit-card {
  text-align: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.benefit-icon {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.benefit-card strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.benefit-card p {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin: 0;
}

.preset-example {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius);
  border-left: 3px solid var(--primary-color);
}

.preset-example h4 {
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.example-box {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.example-box p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.example-tip {
  color: var(--primary-color);
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.tip-card {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.tip-card h4 {
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.tip-good {
  font-size: 0.8125rem;
  padding: 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #16a34a;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.tip-bad {
  font-size: 0.8125rem;
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #dc2626;
  border-radius: 4px;
  color: var(--text-secondary);
  margin: 0;
}

.prompt-formula {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 2px solid var(--primary-color);
  text-align: center;
}

.prompt-formula h4 {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.formula-text {
  font-size: 1.0625rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-weight: 600;
}

.formula-example {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

.final-checklist {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--text-secondary);
}

.checklist-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.checklist-item.checked {
  color: #16a34a;
}

.check-icon {
  font-weight: 700;
  font-size: 1.25rem;
}

.next-steps {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius);
  border-left: 3px solid var(--primary-color);
  margin-bottom: 1.5rem;
}

.next-steps h4 {
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.next-steps ol {
  margin: 0 0 0 1.5rem;
  padding: 0;
  color: var(--text-secondary);
  line-height: 1.8;
}

.help-reminder {
  text-align: center;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.help-reminder strong {
  color: var(--primary-color);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.footer-spacer {
  flex: 1;
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

@media (max-width: 768px) {
  .wizard-progress {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .progress-step {
    min-width: 80px;
  }

  .progress-step:not(:last-child)::after {
    display: none;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .preset-benefits {
    grid-template-columns: 1fr;
  }
}
</style>
