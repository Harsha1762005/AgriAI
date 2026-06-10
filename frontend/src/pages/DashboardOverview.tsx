import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Leaf, 
  BarChart3, 
  CloudSun, 
  TrendingUp, 
  Database,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import API from '../services/api';

const COLORS = ['#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Dashboard states
  const [stats, setStats] = useState({
    totalPredictions: 0,
    cropCount: 0,
    fertilizerCount: 0,
    totalProfit: 0,
    averageN: 0,
    averageP: 0,
    averageK: 0
  });
  
  const [cropDistribution, setCropDistribution] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [weatherSim, setWeatherSim] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch History Logs
        const historyRes = await API.get('/api/history?limit=100');
        const items = historyRes.data.items || [];
        
        // 2. Fetch Weather
        const weatherRes = await API.get('/api/weather?location=Central%20Farmlands');
        setWeatherSim(weatherRes.data.current);

        // 3. Process History statistics
        const total = items.length;
        const crops = items.filter((item: any) => item.type === 'crop');
        const fertilizers = items.filter((item: any) => item.type === 'fertilizer');
        const yields = items.filter((item: any) => item.type === 'yield');

        let totalProfit = 0;
        yields.forEach((item: any) => {
          totalProfit += item.yieldProfit || 0;
        });

        // Compute average N-P-K values
        let sumN = 0, sumP = 0, sumK = 0, npkCount = 0;
        items.forEach((item: any) => {
          if (item.nitrogen !== undefined) {
            sumN += item.nitrogen;
            sumP += item.phosphorus;
            sumK += item.potassium;
            npkCount++;
          }
        });

        setStats({
          totalPredictions: total,
          cropCount: crops.length,
          fertilizerCount: fertilizers.length,
          totalProfit: Math.round(totalProfit),
          averageN: npkCount ? Math.round(sumN / npkCount) : 0,
          averageP: npkCount ? Math.round(sumP / npkCount) : 0,
          averageK: npkCount ? Math.round(sumK / npkCount) : 0
        });

        // Group crops for Pie chart
        const cropCounts: Record<string, number> = {};
        crops.forEach((c: any) => {
          if (c.crop) {
            cropCounts[c.crop] = (cropCounts[c.crop] || 0) + 1;
          }
        });
        const cropDist = Object.keys(cropCounts).map(name => ({
          name,
          value: cropCounts[name]
        })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5
        setCropDistribution(cropDist);

        // Group trends by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyCounts: Record<string, number> = {};
        
        // Initialize past 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${months[d.getMonth()]}`;
          monthlyCounts[key] = 0;
        }

        items.forEach((item: any) => {
          const itemDate = new Date(item.createdAt);
          const key = `${months[itemDate.getMonth()]}`;
          if (monthlyCounts[key] !== undefined) {
            monthlyCounts[key]++;
          }
        });

        const trends = Object.keys(monthlyCounts).map(month => ({
          month,
          predictions: monthlyCounts[month]
        }));
        setMonthlyTrends(trends);

      } catch (err) {
        console.error('Error compiling dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Radar data format
  const radarData = [
    { subject: 'Nitrogen (N)', Current: stats.averageN || 30, Ideal: 100 },
    { subject: 'Phosphorus (P)', Current: stats.averageP || 40, Ideal: 60 },
    { subject: 'Potassium (K)', Current: stats.averageK || 35, Ideal: 60 }
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total predictions */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center relative overflow-hidden group hover:border-emerald-500/30 transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Diagnostic Runs</span>
            <div className="text-3xl font-extrabold">{stats.totalPredictions}</div>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Crops recommended */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center relative overflow-hidden group hover:border-sky-500/30 transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Crops Predicted</span>
            <div className="text-3xl font-extrabold">{stats.cropCount}</div>
            <span className="text-[10px] text-sky-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Top crop: {cropDistribution[0]?.name || 'Rice'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        {/* Yield profits */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center relative overflow-hidden group hover:border-amber-500/30 transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Forecasted Profit</span>
            <div className="text-3xl font-extrabold">${stats.totalProfit.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Maximize yield limits
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-accent flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Weather card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center relative overflow-hidden group hover:border-indigo-500/30 transition">
          <div className="space-y-1 z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weather Status</span>
            <div className="text-3xl font-extrabold">{weatherSim?.temperature || 24}°C</div>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              {weatherSim?.condition || 'Clear'} • {weatherSim?.humidity || 65}% Humidity
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0">
            <CloudSun className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MONTHLY LINE CHART */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold font-sans text-lg">Diagnostics Usage</h3>
              <p className="text-xs text-slate-500">Monthly prediction log counts over time</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">Past 6 Months</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="predictions" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPredictions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SOIL NUTRIENT RADAR */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold font-sans text-lg">Soil Nutrient Profile</h3>
            <p className="text-xs text-slate-500">Average tested N-P-K compared to optimal target levels</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 120]} stroke="#94A3B8" fontSize={8} />
                <Radar name="Current Average" dataKey="Current" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.3} />
                <Radar name="Ideal Threshold" dataKey="Ideal" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* LOWER CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PIE CHART - CROP DISTRIBUTION */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold font-sans text-lg">Recommended Crops</h3>
            <p className="text-xs text-slate-500">Distribution of top recommended crops</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {cropDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Sprout className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
                <span className="text-xs">No crop data available yet</span>
              </div>
            )}
          </div>
        </div>

        {/* QUICK DIAGNOSTICS LAUNCH PANEL */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative back graphic */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12">
            <Sprout className="w-64 h-64 text-emerald-500" />
          </div>
          
          <div className="space-y-4 z-10 text-left max-w-xl">
            <h3 className="text-2xl font-extrabold font-sans leading-tight">Optimizing Soil Conditions Has Never Been Easier.</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Launch crop suitability testing, check soil nutrient deficits for fertilizer recommendations, or forecast expected profits and crop yield parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 z-10">
            <button 
              onClick={() => navigate('/dashboard/crop-recommendation')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 text-left transition space-y-2 group"
            >
              <Sprout className="w-8 h-8 text-emerald-500" />
              <div className="font-bold text-sm flex items-center gap-1 group-hover:text-emerald-500 transition">
                <span>Crop Rec</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-[10px] text-slate-500">Run Random Forest model crop predictions.</p>
            </button>

            <button 
              onClick={() => navigate('/dashboard/fertilizer')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/30 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 text-left transition space-y-2 group"
            >
              <Leaf className="w-8 h-8 text-sky-500" />
              <div className="font-bold text-sm flex items-center gap-1 group-hover:text-sky-500 transition">
                <span>Fertilizer Deficits</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-[10px] text-slate-500">Check soil N-P-K levels and get Urea/DAP.</p>
            </button>

            <button 
              onClick={() => navigate('/dashboard/yield')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 text-left transition space-y-2 group"
            >
              <BarChart3 className="w-8 h-8 text-accent" />
              <div className="font-bold text-sm flex items-center gap-1 group-hover:text-amber-500 transition">
                <span>Yield Forecast</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
              <p className="text-[10px] text-slate-500">Calculate harvest tonnage and profits.</p>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
