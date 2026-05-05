import cron from 'node-cron';
import { refreshGristStaging } from '../services/gristSyncService.js';

// Force TZ to Asia/Kolkata so cron always uses IST regardless of server timezone
process.env.TZ = 'Asia/Kolkata';

// Cron now ONLY refreshes the staging table — never creates Members/Onboardings.
// Promotion to Member/Onboarding happens manually via the Settings → Grist Data Sync page.
const runGristStagingRefresh = async (label) => {
  console.log(`[CRON] Refreshing Grist staging (${label}) at`, new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  try {
    const results = await refreshGristStaging();
    console.log(`[CRON] Grist staging refresh complete (${label}) — Total: ${results.total}, New pending: ${results.newPending}, Auto-linked: ${results.autoLinked}, Errors: ${results.errors.length}`);
  } catch (error) {
    console.error(`[CRON] Grist staging refresh failed (${label}):`, error.message);
  }
};

export const startGristSyncCron = () => {
  cron.schedule('0 9 * * *', () => runGristStagingRefresh('9:00 AM IST'), {
    timezone: 'Asia/Kolkata'
  });

  cron.schedule('0 14 * * *', () => runGristStagingRefresh('2:00 PM IST'), {
    timezone: 'Asia/Kolkata'
  });

  console.log('Grist staging refresh cron scheduled — daily at 9:00 AM IST & 2:00 PM IST (refresh-only)');
};
