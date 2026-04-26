import mongoose from 'mongoose';

const stageCountSchema = new mongoose.Schema({
  stageKey: { type: String, required: true },
  New: { type: Number, default: 0 },
  inProgress: { type: Number, default: 0 },
  Closed: { type: Number, default: 0 },
}, { _id: false });

const closureReportSnapshotSchema = new mongoose.Schema({
  dateKey: { type: String, required: true, unique: true, index: true },
  totalArtists: { type: Number, default: 0 },
  counts: [stageCountSchema],
}, { timestamps: true });

const ClosureReportSnapshot = mongoose.model('ClosureReportSnapshot', closureReportSnapshotSchema);

export default ClosureReportSnapshot;
