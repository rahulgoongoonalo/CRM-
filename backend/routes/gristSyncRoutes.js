import express from 'express';
import GristStaging from '../models/GristStaging.js';
import Member from '../models/Member.js';
import Onboarding from '../models/Onboarding.js';
import { refreshGristStaging, promoteStagingRow } from '../services/gristSyncService.js';

const router = express.Router();

// @route   GET /api/grist-sync/staging
// @desc    List all staging rows with optional filter (?status=pending|synced|ignored)
// @access  Private
router.get('/staging', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && ['pending', 'synced', 'ignored'].includes(status)) {
      query.status = status;
    }

    let rows = await GristStaging.find(query)
      .populate('member', 'artistName email phone memberNumber status source')
      .populate('onboarding', 'taskNumber status spoc')
      .sort({ lastSeenAt: -1 })
      .lean();

    if (status === 'pending') {
      const syncedRows = await GristStaging.find({ status: 'synced', member: { $ne: null } })
        .select('gristId member')
        .lean();
      const syncedByMember = new Map(
        syncedRows.map(row => [row.member.toString(), row.gristId])
      );

      rows = rows.map(row => {
        const memberId = row.member?._id?.toString();
        const representedByGristId = memberId ? syncedByMember.get(memberId) : null;

        if (representedByGristId) {
          return {
            ...row,
            reviewReason: `Duplicate Grist row. Already represented by Grist ID ${representedByGristId} / Member #${row.member.memberNumber}.`,
          };
        }

        if (row.member) {
          return {
            ...row,
            reviewReason: `Existing app match found: Member #${row.member.memberNumber}. Review before syncing.`,
          };
        }

        return {
          ...row,
          reviewReason: 'No exact app match. Review and sync manually.',
        };
      });
    }

    // Aggregate counts for tabs
    const [counts, getgristMembers] = await Promise.all([
      GristStaging.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Member.find({ source: 'Getgrist' }).select('_id').lean(),
    ]);
    const countMap = { pending: 0, synced: 0, ignored: 0 };
    counts.forEach(c => { countMap[c._id] = c.count; });
    const getgristMemberIds = getgristMembers.map(member => member._id);
    const getgristOnboardings = await Onboarding.countDocuments({ member: { $in: getgristMemberIds } });

    res.json({
      success: true,
      data: rows,
      counts: countMap,
      appCounts: {
        getgristMembers: getgristMembers.length,
        getgristOnboardings,
      },
      total: rows.length,
    });
  } catch (error) {
    console.error('[GristStaging] List failed:', error.message);
    res.status(500).json({ success: false, message: 'Failed to list staging rows', error: error.message });
  }
});

// @route   POST /api/grist-sync/refresh
// @desc    Pull latest from Grist into the staging table (does NOT create Member/Onboarding)
// @access  Private (any authenticated user)
router.post('/refresh', async (req, res) => {
  try {
    console.log('[GristStaging] Manual refresh triggered via API');
    const results = await refreshGristStaging();
    res.json({
      success: true,
      message: `Staging refreshed — ${results.total} total, ${results.newPending} new pending, ${results.autoLinked} auto-linked, ${results.errors.length} errors`,
      data: results,
    });
  } catch (error) {
    console.error('[GristStaging] Refresh failed:', error.message);
    res.status(500).json({ success: false, message: 'Refresh failed', error: error.message });
  }
});

// @route   POST /api/grist-sync/promote
// @desc    Promote selected staging rows to Member + Onboarding
// @body    { ids: [stagingId, ...] }
// @access  Private
router.post('/promote', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }

    const results = { synced: 0, alreadySynced: 0, errors: [], details: [] };

    // Resolve staging rows up front so we can attach artistName to each error
    const stagingRows = await GristStaging.find({ _id: { $in: ids } }).lean();
    const stagingById = new Map(stagingRows.map(s => [s._id.toString(), s]));

    for (const id of ids) {
      try {
        const r = await promoteStagingRow(id);
        results.details.push(r);
        if (r.action === 'synced') results.synced++;
        else if (r.action === 'already-synced') results.alreadySynced++;
      } catch (err) {
        const staging = stagingById.get(id.toString());
        results.errors.push({
          id,
          artistName: staging?.artistName || 'Unknown',
          email: staging?.email || '',
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      message: `Synced ${results.synced} new, ${results.alreadySynced} already-synced, ${results.errors.length} errors`,
      data: results,
    });
  } catch (error) {
    console.error('[GristStaging] Promote failed:', error.message);
    res.status(500).json({ success: false, message: 'Promote failed', error: error.message });
  }
});

// @route   POST /api/grist-sync/ignore
// @desc    Mark selected staging rows as ignored (still listed, but won't be synced)
// @body    { ids: [stagingId, ...] }
// @access  Private
router.post('/ignore', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }

    const result = await GristStaging.updateMany(
      { _id: { $in: ids }, status: 'pending' },
      { $set: { status: 'ignored', ignoredAt: new Date() } }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} row(s) as ignored`,
      data: { modified: result.modifiedCount, matched: result.matchedCount },
    });
  } catch (error) {
    console.error('[GristStaging] Ignore failed:', error.message);
    res.status(500).json({ success: false, message: 'Ignore failed', error: error.message });
  }
});

// @route   POST /api/grist-sync/unignore
// @desc    Move ignored rows back to pending
// @body    { ids: [stagingId, ...] }
// @access  Private
router.post('/unignore', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }

    const result = await GristStaging.updateMany(
      { _id: { $in: ids }, status: 'ignored' },
      { $set: { status: 'pending', ignoredAt: null } }
    );

    res.json({
      success: true,
      message: `Moved ${result.modifiedCount} row(s) back to pending`,
      data: { modified: result.modifiedCount, matched: result.matchedCount },
    });
  } catch (error) {
    console.error('[GristStaging] Unignore failed:', error.message);
    res.status(500).json({ success: false, message: 'Unignore failed', error: error.message });
  }
});

// Legacy: keep this so any existing client/cron calls still work
router.post('/trigger', async (req, res) => {
  try {
    const results = await refreshGristStaging();
    res.json({
      success: true,
      message: `Refresh completed — total ${results.total}, new pending ${results.newPending}, auto-linked ${results.autoLinked}, errors ${results.errors.length}`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Refresh failed', error: error.message });
  }
});

router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Grist staging service is running',
    schedule: 'Daily at 9:00 AM IST & 2:00 PM IST (refresh-only — no auto-promote)',
    apiUrl: process.env.GRIST_API_URL || 'https://ism.getgrist.com/api/docs/5T8YB3qAMkaS/tables/Table1/records',
  });
});

export default router;
