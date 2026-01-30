import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixEmailIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    const db = mongoose.connection.db;
    const collection = db.collection('members');

    // Drop the old unique index on email
    try {
      await collection.dropIndex('email_1');
      console.log('Old email index dropped successfully');
    } catch (error) {
      console.log('No existing email index to drop or already dropped');
    }

    // Create new sparse unique index
    await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('New sparse unique index created successfully');

    console.log('Email index fixed! Multiple members can now have null/empty emails.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing email index:', error);
    process.exit(1);
  }
};

fixEmailIndex();
