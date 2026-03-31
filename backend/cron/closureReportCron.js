import cron from 'node-cron';
import Onboarding from '../models/Onboarding.js';
import { sendDailyClosureReport } from '../utils/emailService.js';

export const startClosureReportCron = () => {
  // Runs every day at 5:00 PM IST (Asia/Kolkata timezone)
  cron.schedule('0 17 * * *', async () => {
    console.log('[CRON] Running daily closure stages report at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

    try {
      const recipientEmail = 'rahul.goongoonalo@gmail.com, sherley@goongoonalo.com, vaishali.goongoonalo@gmail.com, support@goongoonalo.com';

      // Fetch all onboardings that have stages data
      const onboardings = await Onboarding.find({
        'l2ReviewData.stages': { $exists: true }
      }).populate('member', 'artistName email').sort({ taskNumber: 1 });

      if (onboardings.length === 0) {
        console.log('[CRON] No onboardings with closure stages data found. Skipping email.');
        return;
      }

      await sendDailyClosureReport(recipientEmail, onboardings);
      console.log(`[CRON] Closure stages report sent to ${recipientEmail}`);
    } catch (error) {
      console.error('[CRON] Failed to send closure stages report:', error.message);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('Closure stages report cron scheduled — daily at 5:00 PM IST');
};
