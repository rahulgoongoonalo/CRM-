import mongoose from 'mongoose';

const glossaryTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  accountable: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: String,
    trim: true,
  },
  createdDate: {
    type: Date,
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  fileOriginalName: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const GlossaryTask = mongoose.model('GlossaryTask', glossaryTaskSchema);

export default GlossaryTask;
