import mongoose from 'mongoose';

const onboardingSchema = new mongoose.Schema({
  taskNumber: {
    type: Number,
    unique: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  spoc: {
    type: String,
    required: true
  },
  etaClosure: {
    type: Date,
    required: false
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    // enum managed via Picklist collection
    default: 'warm'
  },
  // Step 1: Initial Contact Data
  step1Data: {
    type: {
      source: String,
      contactStatus: String,
      step1Notes: String
    },
    default: {}
  },
  // L1 Questionnaire Data
  l1QuestionnaireData: {
    type: {
      // Artist Basics
      artistName: String,
      primaryContact: String,
      email: String,
      phone: String,
      cityCountry: String,
      yearsActive: String,
      artistBio: String,
      listenerRegion: String,
      // Representation
      hasManager: String,
      managerName: String,
      hasLabel: String,
      labelName: String,
      // Music & Identity
      primaryRole: String,
      primaryGenres: String,
      languages: String,
      subGenre: String,
      // Streaming & Social Media
      streamingLink: String,
      youtube: String,
      instagram: String,
      facebook: String,
      twitter: String,
      soundcloud: String,
      otherPlatforms: String,
      // Existing Contracts
      hasDistributor: String,
      distributorName: String,
      hasContracts: String,
      contractValidUntil: String,
      // Goongoonalo Participation
      exclusiveReleases: String,
      openToCollabs: String,
      performLive: String,
      upcomingProject: String,
      interestedInGatecrash: String,
      whyGoongoonalo: String,
      howHeard: String,
      otherInfo: String,
      // KYC Information
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      panNumber: String,
      aadharNumber: String,
      // Agreements
      confirmRights: Boolean,
      acceptTerms: Boolean,
      consentEditorial: Boolean,
      understandPayout: Boolean
    },
    default: {}
  },
  // L2 Review Data
  l2ReviewData: {
    type: {
      meetingScheduledOn: Date,
      meetingType: {
        type: String,
        default: 'In-Person'
      },
      checklist: {
        catalogReview: { type: Boolean, default: false },
        rightsOwnership: { type: Boolean, default: false },
        commercialData: { type: Boolean, default: false },
        contractDiscussion: { type: Boolean, default: false },
        techOnboarding: { type: Boolean, default: false },
        contentIngestion: { type: Boolean, default: false }
      },
      // New 5-stage closure tracking
      stages: {
        basicOnboarding: {
          firstCallCompleted: { type: String, default: 'NA' },
          artistInfoUpdated: { type: String, default: 'NA' },
          whatsappGroupCreated: { type: String, default: 'NA' },
          introEmailSent: { type: String, default: 'NA' },
          notInterested: { type: String, default: 'NA' }
        },
        artistInvestment: {
          ssaShaShared: { type: String, default: 'NA' },
          kycReceived: { type: String, default: 'NA' },
          investmentReceived: { type: String, default: 'NA' },
          shareCertificateSent: { type: String, default: 'NA' }
        },
        distributionAgreement: {
          distributionAgreementSent: { type: String, default: 'NA' },
          contentReceivedForUpload: { type: String, default: 'NA' },
          contentSentToDevi: { type: String, default: 'NA' },
          contentVisibleOnGoongoonalo: { type: String, default: 'NA' }
        },
        nonExclusiveLicense: {
          streamingAgreementSent: { type: String, default: 'NA' },
          contentReceivedForUpload: { type: String, default: 'NA' },
          contentSentToDevi: { type: String, default: 'NA' },
          contentVisibleOnGoongoonalo: { type: String, default: 'NA' },
          artistReviewMeeting: { type: String, default: 'NA' },
          subscriptionActivated: { type: String, default: 'NA' }
        },
        finalClosure: {
          notInterested: { type: String, default: 'NA' },
          investmentClosed: { type: String, default: 'NA' },
          distributionClosed: { type: String, default: 'NA' },
          licensingClosed: { type: String, default: 'NA' },
          ayushDemoCompleted: { type: String, default: 'NA' }
        }
      },
      notes: String,
      documents: [{
        title: String,
        description: String,
        fileName: String,
        filePath: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: { type: Date, default: Date.now }
      }]
    },
    default: {}
  },
  createdBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
onboardingSchema.index({ status: 1 });
onboardingSchema.index({ member: 1 });
onboardingSchema.index({ taskNumber: -1 });
onboardingSchema.index({ createdAt: -1 });

// Auto-increment taskNumber before saving
onboardingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastOnboarding = await mongoose.model('Onboarding').findOne({}, { taskNumber: 1 }).sort({ taskNumber: -1 }).lean();
      this.taskNumber = lastOnboarding ? lastOnboarding.taskNumber + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Onboarding', onboardingSchema);
