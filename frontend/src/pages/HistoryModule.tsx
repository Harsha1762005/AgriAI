import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Printer, 
  ArrowUpDown, 
  Database, 
  Sprout, 
  Leaf, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import API from '../services/api';

export const HistoryModule: React.FC = () => {
  // Query parameters
  const [search, setSearch] = useState('');
  const [type, setType] = useState(''); // '' (All), 'crop', 'fertilizer', 'yield'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  
  // Results state
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (type) queryParams.push(`type=${type}`);
      queryParams.push(`sortOrder=${sortOrder}`);
      queryParams.push(`page=${page}`);
      queryParams.push('limit=6');

      const url = `/api/history?${queryParams.join('&')}`;
      const res = await API.get(url);
      
      if (res.data && res.data.success) {
        setHistoryItems(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load history logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [type, sortOrder, page]); // Triggers when page, filter, or sorting toggles

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prediction log?')) return;
    try {
      setDeletingId(id);
      await API.delete(`/api/history/${id}`);
      // Reload history
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete history record:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Direct link trigger
    window.open(`${baseUrl}/api/history/export/csv?token=${token}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const getRecordIcon = (itemType: string) => {
    if (itemType === 'crop') return <Sprout className="w-5 h-5 text-emerald-500" />;
    if (itemType === 'fertilizer') return <Leaf className="w-5 h-5 text-sky-500" />;
    return <BarChart3 className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8 animate-fadeIn print:bg-white print:p-0">
      
      {/* Control panel header (hidden during printing) */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="space-y-1">
          <h3 className="font-bold text-lg font-sans">Diagnostic Archives</h3>
          <p className="text-xs text-slate-500">Query and export your historical agricultural recommendation logs</p>
        </div>

        <div className="flex space-x-3 w-full md:w-auto">
          {/* CSV Export */}
          <button 
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-xl border border-slate-250 dark:border-slate-800 hover:border-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition bg-white/40 dark:bg-slate-900/40"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export Excel</span>
          </button>
          
          {/* PDF Print */}
          <button 
            onClick={handlePrint}
            className="h-10 px-4 rounded-xl border border-slate-250 dark:border-slate-800 hover:border-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition bg-white/40 dark:bg-slate-900/40"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (hidden during printing) */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print:hidden">
        
        {/* Filters Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start">
          <button 
            onClick={() => { setType(''); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${type === '' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            All Logs
          </button>
          <button 
            onClick={() => { setType('crop'); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${type === 'crop' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Crops
          </button>
          <button 
            onClick={() => { setType('fertilizer'); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${type === 'fertilizer' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Fertilizer
          </button>
          <button 
            onClick={() => { setType('yield'); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${type === 'yield' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500'}`}
          >
            Yields
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by crop name..."
              className="w-full h-10 pl-10 pr-4 rounded-xl glass-input text-xs focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition active:scale-95"
          >
            Search
          </button>
        </form>

        {/* Sort Order */}
        <button 
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 flex items-center justify-center shrink-0"
          title="Toggle Sort Order"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : historyItems.length > 0 ? (
        <div className="space-y-4">
          
          {/* Logs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {historyItems.map((item) => (
              <div 
                key={item._id}
                className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/20 transition group text-left relative overflow-hidden"
              >
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getRecordIcon(item.type)}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{item.type} Analysis</span>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                        {item.type === 'crop' && item.crop}
                        {item.type === 'yield' && `${item.yieldCropType} Forecast`}
                        {item.type === 'fertilizer' && 'Fertilizer Advisory Run'}
                      </h4>
                    </div>
                  </div>
                  
                  {/* Delete trigger */}
                  <button 
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition shrink-0 print:hidden"
                  >
                    {deletingId === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Soil/Weather Metrics detail */}
                {item.type === 'crop' && (
                  <div className="grid grid-cols-4 gap-2 py-2 text-[10px] bg-slate-100/50 dark:bg-slate-900/40 rounded-xl px-3 border border-slate-150/40 dark:border-slate-800/40 font-semibold text-slate-600 dark:text-slate-400">
                    <span>N: {item.nitrogen}</span>
                    <span>P: {item.phosphorus}</span>
                    <span>K: {item.potassium}</span>
                    <span>pH: {item.ph}</span>
                    <span className="col-span-2">Rain: {item.rainfall}mm</span>
                    <span className="col-span-2">Temp: {item.temperature}°C</span>
                  </div>
                )}

                {item.type === 'yield' && (
                  <div className="grid grid-cols-2 gap-2 py-2 text-[10px] bg-slate-100/50 dark:bg-slate-900/40 rounded-xl px-3 border border-slate-150/40 dark:border-slate-800/40 font-semibold text-slate-600 dark:text-slate-400">
                    <span>Area: {item.yieldArea} ha</span>
                    <span>Soil Quality: {item.yieldSoilQuality}</span>
                    <span>Estimated Output: {item.yieldEstimatedOutput} Tons</span>
                    <span>Expected Profit: ${item.yieldProfit.toLocaleString()}</span>
                  </div>
                )}

                {item.type === 'fertilizer' && (
                  <div className="space-y-1.5 py-1 text-[10px] text-slate-600 dark:text-slate-400">
                    <div className="font-bold text-slate-400">NPK levels tested: N:{item.nitrogen} P:{item.phosphorus} K:{item.potassium}</div>
                    <div className="flex flex-wrap gap-1">
                      {item.fertilizerRecommendations?.map((rec: any, index: number) => (
                        <span key={index} className={`px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold`}>
                          {rec.nutrient}: {rec.recommendedFertilizer.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer timestamp & status */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <span>Logged: {new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.type === 'crop' && (
                    <span className="font-bold text-sky-500">Confidence: {item.confidence}%</span>
                  )}
                  {item.type === 'yield' && (
                    <span className="font-bold text-emerald-500">Revenue: ${item.yieldRevenue.toLocaleString()}</span>
                  )}
                  {item.type === 'fertilizer' && (
                    <span className="font-bold text-emerald-500">Analyzed</span>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Pagination Controls (hidden during printing) */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-3 pt-6 print:hidden">
              <button 
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {page} of {pagination.pages}
              </span>
              <button 
                onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={page === pagination.pages}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500 disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      ) : (
        // Empty State (hidden during printing)
        <div className="glass-card p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto print:hidden">
          <Database className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="font-bold text-lg">Empty Archives</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            You haven't run any diagnostics calculations yet. Navigate to any calculator sidebar module to generate crop yields or suggestions.
          </p>
        </div>
      )}

    </div>
  );
};
