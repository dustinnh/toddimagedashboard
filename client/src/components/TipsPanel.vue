<template>
  <div class="tips-panel card" :class="{ collapsed: isCollapsed }">
    <div class="tips-header" @click="toggleCollapse">
      <div class="header-left">
        <span class="tip-icon">💡</span>
        <h3>Helpful Tips</h3>
      </div>
      <button class="btn-collapse" :title="isCollapsed ? 'Show tips' : 'Hide tips'">
        {{ isCollapsed ? '▼' : '▲' }}
      </button>
    </div>

    <div v-if="!isCollapsed" class="tips-content">
      <div class="current-tip">
        <div class="tip-category">{{ currentTip.category }}</div>
        <div class="tip-text">{{ currentTip.text }}</div>
        <div v-if="currentTip.example" class="tip-example">
          <strong>Example:</strong> "{{ currentTip.example }}"
        </div>
      </div>

      <div class="tip-navigation">
        <button @click="previousTip" class="btn-nav" title="Previous tip">
          ←
        </button>
        <div class="tip-indicator">
          <span v-for="(tip, index) in tips" :key="index" class="dot" :class="{ active: index === currentTipIndex }"></span>
        </div>
        <button @click="nextTip" class="btn-nav" title="Next tip">
          →
        </button>
      </div>

      <div class="quick-links">
        <button @click="filterByCategory('prompts')" class="link-btn" :class="{ active: selectedCategory === 'prompts' }">
          ✍️ Prompt Tips
        </button>
        <button @click="filterByCategory('models')" class="link-btn" :class="{ active: selectedCategory === 'models' }">
          🤖 Model Info
        </button>
        <button @click="filterByCategory('best-practices')" class="link-btn" :class="{ active: selectedCategory === 'best-practices' }">
          ⭐ Best Practices
        </button>
        <button @click="resetFilter" class="link-btn" :class="{ active: !selectedCategory }">
          📚 All Tips
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isCollapsed = ref(false);
const currentTipIndex = ref(0);
const selectedCategory = ref(null);
let autoRotateInterval = null;

const allTips = [
  // Prompt Writing Tips
  {
    category: 'Prompt Writing',
    type: 'prompts',
    text: 'Be specific with details. Instead of "a dog", try "a friendly golden retriever puppy sitting in a green meadow"',
    example: 'Educational poster of the water cycle, simple labeled diagram, bright colors, suitable for 3rd grade'
  },
  {
    category: 'Prompt Writing',
    type: 'prompts',
    text: 'Include the intended audience or age group in your prompt for age-appropriate imagery',
    example: 'Simple illustration of sharing toys, appropriate for kindergarten students, friendly cartoon style'
  },
  {
    category: 'Prompt Writing',
    type: 'prompts',
    text: 'Specify the style you want: cartoon, photorealistic, watercolor, simple illustration, etc.',
    example: 'Diagram of human heart with labeled parts, medical illustration style, clear and educational'
  },
  {
    category: 'Prompt Writing',
    type: 'prompts',
    text: 'Add context about how the image will be used (poster, flashcard, visual schedule, etc.)',
    example: 'Icon-style illustration of brushing teeth for visual schedule, simple and clear, white background'
  },
  {
    category: 'Prompt Writing',
    type: 'prompts',
    text: 'Use placeholder text like [ITEM] or [EMOTION] in your presets so you can easily customize them',
    example: 'Friendly cartoon face showing [EMOTION], simple and clear for emotion cards'
  },

  // Model Information
  {
    category: 'Model Selection',
    type: 'models',
    text: 'GPT Image 1 is best for diagrams, educational content, and images with text or labels',
    example: null
  },
  {
    category: 'Model Selection',
    type: 'models',
    text: 'DALL-E 3 excels at creative, artistic images and following complex prompts accurately',
    example: null
  },
  {
    category: 'Model Selection',
    type: 'models',
    text: 'DALL-E 2 is most cost-effective and great for simpler images or when you need multiple variations',
    example: null
  },
  {
    category: 'Model Selection',
    type: 'models',
    text: 'Use "Standard" quality for most educational materials - it\'s more cost-effective and usually sufficient',
    example: null
  },
  {
    category: 'Model Selection',
    type: 'models',
    text: 'HD quality costs more but provides sharper details - use it for posters or materials that will be printed large',
    example: null
  },

  // Best Practices
  {
    category: 'Best Practices',
    type: 'best-practices',
    text: 'Save successful prompts as presets so you can reuse them with different subjects',
    example: null
  },
  {
    category: 'Best Practices',
    type: 'best-practices',
    text: 'Start with existing presets and customize them - it\'s faster than starting from scratch',
    example: null
  },
  {
    category: 'Best Practices',
    type: 'best-practices',
    text: 'Generate multiple versions (increase the "n" parameter) to have options to choose from',
    example: null
  },
  {
    category: 'Best Practices',
    type: 'best-practices',
    text: 'Keep track of your costs in Settings - Standard quality images cost much less than HD',
    example: null
  },
  {
    category: 'Best Practices',
    type: 'best-practices',
    text: 'Use the Edit feature (inpainting) to modify specific parts of an image rather than regenerating',
    example: null
  },
  {
    category: 'Best Practices',
    type: 'best-practices',
    text: 'For consistency across a series (like social stories), mention keeping the same style/character in your prompt',
    example: null
  },

  // Accessibility & Inclusion
  {
    category: 'Accessibility',
    type: 'best-practices',
    text: 'Request "simple and clear" visuals for students with different learning needs',
    example: 'Simple, uncluttered illustration of morning routine, clear steps, minimal distractions'
  },
  {
    category: 'Accessibility',
    type: 'best-practices',
    text: 'Use "white background" or "minimal background" for visual schedules and flashcards to reduce visual clutter',
    example: null
  },
  {
    category: 'Accessibility',
    type: 'best-practices',
    text: 'Specify "diverse" or "inclusive" in prompts to ensure representation that reflects your classroom',
    example: 'Diverse group of children playing together, inclusive representation, friendly style'
  },

  // Cost Management
  {
    category: 'Cost Management',
    type: 'best-practices',
    text: 'DALL-E 2 is 4-5x cheaper than DALL-E 3 - use it for simple images and testing prompts',
    example: null
  },
  {
    category: 'Cost Management',
    type: 'best-practices',
    text: 'Test your prompts with Standard quality before generating HD versions',
    example: null
  },
  {
    category: 'Cost Management',
    type: 'best-practices',
    text: 'Use 1024x1024 size for most purposes - larger sizes cost more and aren\'t always necessary',
    example: null
  },

  // Educational Strategies
  {
    category: 'Educational Use',
    type: 'best-practices',
    text: 'For sequential activities, number your steps in the prompt: "Step 1: [action], Step 2: [action]"',
    example: null
  },
  {
    category: 'Educational Use',
    type: 'best-practices',
    text: 'Add "encouraging" or "positive" to prompts for behavior and social skills materials',
    example: 'Positive illustration of raising hand in class, encouraging style, clear and friendly'
  },
  {
    category: 'Educational Use',
    type: 'best-practices',
    text: 'Request "labeled" diagrams when you need text on the image for educational purposes',
    example: null
  },
  {
    category: 'Educational Use',
    type: 'best-practices',
    text: 'For emotion cards, specify "clear facial expression" to ensure emotions are easy to identify',
    example: null
  }
];

