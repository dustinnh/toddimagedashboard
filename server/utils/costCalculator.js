/**
 * Cost Calculator for OpenAI Image Generation
 * Calculates estimated costs based on model, size, quality, and quantity
 */

class CostCalculator {
  constructor() {
    // Pricing structure based on OpenAI's current rates
    this.pricing = {
      'gpt-image-1': {
        'low': 0.02,
        'medium': 0.07,
        'high': 0.19
      },
      'dall-e-3': {
        '1024x1024': {
          'standard': 0.04,
          'hd': 0.08
        },
        '1024x1792': {
          'standard': 0.08,
          'hd': 0.12
        },
        '1792x1024': {
          'standard': 0.08,
          'hd': 0.12
        }
      },
      'dall-e-2': {
        '256x256': 0.016,
        '512x512': 0.018,
        '1024x1024': 0.020
      }
    };
  }

  /**
   * Calculate cost for image generation
   * @param {Object} params - Generation parameters
   * @param {string} params.model - Model name (gpt-image-1, dall-e-3, dall-e-2)
   * @param {string} params.size - Image size
   * @param {string} params.quality - Quality setting
   * @param {number} params.n - Number of images
   * @returns {number} Total cost in dollars
   */
  calculate(params) {
    const { model, size, quality = 'standard', n = 1 } = params;

    let unitCost = 0;

    if (model === 'gpt-image-1') {
      unitCost = this.pricing[model][quality] || this.pricing[model]['high'];
    } else if (model === 'dall-e-3') {
      const sizeConfig = this.pricing[model][size];
      if (sizeConfig) {
        unitCost = sizeConfig[quality] || sizeConfig['standard'];
      } else {
        // Default to standard 1024x1024
        unitCost = 0.04;
      }
    } else if (model === 'dall-e-2') {
      unitCost = this.pricing[model][size] || this.pricing[model]['1024x1024'];
    } else {
      // Unknown model, use conservative estimate
      unitCost = 0.10;
    }

    return Number((unitCost * n).toFixed(4));
  }

  /**
   * Get pricing information for a specific model
   * @param {string} model - Model name
   * @returns {Object} Pricing structure for the model
   */
  getPricingForModel(model) {
    return this.pricing[model] || {};
  }

  /**
   * Format cost as string with currency
   * @param {number} cost - Cost in dollars
   * @returns {string} Formatted cost string
   */
  format(cost) {
    return `$${cost.toFixed(3)}`;
  }
}

module.exports = CostCalculator;
