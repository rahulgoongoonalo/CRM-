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
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rahulgoongoonalo:Rahul9175@cluster0.1pidizx.mongodb.net/crm_db?retryWrites=true&w=majority';

// Member Schema (matching your current schema)
const memberSchema = new mongoose.Schema({
  memberNumber: { type: Number, unique: true },
  artistName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  alternateNumber: { type: String },
  location: { type: String },
  country: { type: String },
  contactName: { type: String },
  category: { type: String },
  tier: { type: String },
  primaryRole: { type: String },
  talentType: { type: String },
  primaryGenres: { type: String },
  source: { type: String },
  spoc: { type: String },
  biography: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  panNumber: { type: String },
  aadharNumber: { type: String },
  status: { type: String, default: 'active' },
  joinDate: { type: Date, default: Date.now },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);

// Parse CSV manually
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with quoted fields
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

async function importData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Read CSV file
    const csvPath = path.join(__dirname, '..', '..', 'crm_db.members FINAL.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parseCSV(csvContent);
    console.log(`Found ${records.length} records in CSV`);

    // Clear existing members (optional - comment out if you want to keep existing data)
    await Member.deleteMany({});
    console.log('Cleared existing members');

    // Import each record
    let imported = 0;
    for (const record of records) {
      try {
        // Map CSV columns to schema fields
        const memberData = {
          memberNumber: parseInt(record['_id']) || imported + 1,
          artistName: record['Artist Name'] || '',
          email: record['Email'] || '',
          phone: String(record['Phone'] || ''),
          alternateNumber: record['alternateNumber'] === 'NA' ? '' : record['alternateNumber'],
          location: record['Location'] || '',
          contactName: record['Contact Name'] === 'NA' ? '' : record['Contact Name'],
          category: record['category'] === 'NA' ? '' : record['category'],
          tier: record['tier'] === 'NA' ? '' : record['tier'],
          primaryRole: record['Primary Roles'] === 'NA' ? '' : record['Primary Roles'],
          talentType: record['talentType'] === 'NA' ? '' : record['talentType'],
          primaryGenres: record['Primary Genres'] === 'NA' ? '' : record['Primary Genres'],
          source: record['source'] === 'NA' ? '' : record['source'],
          spoc: record['spoc'] === 'NA' ? '' : record['spoc'],
          biography: record['biography'] === 'NA' ? '' : record['biography'],
          status: record['status'] === 'NA' ? 'active' : (record['status'] || 'active')
        };

        // Skip empty records
        if (!memberData.artistName && !memberData.email) {
          console.log(`Skipping empty record at index ${imported}`);
          continue;
        }

        await Member.create(memberData);
        imported++;
        console.log(`Imported: ${memberData.artistName} (${memberData.email})`);
      } catch (err) {
        console.error(`Error importing record:`, record, err.message);
      }
    }

    console.log(`\nSuccessfully imported ${imported} members`);
    
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

importData();
