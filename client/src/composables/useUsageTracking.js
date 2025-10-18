import { ref } from 'vue';
import axios from 'axios';

export function useUsageTracking() {
  const stats = ref(null);
  const sessionStats = ref(null);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Load overall usage statistics
   */
  const loadStats = async (options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const params = {};
      if (options.startDate) params.startDate = options.startDate;
      if (options.endDate) params.endDate = options.endDate;

      const response = await axios.get('/api/usage/stats', { params });
      stats.value = response.data.stats;
      return stats.value;
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load stats';
      console.error('Error loading stats:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load session (today's) statistics
   */
  const loadSessionStats = async () => {
    try {
      const response = await axios.get('/api/usage/session');
      sessionStats.value = response.data.session;
      return sessionStats.value;
    } catch (err) {
      console.error('Error loading session stats:', err);
      return null;
    }
  };

  /**
   * Export usage data to CSV
   */
  const exportData = async (options = {}) => {
    try {
      const params = {};
      if (options.startDate) params.startDate = options.startDate;
      if (options.endDate) params.endDate = options.endDate;
      if (options.limit) params.limit = options.limit;

      const response = await axios.get('/api/usage/export', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'usage-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('Error exporting data:', err);
      return { success: false, error: 'Export failed' };
    }
  };

  return {
    stats,
    sessionStats,
    loading,
    error,
    loadStats,
    loadSessionStats,
    exportData
  };
}
