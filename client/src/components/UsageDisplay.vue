<template>
  <div class="usage-display card">
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Session Cost</div>
        <div class="stat-value">${{ sessionCost.toFixed(3) }}</div>
      </div>

      <div class="stat-item">
        <div class="stat-label">Images Generated</div>
        <div class="stat-value">{{ sessionImages }}</div>
      </div>

      <div class="stat-item">
        <div class="stat-label">Avg Cost / Image</div>
        <div class="stat-value">
          ${{ sessionImages > 0 ? (sessionCost / sessionImages).toFixed(3) : '0.000' }}
        </div>
      </div>

      <div class="stat-actions">
        <button @click="showStats = true" class="small secondary">
          View All Stats
        </button>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStats" class="modal-overlay" @click.self="showStats = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Usage Statistics</h2>
          <button @click="showStats = false" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="loadingStats" class="text-center">
            <span class="loading"></span> Loading statistics...
          </div>

          <div v-else-if="stats">
            <div class="stats-section">
              <h3>Overall Statistics</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Total Requests:</span>
                  <span class="detail-value">{{ stats.total_images || 0 }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Images Generated:</span>
                  <span class="detail-value">{{ stats.total_generated || 0 }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Cost:</span>
                  <span class="detail-value">${{ (stats.total_cost || 0).toFixed(3) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Average Cost:</span>
                  <span class="detail-value">${{ (stats.avg_cost || 0).toFixed(3) }}</span>
                </div>
              </div>
            </div>

            <div v-if="stats.byModel && stats.byModel.length > 0" class="stats-section">
              <h3>Usage by Model</h3>
              <div class="model-stats">
                <div v-for="model in stats.byModel" :key="model.model" class="model-stat-item">
                  <div class="model-name">{{ model.model }}</div>
                  <div class="model-details">
                    <span>{{ model.images_generated }} images</span>
                    <span>${{ (model.total_cost || 0).toFixed(3) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="exportStats" class="secondary">
            Export CSV
          </button>
          <button @click="showStats = false" class="secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUsageTracking } from '../composables/useUsageTracking';

defineProps({
  sessionCost: {
    type: Number,
    default: 0
  },
  sessionImages: {
    type: Number,
    default: 0
  }
});

const { stats, loadingStats, loadStats, exportData } = useUsageTracking();

const showStats = ref(false);

onMounted(async () => {
  await loadStats();
});

async function exportStats() {
  await exportData();
}
</script>

<style scoped>
.usage-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  align-items: center;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.8125rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-actions {
  text-align: center;
}

.stat-actions button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-actions button:hover {
  background: rgba(255, 255, 255, 0.3);
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

.stats-section {
  margin-bottom: 2rem;
}

.stats-section:last-child {
  margin-bottom: 0;
}

.stats-section h3 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.detail-value {
  font-weight: 600;
  color: var(--text-primary);
}

.model-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.model-stat-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

.model-name {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.model-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-actions {
    grid-column: 1 / -1;
  }
}
</style>
