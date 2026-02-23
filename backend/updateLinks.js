import mongoose from 'mongoose';
import dns from 'dns';
import XLSX from 'xlsx';

dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://rahulgoongoonalo:Rahul9175@ac-mtej6dw-shard-00-00.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-01.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-02.1pidizx.mongodb.net:27017/crm_db?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function updateLinks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read Excel file
    const wb = XLSX.readFile('C:\\Users\\Devi\\Desktop\\CRM-\\Ayan.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    console.log(`Read ${rows.length} rows from Excel`);

    const onboardings = mongoose.connection.db.collection('onboardings');
    let updated = 0;

    for (const row of rows) {
      const artistName = row['Name Of Artists'];
      const instagram = row['Instagram Link'] || '';
      const spotify = row['Spotify Link'] || '';

      if (!artistName) continue;

      const result = await onboardings.updateMany(
        { artistName: artistName },
        {
          $set: {
            'l1QuestionnaireData.instagram': instagram,
            'l1QuestionnaireData.otherPlatforms': spotify,
            'l1QuestionnaireData.primaryRole': row['Talent Role'] || '',
            'l1QuestionnaireData.primaryGenres': row['Genre'] || '',
            'l1QuestionnaireData.primaryContact': row['Contact Name'] || '',
          }
        }
      );

      if (result.modifiedCount > 0) {
        updated += result.modifiedCount;
        console.log(`Updated: ${artistName} (IG: ${instagram ? 'Yes' : 'No'}, Spotify: ${spotify ? 'Yes' : 'No'})`);
      }
    }

    console.log(`\nDone! Updated ${updated} onboarding records with Instagram & Spotify links.`);
  } catch (error) {
    console.error('Failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateLinks();
