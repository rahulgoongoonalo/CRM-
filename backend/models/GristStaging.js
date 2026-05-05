import mongoose from 'mongoose';

const gristStagingSchema = new mongoose.Schema({
  // Grist row identity (unique per Grist row)
  gristId: { type: Number, required: true, unique: true, index: true },

  // Snapshot of all Grist fields — kept as Mixed so future Grist column changes don't break the schema
  fields: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Convenience fields lifted out for indexing / filtering
  artistName: { type: String, default: '', index: true },
  email: { type: String, default: '', index: true },
  phone: { type: String, default: '' },

  // Sync state
  // - pending: in Grist, not yet pushed to Member/Onboarding
  // - synced:  pushed to Member/Onboarding
  // - ignored: user marked it as ignored (still in Grist, but won't be synced)
  status: {
    type: String,
    enum: ['pending', 'synced', 'ignored'],
    default: 'pending',
    index: true
  },

  // Refs created on sync
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  onboarding: { type: mongoose.Schema.Types.ObjectId, ref: 'Onboarding', default: null },

  // Timestamps
  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  syncedAt: { type: Date, default: null },
  ignoredAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('GristStaging', gristStagingSchema);
