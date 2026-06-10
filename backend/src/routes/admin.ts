import { Router, Response } from 'express';
import { isLocalDB } from '../db/db';
import { UserModel } from '../models/user';
import { PredictionModel } from '../models/prediction';
import { CropModel } from '../models/crop';
import { localDb } from '../db/jsonDb';
import { authProtect, adminRoute, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const getUsersDB = () => (isLocalDB ? localDb.getCollection('users') : UserModel);
const getPredictionsDB = () => (isLocalDB ? localDb.getCollection('predictions') : PredictionModel);
const getCropsDB = () => (isLocalDB ? localDb.getCollection('crops') : CropModel);

// -------------------------------------------------------------
// USER MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

// @route   GET /api/admin/users
// @desc    Get all users list
router.get('/users', authProtect, adminRoute, async (req: AuthRequest, res) => {
  try {
    const usersDb = getUsersDB();
    const users = await usersDb.find();
    // Exclude passwords
    const sanitizedUsers = users.map((u: any) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      phone: u.phone,
      location: u.location,
      createdAt: u.createdAt
    }));
    res.status(200).json({ success: true, users: sanitizedUsers });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to fetch users: ${error.message}` });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details or role
router.put('/users/:id', authProtect, adminRoute, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, role, phone, location } = req.body;
  try {
    const usersDb = getUsersDB();
    const updated = await usersDb.findByIdAndUpdate(id, { name, role, phone, location });
    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: `Update failed: ${error.message}` });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', authProtect, adminRoute, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const usersDb = getUsersDB();
    const deleted = await usersDb.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: `Deletion failed: ${error.message}` });
  }
});

// -------------------------------------------------------------
// ANALYTICS ENDPOINT
// -------------------------------------------------------------

// @route   GET /api/admin/analytics
// @desc    Get dashboard metrics and crop distribution aggregates
router.get('/analytics', authProtect, adminRoute, async (req: AuthRequest, res) => {
  try {
    const usersDb = getUsersDB();
    const predictionsDb = getPredictionsDB();

    const users = await usersDb.find();
    const predictions = await predictionsDb.find();

    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => u.role !== 'admin').length;
    const totalPredictions = predictions.length;

    // Calculate crop distribution counts
    const cropCounts: Record<string, number> = {};
    predictions.forEach((p: any) => {
      if (p.type === 'crop' && p.crop) {
        cropCounts[p.crop] = (cropCounts[p.crop] || 0) + 1;
      }
    });

    const cropDistribution = Object.keys(cropCounts).map(name => ({
      name,
      value: cropCounts[name]
    })).sort((a, b) => b.value - a.value);

    // Monthly prediction trend (mock aggregates based on logged predictions)
    // Group predictions of the last 6 months
    const monthlyData: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed last 6 months with 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyData[key] = 0;
    }

    predictions.forEach((p: any) => {
      const pDate = new Date(p.createdAt);
      const key = `${months[pDate.getMonth()]} ${pDate.getFullYear().toString().substring(2)}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++;
      }
    });

    const monthlyTrends = Object.keys(monthlyData).map(month => ({
      month,
      predictions: monthlyData[month]
    }));

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        totalPredictions,
        mostRecommendedCrop: cropDistribution[0]?.name || 'N/A'
      },
      cropDistribution,
      monthlyTrends
    });

  } catch (error: any) {
    res.status(500).json({ error: `Analytics aggregation failed: ${error.message}` });
  }
});

// -------------------------------------------------------------
// CROP DATABASE CRUD ENDPOINTS
// -------------------------------------------------------------

// @route   GET /api/admin/crops
// @desc    Get all crops in system database
router.get('/crops', authProtect, adminRoute, async (req: AuthRequest, res) => {
  try {
    const cropsDb = getCropsDB();
    const crops = await cropsDb.find();
    res.status(200).json({ success: true, crops });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to fetch crops: ${error.message}` });
  }
});

// @route   POST /api/admin/crops
// @desc    Create a new crop metadata entry
router.post('/crops', authProtect, adminRoute, async (req: AuthRequest, res) => {
  const { name, scientificName, description, suitableSeason, waterRequirement, expectedYield, marketDemand, profitability, growingTips, imageUrl } = req.body;
  if (!name || !scientificName || !description || !suitableSeason || !waterRequirement || !expectedYield || !marketDemand || profitability === undefined || !imageUrl) {
    return res.status(400).json({ error: 'Please enter all crop fields.' });
  }

  try {
    const cropsDb = getCropsDB();
    const cropExists = await cropsDb.findOne({ name: name.toLowerCase() });
    if (cropExists) {
      return res.status(400).json({ error: 'Crop metadata with this name already exists.' });
    }

    const newCrop = await cropsDb.create({
      name: name.toLowerCase(),
      scientificName,
      description,
      suitableSeason,
      waterRequirement,
      expectedYield,
      marketDemand,
      profitability: Number(profitability),
      growingTips: Array.isArray(growingTips) ? growingTips : [growingTips],
      imageUrl
    });

    res.status(201).json({ success: true, crop: newCrop });
  } catch (error: any) {
    res.status(500).json({ error: `Failed to add crop: ${error.message}` });
  }
});

// @route   PUT /api/admin/crops/:id
// @desc    Update crop metadata
router.put('/crops/:id', authProtect, adminRoute, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const cropsDb = getCropsDB();
    const updated = await cropsDb.findByIdAndUpdate(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Crop metadata not found.' });
    }
    res.status(200).json({ success: true, message: 'Crop updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: `Update failed: ${error.message}` });
  }
});

// @route   DELETE /api/admin/crops/:id
// @desc    Delete a crop from catalog
router.delete('/crops/:id', authProtect, adminRoute, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const cropsDb = getCropsDB();
    const deleted = await cropsDb.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Crop metadata not found.' });
    }
    res.status(200).json({ success: true, message: 'Crop deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: `Deletion failed: ${error.message}` });
  }
});

export default router;
