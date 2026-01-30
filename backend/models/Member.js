import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide member name'],
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
  address: {
    type: String,
    trim: true
  },
  aliasName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  tier: {
    type: String,
    trim: true
  },
  talentRole: {
    type: String,
    trim: true
  },
  talentType: {
    type: String,
    trim: true
  },
  genre: {
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
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  membershipType: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    default: 'basic'
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
memberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create sparse unique index on email (allows multiple null values)
memberSchema.index({ email: 1 }, { unique: true, sparse: true });

const Member = mongoose.model('Member', memberSchema);

export default Member;
