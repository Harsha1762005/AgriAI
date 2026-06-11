import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { connectDB, isLocalDB } from './db/db';
import { UserModel } from './models/user';
import { CropModel } from './models/crop';
import { PredictionModel } from './models/prediction';
import { localDb } from './db/jsonDb';
import { STATIC_CROP_METADATA } from './routes/crop';

// Routes
import authRoutes from './routes/auth';
import cropRoutes from './routes/crop';
import fertilizerRoutes from './routes/fertilizer';
import yieldRoutes from './routes/yield';
import historyRoutes from './routes/history';
import weatherRoutes from './routes/weather';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting (protect APIs from abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/crop', cropRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/yield', yieldRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);

// Root check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AgriAI API Server is running successfully.' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', isLocalDB, timestamp: new Date().toISOString() });
});

// Startup Seeder function
async function runSeeder() {
  try {
    const usersDb = isLocalDB ? localDb.getCollection('users') : UserModel;
    const cropsDb = isLocalDB ? localDb.getCollection('crops') : CropModel;
    const predictionsDb = isLocalDB ? localDb.getCollection('predictions') : PredictionModel;

    const existingUsers = await usersDb.find();
    
    if (existingUsers.length === 0) {
      console.log('🌱 Database is empty! Initiating seed script...');

      // 1. Seed Users
      const salt = bcrypt.genSaltSync(10);
      const adminPassword = bcrypt.hashSync('adminpassword123', salt);
      const farmerPassword = bcrypt.hashSync('farmer123', salt);

      const adminUser = await usersDb.create({
        name: 'AgriAI System Admin',
        email: 'admin@agriai.com',
        password: adminPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        phone: '+1 (555) 123-4567',
        location: 'California, US'
      });

      const farmerUser = await usersDb.create({
        name: 'John Doe (Farmer)',
        email: 'farmer@agriai.com',
        password: farmerPassword,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        phone: '+1 (555) 987-6543',
        location: 'Green Valley Farmland'
      });

      console.log('✅ Users seeded:');
      console.log('   - Admin: admin@agriai.com / adminpassword123');
      console.log('   - Farmer: farmer@agriai.com / farmer123');

      // 2. Seed Crops Catalog
      console.log('🌱 Seeding crops metadata catalog...');
      for (const [name, data] of Object.entries(STATIC_CROP_METADATA)) {
        await cropsDb.create({
          name,
          scientificName: data.scientificName,
          description: data.description,
          suitableSeason: data.suitableSeason,
          waterRequirement: data.waterRequirement,
          expectedYield: data.expectedYield,
          marketDemand: data.marketDemand,
          profitability: data.profitability,
          growingTips: data.growingTips,
          imageUrl: data.imageUrl
        });
      }
      console.log('✅ Crops catalog seeded.');

      // 3. Seed Prediction History Logs (for Analytics Charts visualization)
      console.log('🌱 Seeding mock analytics history...');
      const cropsList = ['rice', 'maize', 'coffee', 'cotton', 'grapes', 'pomegranate'];
      const now = new Date();
      
      // Generate some entries over the past 4 months
      for (let i = 0; i < 24; i++) {
        const crop = cropsList[i % cropsList.length];
        const date = new Date();
        date.setMonth(now.getMonth() - Math.floor(i / 6)); // Spread across past 4 months
        date.setDate(1 + (i * 3) % 28);
        
        // Seed Crop predictions
        const cropPred = await predictionsDb.create({
          userId: farmerUser._id,
          type: 'crop',
          nitrogen: 50 + (i * 7) % 50,
          phosphorus: 30 + (i * 9) % 40,
          potassium: 20 + (i * 11) % 60,
          temperature: 20 + (i % 8),
          humidity: 60 + (i % 25),
          ph: 5.5 + (i % 3) * 0.5,
          rainfall: 80 + (i * 15) % 150,
          crop: crop.charAt(0).toUpperCase() + crop.slice(1),
          confidence: Number((85 + (i * 2.3) % 14.5).toFixed(2))
        });
        
        // Update createdAt timestamp directly (override auto timestamps for spread)
        if (isLocalDB) {
          cropPred.createdAt = date.toISOString();
          localDb.save();
        } else {
          await PredictionModel.findByIdAndUpdate(cropPred._id, { createdAt: date });
        }

        // Seed some Yield Predictions too
        if (i % 2 === 0) {
          const yieldPred = await predictionsDb.create({
            userId: farmerUser._id,
            type: 'yield',
            yieldCropType: crop.charAt(0).toUpperCase() + crop.slice(1),
            yieldArea: 2 + (i % 4),
            yieldSoilQuality: i % 3 === 0 ? 'Good' : 'Medium',
            temperature: 22 + (i % 5),
            rainfall: 90 + (i * 10) % 100,
            yieldEstimatedOutput: 10 + (i * 2.5),
            yieldRevenue: (10 + (i * 2.5)) * (crop === 'coffee' ? 2000 : 350),
            yieldProfit: (10 + (i * 2.5)) * (crop === 'coffee' ? 1200 : 200)
          });
          if (isLocalDB) {
            yieldPred.createdAt = date.toISOString();
            localDb.save();
          } else {
            await PredictionModel.findByIdAndUpdate(yieldPred._id, { createdAt: date });
          }
        }
      }
      console.log('✅ Prediction history seeded.');
    }
  } catch (err: any) {
    console.error('⚠️ Seeding error:', err.message);
  }
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
async function startServer() {
  app.listen(PORT, async () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    try {
      await connectDB();
      await runSeeder();
    } catch (dbErr: any) {
      console.error('⚠️ DB Initialization warning:', dbErr.message);
    }
  });
}

startServer();
