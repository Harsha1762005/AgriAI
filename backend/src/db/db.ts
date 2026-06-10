import mongoose from 'mongoose';
import { localDb } from './jsonDb';

export let isLocalDB = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('---------------------------------------------------------');
    console.log('⚠️  No MONGODB_URI found in environment configuration.');
    console.log('🤖 AgriAI is starting with the Local JSON DB Engine (localdb.json).');
    console.log('   All data will be persisted locally. Connect MongoDB Atlas to scale.');
    console.log('---------------------------------------------------------');
    isLocalDB = true;
    await localDb.initialize();
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log('---------------------------------------------------------');
    console.log('🚀 Connected to MongoDB Atlas successfully.');
    console.log('---------------------------------------------------------');
  } catch (error: any) {
    console.log('---------------------------------------------------------');
    console.log('❌ Failed to connect to MongoDB Atlas:', error.message);
    console.log('🤖 Falling back to the Local JSON DB Engine (localdb.json)...');
    console.log('---------------------------------------------------------');
    isLocalDB = true;
    await localDb.initialize();
  }
}
