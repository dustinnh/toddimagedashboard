/**
 * Preset Management Routes
 * Handle saving, loading, and managing image generation presets
 */

const express = require('express');
const PresetManager = require('../utils/presetManager');

const router = express.Router();
const presetManager = new PresetManager();

/**
 * GET /api/presets
 * Get all presets
 */
router.get('/', (req, res) => {
  try {
    const presets = presetManager.loadAll();
    res.json({
      success: true,
      presets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/presets/categories
 * Get all unique categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = presetManager.getCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/presets/category/:category
 * Get presets by category
 */
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const presets = presetManager.getByCategory(category);
    res.json({
      success: true,
      presets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/presets
 * Create a new preset
 */
router.post('/', (req, res) => {
  try {
    const preset = req.body;

    // Validation
    if (!preset.name || !preset.model || !preset.prompt) {
      return res.status(400).json({
        success: false,
        error: 'Name, model, and prompt are required'
      });
    }

    // Set default category if not provided
    if (!preset.category) {
      preset.category = 'General';
    }

    const saved = presetManager.save(preset);
    res.json({
      success: true,
      preset: saved
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/presets/:id
 * Update an existing preset
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = presetManager.update(id, updates);
    res.json({
      success: true,
      preset: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/presets/:id
 * Delete a preset
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    presetManager.delete(id);
    res.json({
      success: true,
      message: 'Preset deleted'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/presets/:id/use
 * Increment usage count for a preset
 */
router.post('/:id/use', (req, res) => {
  try {
    const { id } = req.params;
    presetManager.incrementUsage(id);
    res.json({
      success: true,
      message: 'Usage count incremented'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
