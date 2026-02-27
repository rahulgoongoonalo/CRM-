import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import connectDB from './config/db.js';
import Member from './models/Member.js';
import Onboarding from './models/Onboarding.js';

const t0 = Date.now();
await connectDB();
console.log('DB connect:', Date.now() - t0, 'ms');

let s = Date.now();
const members = await Member.find().sort({ createdAt: -1 }).lean();
console.log('Members:', Date.now() - s, 'ms, count:', members.length);

s = Date.now();
const obs = await Onboarding.find().populate('member', 'artistName email phone primaryGenres source tier').sort({ createdAt: -1 }).lean();
console.log('Onboardings:', Date.now() - s, 'ms, count:', obs.length);

s = Date.now();
await Member.find().sort({ createdAt: -1 }).lean();
console.log('Members (warm):', Date.now() - s, 'ms');

s = Date.now();
await Onboarding.find().populate('member', 'artistName email phone primaryGenres source tier').sort({ createdAt: -1 }).lean();
console.log('Onboardings (warm):', Date.now() - s, 'ms');

process.exit(0);
