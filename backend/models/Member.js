import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  memberNumber: {
    type: Number,
    unique: true
  },
  artistName: {
    type: String,
    required: [true, 'Please provide artist name'],
    trim: true
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  alternateNumber: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  contactName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  tier: {
    type: String,
    trim: true,
    default: 'tier1'
  },
  primaryRole: {
    type: String,
    trim: true
  },
  talentType: {
    type: String,
    trim: true
  },
  primaryGenres: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  spoc: {
    type: String,
    trim: true
  },
  biography: {
    type: String,
    trim: true
  },
  instagramFollowers: {
    type: Number,
    default: null
  },
  spotifyMonthlyListeners: {
    type: Number,
    default: null
  },
  youtubeSubscribers: {
    type: Number,
    default: null
  },
  facebookFollowers: {
    type: Number,
    default: null
  },
  twitterFollowers: {
    type: Number,
    default: null
  },
  soundcloudFollowers: {
    type: Number,
    default: null
  },
  bankName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true
  },
  panNumber: {
    type: String,
    trim: true
  },
  aadharNumber: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    // enum managed via Picklist collection
    default: 'pending'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
memberSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Auto-increment memberNumber for new members
  if (this.isNew) {
    try {
      const lastMember = await mongoose.model('Member').findOne().sort({ memberNumber: -1 });
      this.memberNumber = lastMember ? lastMember.memberNumber + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Indexes for faster queries
memberSchema.index({ artistName: 1 });
memberSchema.index({ status: 1 });
memberSchema.index({ tier: 1 });
memberSchema.index({ source: 1 });
memberSchema.index({ memberNumber: -1 });
memberSchema.index({ createdAt: -1 });

// Create partial unique index on email
// Partial index only applies to documents where email exists and is a non-empty string
// This allows unlimited documents with null/empty/missing email
memberSchema.index(
  { email: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { email: { $exists: true, $type: 'string', $gt: '' } },
    name: 'email_unique_partial'
  }
);

const Member = mongoose.model('Member', memberSchema);

export default Member;
