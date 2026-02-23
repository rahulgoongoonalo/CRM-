import mongoose from 'mongoose';
import dns from 'dns';
import XLSX from 'xlsx';
import Member from './models/Member.js';
import Onboarding from './models/Onboarding.js';
import Picklist from './models/Picklist.js';

dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://rahulgoongoonalo:Rahul9175@ac-mtej6dw-shard-00-00.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-01.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-02.1pidizx.mongodb.net:27017/crm_db?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function importAME() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read Excel file
    const wb = XLSX.readFile('C:\\Users\\Devi\\Desktop\\CRM-\\AME.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    console.log(`Read ${rows.length} rows from AME.xlsx`);

    // Ensure "AME" exists in source picklist
    const picklist = await Picklist.findOne({ name: 'source' });
    if (picklist) {
      const exists = picklist.items.some(item => item.value === 'AME');
      if (!exists) {
        const maxOrder = Math.max(...picklist.items.map(i => i.order), 0);
        picklist.items.push({ value: 'AME', label: 'AME', order: maxOrder + 1 });
        await picklist.save();
        console.log('Added "AME" to source picklist');
      } else {
        console.log('"AME" already exists in source picklist');
      }
    }

    // Get last member number
    const lastMember = await Member.findOne().sort({ memberNumber: -1 });
    let memberNumber = lastMember ? lastMember.memberNumber + 1 : 1;

    // Get last onboarding task number
    const lastOnboarding = await Onboarding.findOne().sort({ taskNumber: -1 });
    let taskNumber = lastOnboarding ? lastOnboarding.taskNumber + 1 : 1;

    const now = new Date();
    let memberCount = 0;
    let onboardingCount = 0;

    for (const row of rows) {
      const artistName = row['Name Of Artists'];
      if (!artistName) continue;

      const contactName = row['Contact Name'] || '';
      const talentRole = row['Talent Role'] || '';
      const spotifyLink = row['Spotify Link'] || '';

      // Create member
      const memberDoc = {
        memberNumber: memberNumber++,
        artistName: artistName,
        contactName: contactName,
        primaryRole: talentRole,
        source: 'AME',
        status: 'Pending',
        tier: 'tier1',
        createdAt: now,
        updatedAt: now,
      };

      const member = new Member(memberDoc);
      await member.collection.insertOne({
        ...member.toObject(),
        createdAt: now,
        updatedAt: now,
      });
      memberCount++;

      // Create onboarding record
      const onboardingDoc = {
        taskNumber: taskNumber++,
        member: member._id,
        artistName: artistName,
        spoc: 'Admin',
        status: 'warm',
        step1Data: {
          source: 'AME',
          contactStatus: 'New',
        },
        l1QuestionnaireData: {
          primaryContact: contactName,
          primaryRole: talentRole,
          streamingLink: spotifyLink,
        },
        createdBy: 'Admin',
        createdAt: now,
        updatedAt: now,
      };

      const onboarding = new Onboarding(onboardingDoc);
      await onboarding.collection.insertOne({
        ...onboarding.toObject(),
        createdAt: now,
        updatedAt: now,
      });
      onboardingCount++;

      console.log(`Added: ${artistName}${spotifyLink ? ' (Spotify: Yes)' : ''}`);
    }

    console.log(`\nImport completed!`);
    console.log(`Members added: ${memberCount}`);
    console.log(`Onboarding records added: ${onboardingCount}`);
  } catch (error) {
    console.error('Import failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

importAME();
