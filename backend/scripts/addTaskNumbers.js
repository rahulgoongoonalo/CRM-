import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const addTaskNumbers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    const db = mongoose.connection.db;
    const onboardingsCollection = db.collection('onboardings');
    const membersCollection = db.collection('members');

    // Get all onboardings sorted by creation date
    const onboardings = await onboardingsCollection.find({}).sort({ createdAt: 1 }).toArray();
    
    console.log(`Found ${onboardings.length} onboarding records`);

    // Update each onboarding with a sequential task number and memberName
    for (let i = 0; i < onboardings.length; i++) {
      const taskNumber = i + 1;
      
      // Get member name from members collection if not already set
      let memberName = onboardings[i].memberName;
      if (!memberName && onboardings[i].member) {
        const member = await membersCollection.findOne({ _id: onboardings[i].member });
        memberName = member?.name || 'Unknown';
      }
      
      await onboardingsCollection.updateOne(
        { _id: onboardings[i]._id },
        { 
          $set: { 
            taskNumber: taskNumber,
            memberName: memberName || 'Unknown'
          } 
        }
      );
      console.log(`Updated onboarding ${onboardings[i]._id} with taskNumber: ${taskNumber}, memberName: ${memberName}`);
    }

    console.log('All onboarding records updated with task numbers and member names!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding task numbers:', error);
    process.exit(1);
  }
};

addTaskNumbers();
