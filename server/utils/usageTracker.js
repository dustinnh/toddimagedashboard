/**
 * Usage Tracker using JSON file storage
 * Tracks all image generation requests and costs
 */

const fs = require('fs');
const path = require('path');

class UsageTracker {
  constructor(dataPath = './data/usage.json') {
    this.dataPath = dataPath;
    this.ensureFile();
  }

  ensureFile() {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.dataPath)) {
      fs.writeFileSync(this.dataPath, JSON.stringify([], null, 2));
    }
  }

  /**
   * Load all usage records
   */
  loadAll() {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading usage data:', error);
      return [];
    }
  }

  /**
   * Save usage records
   */
  saveAll(records) {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(records, null, 2));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  /**
   * Track a usage event
   * @param {Object} params - Usage parameters
   * @returns {string} ID of inserted record
   */
  track(params) {
    const {
      model,
      operation = 'generation',
      size,
      quality,
      style,
      n = 1,
      cost,
      prompt,
      presetName,
      success = true,
      errorMessage = null
    } = params;

    const records = this.loadAll();

    const record = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      model,
      operation,
      size,
      quality: quality || null,
      style: style || null,
      n,
      cost,
      prompt_preview: prompt ? prompt.substring(0, 200) : null,
      preset_name: presetName || null,
      success: success ? 1 : 0,
      error_message: errorMessage
    };

    records.push(record);
    this.saveAll(records);

    return record.id;
  }

  /**
   * Get usage statistics
   * @param {Object} options - Query options
   * @returns {Object} Usage statistics
   */
  getStats(options = {}) {
    const { startDate, endDate } = options;
    const records = this.loadAll();

    let filtered = records.filter(r => r.success === 1);

    if (startDate) {
      filtered = filtered.filter(r => r.timestamp >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(r => r.timestamp <= endDate);
    }

    const totalImages = filtered.length;
    const totalGenerated = filtered.reduce((sum, r) => sum + (r.n || 1), 0);
    const totalCost = filtered.reduce((sum, r) => sum + (r.cost || 0), 0);
    const avgCost = totalImages > 0 ? totalCost / totalImages : 0;

    return {
      total_images: totalImages,
      total_generated: totalGenerated,
      total_cost: totalCost,
      avg_cost: avgCost
    };
  }

  /**
   * Get statistics by model
   * @returns {Array} Array of model statistics
   */
  getStatsByModel() {
    const records = this.loadAll();
    const successful = records.filter(r => r.success === 1);

    const byModel = {};

    successful.forEach(record => {
      if (!byModel[record.model]) {
        byModel[record.model] = {
          model: record.model,
          count: 0,
          images_generated: 0,
          total_cost: 0
        };
      }

      byModel[record.model].count++;
      byModel[record.model].images_generated += (record.n || 1);
      byModel[record.model].total_cost += (record.cost || 0);
    });

    return Object.values(byModel).map(m => ({
      ...m,
      avg_cost: m.count > 0 ? m.total_cost / m.count : 0
    }));
  }

  /**
   * Get recent usage entries
   * @param {number} limit - Number of entries to return
   * @returns {Array} Recent usage entries
   */
  getRecent(limit = 50) {
    const records = this.loadAll();
    return records
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get session statistics (today's usage)
   * @returns {Object} Today's usage statistics
   */
  getSessionStats() {
    const records = this.loadAll();
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = records.filter(r => {
      const recordDate = r.timestamp.split('T')[0];
      return recordDate === today && r.success === 1;
    });

    const totalRequests = todayRecords.length;
    const imagesGenerated = todayRecords.reduce((sum, r) => sum + (r.n || 1), 0);
    const totalCost = todayRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

    return {
      total_requests: totalRequests,
      images_generated: imagesGenerated,
      total_cost: totalCost
    };
  }

  /**
   * Export usage data to CSV-friendly format
   * @param {Object} options - Export options
   * @returns {Array} Array of usage records
   */
  exportData(options = {}) {
    const { startDate, endDate, limit = 1000 } = options;
    let records = this.loadAll();

    if (startDate) {
      records = records.filter(r => r.timestamp >= startDate);
    }
    if (endDate) {
      records = records.filter(r => r.timestamp <= endDate);
    }

    return records
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(r => ({
        date_time: new Date(r.timestamp).toLocaleString(),
        model: r.model,
        size: r.size,
        quality: r.quality,
        num_images: r.n,
        cost: r.cost,
        prompt_preview: r.prompt_preview,
        preset_name: r.preset_name,
        success: r.success === 1 ? 'Yes' : 'No'
      }));
  }

  /**
   * Close (no-op for JSON storage, kept for compatibility)
   */
  close() {
    // No-op for JSON storage
  }
}

module.exports = UsageTracker;
