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

// @route   PUT /api/onboarding/renumber
// @desc    Renumber all onboarding tasks sequentially starting from 1
// @access  Private
router.put('/renumber', async (req, res) => {
  try {
    const onboardings = await Onboarding.find().sort({ taskNumber: 1 });

    let count = 0;
    for (let i = 0; i < onboardings.length; i++) {
      const newNumber = i + 1;
      if (onboardings[i].taskNumber !== newNumber) {
        await Onboarding.findByIdAndUpdate(onboardings[i]._id, { taskNumber: newNumber });
        count++;
      }
    }

    res.json({
      success: true,
      message: `Renumbered ${count} onboarding tasks. Total: ${onboardings.length}`,
      total: onboardings.length,
      updated: count
    });
  } catch (error) {
    console.error('Error renumbering onboarding tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get full export data with member + L1 + L2 data (must be before /:id route)
router.get('/reports/full-export', async (req, res) => {
  try {
    const onboardings = await Onboarding.find()
      .populate('member')
      .sort({ createdAt: -1 })
      .lean();
    
    const exportData = onboardings.map((onboarding, index) => {
      const member = onboarding.member || {};
      const l1 = onboarding.l1QuestionnaireData || {};
      const l2 = onboarding.l2ReviewData || {};
      const step1 = onboarding.step1Data || {};
      
      // Calculate days from ETA
      let daysFromETA = null;
      if (onboarding.etaClosure) {
        const today = new Date();
        const eta = new Date(onboarding.etaClosure);
        daysFromETA = Math.floor((today - eta) / (1000 * 60 * 60 * 24));
      }

      const statusMapping = {
        'hot': 'Hot', 'warm': 'Warm', 'cold': 'Cold',
        'closed-won': 'Closed Won', 'closed-lost': 'Closed Lost',
        'cold-storage': 'Cold Storage'
      };

      // Clean tier
      let cleanTier = 'N/A';
      if (member.tier) {
        const tierMatch = member.tier.toString().toLowerCase().match(/tier\s*(\d+)/);
        cleanTier = tierMatch ? `Tier ${tierMatch[1]}` : member.tier;
      }
      
      return {
        // Basic Info
        serialNo: index + 1,
        taskNumber: onboarding.taskNumber || 'N/A',
        onboardingStatus: statusMapping[onboarding.status?.toLowerCase()] || onboarding.status || 'N/A',
        etaClosure: onboarding.etaClosure ? new Date(onboarding.etaClosure).toLocaleDateString() : 'N/A',
        daysFromETA: daysFromETA !== null ? daysFromETA : 'N/A',
        spoc: onboarding.spoc || 'N/A',
        onboardingNotes: onboarding.notes || '',
        onboardingDescription: onboarding.description || '',
        
        // Member Data
        memberNumber: member.memberNumber || 'N/A',
        artistName: member.artistName || onboarding.artistName || 'N/A',
        email: member.email || 'N/A',
        phone: member.phone || 'N/A',
        alternateNumber: member.alternateNumber || 'N/A',
        location: member.location || 'N/A',
        country: member.country || 'N/A',
        contactName: member.contactName || 'N/A',
        category: member.category || 'N/A',
        tier: cleanTier,
        primaryRole: member.primaryRole || 'N/A',
        talentType: member.talentType || 'N/A',
        primaryGenres: member.primaryGenres || 'N/A',
        source: member.source || 'N/A',
        biography: member.biography || 'N/A',
        memberStatus: member.status || 'N/A',
        joinDate: member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A',
        instagramFollowers: member.instagramFollowers ?? 'N/A',
        spotifyMonthlyListeners: member.spotifyMonthlyListeners ?? 'N/A',
        youtubeSubscribers: member.youtubeSubscribers ?? 'N/A',
        facebookFollowers: member.facebookFollowers ?? 'N/A',
        twitterFollowers: member.twitterFollowers ?? 'N/A',
        soundcloudFollowers: member.soundcloudFollowers ?? 'N/A',
        bankName: member.bankName || 'N/A',
        accountNumber: member.accountNumber || 'N/A',
        ifscCode: member.ifscCode || 'N/A',
        panNumber: member.panNumber || 'N/A',
        aadharNumber: member.aadharNumber || 'N/A',
        
        // Step 1 Data
        step1Source: step1.source || 'N/A',
        step1ContactStatus: step1.contactStatus || 'N/A',
        step1Notes: step1.step1Notes || '',
        
        // L1 Questionnaire Data
        l1ArtistName: l1.artistName || 'N/A',
        l1PrimaryContact: l1.primaryContact || 'N/A',
        l1Email: l1.email || 'N/A',
        l1Phone: l1.phone || 'N/A',
        l1CityCountry: l1.cityCountry || 'N/A',
        l1YearsActive: l1.yearsActive || 'N/A',
        l1ArtistBio: l1.artistBio || '',
        l1ListenerRegion: l1.listenerRegion || 'N/A',
        l1HasManager: l1.hasManager || 'N/A',
        l1ManagerName: l1.managerName || 'N/A',
        l1HasLabel: l1.hasLabel || 'N/A',
        l1LabelName: l1.labelName || 'N/A',
        l1PrimaryRole: l1.primaryRole || 'N/A',
        l1PrimaryGenres: l1.primaryGenres || 'N/A',
        l1Languages: l1.languages || 'N/A',
        l1SubGenre: l1.subGenre || 'N/A',
        l1StreamingLink: l1.streamingLink || 'N/A',
        l1Youtube: l1.youtube || 'N/A',
        l1Instagram: l1.instagram || 'N/A',
        l1Facebook: l1.facebook || 'N/A',
        l1Twitter: l1.twitter || 'N/A',
        l1Soundcloud: l1.soundcloud || 'N/A',
        l1OtherPlatforms: l1.otherPlatforms || 'N/A',
        l1HasDistributor: l1.hasDistributor || 'N/A',
        l1DistributorName: l1.distributorName || 'N/A',
        l1HasContracts: l1.hasContracts || 'N/A',
        l1ContractValidUntil: l1.contractValidUntil || 'N/A',
        l1ExclusiveReleases: l1.exclusiveReleases || 'N/A',
        l1OpenToCollabs: l1.openToCollabs || 'N/A',
        l1PerformLive: l1.performLive || 'N/A',
        l1UpcomingProject: l1.upcomingProject || 'N/A',
        l1InterestedInGatecrash: l1.interestedInGatecrash || 'N/A',
        l1WhyGoongoonalo: l1.whyGoongoonalo || '',
        l1HowHeard: l1.howHeard || 'N/A',
        l1OtherInfo: l1.otherInfo || '',
        l1BankName: l1.bankName || 'N/A',
        l1AccountNumber: l1.accountNumber || 'N/A',
        l1IfscCode: l1.ifscCode || 'N/A',
        l1PanNumber: l1.panNumber || 'N/A',
        l1AadharNumber: l1.aadharNumber || 'N/A',
        l1ConfirmRights: l1.confirmRights != null ? (l1.confirmRights ? 'Yes' : 'No') : 'N/A',
        l1AcceptTerms: l1.acceptTerms != null ? (l1.acceptTerms ? 'Yes' : 'No') : 'N/A',
        l1ConsentEditorial: l1.consentEditorial != null ? (l1.consentEditorial ? 'Yes' : 'No') : 'N/A',
        l1UnderstandPayout: l1.understandPayout != null ? (l1.understandPayout ? 'Yes' : 'No') : 'N/A',
        
        // L2 Review Data
        l2MeetingScheduledOn: l2.meetingScheduledOn ? new Date(l2.meetingScheduledOn).toLocaleDateString() : 'N/A',
        l2MeetingType: l2.meetingType || 'N/A',
        l2CatalogReview: l2.checklist?.catalogReview ? 'Yes' : 'No',
        l2RightsOwnership: l2.checklist?.rightsOwnership ? 'Yes' : 'No',
        l2CommercialData: l2.checklist?.commercialData ? 'Yes' : 'No',
        l2ContractDiscussion: l2.checklist?.contractDiscussion ? 'Yes' : 'No',
        l2TechOnboarding: l2.checklist?.techOnboarding ? 'Yes' : 'No',
        l2ContentIngestion: l2.checklist?.contentIngestion ? 'Yes' : 'No',
        l2MembershipType: Array.isArray(l2.membershipType) ? l2.membershipType.join(', ') : (l2.membershipType || 'N/A'),
        l2Notes: l2.notes || '',
        l2ClosureChecklist: Array.isArray(l2.closureChecklist) ? l2.closureChecklist.map((c, i) => 
          `[${i+1}] Status: ${c.status || 'N/A'}, Type: ${c.membershipType || 'N/A'}, SPOC: ${c.spoc || 'N/A'}, ETA: ${c.eta ? new Date(c.eta).toLocaleDateString() : 'N/A'}`
        ).join(' | ') : 'N/A',
        l2DocumentsCount: Array.isArray(l2.documents) ? l2.documents.length : 0,
        l2DocumentTitles: Array.isArray(l2.documents) ? l2.documents.map(d => d.title || d.fileName).join(', ') : 'N/A',
      };
    });
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error fetching full export data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch full export data',
      error: error.message
    });
  }
});

// Get onboarding status report data (must be before /:id route)
router.get('/reports/onboarding-status', async (req, res) => {
  try {
    const onboardings = await Onboarding.find()
      .populate('member', 'artistName primaryGenres source tier')
      .sort({ createdAt: -1 })
      .lean();
    
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

// Get all onboardings with server-side pagination, search, filter, sort
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    // Build filter query
    const query = {};

    // Status filter — map display label to db value
    if (status && status !== 'All') {
      const statusMap = {
        'hot': 'hot',
        'warm': 'warm',
        'cold': 'cold',
        'closed won': 'closed-won',
        'closed lost': 'closed-lost',
        'cold storage': 'cold-storage'
      };
      const mapped = statusMap[status.toLowerCase()];
      if (mapped) {
        query.status = mapped;
      }
    }

    // Search across artistName and spoc (member.source searched via populate match later)
    if (search.trim()) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { artistName: { $regex: escaped, $options: 'i' } },
        { spoc: { $regex: escaped, $options: 'i' } }
      ];

      // Also find members whose source or artistName matches and include their IDs
      const matchingMembers = await Member.find({
        $or: [
          { artistName: { $regex: escaped, $options: 'i' } },
          { source: { $regex: escaped, $options: 'i' } }
        ]
      }, { _id: 1 }).lean();

      if (matchingMembers.length > 0) {
        query.$or.push({ member: { $in: matchingMembers.map(m => m._id) } });
      }
    }

    // Build sort — handle populated field sorting
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute paginated query + total count + stats in parallel
    const [onboardings, total, closedWon, closedLost, coldStorage, grandTotal] = await Promise.all([
      Onboarding.find(query)
        .populate('member', 'artistName email phone primaryGenres source tier')
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Onboarding.countDocuments(query),
      Onboarding.countDocuments({ status: 'closed-won' }),
      Onboarding.countDocuments({ status: 'closed-lost' }),
      Onboarding.countDocuments({ status: 'cold-storage' }),
      Onboarding.countDocuments({})
    ]);

    res.json({
      success: true,
      data: onboardings,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      stats: {
        total: grandTotal,
        closedWon,
        closedLost,
        coldStorage
      }
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
      .populate('member', 'artistName email phone primaryGenres source tier')
      .lean();
    
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

    // Check if onboarding already exists for this member
    const existingOnboarding = await Onboarding.findOne({ member });
    if (existingOnboarding) {
      return res.status(400).json({
        success: false,
        message: `Onboarding for "${existingOnboarding.artistName}" already exists`
      });
    }

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

// Save L1 Questionnaire progress (no validation, no status change)
router.patch('/:id/l1-questionnaire/save-progress', async (req, res) => {
  try {
    const l1Data = req.body;

    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({ success: false, message: 'Onboarding not found' });
    }

    // Save whatever data has been filled so far — do NOT change status
    const updatedOnboarding = await Onboarding.findByIdAndUpdate(
      req.params.id,
      { l1QuestionnaireData: l1Data },
      { new: true, runValidators: false }
    ).populate('member', 'artistName email phone primaryGenres source tier');

    res.json({
      success: true,
      data: updatedOnboarding,
      message: 'L1 Questionnaire progress saved'
    });
  } catch (error) {
    console.error('Error saving L1 questionnaire progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save L1 questionnaire progress',
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
