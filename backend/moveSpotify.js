import mongoose from 'mongoose';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://rahulgoongoonalo:Rahul9175@ac-mtej6dw-shard-00-00.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-01.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-02.1pidizx.mongodb.net:27017/crm_db?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function moveSpotify() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const col = mongoose.connection.db.collection('onboardings');

    // Move Spotify links from otherPlatforms to streamingLink
    const result = await col.updateMany(
      { 'l1QuestionnaireData.otherPlatforms': { $regex: 'spotify', $options: 'i' } },
      [
        {
          $set: {
            'l1QuestionnaireData.streamingLink': '$l1QuestionnaireData.otherPlatforms',
            'l1QuestionnaireData.otherPlatforms': ''
          }
        }
      ]
    );

    console.log(`Moved Spotify links to Streaming Platform Link: ${result.modifiedCount} records updated`);
  } catch (error) {
    console.error('Failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

moveSpotify();
