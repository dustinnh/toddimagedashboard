/**
 * Image Editing Routes
 * Handles image editing/inpainting and variations
 */

const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const CostCalculator = require('../utils/costCalculator');
const UsageTracker = require('../utils/usageTracker');

const router = express.Router();
const costCalculator = new CostCalculator();
const usageTracker = new UsageTracker();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

/**
 * POST /api/edit/inpaint
 * Edit an image using inpainting with a mask
 */
router.post('/inpaint', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mask', maxCount: 1 }
]), async (req, res) => {
  try {
    // Get API key from request header or environment variable
    const apiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API key not configured. Please add your API key in Settings.'
      });
    }

    const { prompt, model = 'gpt-image-1', size = '1024x1024', quality, n = 1, input_fidelity } = req.body;

    if (!req.files['image']) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    const imagePath = req.files['image'][0].path;
    const maskPath = req.files['mask']?.[0]?.path;

    console.log(`Editing image with ${model}...`);

    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    if (maskPath) {
      formData.append('mask', fs.createReadStream(maskPath));
    }
    formData.append('prompt', prompt);
    formData.append('model', model);
    formData.append('size', size);
    formData.append('n', n);
    if (quality && model !== 'dall-e-2') {
      formData.append('quality', quality);
    }
    // Add input_fidelity for GPT Image 1
    if (model === 'gpt-image-1' && input_fidelity !== undefined) {
      formData.append('input_fidelity', input_fidelity);
    }

    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...formData.getHeaders()
        },
        timeout: 120000
      }
    );

    // Cleanup uploaded files
    fs.unlinkSync(imagePath);
    if (maskPath) fs.unlinkSync(maskPath);

    // Save edited images
    const savedImages = await saveImagesLocally(response.data.data, {
      model,
      prompt,
      size,
      quality,
      operation: 'edit'
    });

    // Calculate and track cost
    const cost = costCalculator.calculate({ model, size, quality, n: response.data.data.length });

    usageTracker.track({
      model,
      operation: 'edit',
      size,
      quality,
      n: response.data.data.length,
      cost,
      prompt,
      success: true
    });

    console.log(`✓ Edited image - Cost: $${cost.toFixed(3)}`);

    res.json({
      success: true,
      images: savedImages,
      cost: cost,
      count: savedImages.length
    });

  } catch (error) {
    console.error('Edit error:', error.response?.data || error.message);

    // Cleanup files on error
    if (req.files['image']) {
      try { fs.unlinkSync(req.files['image'][0].path); } catch (e) {}
    }
    if (req.files['mask']) {
      try { fs.unlinkSync(req.files['mask'][0].path); } catch (e) {}
    }

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || error.message;

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * POST /api/edit/variations
 * Create variations of an existing image (DALL-E 2 only)
 */
router.post('/variations', upload.single('image'), async (req, res) => {
  try {
    // Get API key from request header or environment variable
    const apiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API key not configured. Please add your API key in Settings.'
      });
    }

    const { size = '1024x1024', n = 1 } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    const imagePath = req.file.path;

    console.log(`Creating ${n} variation(s) with DALL-E 2...`);

    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('model', 'dall-e-2');
    formData.append('size', size);
    formData.append('n', Math.min(n, 10));

    const response = await axios.post(
      'https://api.openai.com/v1/images/variations',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...formData.getHeaders()
        },
        timeout: 120000
      }
    );

    // Cleanup uploaded file
    fs.unlinkSync(imagePath);

    // Save variation images
    const savedImages = await saveImagesLocally(response.data.data, {
      model: 'dall-e-2',
      size,
      operation: 'variation'
    });

    // Calculate and track cost
    const cost = costCalculator.calculate({
      model: 'dall-e-2',
      size,
      n: response.data.data.length
    });

    usageTracker.track({
      model: 'dall-e-2',
      operation: 'variation',
      size,
      n: response.data.data.length,
      cost,
      success: true
    });

    console.log(`✓ Created ${response.data.data.length} variation(s) - Cost: $${cost.toFixed(3)}`);

    res.json({
      success: true,
      images: savedImages,
      cost: cost,
      count: savedImages.length
    });

  } catch (error) {
    console.error('Variations error:', error.response?.data || error.message);

    // Cleanup file on error
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || error.message;

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Save images to local filesystem with metadata
 */
async function saveImagesLocally(imageData, metadata) {
  const imagesDir = path.join(__dirname, '../../Images');
  const saved = [];

  for (let i = 0; i < imageData.length; i++) {
    const img = imageData[i];
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${timestamp}-${randomId}.png`;
    const filepath = path.join(imagesDir, filename);

    try {
      // Save image
      if (img.b64_json) {
        const buffer = Buffer.from(img.b64_json, 'base64');
        fs.writeFileSync(filepath, buffer);
      } else if (img.url) {
        const response = await axios.get(img.url, { responseType: 'arraybuffer' });
        fs.writeFileSync(filepath, response.data);
      }

      // Save metadata
      const metadataFile = filepath.replace('.png', '.json');
      const metadataContent = {
        filename,
        generatedAt: new Date().toISOString(),
        model: metadata.model,
        operation: metadata.operation,
        prompt: metadata.prompt,
        size: metadata.size,
        quality: metadata.quality
      };
      fs.writeFileSync(metadataFile, JSON.stringify(metadataContent, null, 2));

      saved.push({
        filename,
        path: filepath,
        url: `/images/${filename}`,
        metadata: metadataContent
      });

      console.log(`✓ Saved: ${filename}`);
    } catch (error) {
      console.error(`Error saving image ${i}:`, error);
    }
  }

  return saved;
}

module.exports = router;
