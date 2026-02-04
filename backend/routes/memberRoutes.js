import express from 'express';
import { body, validationResult } from 'express-validator';
import Member from '../models/Member.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
// TEMPORARY: Comment out for testing - REMOVE IN PRODUCTION
// router.use(protect);

// @route   GET /api/members
// @desc    Get all members
// @access  Private
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/members - Request received');
    const members = await Member.find().sort({ createdAt: -1 });
    console.log(`Found ${members.length} members`);
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error in GET /api/members:', error);
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
  body('status').optional().isIn(['active', 'inactive', 'pending', 'on hold', 'Active', 'Inactive', 'Pending', 'On Hold'])
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
      biography, bankName, accountNumber, ifscCode, panNumber, 
      aadharNumber, status, notes 
    } = req.body;

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
      biography, bankName, accountNumber, ifscCode, panNumber, 
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
        biography, bankName, accountNumber, ifscCode, panNumber, 
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
