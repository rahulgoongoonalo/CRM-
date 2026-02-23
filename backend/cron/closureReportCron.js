import cron from 'node-cron';
import Onboarding from '../models/Onboarding.js';
import { sendDailyClosureReport } from '../utils/emailService.js';

export const startClosureReportCron = () => {
  // Runs every day at 5:00 PM IST
  cron.schedule('0 17 * * *', async () => {
    console.log('[CRON] Running daily closure checklist report at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

    try {
      const recipientEmail = 'rahul.goongoonalo@gmail.com, sherley.goongoonalo@gmail.com, vaishali.goongoonalo@gmail.com';

      // Fetch all onboardings that have closure checklist data
      const onboardings = await Onboarding.find({
        'l2ReviewData.closureChecklist': { $exists: true, $ne: [] }
      }).populate('member', 'artistName email').sort({ taskNumber: 1 });

      if (onboardings.length === 0) {
        console.log('[CRON] No onboardings with closure checklist data found. Skipping email.');
        return;
      }

      await sendDailyClosureReport(recipientEmail, onboardings);
      console.log(`[CRON] Closure checklist report sent to ${recipientEmail}`);
    } catch (error) {
      console.error('[CRON] Failed to send closure checklist report:', error.message);
    }
  });

  console.log('Closure checklist report cron scheduled — daily at 5:00 PM IST');
};
