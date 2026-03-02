import express from 'express';
import { syncGristData } from '../services/gristSyncService.js';

const router = express.Router();

// @route   POST /api/grist-sync/trigger
// @desc    Manually trigger Grist data sync
// @access  Private (add protect middleware in production)
router.post('/trigger', async (req, res) => {
  try {
    console.log('[GristSync] Manual sync triggered via API');
    const results = await syncGristData();

    res.json({
      success: true,
      message: `Grist sync completed — Created: ${results.created}, Updated: ${results.updated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
      data: results,
    });
  } catch (error) {
    console.error('[GristSync] Manual sync failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Grist sync failed',
      error: error.message,
    });
  }
});

// @route   GET /api/grist-sync/status
// @desc    Get last sync status / health check
// @access  Private
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Grist sync service is running',
    schedule: 'Daily at 9:00 AM IST & 2:00 PM IST',
    apiUrl: process.env.GRIST_API_URL || 'https://ism.getgrist.com/api/docs/5T8YB3qAMkaS/tables/Table1/records',
  });
});

export default router;
