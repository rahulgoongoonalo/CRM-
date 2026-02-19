import mongoose from 'mongoose';
import dns from 'dns';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECT_URI = 'mongodb://rahulgoongoonalo:Rahul9175@ac-mtej6dw-shard-00-00.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-01.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-02.1pidizx.mongodb.net:27017/crm_db?ssl=true&authSource=admin&retryWrites=true&w=majority';

// Import Member model
import Member from './models/Member.js';

async function main() {
  // Connect to MongoDB
  try {
    await mongoose.connect(DIRECT_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }

  // Read Excel file
  const excelPath = path.join(__dirname, '..', '16th Jan 2026 - Goongoonalo Party Invitation List (1).xlsx');
  const wb = XLSX.readFile(excelPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  console.log(`\nTotal entries in Excel: ${data.length}`);
  console.log('-------------------------------------------');

  let updatedCount = 0;
  let addedCount = 0;
  let errorCount = 0;

  for (const row of data) {
    const phone = (row.Phone || '').trim();
    const name = (row.Name || '').trim();
    const region = (row['India/Rest of world'] || '').trim();

    if (!phone || !name) {
      console.log(`SKIP: Missing phone or name - ${JSON.stringify(row)}`);
      errorCount++;
      continue;
    }

    try {
      // Try to find member by phone number (exact match or partial)
      // Normalize phone: remove spaces, handle variations
      const phoneNormalized = phone.replace(/\s+/g, '');
      
      // Search by phone - try exact match first, then partial
      let existingMember = await Member.findOne({ phone: phoneNormalized });
      
      // Also try without leading + or with different format
      if (!existingMember) {
        existingMember = await Member.findOne({ phone: phone });
      }
      
      // Try matching by last 10 digits
      if (!existingMember && phoneNormalized.length >= 10) {
        const last10 = phoneNormalized.slice(-10);
        existingMember = await Member.findOne({
          phone: { $regex: last10 + '$' }
        });
      }

      // Also try matching by artist name (case insensitive)
      if (!existingMember) {
        existingMember = await Member.findOne({
          artistName: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
        });
      }

      if (existingMember) {
        // Update source to Marriott and SPOC to Vaishali
        existingMember.source = 'Marriott';
        existingMember.spoc = 'Vaishali';
        await existingMember.save();
        console.log(`UPDATED: "${existingMember.artistName}" (Phone: ${existingMember.phone}) -> source: Marriott, spoc: Vaishali`);
        updatedCount++;
      } else {
        // Add new member
        const country = region === 'IN' ? 'India' : (region === 'ROW' ? 'International' : '');
        
        const newMember = new Member({
          artistName: name,
          phone: phoneNormalized,
          country: country,
          source: 'Marriott',
          spoc: 'Vaishali',
          status: 'pending'
        });
        
        await newMember.save();
        console.log(`ADDED: "${name}" (Phone: ${phoneNormalized}) -> source: Marriott, spoc: Vaishali, memberNumber: ${newMember.memberNumber}`);
        addedCount++;
      }
    } catch (error) {
      console.error(`ERROR processing "${name}" (${phone}): ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n===========================================');
  console.log(`SUMMARY:`);
  console.log(`  Updated existing: ${updatedCount}`);
  console.log(`  Added new:        ${addedCount}`);
  console.log(`  Errors/Skipped:   ${errorCount}`);
  console.log(`  Total processed:  ${data.length}`);
  console.log('===========================================');

  await mongoose.disconnect();
  console.log('\nDone. MongoDB disconnected.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
