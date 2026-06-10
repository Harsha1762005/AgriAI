import { Router, Response } from 'express';
import { isLocalDB } from '../db/db';
import { PredictionModel } from '../models/prediction';
import { localDb } from '../db/jsonDb';
import { authProtect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const getPredictionsDB = () => (isLocalDB ? localDb.getCollection('predictions') : PredictionModel);

// Optimal target ranges for N-P-K (general agricultural averages)
const OPTIMAL_TARGETS = {
  N: { min: 80, max: 120, name: 'Nitrogen (N)' },
  P: { min: 40, max: 80, name: 'Phosphorus (P)' },
  K: { min: 40, max: 80, name: 'Potassium (K)' }
};

// @route   POST /api/fertilizer/recommend
// @desc    Determine fertilizer recommendations based on N-P-K values
router.post('/recommend', authProtect, async (req: AuthRequest, res) => {
  const { N, P, K } = req.body;

  if (N === undefined || P === undefined || K === undefined) {
    return res.status(400).json({ error: 'Please enter N, P, and K soil nutrient values.' });
  }

  try {
    const nVal = Number(N);
    const pVal = Number(P);
    const kVal = Number(K);

    if (isNaN(nVal) || isNaN(pVal) || isNaN(kVal)) {
      return res.status(400).json({ error: 'Soil nutrient values must be numeric.' });
    }

    const recommendations = [];

    // Analyze Nitrogen (N)
    if (nVal < OPTIMAL_TARGETS.N.min) {
      recommendations.push({
        nutrient: 'Nitrogen (N)',
        status: 'low' as const,
        value: nVal,
        recommendedFertilizer: 'Urea (46% Nitrogen)',
        applicationRate: `${Math.round((OPTIMAL_TARGETS.N.min - nVal) * 1.5)} kg/hectare`,
        description: 'Nitrogen is crucial for vegetative leaf growth. A deficiency results in yellowing of leaves and stunted plant growth.'
      });
    } else if (nVal > OPTIMAL_TARGETS.N.max) {
      recommendations.push({
        nutrient: 'Nitrogen (N)',
        status: 'high' as const,
        value: nVal,
        recommendedFertilizer: 'None (Limit nitrogen application)',
        applicationRate: '0 kg/hectare',
        description: 'Excessive nitrogen causes rapid, weak vegetative growth, reduces flowering/fruiting, and increases pest susceptibility.'
      });
    } else {
      recommendations.push({
        nutrient: 'Nitrogen (N)',
        status: 'optimal' as const,
        value: nVal,
        recommendedFertilizer: 'Organic Compost (Maintenance dose)',
        applicationRate: '20 kg/hectare',
        description: 'Nitrogen levels are optimal. Continue regular organic maintenance.'
      });
    }

    // Analyze Phosphorus (P)
    if (pVal < OPTIMAL_TARGETS.P.min) {
      recommendations.push({
        nutrient: 'Phosphorus (P)',
        status: 'low' as const,
        value: pVal,
        recommendedFertilizer: 'DAP (Diammonium Phosphate) or Single Super Phosphate (SSP)',
        applicationRate: `${Math.round((OPTIMAL_TARGETS.P.min - pVal) * 2.0)} kg/hectare`,
        description: 'Phosphorus is critical for root development, flowering, and seed production. Deficiency shows as purplish leaf edges and weak root networks.'
      });
    } else if (pVal > OPTIMAL_TARGETS.P.max) {
      recommendations.push({
        nutrient: 'Phosphorus (P)',
        status: 'high' as const,
        value: pVal,
        recommendedFertilizer: 'None (Limit phosphorus application)',
        applicationRate: '0 kg/hectare',
        description: 'Excess phosphorus blocks iron and zinc uptake, leading to micronutrient deficiencies.'
      });
    } else {
      recommendations.push({
        nutrient: 'Phosphorus (P)',
        status: 'optimal' as const,
        value: pVal,
        recommendedFertilizer: 'Bone Meal / Maintenance dose',
        applicationRate: '15 kg/hectare',
        description: 'Phosphorus levels are optimal. Supports healthy bloom and strong root caps.'
      });
    }

    // Analyze Potassium (K)
    if (kVal < OPTIMAL_TARGETS.K.min) {
      recommendations.push({
        nutrient: 'Potassium (K)',
        status: 'low' as const,
        value: kVal,
        recommendedFertilizer: 'MOP (Muriate of Potash / Potassium Chloride)',
        applicationRate: `${Math.round((OPTIMAL_TARGETS.K.min - kVal) * 1.8)} kg/hectare`,
        description: 'Potassium aids in water regulation, disease resistance, and fruit quality. Deficiency causes brown scorching on leaf tips.'
      });
    } else if (kVal > OPTIMAL_TARGETS.K.max) {
      recommendations.push({
        nutrient: 'Potassium (K)',
        status: 'high' as const,
        value: kVal,
        recommendedFertilizer: 'None (Limit potassium application)',
        applicationRate: '0 kg/hectare',
        description: 'High potassium blocks magnesium and calcium absorption, leading to leaf margins curl and yellowing.'
      });
    } else {
      recommendations.push({
        nutrient: 'Potassium (K)',
        status: 'optimal' as const,
        value: kVal,
        recommendedFertilizer: 'Wood Ash / Maintenance dose',
        applicationRate: '15 kg/hectare',
        description: 'Potassium levels are optimal. Enhances crop water retention and cell wall thickness.'
      });
    }

    // Log fertilizer recommendation run in history
    const predictionsDb = getPredictionsDB();
    const newPrediction = await predictionsDb.create({
      userId: req.user!.id,
      type: 'fertilizer',
      nitrogen: nVal,
      phosphorus: pVal,
      potassium: kVal,
      fertilizerRecommendations: recommendations.map(rec => ({
        nutrient: rec.nutrient,
        status: rec.status,
        value: rec.value,
        recommendedFertilizer: rec.recommendedFertilizer,
        applicationRate: rec.applicationRate
      }))
    });

    res.status(200).json({
      success: true,
      predictionId: newPrediction._id,
      fertilizerRecommendations: recommendations,
      inputs: { N: nVal, P: pVal, K: kVal }
    });

  } catch (error: any) {
    res.status(500).json({ error: `Fertilizer recommendation failed: ${error.message}` });
  }
});

export default router;
