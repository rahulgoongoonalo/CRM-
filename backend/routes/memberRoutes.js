import express from 'express';
import { body, validationResult } from 'express-validator';
import Member from '../models/Member.js';
import Onboarding from '../models/Onboarding.js';
import { protect } from '../middleware/auth.js';

// Helper: sync overlapping member fields to linked onboarding's l1QuestionnaireData
const syncMemberToOnboardingL1 = async (memberId, memberData) => {
  try {
    const onboarding = await Onboarding.findOne({ member: memberId });
    if (!onboarding) return;

    const l1 = onboarding.l1QuestionnaireData || {};
    const updates = {};

    // Map: member field → L1 field (always overwrite to keep in sync)
    if (memberData.artistName) updates['l1QuestionnaireData.artistName'] = memberData.artistName;
    if (memberData.contactName) updates['l1QuestionnaireData.primaryContact'] = memberData.contactName;
    if (memberData.email) updates['l1QuestionnaireData.email'] = memberData.email;
    if (memberData.phone) updates['l1QuestionnaireData.phone'] = memberData.phone;
    if (memberData.location) {
      updates['l1QuestionnaireData.cityCountry'] = memberData.location;
      updates['l1QuestionnaireData.address'] = memberData.location;
    }
    if (memberData.primaryRole) updates['l1QuestionnaireData.primaryRole'] = memberData.primaryRole;
    if (memberData.primaryGenres) updates['l1QuestionnaireData.primaryGenres'] = memberData.primaryGenres;
    if (memberData.biography) updates['l1QuestionnaireData.artistBio'] = memberData.biography;

    // Member status → onboarding pipeline status:
    //   Pending → cold,  Updated → warm,  On Hold → warm.
    // This auto-drive only applies while the user has NOT taken over the onboarding status:
    //   - `statusLocked` is set the moment a user changes the status in the onboarding/L2 flow.
    //   - The early-stage guard additionally protects legacy records (no lock flag yet) that
    //     are already in Review L2 / Closed / Cold Storage, so we never knock them back down.
    const memberStatus = (memberData.status || '').toString().trim().toLowerCase();
    const statusToPipeline = { pending: 'cold', updated: 'warm', 'on hold': 'warm', inactive: 'warm' };
    const mappedStatus = statusToPipeline[memberStatus];
    const EARLY_STAGES = ['hot', 'warm', 'cold'];
    const currentOnbStatus = (onboarding.status || '').toLowerCase();
    if (
      mappedStatus &&
      !onboarding.statusLocked &&
      EARLY_STAGES.includes(currentOnbStatus) &&
      currentOnbStatus !== mappedStatus
    ) {
      updates['status'] = mappedStatus;
    }

    if (Object.keys(updates).length > 0) {
      await Onboarding.findByIdAndUpdate(onboarding._id, { $set: updates });
    }
  } catch (err) {
    console.error('Error syncing member to onboarding L1:', err);
  }
};

const router = express.Router();

// All routes are protected
// TEMPORARY: Comment out for testing - REMOVE IN PRODUCTION
// router.use(protect);

