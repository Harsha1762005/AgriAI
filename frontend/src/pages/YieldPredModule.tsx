import React, { useState } from 'react';
import { BarChart3, RefreshCw, AlertCircle, ArrowRight, Coins, TrendingUp, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import API from '../services/api';

export const YieldPredModule: React.FC = () => {
  const [formData, setFormData] = useState({
    cropType: '',
    area: '',
    soilQuality: 'Medium',
    temperature: '',
    rainfall: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const cropsList = [
    'Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 'Mothbeans', 'Mungbean', 
    'Blackgram', 'Lentil', 'Pomegranate', 'Banana', 'Mango', 'Grapes', 'Watermelon', 
    'Muskmelon', 'Apple', 'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutofill = (type: 'coffee' | 'rice' | 'pomegranate') => {
    if (type === 'coffee') {
      setFormData({ cropType: 'Coffee', area: '5.0', soilQuality: 'Good', temperature: '24.5', rainfall: '160.0' });
    } else if (type === 'rice') {
      setFormData({ cropType: 'Rice', area: '10.0', soilQuality: 'Good', temperature: '25.0', rainfall: '210.0' });
    } else if (type === 'pomegranate') {
      setFormData({ cropType: 'Pomegranate', area: '2.5', soilQuality: 'Medium', temperature: '22.0', rainfall: '105.0' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { cropType, area, soilQuality, temperature, rainfall } = formData;
    if (!cropType || !area || !soilQuality || !temperature || !rainfall) {
      setError('Please fill in all yield forecasting parameters.');
      return;
    }

    const areaVal = Number(area);
    const tempVal = Number(temperature);
    const rainVal = Number(rainfall);

    if (isNaN(areaVal) || isNaN(tempVal) || isNaN(rainVal)) {
      setError('Area, temperature, and rainfall must be numerical values.');
      return;
    }

    if (areaVal <= 0 || rainVal < 0) {
      setError('Area must be greater than 0, rainfall cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/yield/predict', {
        cropType,
        area: areaVal,
        soilQuality,
        temperature: tempVal,
        rainfall: rainVal
      });

      if (res.data && res.data.success) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Yield prediction analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ cropType: '', area: '', soilQuality: 'Medium', temperature: '', rainfall: '' });
  };

  // Format Recharts data based on modifier metrics
  const getChartData = () => {
    if (!result) return [];
    return [
      { name: 'Base Yield', factor: result.metrics.baseYield, fill: '#64748B' },
      { name: 'Soil Quality', factor: Number((result.metrics.baseYield * result.metrics.soilFactor).toFixed(2)), fill: '#10B981' },
      { name: 'Temp Fit', factor: Number((result.metrics.baseYield * result.metrics.soilFactor * result.metrics.tempFactor).toFixed(2)), fill: '#0EA5E9' },
      { name: 'Rainfall Fit', factor: result.metrics.yieldPerHectare, fill: '#F59E0B' }
    ];
  };

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8 animate-fadeIn">
      
      {!result ? (
        // FORM VIEW
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-sans">Yield Forecasting Inputs</h3>
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  onClick={() => handleAutofill('coffee')}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition bg-slate-100/50 dark:bg-slate-900/50"
                >
                  Coffee 5ha
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAutofill('rice')}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition bg-slate-100/50 dark:bg-slate-900/50"
                >
                  Rice 10ha
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Crop dropdown */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Crop Variety</label>
                  <select 
                    name="cropType" 
                    value={formData.cropType}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:bg-slate-900"
                    required
                  >
                    <option value="" disabled>Select Crop</option>
                    {cropsList.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                {/* Land Area */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Farm Area (Hectares)</label>
                  <input 
                    type="number" 
                    name="area" 
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g. 5" 
                    step="0.01"
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    min="0"
                  />
                </div>

                {/* Soil quality selection */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Soil Quality Index</label>
                  <select 
                    name="soilQuality" 
                    value={formData.soilQuality}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:bg-slate-900"
                  >
                    <option value="Good">Good (Premium/Tested Loamy)</option>
                    <option value="Medium">Medium (Average/Standard Soil)</option>
                    <option value="Poor">Poor (Degraded/Nutrient Leached)</option>
                  </select>
                </div>

                {/* Temperature */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Forecast Temperature (°C)</label>
                  <input 
                    type="number" 
                    name="temperature" 
                    value={formData.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g. 24.5" 
                    step="0.1"
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                  />
                </div>

                {/* Rainfall */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold">Average Forecast Rainfall (mm)</label>
                  <input 
                    type="number" 
                    name="rainfall" 
                    value={formData.rainfall}
                    onChange={handleInputChange}
                    placeholder="e.g. 150.0" 
                    step="1"
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    min="0"
                  />
                </div>

              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing Productivity Equations...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Yield Forecast</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Guide Sidebar */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 text-amber-500">
              <HelpCircle className="w-6 h-6" />
              <h4 className="font-bold">Yield Modifiers</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Base yield estimates represent standard yields under ideal climate controls. Calculations are adjusted dynamically:
            </p>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <span className="font-bold block text-slate-700 dark:text-slate-300">Soil Quality Index:</span>
                Good soil multiplies output by <span className="text-emerald-500 font-bold">1.25x</span>. Poor soil decreases yields down to <span className="text-red-500 font-bold">0.70x</span>.
              </li>
              <li>
                <span className="font-bold block text-slate-700 dark:text-slate-300">Climate Fit:</span>
                Deviations from the crop's ideal temperature or water bounds apply progressive penalties to model output.
              </li>
            </ul>
          </div>

        </div>
      ) : (
        // RESULTS VIEW
        <div className="space-y-8 animate-fadeIn">
          
          {/* Card stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tonnage yield */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Estimated Harvest</span>
                <div className="text-3xl font-extrabold text-emerald-500">{result.estimatedYield} Tons</div>
                <span className="text-[10px] text-slate-500">
                  {result.metrics.yieldPerHectare} tons per hectare
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>

            {/* Expected Revenue */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Gross Revenue</span>
                <div className="text-3xl font-extrabold text-sky-500">${result.expectedRevenue.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block">Estimated market value</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6" />
              </div>
            </div>

            {/* Net Profits */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Expected Net Profit</span>
                <div className="text-3xl font-extrabold text-amber-500">${result.expectedProfit.toLocaleString()}</div>
                <span className="text-[10px] text-emerald-500 font-semibold block">
                  ROI: {Math.round((result.expectedProfit / (result.expectedRevenue - result.expectedProfit)) * 100)}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-accent flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Factor breakdown chart */}
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-lg">Yield Modifier Progression</h4>
                <p className="text-xs text-slate-500">Yield limits (tons/ha) as environmental filters are applied</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="factor" fill="#10B981" radius={[8, 8, 0, 0]}>
                      {getChartData().map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagnostics Report Summary */}
            <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4 text-left">
                <h4 className="font-bold font-sans text-xl">Modifier Audit Log</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Soil Quality Index</span>
                    <span className={`font-bold ${result.metrics.soilFactor >= 1 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {result.metrics.soilFactor}x
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Temperature Fit</span>
                    <span className={`font-bold ${result.metrics.tempFactor >= 0.9 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {result.metrics.tempFactor}x
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Water Volume Fit</span>
                    <span className={`font-bold ${result.metrics.rainFactor >= 0.9 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {result.metrics.rainFactor}x
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  These factors detail how soil micro-particles and meteorological changes deviate expected outputs from ideal crop genetics baselines.
                </p>
              </div>

              <button 
                onClick={handleReset}
                className="w-full h-11 rounded-xl bg-slate-150 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition text-sm flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Forecast New Crop</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
