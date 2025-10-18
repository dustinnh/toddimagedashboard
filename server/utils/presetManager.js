/**
 * Preset Manager
 * Manages saving, loading, and organizing image generation presets
 */

const fs = require('fs');
const path = require('path');

class PresetManager {
  constructor(presetsPath = './data/presets.json') {
    this.presetsPath = presetsPath;
    this.ensureFile();
    this.loadEducationalDefaults();
  }

  ensureFile() {
    const dir = path.dirname(this.presetsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.presetsPath)) {
      fs.writeFileSync(this.presetsPath, JSON.stringify([], null, 2));
    }
  }

  /**
   * Load all presets
   * @returns {Array} Array of preset objects
   */
  loadAll() {
    try {
      const data = fs.readFileSync(this.presetsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading presets:', error);
      return [];
    }
  }

  /**
   * Save a new preset
   * @param {Object} preset - Preset object
   * @returns {Object} Saved preset with ID
   */
  save(preset) {
    const presets = this.loadAll();

    // Generate ID
    preset.id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    preset.createdAt = new Date().toISOString();
    preset.usageCount = 0;

    // Check for duplicate names in same category
    const duplicate = presets.find(
      p => p.name === preset.name && p.category === preset.category
    );

    if (duplicate) {
      throw new Error(`Preset "${preset.name}" already exists in category "${preset.category}"`);
    }

    presets.push(preset);
    this.saveToFile(presets);

    return preset;
  }

  /**
   * Update an existing preset
   * @param {string} id - Preset ID
   * @param {Object} updates - Updates to apply
   * @returns {Object} Updated preset
   */
  update(id, updates) {
    const presets = this.loadAll();
    const index = presets.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('Preset not found');
    }

    // Don't allow changing ID or createdAt
    delete updates.id;
    delete updates.createdAt;

    presets[index] = {
      ...presets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile(presets);
    return presets[index];
  }

  /**
   * Delete a preset
   * @param {string} id - Preset ID
   */
  delete(id) {
    const presets = this.loadAll();
    const filtered = presets.filter(p => p.id !== id);

    if (filtered.length === presets.length) {
      throw new Error('Preset not found');
    }

    this.saveToFile(filtered);
  }

  /**
   * Get presets by category
   * @param {string} category - Category name
   * @returns {Array} Filtered presets
   */
  getByCategory(category) {
    const presets = this.loadAll();
    return presets.filter(p => p.category === category);
  }

  /**
   * Increment usage count for a preset
   * @param {string} id - Preset ID
   */
  incrementUsage(id) {
    const presets = this.loadAll();
    const preset = presets.find(p => p.id === id);

    if (preset) {
      preset.usageCount = (preset.usageCount || 0) + 1;
      preset.lastUsedAt = new Date().toISOString();
      this.saveToFile(presets);
    }
  }

  /**
   * Save presets array to file
   * @param {Array} presets - Presets to save
   */
  saveToFile(presets) {
    fs.writeFileSync(this.presetsPath, JSON.stringify(presets, null, 2));
  }

  /**
   * Load default educational presets if none exist
   */
  loadEducationalDefaults() {
    const presets = this.loadAll();

    if (presets.length === 0) {
      const defaults = this.getDefaultPresets();
      defaults.forEach(preset => {
        try {
          this.save(preset);
        } catch (error) {
          // Ignore duplicates when loading defaults
        }
      });
    }
  }

  /**
   * Get default preset templates for special needs education
   * @returns {Array} Default presets
   */
  getDefaultPresets() {
    return [
      // Visual Schedule Items
      {
        name: 'Morning Routine Item',
        category: 'Visual Schedule',
        model: 'dall-e-3',
        prompt: 'Simple, clear icon-style illustration of [ITEM] on white background, friendly style, suitable for visual schedule, minimal details, bright colors',
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        notes: 'Replace [ITEM] with specific activity like "brushing teeth", "eating breakfast", etc.'
      },
      {
        name: 'Transition Activity',
        category: 'Visual Schedule',
        model: 'dall-e-3',
        prompt: 'Clean, simple illustration showing [ACTIVITY] for classroom transition, clear and easy to understand, suitable for children, minimal background',
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        notes: 'For activities like "line up", "sit down", "clean up"'
      },

      // Emotion Cards
      {
        name: 'Emotion Face - Basic',
        category: 'Emotion Cards',
        model: 'dall-e-3',
        prompt: 'Simple, friendly cartoon face showing [EMOTION], clear facial expression, suitable for teaching emotions to children, clean white background, gentle style',
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        notes: 'Replace [EMOTION] with: happy, sad, angry, scared, surprised, etc.'
      },

      // Social Stories
      {
        name: 'Social Story Character',
        category: 'Social Stories',
        model: 'dall-e-3',
        prompt: 'Friendly, simple cartoon character [DOING ACTION], suitable for social story, clear and encouraging, minimal background, appropriate for children',
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        notes: 'For sequential social stories. Keep character style consistent.'
      },

      // Educational Concepts
      {
        name: 'Learning Concept',
        category: 'Educational',
        model: 'dall-e-3',
        prompt: 'Clear, simple educational illustration showing [CONCEPT], easy to understand, suitable for children, uncluttered, bright and engaging',
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        notes: 'For teaching concepts like colors, shapes, numbers, letters'
      },

      // Choice Boards
      {
        name: 'Choice Board Item',
        category: 'Choice Boards',
        model: 'dall-e-3',
        prompt: 'Simple, clear illustration of [CHOICE] for choice board, icon style, easy to identify, suitable for classroom, white background',
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        notes: 'For choice boards showing activity options'
      }
    ];
  }

  /**
   * Get all unique categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    const presets = this.loadAll();
    const categories = [...new Set(presets.map(p => p.category))];
    return categories.sort();
  }
}

module.exports = PresetManager;
