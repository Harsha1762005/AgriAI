import React, { useState } from 'react';
import { Sprout, HelpCircle, ArrowRight, RefreshCw, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import API from '../services/api';

export const CropRecModule: React.FC = () => {
  // Form input states
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Prediction results state
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAutofill = (type: 'rice' | 'grapes' | 'coffee') => {
    // Helper to test quickly
    if (type === 'rice') {
      setFormData({ N: '90', P: '42', K: '43', temperature: '23.6', humidity: '82.2', ph: '6.5', rainfall: '202.9' });
    } else if (type === 'grapes') {
      setFormData({ N: '23', P: '125', K: '201', temperature: '22.4', humidity: '81.9', ph: '5.9', rainfall: '69.8' });
    } else if (type === 'coffee') {
      setFormData({ N: '98', P: '28', K: '32', temperature: '26.1', humidity: '55.4', ph: '6.8', rainfall: '158.2' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const { N, P, K, temperature, humidity, ph, rainfall } = formData;
    if (!N || !P || !K || !temperature || !humidity || !ph || !rainfall) {
      setError('Please fill in all soil and environmental parameters.');
      return;
    }

    const nVal = Number(N);
    const pVal = Number(P);
    const kVal = Number(K);
    const tempVal = Number(temperature);
    const humVal = Number(humidity);
    const phVal = Number(ph);
    const rainVal = Number(rainfall);

    if (
      isNaN(nVal) || isNaN(pVal) || isNaN(kVal) || 
      isNaN(tempVal) || isNaN(humVal) || isNaN(phVal) || isNaN(rainVal)
    ) {
      setError('All parameters must be numerical values.');
      return;
    }

    if (nVal < 0 || pVal < 0 || kVal < 0 || humVal < 0 || rainVal < 0) {
      setError('Nutrients, humidity, and rainfall cannot be negative.');
      return;
    }

    if (phVal < 0 || phVal > 14) {
      setError('pH value must be between 0 and 14.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/crop/predict', {
        N: nVal,
        P: pVal,
        K: kVal,
        temperature: tempVal,
        humidity: humVal,
        ph: phVal,
        rainfall: rainVal
      });

      if (res.data && res.data.success) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Crop prediction analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' });
  };

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8">
      
      {!result ? (
        // INPUT FORM
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Input Form */}
          <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-sans">Soil Diagnostics & Crop Input</h3>
              
              {/* Quick Autofill Buttons for review testing */}
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  onClick={() => handleAutofill('rice')}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition bg-slate-100/50 dark:bg-slate-900/50"
                >
                  Autofill Rice
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAutofill('grapes')}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition bg-slate-100/50 dark:bg-slate-900/50"
                >
                  Autofill Grapes
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Soil Macronutrients N-P-K */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Soil Macronutrients (ppm)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Nitrogen */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Nitrogen (N)</label>
                    <input 
                      type="number" 
                      name="N" 
                      value={formData.N}
                      onChange={handleInputChange}
                      placeholder="e.g. 90" 
                      className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                      min="0"
                      max="300"
                    />
                  </div>
                  {/* Phosphorus */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Phosphorus (P)</label>
                    <input 
                      type="number" 
                      name="P" 
                      value={formData.P}
                      onChange={handleInputChange}
                      placeholder="e.g. 42" 
                      className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                      min="0"
                      max="300"
                    />
                  </div>
                  {/* Potassium */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Potassium (K)</label>
                    <input 
                      type="number" 
                      name="K" 
                      value={formData.K}
                      onChange={handleInputChange}
                      placeholder="e.g. 43" 
                      className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                      min="0"
                      max="300"
                    />
                  </div>
                </div>
              </div>

              {/* Environmental Metrics */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Environmental Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Temperature */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Temperature (°C)</label>
                    <input 
                      type="number" 
                      name="temperature" 
                      value={formData.temperature}
                      onChange={handleInputChange}
                      placeholder="e.g. 23.6" 
                      step="0.01"
                      className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    />
                  </div>
                  {/* Humidity */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Relative Humidity (%)</label>
                    <input 
                      type="number" 
                      name="humidity" 
                      value={formData.humidity}
                      onChange={handleInputChange}
                      placeholder="e.g. 82.2" 
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    />
                  </div>
                  {/* pH */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Soil pH Value</label>
                    <input 
                      type="number" 
                      name="ph" 
                      value={formData.ph}
                      onChange={handleInputChange}
                      placeholder="e.g. 6.5" 
                      min="0"
                      max="14"
                      step="0.01"
                      className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    />
                  </div>
                  {/* Rainfall */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Annual Rainfall (mm)</label>
                    <input 
                      type="number" 
                      name="rainfall" 
                      value={formData.rainfall}
                      onChange={handleInputChange}
                      placeholder="e.g. 202.9" 
                      min="0"
                      step="0.01"
                      className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit trigger */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Soil Chemistry...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Crop Recommendation</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Guide Helper Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center space-x-3 text-emerald-500">
                <HelpCircle className="w-6 h-6" />
                <h4 className="font-bold">How to Input Data</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Soil N-P-K tests measure key macro-elements in parts per million (ppm). Temperature and humidity can be fetched from your weather station. A standard laboratory soil probe measures pH. Rainfall values represent average annual patterns.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  N (Nitrogen): Leaf Growth
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  P (Phosphorus): Root & Flower
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  K (Potassium): Fruit & Stalk
                </li>
              </ul>
            </div>
          </div>

        </div>
      ) : (
        // RESULTS VIEW
        <div className="space-y-8 animate-fadeIn">
          
          {/* Result Header Card */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row">
            {/* Crop image */}
            <div className="md:w-1/3 h-64 md:h-auto bg-cover bg-center overflow-hidden min-h-[250px]" 
                 style={{ backgroundImage: `url(${result.crop.imageUrl})` }}>
            </div>
            {/* Crop basic details */}
            <div className="md:w-2/3 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-extrabold font-sans text-emerald-500">{result.crop.name}</h3>
                    <p className="text-sm text-slate-400 italic">{result.crop.scientificName}</p>
                  </div>
                  
                  {/* Confidence Gauge */}
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-sky-500">{result.confidence}%</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Confidence</span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-left">
                  {result.crop.description}
                </p>
              </div>

              {/* Quick stats list */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Suitable Season</span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{result.crop.suitableSeason}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Water Need</span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{result.crop.waterRequirement}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Expected Yield</span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{result.crop.expectedYield}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Market Demand</span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{result.crop.marketDemand}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Details Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cultivation Tips */}
            <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h4 className="font-bold font-sans text-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Growing Recommendations</span>
              </h4>
              <div className="space-y-4">
                {result.crop.growingTips.map((tip: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 text-left">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Economic indicators */}
            <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              <h4 className="font-bold font-sans text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span>Profitability Index</span>
              </h4>

              {/* Slide meter for profitability */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span>Economic Returns</span>
                  <span className="text-emerald-500">{result.crop.profitability}% Rating</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: `${result.crop.profitability}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed text-left">
                  This crop is currently rated highly in regional agro-economic evaluations, representing strong commercial viability.
                </p>
              </div>

              {/* Reset trigger */}
              <button 
                onClick={handleReset}
                className="w-full h-11 rounded-xl bg-slate-150 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition text-sm flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Analyze New Soil</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
