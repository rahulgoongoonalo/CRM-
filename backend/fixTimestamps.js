import mongoose from 'mongoose';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://rahulgoongoonalo:Rahul9175@ac-mtej6dw-shard-00-00.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-01.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-02.1pidizx.mongodb.net:27017/crm_db?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function fixTimestamps() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const now = new Date();

    // Fix onboardings missing createdAt
    const onboardingResult = await mongoose.connection.db.collection('onboardings').updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: now, updatedAt: now } }
    );
    console.log(`Fixed ${onboardingResult.modifiedCount} onboarding records missing timestamps`);

    // Fix members missing createdAt
    const memberResult = await mongoose.connection.db.collection('members').updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: now, updatedAt: now } }
    );
    console.log(`Fixed ${memberResult.modifiedCount} member records missing timestamps`);

    console.log('Timestamps fix completed!');
  } catch (error) {
    console.error('Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixTimestamps();
