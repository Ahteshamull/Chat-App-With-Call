import mongoose from 'mongoose';
import config from './index';

const connectDB = async () => {
  try {
    if (!config.database_url) {
      console.error('Database URL is not defined in the environment variables.');
      process.exit(1);
    }
    await mongoose.connect(config.database_url);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
