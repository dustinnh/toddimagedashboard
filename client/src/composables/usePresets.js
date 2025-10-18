import { ref } from 'vue';
import axios from 'axios';

export function usePresets() {
  const presets = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Load all presets
   */
  const loadPresets = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get('/api/presets');
      presets.value = response.data.presets || [];
      return presets.value;
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load presets';
      console.error('Error loading presets:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load categories
   */
  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/presets/categories');
      categories.value = response.data.categories || [];
      return categories.value;
    } catch (err) {
      console.error('Error loading categories:', err);
      return [];
    }
  };

  /**
   * Save a new preset
   */
  const savePreset = async (preset) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post('/api/presets', preset);
      presets.value.push(response.data.preset);
      return { success: true, preset: response.data.preset };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to save preset';
      error.value = errorMessage;
      console.error('Error saving preset:', err);
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing preset
   */
  const updatePreset = async (id, updates) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.put(`/api/presets/${id}`, updates);
      const index = presets.value.findIndex(p => p.id === id);
      if (index !== -1) {
        presets.value[index] = response.data.preset;
      }
      return { success: true, preset: response.data.preset };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update preset';
      error.value = errorMessage;
      console.error('Error updating preset:', err);
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a preset
   */
  const deletePreset = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      await axios.delete(`/api/presets/${id}`);
      presets.value = presets.value.filter(p => p.id !== id);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete preset';
      error.value = errorMessage;
      console.error('Error deleting preset:', err);
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Increment usage count for a preset
   */
  const incrementUsage = async (id) => {
    try {
      await axios.post(`/api/presets/${id}/use`);
    } catch (err) {
      console.error('Error incrementing usage:', err);
    }
  };

  /**
   * Get presets by category
   */
  const getByCategory = (category) => {
    return presets.value.filter(p => p.category === category);
  };

  return {
    presets,
    categories,
    loading,
    error,
    loadPresets,
    loadCategories,
    savePreset,
    updatePreset,
    deletePreset,
    incrementUsage,
    getByCategory
  };
}
