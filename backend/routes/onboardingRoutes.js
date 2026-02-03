import express from 'express';
import Onboarding from '../models/Onboarding.js';
import Member from '../models/Member.js';

const router = express.Router();

// Get all onboardings with member details
router.get('/', async (req, res) => {
  try {
    const onboardings = await Onboarding.find()
      .populate('member', 'name email phone genre source membershipType')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: onboardings
    });
  } catch (error) {
    console.error('Error fetching onboardings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboardings',
      error: error.message
    });
  }
});

// Get single onboarding by ID
router.get('/:id', async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate('member', 'name email phone genre source membershipType');
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }
    
    res.json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    console.error('Error fetching onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding',
      error: error.message
    });
  }
});

// Create new onboarding
router.post('/', async (req, res) => {
  try {
    const { member, memberName, description, spoc, etaClosure, notes, status, createdBy } = req.body;
    
    const newOnboarding = new Onboarding({
      member,
      memberName,
      description,
      spoc,
      etaClosure,
      notes,
      status: status || 'contact-established',
      createdBy: createdBy || 'Admin'
    });
    
    const savedOnboarding = await newOnboarding.save();
    const populatedOnboarding = await Onboarding.findById(savedOnboarding._id)
      .populate('member', 'name email phone genre source membershipType');
    
    res.status(201).json({
      success: true,
      data: populatedOnboarding,
      message: 'Onboarding created successfully'
    });
  } catch (error) {
    console.error('Error creating onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create onboarding',
      error: error.message
    });
  }
});

// Update onboarding
router.put('/:id', async (req, res) => {
  try {
    const { member, description, spoc, etaClosure, notes, status } = req.body;
    
    const updatedOnboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      {
        member,
        description,
        spoc,
        etaClosure,
        notes,
        status
      },
      { new: true, runValidators: true }
    ).populate('member', 'name email phone genre source membershipType');
    
    if (!updatedOnboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedOnboarding,
      message: 'Onboarding updated successfully'
    });
  } catch (error) {
    console.error('Error updating onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update onboarding',
      error: error.message
    });
  }
});

// Delete onboarding
router.delete('/:id', async (req, res) => {
  try {
    const deletedOnboarding = await Onboarding.findByIdAndDelete(req.params.id);
    
    if (!deletedOnboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Onboarding deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete onboarding',
      error: error.message
    });
  }
});

// Update Step 1 data
router.patch('/:id/step1', async (req, res) => {
  try {
    const { source, contactStatus, step1Notes } = req.body;
    
    const updatedOnboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      {
        step1Data: { source, contactStatus, step1Notes },
        status: 'spoc-assigned'
      },
      { new: true, runValidators: true }
    ).populate('member', 'name email phone genre source membershipType');
    
    if (!updatedOnboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedOnboarding,
      message: 'Step 1 data saved successfully'
    });
  } catch (error) {
    console.error('Error updating step 1:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update step 1',
      error: error.message
    });
  }
});

// Update L1 Questionnaire data
router.patch('/:id/l1-questionnaire', async (req, res) => {
  try {
    const l1Data = req.body;
    
    // Find the onboarding to get the member ID
    const onboarding = await Onboarding.findById(req.params.id);
    
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }
    
    // Update the onboarding with L1 data
    const updatedOnboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      {
        l1QuestionnaireData: l1Data,
        status: 'review-l2'
      },
      { new: true, runValidators: true }
    ).populate('member', 'name email phone genre source membershipType');
    
    // Update the member with KYC information from L1 data
    if (onboarding.member && l1Data) {
      await Member.findByIdAndUpdate(
        onboarding.member,
        {
          bankName: l1Data.bankName,
          accountNumber: l1Data.accountNumber,
          ifscCode: l1Data.ifscCode,
          panNumber: l1Data.panNumber,
          aadharNumber: l1Data.aadharNumber
        },
        { runValidators: true }
      );
    }
    
    res.json({
      success: true,
      data: updatedOnboarding,
      message: 'L1 Questionnaire saved successfully'
    });
  } catch (error) {
    console.error('Error updating L1 questionnaire:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update L1 questionnaire',
      error: error.message
    });
  }
});

// Update L2 Review data
router.patch('/:id/l2-review', async (req, res) => {
  try {
    const { l2ReviewData, status } = req.body;
    
    const updatedOnboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      {
        l2ReviewData,
        status: status || 'review-l2'
      },
      { new: true, runValidators: true }
    ).populate('member', 'name email phone genre source membershipType');
    
    if (!updatedOnboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedOnboarding,
      message: 'L2 Review saved successfully'
    });
  } catch (error) {
    console.error('Error updating L2 review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update L2 review',
      error: error.message
    });
  }
});

export default router;
