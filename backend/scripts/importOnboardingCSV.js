import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI;

// Member Schema
const memberSchema = new mongoose.Schema({
  memberNumber: Number,
  artistName: String,
  email: String
}, { strict: false });

// Onboarding Schema
const onboardingSchema = new mongoose.Schema({
  taskNumber: Number,
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  artistName: String,
  description: String,
  spoc: String,
  etaClosure: Date,
  notes: String,
  status: String,
  step1Data: Object,
  l1QuestionnaireData: Object,
  l2ReviewData: Object,
  createdBy: String
}, { timestamps: true, strict: false });

// Auto-increment for taskNumber
onboardingSchema.pre('save', async function(next) {
  if (!this.taskNumber) {
    const lastOnboarding = await this.constructor.findOne().sort({ taskNumber: -1 });
    this.taskNumber = lastOnboarding ? lastOnboarding.taskNumber + 1 : 1;
  }
  next();
});

const Member = mongoose.model('Member', memberSchema);
const Onboarding = mongoose.model('Onboarding', onboardingSchema);

// Parse CSV manually
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }

  return records;
}

async function importOnboardingData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Read CSV file
    const csvPath = path.join(__dirname, '..', '..', 'crm_db.onboardings FINAL.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parseCSV(csvContent);
    console.log(`Found ${records.length} onboarding records in CSV`);

    // Clear existing onboardings (optional)
    await Onboarding.deleteMany({});
    console.log('Cleared existing onboardings');

    // Import each record
    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        const artistName = record['Artist Name'];
        
        if (!artistName || artistName === 'NA') {
          console.log(`Skipping record with no artist name`);
          skipped++;
          continue;
        }

        // Find matching member by artistName
        const member = await Member.findOne({ artistName: artistName.trim() });
        
        if (!member) {
          console.log(`No member found for artist: ${artistName}`);
          skipped++;
          continue;
        }

        // Prepare step1Data
        const step1Data = {};
        if (record['step1Data.source'] && record['step1Data.source'] !== 'NA') {
          step1Data.source = record['step1Data.source'];
        }
        if (record['step1Data.contactStatus'] && record['step1Data.contactStatus'] !== 'NA') {
          step1Data.contactStatus = record['step1Data.contactStatus'];
        }
        if (record['step1Data.step1Notes'] && record['step1Data.step1Notes'] !== 'NA') {
          step1Data.step1Notes = record['step1Data.step1Notes'];
        }

        // Prepare l1QuestionnaireData
        const l1Data = {};
        const l1Prefix = 'l1QuestionnaireData.';
        
        // Field name mapping from CSV to schema
        const fieldMapping = {
          'streamingplatformlink': 'streamingLink',
          'performlive': 'performLive',
          'upcomingprojects': 'upcomingProject',
          'intrestedingatecrach': 'interestedInGatecrash',
          'otherinfo': 'otherInfo',
          'listnerregion': 'listenerRegion'
        };
        
        Object.keys(record).forEach(key => {
          if (key.startsWith(l1Prefix) && record[key] && record[key] !== 'NA') {
            let fieldName = key.replace(l1Prefix, '');
            if (fieldName !== '_id') {
              // Apply field name mapping if exists
              fieldName = fieldMapping[fieldName] || fieldName;
              l1Data[fieldName] = record[key];
            }
          }
        });

        // Prepare l2ReviewData
        const l2Data = {};
        const l2Prefix = 'l2ReviewData.';
        
        Object.keys(record).forEach(key => {
          if (key.startsWith(l2Prefix) && record[key] && record[key] !== 'NA') {
            const fieldName = key.replace(l2Prefix, '');
            if (fieldName !== '_id') {
              if (fieldName.startsWith('checklist.')) {
                if (!l2Data.checklist) l2Data.checklist = {};
                const checklistField = fieldName.replace('checklist.', '');
                l2Data.checklist[checklistField] = record[key];
              } else {
                l2Data[fieldName] = record[key];
              }
            }
          }
        });

        // Create onboarding record
        const onboardingData = {
          member: member._id,
          artistName: artistName,
          description: record['description'] === 'NA' ? '' : record['description'],
          spoc: record['spoc'] === 'NA' ? '' : record['spoc'],
          etaClosure: record['etaClosure'] && record['etaClosure'] !== 'NA' ? new Date(record['etaClosure']) : null,
          notes: record['notes'] === 'NA' ? '' : record['notes'],
          status: record['status'] === 'NA' ? 'contact-established' : record['status'],
          step1Data: Object.keys(step1Data).length > 0 ? step1Data : {},
          l1QuestionnaireData: Object.keys(l1Data).length > 0 ? l1Data : {},
          l2ReviewData: Object.keys(l2Data).length > 0 ? l2Data : {},
          createdBy: record['createdBy'] || 'Admin'
        };

        await Onboarding.create(onboardingData);
        imported++;
        console.log(`Imported onboarding for: ${artistName} (Member ID: ${member.memberNumber})`);
      } catch (err) {
        console.error(`Error importing record for ${record['Artist Name']}:`, err.message);
        skipped++;
      }
    }

    console.log(`\nImport complete:`);
    console.log(`Successfully imported: ${imported} onboardings`);
    console.log(`Skipped: ${skipped} records`);
    
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

importOnboardingData();
