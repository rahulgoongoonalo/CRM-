import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Onboarding from '../models/Onboarding.js';
import Member from '../models/Member.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const uploadsDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

// Get onboarding status report data (must be before /:id route)
router.get('/reports/onboarding-status', async (req, res) => {
  try {
    const onboardings = await Onboarding.find()
      .populate('member', 'artistName primaryGenres source tier')
      .sort({ createdAt: -1 });
    
    // Transform data for the report
    const reportData = onboardings.map((onboarding, index) => {
      const member = onboarding.member;
      const etaClosure = onboarding.etaClosure;
      
      // Calculate days from ETA
      let daysFromETA = null;
      if (etaClosure) {
        const today = new Date();
        const eta = new Date(etaClosure);
        const timeDiff = today - eta;
        daysFromETA = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      }
      
      // Format onboarding status
      const statusMapping = {
        'hot': 'Hot',
        'warm': 'Warm',
        'cold': 'Cold'
      };
      
      // Clean and normalize tier value
      let cleanTier = 'N/A';
      if (member?.tier) {
        const tierStr = member.tier.toString().toLowerCase();
        // Extract tier number from formats like "tier 3 - 500k" or "tier3"
        const tierMatch = tierStr.match(/tier\s*(\d+)/);
        if (tierMatch) {
          cleanTier = `tier${tierMatch[1]}`;
        } else {
          cleanTier = tierStr;
        }
      }
      
      return {
        serialNo: index + 1,
        artistName: member?.artistName || onboarding.artistName || 'N/A',
        genre: member?.primaryGenres || 'N/A',
        source: member?.source || onboarding.step1Data?.source || 'N/A',
        spoc: onboarding.spoc || 'N/A',
        tier: cleanTier,
        onboardingStatus: statusMapping[onboarding.status.toLowerCase()] || statusMapping[onboarding.status] || onboarding.status,
        etaClosure: etaClosure ? new Date(etaClosure).toLocaleDateString() : 'N/A',
        daysFromETA: daysFromETA !== null ? daysFromETA : 'N/A',
        rawEtaClosure: etaClosure
      };
    });
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error fetching onboarding status report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding status report',
      error: error.message
    });
  }
});

// Get all onboardings with member details
router.get('/', async (req, res) => {
  try {
    const onboardings = await Onboarding.find()
      .populate('member', 'artistName email phone primaryGenres source tier')
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
      .populate('member', 'artistName email phone primaryGenres source tier');
    
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
    const { member, artistName, description, spoc, etaClosure, notes, status, createdBy } = req.body;
    
    const newOnboarding = new Onboarding({
      member,
      artistName,
      description,
      spoc,
      etaClosure,
      notes,
      status: status || 'contact-established',
      createdBy: createdBy || 'Admin'
    });
    
    const savedOnboarding = await newOnboarding.save();
    const populatedOnboarding = await Onboarding.findById(savedOnboarding._id)
      .populate('member', 'artistName email phone primaryGenres source tier');
    
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
    ).populate('member', 'artistName email phone primaryGenres source tier');
    
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
    ).populate('member', 'artistName email phone primaryGenres source tier');
    
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
    ).populate('member', 'artistName email phone primaryGenres source tier');
    
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
    
    // Preserve existing documents when updating L2 review
    const existing = await Onboarding.findById(req.params.id);
    if (existing && existing.l2ReviewData && existing.l2ReviewData.documents) {
      l2ReviewData.documents = existing.l2ReviewData.documents;
    }
    
    const updatedOnboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      {
        l2ReviewData,
        status: status || 'review-l2'
      },
      { new: true, runValidators: true }
    ).populate('member', 'artistName email phone primaryGenres source tier');
    
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

// Upload document for L2 Review
router.post('/:id/l2-review/upload-document', upload.single('document'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: 'Document title is required' });
    }

    const docEntry = {
      title,
      description: description || '',
      fileName: file.originalname,
      filePath: '/uploads/documents/' + file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedAt: new Date()
    };

    const updatedOnboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      { $push: { 'l2ReviewData.documents': docEntry } },
      { new: true, runValidators: true }
    ).populate('member', 'artistName email phone primaryGenres source tier');

    if (!updatedOnboarding) {
      return res.status(404).json({ success: false, message: 'Onboarding not found' });
    }

    res.json({
      success: true,
      data: updatedOnboarding,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document', error: error.message });
  }
});

// Delete document from L2 Review
router.delete('/:id/l2-review/document/:docIndex', async (req, res) => {
  try {
    const { id, docIndex } = req.params;
    const onboarding = await Onboarding.findById(id);

    if (!onboarding) {
      return res.status(404).json({ success: false, message: 'Onboarding not found' });
    }

    const docs = onboarding.l2ReviewData?.documents || [];
    const idx = parseInt(docIndex);
    if (idx < 0 || idx >= docs.length) {
      return res.status(400).json({ success: false, message: 'Invalid document index' });
    }

    // Remove the file from disk
    const filePath = path.join(__dirname, '..', docs[idx].filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    docs.splice(idx, 1);
    onboarding.l2ReviewData.documents = docs;
    await onboarding.save();

    const populated = await Onboarding.findById(id)
      .populate('member', 'artistName email phone primaryGenres source tier');

    res.json({ success: true, data: populated, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
});

export default router;
