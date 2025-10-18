/**
 * Image Generation Routes
 * Handles requests to OpenAI's image generation API
 */

const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const fs = require('fs');
const path = require('path');
const CostCalculator = require('../utils/costCalculator');
const UsageTracker = require('../utils/usageTracker');

const router = express.Router();
const costCalculator = new CostCalculator();
const usageTracker = new UsageTracker();

// Configure axios retry for rate limiting
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error)
      || error.response?.status === 429
      || (error.response?.status >= 500);
  },
  onRetry: (retryCount, error) => {
    console.log(`Retry attempt ${retryCount}: ${error.message}`);
  }
});

/**
 * POST /api/generate
 * Generate images from text prompt
 */
router.post('/', async (req, res) => {
  try {
    // Get API key from request header or environment variable
    const apiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'OpenAI API key not configured. Please add your API key in Settings.'
      });
    }

    const {
      model = 'dall-e-3',
      prompt,
      size = '1024x1024',
      quality = 'standard',
      style = 'natural',
      n = 1,
      presetName,
      background = 'auto',
      output_format = 'png',
      output_compression = 80
    } = req.body;

    // Validation
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Build API request payload
    const payload = {
      model,
      prompt: prompt.trim(),
      size,
      n: Math.min(n, 10), // Cap at 10 per API limits
      response_format: 'b64_json' // Use base64 for reliability
    };

    // Add model-specific parameters
    if (model === 'dall-e-3') {
      payload.quality = quality;
      payload.style = style;
      payload.n = 1; // DALL-E 3 only supports n=1
    } else if (model === 'gpt-image-1') {
      payload.quality = quality;
      // Add advanced options for GPT Image 1
      if (background && background !== 'auto') {
        payload.background = background;
      }
      if (output_format) {
        payload.output_format = output_format;
      }
      if (output_format === 'jpeg' && output_compression !== undefined) {
        payload.output_compression = output_compression;
      }
    }

    console.log(`Generating ${n} image(s) with ${model}...`);

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minute timeout
      }
    );

    // Save images locally
    const savedImages = await saveImagesLocally(response.data.data, {
      model,
      prompt,
      size,
      quality,
      style,
      presetName,
      output_format
    });

    // Calculate and track cost
    const cost = costCalculator.calculate({
      model,
      size,
      quality,
      n: response.data.data.length
    });

    usageTracker.track({
      model,
      size,
      quality,
      style: model === 'dall-e-3' ? style : null,
      n: response.data.data.length,
      cost,
      prompt,
      presetName,
      success: true
    });

    console.log(`✓ Generated ${response.data.data.length} image(s) - Cost: $${cost.toFixed(3)}`);

    res.json({
      success: true,
      images: savedImages,
      revisedPrompt: response.data.data[0]?.revised_prompt,
      cost: cost,
      count: savedImages.length
    });

  } catch (error) {
    console.error('Generation error:', error.response?.data || error.message);

    // Track failed attempt
    try {
      const cost = costCalculator.calculate({
        model: req.body.model || 'dall-e-3',
        size: req.body.size || '1024x1024',
        quality: req.body.quality || 'standard',
        n: 0
      });

      usageTracker.track({
        model: req.body.model || 'dall-e-3',
        size: req.body.size || '1024x1024',
        quality: req.body.quality,
        n: 0,
        cost: 0,
        prompt: req.body.prompt,
        success: false,
        errorMessage: error.response?.data?.error?.message || error.message
      });
    } catch (trackError) {
      console.error('Error tracking failed request:', trackError);
    }

    // Return user-friendly error
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || error.message;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data?.error
    });
  }
});

/**
 * POST /api/generate/estimate
 * Estimate cost without generating
 */
router.post('/estimate', (req, res) => {
  try {
    const { model, size, quality, n = 1 } = req.body;

    const cost = costCalculator.calculate({
      model,
      size,
      quality,
      n
    });

    res.json({
      success: true,
      cost: cost,
      formatted: costCalculator.format(cost)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Save images to local filesystem with metadata
 * @param {Array} imageData - Array of image objects from OpenAI
 * @param {Object} metadata - Generation metadata
 * @returns {Array} Saved image information
 */
async function saveImagesLocally(imageData, metadata) {
  const imagesDir = path.join(__dirname, '../../Images');
  const saved = [];

  // Determine file extension based on output format
  const extension = metadata.output_format === 'jpeg' ? 'jpg' : 'png';

  for (let i = 0; i < imageData.length; i++) {
    const img = imageData[i];
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${timestamp}-${randomId}.${extension}`;
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
      const metadataFile = filepath.replace(new RegExp(`\\.${extension}$`), '.json');
      const metadataContent = {
        filename,
        generatedAt: new Date().toISOString(),
        model: metadata.model,
        prompt: metadata.prompt,
        revisedPrompt: img.revised_prompt,
        size: metadata.size,
        quality: metadata.quality,
        style: metadata.style,
        presetName: metadata.presetName
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
