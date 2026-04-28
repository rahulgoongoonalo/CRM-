import mongoose from 'mongoose';

const picklistItemSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
  type: { type: String, default: 'yesno' },
  dependsOn: { type: String, default: '' },
  showWhen: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { _id: true });

const picklistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  items: [picklistItemSchema]
}, { timestamps: true });

const Picklist = mongoose.model('Picklist', picklistSchema);

export default Picklist;
