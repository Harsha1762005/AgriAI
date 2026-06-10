import React, { useEffect, useState } from 'react';
import { 
  CloudSun, 
  Sun, 
  CloudRain, 
  Wind, 
  Gauge, 
  Droplet, 
  Navigation, 
  Loader2,
  CalendarDays
} from 'lucide-react';
import API from '../services/api';

export const WeatherModule: React.FC = () => {
  const [location, setLocation] = useState('Central Farmlands');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const locations = [
    'Central Farmlands',
    'Northern Hills & Highlands',
    'Southern Coastal Delta',
    'Western Arid Plains'
  ];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/weather?location=${encodeURIComponent(location)}`);
        if (res.data && res.data.success) {
          setWeatherData(res.data);
        }
      } catch (err) {
        console.error('Failed to load weather conditions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  // Weather condition icons helper
  const getWeatherIcon = (cond: string, size = 'w-6 h-6') => {
    const key = cond.toLowerCase();
    if (key === 'sunny' || key === 'clear') return <Sun className={`${size} text-amber-500`} />;
    if (key === 'rainy' || key === 'showers') return <CloudRain className={`${size} text-sky-500`} />;
    if (key === 'windy') return <Wind className={`${size} text-slate-400`} />;
    return <CloudSun className={`${size} text-indigo-400`} />;
  };

  if (loading && !weatherData) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  const { current, forecast } = weatherData;

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8 animate-fadeIn">
      
      {/* Location selector */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-lg font-sans">Agricultural Meteorological Center</h3>
          <p className="text-xs text-slate-500">Track local microclimatic conditions and forecast variables</p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Navigation className="w-4 h-4 text-emerald-500 shrink-0" />
          <select 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 glass-input text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:bg-slate-900 font-semibold"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main current weather widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Core weather card */}
        <div className="md:col-span-2 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white/80 via-white/40 to-sky-500/5 dark:from-slate-900/80 dark:to-sky-950/10">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="font-black text-3xl">{current.temperature}°C</h4>
              <p className="text-sm text-slate-400 capitalize">{current.condition} Conditions</p>
              <p className="text-[10px] text-slate-400 font-bold">{current.location}</p>
            </div>
            <div className="w-20 h-20 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-center shrink-0">
              {getWeatherIcon(current.condition, 'w-12 h-12')}
            </div>
          </div>

          {/* Quick metric details */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
            <div className="flex items-center space-x-3">
              <div className="text-slate-400"><Wind className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Wind Speed</span>
                <span className="font-bold">{current.windSpeed} km/h</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-slate-400"><Droplet className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Humidity</span>
                <span className="font-bold">{current.humidity}%</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-slate-400"><Gauge className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Pressure</span>
                <span className="font-bold">{current.pressure} hPa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Soil Moisture & UV status widgets */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
          
          {/* Soil Moisture */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Soil Moisture Index</span>
              <span className="font-bold text-sky-500">{current.soilMoisture}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${current.soilMoisture}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Provides estimation of top-layer moisture levels, critical for root absorption metrics.
            </p>
          </div>

          {/* UV index */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Solar UV Index</span>
              <span className="font-bold text-amber-500">{current.uvIndex} of 10</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${current.uvIndex * 10}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Measures ultraviolet solar irradiance, important to schedule foliar fertilizer sprays.
            </p>
          </div>

        </div>
      </div>

      {/* 5-day Forecast widget */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <h4 className="font-bold text-lg font-sans flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-emerald-500" />
          <span>5-Day Crop Forecast Outlook</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {forecast.map((dayData: any, idx: number) => (
            <div 
              key={idx} 
              className="p-4 rounded-2xl border border-slate-250/30 dark:border-slate-800/80 bg-slate-100/30 dark:bg-slate-900/30 text-center space-y-3 flex flex-col items-center justify-between"
            >
              <span className="text-xs font-bold text-slate-400">{dayData.day}</span>
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                {getWeatherIcon(dayData.condition, 'w-7 h-7')}
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                  {dayData.tempMax}° / <span className="text-slate-400">{dayData.tempMin}°</span>
                </div>
                <div className="text-[9px] font-semibold text-sky-500">
                  🌧️ {dayData.rainfallProb}% rain
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
