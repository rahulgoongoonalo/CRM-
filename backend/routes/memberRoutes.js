import express from 'express';
import { body, validationResult } from 'express-validator';
import Member from '../models/Member.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/members
// @desc    Get all members
// @access  Private
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/members/:id
// @desc    Get single member
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('createdBy', 'name email');
    
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
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('membershipType').optional().isIn(['basic', 'premium', 'vip']),
  body('status').optional().isIn(['active', 'inactive', 'pending'])
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
      name, email, phone, alternateNumber, address, aliasName, 
      category, tier, talentRole, talentType, genre, source, spoc, 
      biography, bankName, accountNumber, ifscCode, panNumber, 
      aadharNumber, membershipType, status, notes 
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
      name,
      email: emailValue,
      phone,
      alternateNumber,
      address,
      aliasName,
      category,
      tier,
      talentRole,
      talentType,
      genre,
      source,
      spoc,
      biography,
      bankName,
      accountNumber,
      ifscCode,
      panNumber,
      aadharNumber,
      membershipType: membershipType || 'basic',
      status: status || 'active',
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
      name, email, phone, alternateNumber, address, aliasName, 
      category, tier, talentRole, talentType, genre, source, spoc, 
      biography, bankName, accountNumber, ifscCode, panNumber, 
      aadharNumber, membershipType, status, notes 
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
        name, email, phone, alternateNumber, address, aliasName, 
        category, tier, talentRole, talentType, genre, source, spoc, 
        biography, bankName, accountNumber, ifscCode, panNumber, 
        aadharNumber, membershipType, status, notes 
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
