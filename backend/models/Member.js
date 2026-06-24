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
  talentScout: {
    type: String,
    trim: true,
    enum: ['Yes', 'No', ''],
    default: 'No'
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
memberSchema.index({ status: 1 });
memberSchema.index({ tier: 1 });
memberSchema.index({ source: 1 });
memberSchema.index({ memberNumber: -1 });
memberSchema.index({ createdAt: -1 });

// artistName is the business identity for a member. Uniqueness is enforced at the route
// layer (case-insensitive lookup before insert/update) — NOT as a DB unique index, so
// pre-existing duplicate names in the collection cause no startup failure.
memberSchema.index({ artistName: 1 });
// Plain (non-unique) index on email for fast lookups, no constraint.
memberSchema.index({ email: 1 }, { name: 'email_lookup' });

const Member = mongoose.model('Member', memberSchema);

// One-time index reconciliation: drop ANY unique index on the `email` field.
// Safe — only removes index metadata, never touches documents.
// Suppress noisy benign Mongoose "index already exists" warnings.
Member.on('index', err => {
  if (err && err.codeName !== 'IndexOptionsConflict' && !/same name as the requested index/.test(err.message || '')) {
    console.warn('[Member index] sync warning:', err.message);
  }
});

async function reconcileMemberIndexes() {
  try {
    // Wait for the mongoose default connection to be open before touching indexes.
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => {
        const onOpen = () => { mongoose.connection.off('open', onOpen); resolve(); };
        mongoose.connection.once('open', onOpen);
      });
    }
    const indexes = await Member.collection.indexes();
    let droppedAny = false;
    for (const idx of indexes) {
      const keys = Object.keys(idx.key || {});
      if (idx.unique && keys.length === 1 && keys[0] === 'email') {
        try {
          await Member.collection.dropIndex(idx.name);
          console.log(`[Member index] Dropped legacy unique-email index: ${idx.name}`);
          droppedAny = true;
        } catch (e) {
          if (e?.codeName !== 'IndexNotFound') {
            console.warn(`[Member index] Could not drop ${idx.name}:`, e.message);
          }
        }
      }
    }
    if (!droppedAny) {
      console.log('[Member index] No legacy unique-email index found — email is already non-unique.');
    }
  } catch (e) {
    console.warn('[Member index] Reconcile failed:', e.message);
  }
}
reconcileMemberIndexes();

export default Member;
