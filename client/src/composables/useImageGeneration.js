import { ref } from 'vue';
import axios from 'axios';

export function useImageGeneration() {
  const loading = ref(false);
  const error = ref(null);

  /**
   * Generate images from prompt
   */
  const generate = async (settings) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post('/api/generate', settings);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Generation failed';
      error.value = errorMessage;
      console.error('Generation error:', err);
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Estimate cost without generating
   */
  const estimateCost = async (settings) => {
    try {
      const response = await axios.post('/api/generate/estimate', settings);
      return response.data;
    } catch (err) {
      console.error('Cost estimation error:', err);
      return { success: false, cost: 0 };
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    loading,
    error,
    generate,
    estimateCost,
    clearError
  };
}
