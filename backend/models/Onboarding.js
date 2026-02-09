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
    enum: ['pending', 'contact-established', 'spoc-assigned', 'review-l2', 'closed-won', 'closed-lost'],
    default: 'contact-established'
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
      enum: ['In-Person', 'Google Meet'],
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
    membershipType: {
      type: String,
      enum: ['artist-investor', 'partner-artist']
    },
    notes: String
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

// Auto-increment taskNumber before saving
onboardingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastOnboarding = await mongoose.model('Onboarding').findOne().sort({ taskNumber: -1 });
      this.taskNumber = lastOnboarding ? lastOnboarding.taskNumber + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Onboarding', onboardingSchema);
