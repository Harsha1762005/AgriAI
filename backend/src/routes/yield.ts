import { Router, Response } from 'express';
import { isLocalDB } from '../db/db';
import { PredictionModel } from '../models/prediction';
import { localDb } from '../db/jsonDb';
import { authProtect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const getPredictionsDB = () => (isLocalDB ? localDb.getCollection('predictions') : PredictionModel);

// Economic and productivity profile per crop type
const CROP_YIELD_PROFILES: Record<string, {
  baseYieldPerHectare: number; // tons
  pricePerTon: number; // USD
  costPerTon: number; // USD
  optimalTemp: number; // °C
  optimalRainfall: number; // mm
}> = {
  rice: { baseYieldPerHectare: 4.5, pricePerTon: 380, costPerTon: 150, optimalTemp: 24, optimalRainfall: 220 },
  maize: { baseYieldPerHectare: 5.5, pricePerTon: 240, costPerTon: 90, optimalTemp: 22, optimalRainfall: 85 },
  chickpea: { baseYieldPerHectare: 1.8, pricePerTon: 620, costPerTon: 220, optimalTemp: 19, optimalRainfall: 80 },
  kidneybeans: { baseYieldPerHectare: 2.1, pricePerTon: 750, costPerTon: 280, optimalTemp: 20, optimalRainfall: 100 },
  pigeonpeas: { baseYieldPerHectare: 1.5, pricePerTon: 680, costPerTon: 240, optimalTemp: 27, optimalRainfall: 145 },
  mothbeans: { baseYieldPerHectare: 0.9, pricePerTon: 580, costPerTon: 180, optimalTemp: 27, optimalRainfall: 50 },
  mungbean: { baseYieldPerHectare: 1.1, pricePerTon: 710, costPerTon: 250, optimalTemp: 31, optimalRainfall: 48 },
  blackgram: { baseYieldPerHectare: 1.4, pricePerTon: 740, costPerTon: 260, optimalTemp: 30, optimalRainfall: 68 },
  lentil: { baseYieldPerHectare: 1.6, pricePerTon: 690, costPerTon: 230, optimalTemp: 24, optimalRainfall: 45 },
  pomegranate: { baseYieldPerHectare: 17.5, pricePerTon: 850, costPerTon: 300, optimalTemp: 21, optimalRainfall: 106 },
  banana: { baseYieldPerHectare: 37.0, pricePerTon: 450, costPerTon: 180, optimalTemp: 27, optimalRainfall: 100 },
  mango: { baseYieldPerHectare: 11.5, pricePerTon: 950, costPerTon: 350, optimalTemp: 31, optimalRainfall: 95 },
  grapes: { baseYieldPerHectare: 14.0, pricePerTon: 1200, costPerTon: 450, optimalTemp: 25, optimalRainfall: 70 },
  watermelon: { baseYieldPerHectare: 32.0, pricePerTon: 280, costPerTon: 100, optimalTemp: 25, optimalRainfall: 50 },
  muskmelon: { baseYieldPerHectare: 20.0, pricePerTon: 320, costPerTon: 120, optimalTemp: 28, optimalRainfall: 25 },
  apple: { baseYieldPerHectare: 25.0, pricePerTon: 1100, costPerTon: 400, optimalTemp: 22, optimalRainfall: 112 },
  orange: { baseYieldPerHectare: 23.0, pricePerTon: 800, costPerTon: 300, optimalTemp: 22, optimalRainfall: 110 },
  papaya: { baseYieldPerHectare: 50.0, pricePerTon: 350, costPerTon: 140, optimalTemp: 33, optimalRainfall: 245 },
  coconut: { baseYieldPerHectare: 12.0, pricePerTon: 600, costPerTon: 200, optimalTemp: 27, optimalRainfall: 180 },
  cotton: { baseYieldPerHectare: 2.8, pricePerTon: 1400, costPerTon: 600, optimalTemp: 24, optimalRainfall: 80 },
  jute: { baseYieldPerHectare: 2.7, pricePerTon: 480, costPerTon: 180, optimalTemp: 25, optimalRainfall: 175 },
  coffee: { baseYieldPerHectare: 2.0, pricePerTon: 2800, costPerTon: 1100, optimalTemp: 25, optimalRainfall: 165 }
};

// @route   POST /api/yield/predict
// @desc    Calculate yield prediction, expected revenue, and profit
router.post('/predict', authProtect, async (req: AuthRequest, res) => {
  const { cropType, area, soilQuality, rainfall, temperature } = req.body;

  if (!cropType || area === undefined || !soilQuality || rainfall === undefined || temperature === undefined) {
    return res.status(400).json({ error: 'Please fill in all yield forecasting parameters.' });
  }

  try {
    const cropKey = cropType.toLowerCase();
    const areaVal = Number(area);
    const rainVal = Number(rainfall);
    const tempVal = Number(temperature);

    if (isNaN(areaVal) || isNaN(rainVal) || isNaN(tempVal)) {
      return res.status(400).json({ error: 'Area, rainfall, and temperature must be numbers.' });
    }

    if (areaVal <= 0) {
      return res.status(400).json({ error: 'Farm area must be greater than zero.' });
    }

    // Retrieve crop yield profile
    const profile = CROP_YIELD_PROFILES[cropKey] || CROP_YIELD_PROFILES['rice'];

    // Adjustments:
    // 1. Soil Quality factor
    let soilMultiplier = 1.0;
    if (soilQuality.toLowerCase() === 'good') soilMultiplier = 1.25;
    if (soilQuality.toLowerCase() === 'poor') soilMultiplier = 0.70;

    // 2. Temperature deviation factor
    const tempDev = Math.abs(tempVal - profile.optimalTemp);
    const tempMultiplier = Math.max(0.7, 1.0 - (tempDev * 0.03)); // loose 3% yield per °C deviation, max 30% loss

    // 3. Rainfall deviation factor
    const rainDevPct = Math.abs(rainVal - profile.optimalRainfall) / profile.optimalRainfall;
    const rainMultiplier = Math.max(0.65, 1.0 - (rainDevPct * 0.5)); // loose up to 35% yield for severe water mismatch

    // Calculate final metrics
    const yieldPerHectare = profile.baseYieldPerHectare * soilMultiplier * tempMultiplier * rainMultiplier;
    const estimatedOutput = Number((yieldPerHectare * areaVal).toFixed(2));
    
    const expectedRevenue = Number((estimatedOutput * profile.pricePerTon).toFixed(2));
    const totalCost = Number((estimatedOutput * profile.costPerTon).toFixed(2));
    const expectedProfit = Number((expectedRevenue - totalCost).toFixed(2));

    // Save yield prediction run in history
    const predictionsDb = getPredictionsDB();
    const newPrediction = await predictionsDb.create({
      userId: req.user!.id,
      type: 'yield',
      yieldCropType: cropType,
      yieldArea: areaVal,
      yieldSoilQuality: soilQuality,
      temperature: tempVal,
      rainfall: rainVal,
      yieldEstimatedOutput: estimatedOutput,
      yieldRevenue: expectedRevenue,
      yieldProfit: expectedProfit
    });

    res.status(200).json({
      success: true,
      predictionId: newPrediction._id,
      estimatedYield: estimatedOutput,
      expectedRevenue,
      expectedProfit,
      metrics: {
        yieldPerHectare: Number(yieldPerHectare.toFixed(2)),
        baseYield: profile.baseYieldPerHectare,
        soilFactor: soilMultiplier,
        tempFactor: Number(tempMultiplier.toFixed(2)),
        rainFactor: Number(rainMultiplier.toFixed(2))
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: `Yield prediction failed: ${error.message}` });
  }
});

export default router;
