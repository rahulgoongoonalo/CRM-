import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Picklist from '../models/Picklist.js';

await connectDB();

const picklist = await Picklist.findOne({ name: 'onboardingStatus' });
if (!picklist) {
  console.log('onboardingStatus picklist not found');
  process.exit(0);
}

const exists = picklist.items.some(i => i.value === 'review-l2');
if (exists) {
  console.log('review-l2 already present');
} else {
  const maxOrder = picklist.items.reduce((m, i) => Math.max(m, i.order || 0), 0);
  picklist.items.push({ value: 'review-l2', label: 'Review L2', order: maxOrder + 1, isActive: true });
  await picklist.save();
  console.log('Added review-l2 to onboardingStatus picklist');
}

await mongoose.disconnect();
