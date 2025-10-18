/**
 * Usage Tracking Routes
 * Handle usage statistics and cost tracking
 */

const express = require('express');
const UsageTracker = require('../utils/usageTracker');

const router = express.Router();
const usageTracker = new UsageTracker();

/**
 * GET /api/usage/stats
 * Get overall usage statistics
 */
router.get('/stats', (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = usageTracker.getStats({ startDate, endDate });
    const byModel = usageTracker.getStatsByModel();

    res.json({
      success: true,
      stats: {
        ...stats,
        byModel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/usage/session
 * Get current session statistics (today)
 */
router.get('/session', (req, res) => {
  try {
    const sessionStats = usageTracker.getSessionStats();
    res.json({
      success: true,
      session: sessionStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/usage/recent
 * Get recent usage entries
 */
router.get('/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const recent = usageTracker.getRecent(limit);

    res.json({
      success: true,
      usage: recent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/usage/export
 * Export usage data
 */
router.get('/export', (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const data = usageTracker.exportData({
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 1000
    });

    // Convert to CSV format
    if (data.length > 0) {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row =>
        Object.values(row).map(val =>
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="usage-export.csv"');
      res.send(csv);
    } else {
      res.json({
        success: false,
        error: 'No data to export'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
