import express from 'express';
import { body, validationResult } from 'express-validator';
import Member from '../models/Member.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
// TEMPORARY: Comment out for testing - REMOVE IN PRODUCTION
// router.use(protect);

// @route   GET /api/members/list
// @desc    Get lightweight member list (id + name only) for dropdowns
// @access  Private
router.get('/list', async (req, res) => {
  try {
    const members = await Member.find({}, { artistName: 1 }).sort({ artistName: 1 }).lean();
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
        query.status = { $in: ['active', 'updated'] };
      } else if (statusLower === 'on hold') {
        query.status = 'inactive';
      } else if (statusLower === 'pending') {
        query.status = 'pending';
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
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
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

    // Convert empty email to null to avoid unique constraint issues
    const emailValue = email && email.trim() !== '' ? email : null;

    // Check if member with email already exists (only if email is provided)
    if (emailValue) {
      const memberExists = await Member.findOne({ email: emailValue });
      if (memberExists) {
        return res.status(400).json({ message: 'Member with this email already exists' });
      }
    }

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
      return res.status(400).json({ 
        message: 'Duplicate email', 
        error: 'A member with this email already exists' 
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
      biography, instagramFollowers, spotifyMonthlyListeners, youtubeSubscribers,
      facebookFollowers, twitterFollowers, soundcloudFollowers,
      bankName, accountNumber, ifscCode, panNumber,
      aadharNumber, status, notes
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== member.email) {
      const emailExists = await Member.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        artistName, email, phone, alternateNumber, location, contactName,
        category, tier, primaryRole, talentType, primaryGenres, source, spoc,
        biography, instagramFollowers, spotifyMonthlyListeners, youtubeSubscribers,
        facebookFollowers, twitterFollowers, soundcloudFollowers,
        bankName, accountNumber, ifscCode, panNumber,
        aadharNumber, status, notes
      },
      { new: true, runValidators: true }
    );

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
// @desc    Delete member
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await Member.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
