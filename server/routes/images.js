/**
 * Images Routes
 * Handle listing and retrieving generated images with metadata
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/**
 * GET /api/images
 * List all generated images with their metadata
 */
router.get('/', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '../../Images');

    // Ensure directory exists
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      return res.json({
        success: true,
        images: []
      });
    }

    // Read all files in the Images directory
    const files = fs.readdirSync(imagesDir);

    // Filter for image files and load their metadata
    const images = [];
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();

      // Skip non-image files
      if (!imageExtensions.includes(ext)) {
        continue;
      }

      const imagePath = path.join(imagesDir, file);
      const metadataPath = imagePath.replace(new RegExp(`${ext}$`), '.json');

      // Load metadata if it exists
      let metadata = null;
      if (fs.existsSync(metadataPath)) {
        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
          metadata = JSON.parse(metadataContent);
        } catch (err) {
          console.warn(`Could not read metadata for ${file}:`, err.message);
        }
      }

      // Get file stats
      const stats = fs.statSync(imagePath);

      images.push({
        filename: file,
        url: `/images/${file}`,
        metadata: metadata || {
          filename: file,
          generatedAt: stats.birthtime.toISOString()
        },
        createdAt: stats.birthtime.toISOString(),
        size: stats.size
      });
    }

    // Sort by creation time (newest first)
    images.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    res.json({
      success: true,
      images,
      count: images.length
    });

  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/images/:filename
 * Delete an image and its metadata
 */
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const imagesDir = path.join(__dirname, '../../Images');

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    const imagePath = path.join(imagesDir, filename);
    const ext = path.extname(filename);
    const metadataPath = imagePath.replace(new RegExp(`${ext}$`), '.json');

    // Delete image file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete metadata file
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
