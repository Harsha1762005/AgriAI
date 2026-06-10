import React, { useState } from 'react';
import { Leaf, RefreshCw, AlertCircle, HelpCircle, Check, ArrowRight, ShieldAlert } from 'lucide-react';
import API from '../services/api';

export const FertilizerModule: React.FC = () => {
  const [formData, setFormData] = useState({ N: '', P: '', K: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutofill = (type: 'lowN' | 'lowP' | 'optimal') => {
    if (type === 'lowN') setFormData({ N: '30', P: '65', K: '60' });
    else if (type === 'lowP') setFormData({ N: '95', P: '15', K: '70' });
    else if (type === 'optimal') setFormData({ N: '95', P: '58', K: '62' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { N, P, K } = formData;

    if (N === '' || P === '' || K === '') {
      setError('Please fill in N, P, and K soil nutrient levels.');
      return;
    }

    const nVal = Number(N);
    const pVal = Number(P);
    const kVal = Number(K);

    if (isNaN(nVal) || isNaN(pVal) || isNaN(kVal)) {
      setError('All nutrient values must be numbers.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/fertilizer/recommend', { N: nVal, P: pVal, K: kVal });
      if (res.data && res.data.success) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze soil nutrients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({ N: '', P: '', K: '' });
  };

  // Helper for color-coding status indicators
  const getStatusDetails = (status: 'low' | 'high' | 'optimal') => {
    if (status === 'low') return { color: 'text-red-500 bg-red-100 dark:bg-red-950/40', barColor: 'bg-red-500' };
    if (status === 'high') return { color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/40', barColor: 'bg-amber-500' };
    return { color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40', barColor: 'bg-emerald-500' };
  };

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8 animate-fadeIn">
      
      {!result ? (
        // INPUT FORM
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-sans">N-P-K Soil Chemical Assays</h3>
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  onClick={() => handleAutofill('lowN')}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:border-red-500/30 transition bg-slate-100/50 dark:bg-slate-900/50"
                >
                  Low Nitrogen
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAutofill('lowP')}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition bg-slate-100/50 dark:bg-slate-900/50"
                >
                  Low Phos
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Nitrogen */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Nitrogen (N) - ppm</label>
                  <input 
                    type="number" 
                    name="N" 
                    value={formData.N}
                    onChange={handleInputChange}
                    placeholder="e.g. 50" 
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    min="0"
                    max="300"
                  />
                </div>

                {/* Phosphorus */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Phosphorus (P) - ppm</label>
                  <input 
                    type="number" 
                    name="P" 
                    value={formData.P}
                    onChange={handleInputChange}
                    placeholder="e.g. 30" 
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    min="0"
                    max="300"
                  />
                </div>

                {/* Potassium */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Potassium (K) - ppm</label>
                  <input 
                    type="number" 
                    name="K" 
                    value={formData.K}
                    onChange={handleInputChange}
                    placeholder="e.g. 70" 
                    className="w-full h-11 px-4 rounded-xl glass-input text-sm"
                    min="0"
                    max="300"
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
                    <span>Analyzing Soil Deficits...</span>
                  </>
                ) : (
                  <>
                    <span>Perform Nutrient Analysis</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Guide Helper Sidebar */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 text-sky-500">
              <HelpCircle className="w-6 h-6" />
              <h4 className="font-bold">Target Nutrient Baselines</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standard optimal ranges represent healthy soil thresholds:
            </p>
            <div className="space-y-3 pt-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Nitrogen (N)</span>
                  <span>80 - 120 ppm</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/5 mx-auto"></div>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Phosphorus (P)</span>
                  <span>40 - 80 ppm</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-2/5 mx-auto"></div>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Potassium (K)</span>
                  <span>40 - 80 ppm</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-2/5 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        // RESULTS DIAGNOSTICS VIEW
        <div className="space-y-8 animate-fadeIn">
          
          {/* Results Summary Header */}
          <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-2xl font-black font-sans text-sky-500">Soil Deficit Diagnostics</h3>
              <p className="text-xs text-slate-500 mt-1">N-P-K assay comparison: Current levels against optimal boundaries</p>
            </div>
            
            <button 
              onClick={handleReset}
              className="px-5 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Test New Assay</span>
            </button>
          </div>

          {/* Individual element details grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {result.fertilizerRecommendations.map((rec: any, idx: number) => {
              const details = getStatusDetails(rec.status);
              
              // Max values for relative bars display (cap at 150)
              const maxScale = 150;
              const currentPct = Math.min(100, (rec.value / maxScale) * 100);
              const targetMin = rec.nutrient.startsWith('Nitrogen') ? 80 : 40;
              const targetMax = rec.nutrient.startsWith('Nitrogen') ? 120 : 80;
              const targetLeft = (targetMin / maxScale) * 100;
              const targetWidth = ((targetMax - targetMin) / maxScale) * 100;

              return (
                <div key={idx} className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-6">
                  
                  {/* Status header */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-lg">{rec.nutrient}</h4>
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${details.color}`}>
                        {rec.status}
                      </span>
                    </div>
                    
                    {/* Visual relative bar */}
                    <div className="relative pt-3 pb-1">
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 relative">
                        {/* Optimal target range zone */}
                        <div 
                          className="absolute h-full bg-emerald-500/10 border-x border-emerald-500/20" 
                          style={{ left: `${targetLeft}%`, width: `${targetWidth}%` }}
                        ></div>
                        {/* Current value marker */}
                        <div 
                          className={`absolute h-full rounded-full ${details.barColor}`} 
                          style={{ width: `${currentPct}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold pt-1">
                        <span>0 ppm</span>
                        <span style={{ marginLeft: `${targetLeft - 5}%` }}>Optimal Zone ({targetMin}-{targetMax})</span>
                        <span>{maxScale}+ ppm</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation description */}
                  <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                    {rec.description}
                  </div>

                  {/* Fertilizer prescription card */}
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-left space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Recommended Remedy</span>
                    <div className="font-extrabold text-sm text-sky-500 flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      <span>{rec.recommendedFertilizer}</span>
                    </div>
                    <div className="text-xs">
                      Application Rate: <span className="font-bold text-slate-700 dark:text-slate-200">{rec.applicationRate}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
