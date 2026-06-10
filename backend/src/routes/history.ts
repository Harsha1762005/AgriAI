import { Router, Response } from 'express';
import { isLocalDB } from '../db/db';
import { PredictionModel } from '../models/prediction';
import { localDb } from '../db/jsonDb';
import { authProtect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const getPredictionsDB = () => (isLocalDB ? localDb.getCollection('predictions') : PredictionModel);

// @route   GET /api/history
// @desc    Get user's prediction logs with search, filter, and pagination
router.get('/', authProtect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const type = req.query.type as string; // 'crop' | 'fertilizer' | 'yield'
    const search = req.query.search as string; // text search
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    let total = 0;
    let items = [];

    if (isLocalDB) {
      // Local JSON DB Engine query formulation
      const filter: any = { userId };
      if (type) filter.type = type;
      if (search) {
        // Simple mock search matching substring
        filter.crop = { $regex: search };
      }

      const collection = localDb.getCollection('predictions');
      const result = await collection.findPaginated(filter, skip, limit, 'createdAt', sortOrder);
      items = result.items;
      total = result.total;
    } else {
      // MongoDB / Mongoose query formulation
      const query: any = { userId };
      if (type) query.type = type;
      if (search) {
        query.$or = [
          { crop: { $regex: search, $options: 'i' } },
          { yieldCropType: { $regex: search, $options: 'i' } }
        ];
      }

      total = await PredictionModel.countDocuments(query);
      items = await PredictionModel.find(query)
        .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    }

    res.status(200).json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: `Failed to fetch prediction history: ${error.message}` });
  }
});

// @route   GET /api/history/export/csv
// @desc    Export prediction logs as CSV
router.get('/export/csv', authProtect, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const predictionsDb = getPredictionsDB();
    const items = await predictionsDb.find({ userId });

    // Format fields into CSV format
    let csvContent = 'ID,Type,Date,Crop/Type,N,P,K,Temp (°C),Humidity (%),pH,Rainfall (mm),Confidence (%),Estimated Yield,Revenue ($),Profit ($)\n';
    
    for (const item of items) {
      const date = new Date(item.createdAt).toLocaleDateString();
      const typeLabel = item.type.toUpperCase();
      
      let cropName = '';
      let n = item.nitrogen || '';
      let p = item.phosphorus || '';
      let k = item.potassium || '';
      let temp = item.temperature || '';
      let hum = item.humidity || '';
      let ph = item.ph || '';
      let rain = item.rainfall || '';
      let conf = item.confidence || '';
      let yieldOut = item.yieldEstimatedOutput || '';
      let rev = item.yieldRevenue || '';
      let prof = item.yieldProfit || '';

      if (item.type === 'crop') {
        cropName = item.crop || '';
      } else if (item.type === 'yield') {
        cropName = item.yieldCropType || '';
      } else if (item.type === 'fertilizer') {
        cropName = 'N-P-K Deficiency Run';
      }

      csvContent += `"${item._id}","${typeLabel}","${date}","${cropName}","${n}","${p}","${k}","${temp}","${hum}","${ph}","${rain}","${conf}","${yieldOut}","${rev}","${prof}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="AgriAI_Analytics_Export_${Date.now()}.csv"`);
    res.status(200).send(csvContent);

  } catch (error: any) {
    res.status(500).json({ error: `CSV Export failed: ${error.message}` });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a prediction record
router.delete('/:id', authProtect, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const predictionsDb = getPredictionsDB();
    const record = await predictionsDb.findById(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    // Verify ownership
    if (record.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You do not own this record.' });
    }

    await predictionsDb.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Prediction record deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: `Deletion failed: ${error.message}` });
  }
});

export default router;
