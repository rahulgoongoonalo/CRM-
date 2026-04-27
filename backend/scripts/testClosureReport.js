import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Onboarding from '../models/Onboarding.js';
import Member from '../models/Member.js';
import ClosureReportSnapshot from '../models/ClosureReportSnapshot.js';
import { sendDailyClosureReport } from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const TEST_RECIPIENT = 'rahul.goongoonalo@gmail.com';

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const onboardings = await Onboarding.find({
      'l2ReviewData.stages': { $exists: true }
    }).populate('member', 'artistName email').sort({ taskNumber: 1 });

    console.log(`Found ${onboardings.length} onboarding(s) with stages data`);

    if (onboardings.length === 0) {
      console.log('No data — sending empty test still skipped.');
      process.exit(0);
    }

    // Inject a synthetic "yesterday" snapshot so the delta UI is visible in the test mail.
    // This is cleaned up after sending — production data is never touched.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    const existingYesterday = await ClosureReportSnapshot.findOne({ dateKey: yesterdayKey });
    let injectedDemoSnapshot = false;

    if (!existingYesterday) {
      await ClosureReportSnapshot.create({
        dateKey: yesterdayKey,
        totalArtists: Math.max(0, onboardings.length - 2),
        counts: [
          { stageKey: 'basicOnboarding', Yes: 8, No: 1, notUpdated: 110 },
          { stageKey: 'interestedInvestment', Yes: 0, No: 0, notUpdated: 117 },
          { stageKey: 'artistInvestment', Yes: 0, No: 0, notUpdated: 117 },
          { stageKey: 'distributionAgreement', Yes: 1, No: 1, notUpdated: 115 },
          { stageKey: 'nonExclusiveLicense', Yes: 1, No: 80, notUpdated: 36 },
          { stageKey: 'finalClosure', Yes: 0, No: 0, notUpdated: 117 },
        ],
      });
      injectedDemoSnapshot = true;
      console.log(`Injected demo yesterday snapshot for ${yesterdayKey}`);
    }

    try {
      await sendDailyClosureReport(TEST_RECIPIENT, onboardings, { persistSnapshot: false });
      console.log(`Test report sent to ${TEST_RECIPIENT} (snapshot NOT persisted)`);
    } finally {
      if (injectedDemoSnapshot) {
        await ClosureReportSnapshot.deleteOne({ dateKey: yesterdayKey });
        console.log(`Cleaned up demo yesterday snapshot`);
      }
    }
  } catch (err) {
    console.error('Test send failed:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
