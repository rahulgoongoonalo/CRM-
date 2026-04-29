import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Picklist from '../models/Picklist.js';

await connectDB();

const p = await Picklist.findOne({ name: 'onboardingStatus' }).lean();
console.log(JSON.stringify(p?.items, null, 2));

await mongoose.disconnect();
