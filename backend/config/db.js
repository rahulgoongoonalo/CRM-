import mongoose from 'mongoose';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const DIRECT_URI = 'mongodb://rahulgoongoonalo:Rahul9175@ac-mtej6dw-shard-00-00.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-01.1pidizx.mongodb.net:27017,ac-mtej6dw-shard-00-02.1pidizx.mongodb.net:27017/crm_db?ssl=true&authSource=admin&retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('SRV connection failed, trying direct connection...');
    try {
      const conn = await mongoose.connect(DIRECT_URI);
      console.log(`MongoDB Connected (direct): ${conn.connection.host}`);
    } catch (directError) {
      console.error(`Error: ${directError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
