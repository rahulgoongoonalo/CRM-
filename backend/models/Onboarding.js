import mongoose from 'mongoose';

const onboardingSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
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
    enum: ['contact-established', 'spoc-assigned', 'review-l2', 'closed-won', 'closed-lost'],
    default: 'contact-established'
  },
  // Step 1: Initial Contact Data
  step1Data: {
    source: String,
    contactStatus: String,
    step1Notes: String
  },
  // L1 Questionnaire Data
  l1QuestionnaireData: {
    artistName: String,
    primaryContact: String,
    email: String,
    phone: String,
    cityCountry: String,
    yearsActive: String,
    artistBio: String,
    hasManager: String,
    managerName: String,
    hasLabel: String,
    labelName: String,
    primaryRole: String,
    primaryGenres: String,
    languages: String,
    subGenre: String,
    streamingLink: String,
    youtube: String,
    instagram: String,
    otherPlatforms: String,
    hasDistributor: String,
    distributorName: String,
    hasContracts: String,
    contractValidUntil: String,
    exclusiveReleases: String,
    openToCollabs: String,
    whyGoongoonalo: String,
    howHeard: String,
    confirmRights: Boolean,
    acceptTerms: Boolean,
    consentEditorial: Boolean,
    understandPayout: Boolean
  },
  createdBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

export default mongoose.model('Onboarding', onboardingSchema);
