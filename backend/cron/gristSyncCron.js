import cron from 'node-cron';
import { syncGristData } from '../services/gristSyncService.js';

// Force TZ to Asia/Kolkata so cron always uses IST regardless of server timezone
process.env.TZ = 'Asia/Kolkata';

const runGristSync = async (label) => {
  console.log(`[CRON] Running Grist data sync (${label}) at`, new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  try {
    const results = await syncGristData();
    console.log(`[CRON] Grist sync complete (${label}) — Created: ${results.created}, Updated: ${results.updated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
  } catch (error) {
    console.error(`[CRON] Grist sync failed (${label}):`, error.message);
  }
};

export const startGristSyncCron = () => {
  // Schedule 1: Every day at 9:00 AM IST
  cron.schedule('0 9 * * *', () => runGristSync('9:00 AM IST'), {
    timezone: 'Asia/Kolkata'
  });

  // Schedule 2: Every day at 2:00 PM IST
  cron.schedule('0 14 * * *', () => runGristSync('2:00 PM IST'), {
    timezone: 'Asia/Kolkata'
  });

  console.log('Grist data sync cron scheduled — daily at 9:00 AM IST & 2:00 PM IST');
};