// @route   GET /api/members/list
// @desc    Get lightweight member list (id + name only) for dropdowns
// @access  Private
router.get('/list', async (req, res) => {
  try {
    const members = await Member.find({}, { artistName: 1, email: 1, status: 1 }).sort({ artistName: 1 }).lean();
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Error in GET /api/members/list:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/members
// @desc    Get members with server-side pagination, search, filter, sort
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      tier = '',
      source = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    // Build filter query
    const query = {};

    // Search across artistName and email
    if (search.trim()) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { artistName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } }
      ];
    }

    // Status filter — map display values to DB values
    if (status && status !== 'All Status') {
      const statusLower = status.toLowerCase();
      if (statusLower === 'updated') {
        query.status = { $regex: /^(active|updated)$/i };
      } else if (statusLower === 'on hold') {
        query.status = { $regex: /^(inactive|on hold)$/i };
      } else if (statusLower === 'pending') {
        query.status = { $regex: /^pending$/i };
      }
    }

    // Tier filter
    if (tier && tier !== 'All Tiers') {
      const escaped = tier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.tier = { $regex: escaped, $options: 'i' };
    }

    // Source filter
    if (source && source !== 'All Sources') {
      query.source = source;
    }

    // Build sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query + count in parallel
    const [members, total] = await Promise.all([
      Member.find(query).sort(sortObj).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Member.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: members,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error in GET /api/members:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/members/renumber
// @desc    Renumber all members sequentially starting from 1
// @access  Private
router.put('/renumber', async (req, res) => {
  try {
    const members = await Member.find().sort({ memberNumber: 1 });

    let count = 0;
    for (let i = 0; i < members.length; i++) {
      const newNumber = i + 1;
      if (members[i].memberNumber !== newNumber) {
        await Member.findByIdAndUpdate(members[i]._id, { memberNumber: newNumber });
        count++;
      }
    }

    res.json({
      success: true,
      message: `Renumbered ${count} members. Total members: ${members.length}`,
      total: members.length,
      updated: count
    });
  } catch (error) {
    console.error('Error renumbering members:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/members/bulk-update
// @desc    Bulk update social media stats for multiple members
// @access  Private
router.put('/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const results = [];
    const skipped = [];
    const errors = [];

    for (const item of updates) {
      try {
        const member = await Member.findById(item.memberId);
        if (!member) {
          errors.push(`Member ID ${item.memberId} not found`);
          continue;
        }

        // Check if any value actually changed
        let hasChanges = false;
        for (const [key, val] of Object.entries(item.data)) {
          const current = member[key];
          if (val === null && (current === null || current === undefined)) continue;
          if (val !== current) { hasChanges = true; break; }
        }

        if (!hasChanges) {
          skipped.push(member.artistName || item.memberId);
          continue;
        }

        await Member.findByIdAndUpdate(item.memberId, item.data, { runValidators: true });
        results.push(item.memberId);
      } catch (err) {
        errors.push(`Failed to update ${item.memberId}: ${err.message}`);
      }
    }

    // If nothing was actually updated
    if (results.length === 0 && skipped.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes detected. This data is already present.',
        skipped: skipped.length
      });
    }

    res.json({
      success: true,
      updated: results.length,
      skipped: skipped.length,
      errors
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/members/:id
// @desc    Get single member
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/members
// @desc    Create new member
// @access  Private
router.post('/', [
  body('artistName').trim().notEmpty().withMessage('Artist name is required'),
  body('email').optional({ checkFalsy: true }).trim(),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('status').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  try {
    const {
      artistName, email, phone, alternateNumber, location, contactName,
      category, tier, primaryRole, talentType, primaryGenres, source, spoc,
      talentScout,
      biography, instagramFollowers, spotifyMonthlyListeners, youtubeSubscribers,
      facebookFollowers, twitterFollowers, soundcloudFollowers,
      bankName, accountNumber, ifscCode, panNumber,
      aadharNumber, status, notes
    } = req.body;

    // Check if member with same artist name already exists (case-insensitive)
    const duplicateName = await Member.findOne({
      artistName: { $regex: new RegExp(`^${artistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (duplicateName) {
      return res.status(400).json({ message: `Member "${duplicateName.artistName}" already exists` });
    }

    // Email is no longer required and not unique — multiple artists can share contact info.
    const emailValue = email && email.trim() !== '' ? email : null;

    const member = await Member.create({
      artistName,
      email: emailValue,
      phone,
      alternateNumber,
      location,
      contactName,
      category,
      tier,
      primaryRole,
      talentType,
      primaryGenres,
      source,
      spoc,
      talentScout,
      biography,
      instagramFollowers,
      spotifyMonthlyListeners,
      youtubeSubscribers,
      facebookFollowers,
      twitterFollowers,
      soundcloudFollowers,
      bankName,
      accountNumber,
      ifscCode,
      panNumber,
      aadharNumber,
      status: status || 'pending',
      notes,
      createdBy: req.user?._id || null
    });

    // Sync overlapping fields to linked onboarding L1 questionnaire
    await syncMemberToOnboardingL1(member._id, {
      artistName, contactName, email: emailValue, phone, location,
      primaryRole, primaryGenres, biography, status: status || 'pending'
    });

    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        details: error.errors 
      });
    }
    if (error.code === 11000) {
      // Generic duplicate-key (only artistName is enforced uniquely at app layer; this is
      // a defensive fallback for any future unique index).
      return res.status(400).json({
        message: 'Duplicate value',
        error: error.message
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const {
      artistName, email, phone, alternateNumber, location, contactName,
      category, tier, primaryRole, talentType, primaryGenres, source, spoc,
      talentScout,
      biography, instagramFollowers, spotifyMonthlyListeners, youtubeSubscribers,
      facebookFollowers, twitterFollowers, soundcloudFollowers,
      bankName, accountNumber, ifscCode, panNumber,
      aadharNumber, status, notes
    } = req.body;

    // Enforce artistName uniqueness (case-insensitive) when the name changes.
    if (artistName && artistName.trim().toLowerCase() !== (member.artistName || '').trim().toLowerCase()) {
      const escaped = artistName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const duplicateName = await Member.findOne({
        _id: { $ne: req.params.id },
        artistName: { $regex: new RegExp(`^${escaped}$`, 'i') }
      });
      if (duplicateName) {
        return res.status(400).json({ message: `Member "${duplicateName.artistName}" already exists` });
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        artistName, email, phone, alternateNumber, location, contactName,
        category, tier, primaryRole, talentType, primaryGenres, source, spoc,
        talentScout,
        biography, instagramFollowers, spotifyMonthlyListeners, youtubeSubscribers,
        facebookFollowers, twitterFollowers, soundcloudFollowers,
        bankName, accountNumber, ifscCode, panNumber,
        aadharNumber, status, notes
      },
      { new: true, runValidators: true }
    );

    // Sync overlapping fields to linked onboarding L1 questionnaire
    await syncMemberToOnboardingL1(req.params.id, {
      artistName, contactName, email, phone, location,
      primaryRole, primaryGenres, biography, status
    });

    res.json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member + cascade-delete linked onboardings (by ref AND by name fallback for legacy records)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const Onboarding = (await import('../models/Onboarding.js')).default;
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Cascade: delete onboardings linked by ref OR (legacy) by exact artistName match
    const onbFilter = {
      $or: [
        { member: member._id },
        { artistName: member.artistName, member: { $exists: false } },
        { artistName: member.artistName, member: null }
      ]
    };
    const cascade = await Onboarding.deleteMany(onbFilter);

    await Member.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Member deleted successfully',
      cascadedOnboardings: cascade.deletedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
