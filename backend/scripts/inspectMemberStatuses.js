import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Member from '../models/Member.js';
import Picklist from '../models/Picklist.js';

await connectDB();

const distinct = await Member.distinct('status');
console.log('Distinct member.status values in DB:', distinct);

const inactive = await Member.find({ status: { $regex: /inactive/i } }, { artistName: 1, status: 1 }).lean();
console.log('Members with inactive-ish status:', inactive);

const rahul = await Member.findOne({ artistName: /Rahul Test/i }, { artistName: 1, status: 1 }).lean();
console.log('Rahul Test member doc:', rahul);

const pl = await Picklist.findOne({ name: 'memberStatus' }).lean();
console.log('memberStatus picklist items:', pl?.items);

await mongoose.disconnect();
