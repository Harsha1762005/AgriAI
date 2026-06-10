import { Router, Response } from 'express';
import { authProtect, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/weather
// @desc    Get current weather conditions and 5-day forecast (simulated/real)
router.get('/', authProtect, async (req: AuthRequest, res) => {
  const location = (req.query.location as string) || 'Central Farmlands';
  
  try {
    // Standard mock weather simulation to ensure 100% out-of-the-box functionality
    // Seed random based on location name length to keep it consistent per location
    const seed = location.length;
    const baseTemp = 22 + (seed % 10); // 22°C to 32°C
    const baseHumidity = 60 + (seed % 25); // 60% to 85%
    const baseWind = 10 + (seed % 15); // 10 to 25 km/h
    
    let condition = 'Sunny';
    if (baseHumidity > 80) condition = 'Rainy';
    else if (baseHumidity > 72) condition = 'Cloudy';
    else if (baseWind > 20) condition = 'Windy';

    const current = {
      location,
      condition,
      temperature: baseTemp,
      humidity: baseHumidity,
      rainfall: condition === 'Rainy' ? 12.5 + (seed % 8) : 0.0,
      windSpeed: baseWind,
      uvIndex: 4 + (seed % 6), // 4 to 10
      soilMoisture: 35 + (seed % 30), // 35% to 65%
      pressure: 1012 - (seed % 6) // hPa
    };

    // Generate 5-day forecast
    const forecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = new Date().getDay();

    for (let i = 1; i <= 5; i++) {
      const dayIndex = (todayIndex + i) % 7;
      const fTempMax = baseTemp + (i % 2 === 0 ? 2 : -2) + (i % 3);
      const fTempMin = baseTemp - 6 - (i % 2);
      const fHumidity = Math.max(40, baseHumidity + (i % 2 === 0 ? 10 : -10));
      
      let fCondition = 'Sunny';
      if (fHumidity > 80) fCondition = 'Rainy';
      else if (fHumidity > 70) fCondition = 'Cloudy';

      forecast.push({
        day: days[dayIndex],
        condition: fCondition,
        tempMax: fTempMax,
        tempMin: fTempMin,
        humidity: fHumidity,
        rainfallProb: fCondition === 'Rainy' ? 80 + (i * 2) : (fCondition === 'Cloudy' ? 30 + (i * 5) : 10)
      });
    }

    res.status(200).json({
      success: true,
      current,
      forecast
    });

  } catch (error: any) {
    res.status(500).json({ error: `Weather retrieval failed: ${error.message}` });
  }
});

export default router;