const tips = computed(() => {
  if (!selectedCategory.value) {
    return allTips;
  }
  return allTips.filter(tip => tip.type === selectedCategory.value);
});

const currentTip = computed(() => {
  return tips.value[currentTipIndex.value] || tips.value[0];
});

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  if (isCollapsed.value) {
    stopAutoRotate();
  } else {
    startAutoRotate();
  }
}

function nextTip() {
  currentTipIndex.value = (currentTipIndex.value + 1) % tips.value.length;
  resetAutoRotate();
}

function previousTip() {
  currentTipIndex.value = (currentTipIndex.value - 1 + tips.value.length) % tips.value.length;
  resetAutoRotate();
}

function filterByCategory(category) {
  selectedCategory.value = category;
  currentTipIndex.value = 0;
  resetAutoRotate();
}

function resetFilter() {
  selectedCategory.value = null;
  currentTipIndex.value = 0;
  resetAutoRotate();
}

function startAutoRotate() {
  stopAutoRotate();
  autoRotateInterval = setInterval(() => {
    nextTip();
  }, 15000); // Rotate every 15 seconds
}

function stopAutoRotate() {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval);
    autoRotateInterval = null;
  }
}

function resetAutoRotate() {
  stopAutoRotate();
  if (!isCollapsed.value) {
    startAutoRotate();
  }
}

onMounted(() => {
  // Check if user wants tips collapsed by default
  const collapsed = localStorage.getItem('tips_collapsed');
  if (collapsed === 'true') {
    isCollapsed.value = true;
  } else {
    startAutoRotate();
  }
});

onUnmounted(() => {
  stopAutoRotate();
  // Save collapsed state
  localStorage.setItem('tips_collapsed', isCollapsed.value.toString());
});
</script>

<style scoped>
.tips-panel {
  margin-bottom: 1.5rem;
  border-left: 3px solid var(--primary-color);
  transition: all 0.3s;
}

.tips-panel.collapsed {
  border-left-color: var(--border-color);
}

.tips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 1rem;
  margin: -1rem -1rem 1rem -1rem;
  border-radius: var(--radius) var(--radius) 0 0;
  transition: background 0.2s;
}

.tips-header:hover {
  background: var(--bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tip-icon {
  font-size: 1.25rem;
}

.tips-header h3 {
  font-size: 0.9375rem;
  margin: 0;
  color: var(--text-primary);
}

.btn-collapse {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-collapse:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.tips-content {
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

.current-tip {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  min-height: 120px;
}

.tip-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.tip-text {
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.tip-example {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-style: italic;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 4px;
  border-left: 2px solid var(--primary-color);
}

.tip-example strong {
  color: var(--primary-color);
  font-style: normal;
}

.tip-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn-nav {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-nav:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: scale(1.1);
}

.tip-indicator {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border-color);
  transition: all 0.3s;
}

.dot.active {
  background: var(--primary-color);
  width: 8px;
  height: 8px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.link-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.link-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.link-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .quick-links {
    grid-template-columns: 1fr;
  }
}
</style>
