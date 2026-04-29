import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Picklist from '../models/Picklist.js';

await connectDB();

const desired = [
  { value: 'hot', label: 'Hot', order: 1, isActive: true },
  { value: 'warm', label: 'Warm', order: 2, isActive: true },
  { value: 'cold', label: 'Cold', order: 3, isActive: true },
  { value: 'review-l2', label: 'Review L2', order: 4, isActive: true },
  { value: 'closed-won', label: 'Closed Won', order: 5, isActive: true },
  { value: 'closed-lost', label: 'Closed Lost', order: 6, isActive: true },
  { value: 'cold-storage', label: 'Cold Storage', order: 7, isActive: true },
];

const picklist = await Picklist.findOne({ name: 'onboardingStatus' });
if (!picklist) {
  console.log('onboardingStatus picklist not found');
  process.exit(0);
}

picklist.items = desired;
await picklist.save();

const fresh = await Picklist.findOne({ name: 'onboardingStatus' }).lean();
console.log('Cleaned items:');
console.log(JSON.stringify(fresh.items.map(({ value, label, order, isActive }) => ({ value, label, order, isActive })), null, 2));

await mongoose.disconnect();
