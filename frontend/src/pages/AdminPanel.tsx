import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Settings, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Database,
  BarChart3
} from 'lucide-react';
import API from '../services/api';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'crops'>('users');
  const [loading, setLoading] = useState(true);

  // States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [cropsList, setCropsList] = useState<any[]>([]);
  
  // Crop CRUD modal states
  const [cropFormOpen, setCropFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<any | null>(null);
  const [cropData, setCropData] = useState({
    name: '',
    scientificName: '',
    description: '',
    suitableSeason: '',
    waterRequirement: 'Medium',
    expectedYield: '',
    marketDemand: 'Medium',
    profitability: '50',
    growingTips: '',
    imageUrl: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/api/admin/users');
      setUsersList(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/api/admin/analytics');
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const fetchCrops = async () => {
    try {
      const res = await API.get('/api/admin/crops');
      setCropsList(res.data.crops || []);
    } catch (err) {
      console.error('Failed to load crops:', err);
    }
  };

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') await fetchUsers();
      if (activeTab === 'analytics') await fetchAnalytics();
      if (activeTab === 'crops') await fetchCrops();
    } catch (err: any) {
      setError('Failed to fetch administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, [activeTab]);

  // Handle user role modifications
  const handleRoleToggle = async (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await API.put(`/api/admin/users/${user._id}`, { role: newRole });
      fetchUsers();
      setSuccess('User role updated successfully.');
    } catch (err) {
      setError('Failed to update user role.');
    }
  };

  const handleUserDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await API.delete(`/api/admin/users/${id}`);
      fetchUsers();
      setSuccess('User account deleted.');
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  // Handle Crop CRUD submissions
  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formattedTips = cropData.growingTips
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      ...cropData,
      profitability: Number(cropData.profitability),
      growingTips: formattedTips
    };

    try {
      if (editingCrop) {
        await API.put(`/api/admin/crops/${editingCrop._id}`, payload);
        setSuccess('Crop metadata updated successfully.');
      } else {
        await API.post('/api/admin/crops', payload);
        setSuccess('New crop catalog entry created.');
      }
      setCropFormOpen(false);
      setEditingCrop(null);
      fetchCrops();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit crop catalog data.');
    }
  };

  const handleCropDelete = async (id: string) => {
    if (!window.confirm('Delete this crop catalog entry?')) return;
    try {
      await API.delete(`/api/admin/crops/${id}`);
      fetchCrops();
      setSuccess('Crop removed from catalog database.');
    } catch (err) {
      setError('Failed to delete crop catalog entry.');
    }
  };

  const openEditCrop = (crop: any) => {
    setEditingCrop(crop);
    setCropData({
      name: crop.name,
      scientificName: crop.scientificName,
      description: crop.description,
      suitableSeason: crop.suitableSeason,
      waterRequirement: crop.waterRequirement,
      expectedYield: crop.expectedYield,
      marketDemand: crop.marketDemand,
      profitability: String(crop.profitability),
      growingTips: crop.growingTips.join('\n'),
      imageUrl: crop.imageUrl
    });
    setCropFormOpen(true);
  };

  const openCreateCrop = () => {
    setEditingCrop(null);
    setCropData({
      name: '',
      scientificName: '',
      description: '',
      suitableSeason: '',
      waterRequirement: 'Medium',
      expectedYield: '',
      marketDemand: 'Medium',
      profitability: '50',
      growingTips: '',
      imageUrl: ''
    });
    setCropFormOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8 animate-fadeIn">
      
      {/* TABS HEADER */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'users' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500'}`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>User Management</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'analytics' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500'}`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span>System Analytics</span>
        </button>
        <button 
          onClick={() => setActiveTab('crops')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${activeTab === 'crops' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500'}`}
        >
          <Database className="w-4.5 h-4.5" />
          <span>Crop Catalog CRUD</span>
        </button>
      </div>

      {/* alerts */}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-250/20 text-red-650 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* CORE TAB VIEWS */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {/* USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/50 dark:bg-slate-900/40 text-xs font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-4">Farmer / Admin</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Region</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {usersList.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/20">
                        <td className="p-4 font-bold flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 bg-cover bg-center overflow-hidden" 
                               style={{ backgroundImage: `url(${u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'})` }}>
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="p-4 text-slate-500">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-red-100 dark:bg-red-950/40 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{u.location || 'N/A'}</td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => handleRoleToggle(u)}
                            className="px-2.5 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 text-xs font-semibold hover:text-emerald-500 transition"
                          >
                            Toggle Role
                          </button>
                          <button 
                            onClick={() => handleUserDelete(u._id)}
                            className="w-8 h-8 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/10 text-red-500 inline-flex items-center justify-center transition"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYSTEM METRICS ANALYTICS */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-bold block mb-1">TOTAL USERS</span>
                  <div className="text-3xl font-extrabold text-gradient">{analyticsData.metrics.totalUsers}</div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-bold block mb-1">ACTIVE FARMERS</span>
                  <div className="text-3xl font-extrabold text-sky-500">{analyticsData.metrics.activeUsers}</div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-bold block mb-1">SYSTEM RUNS</span>
                  <div className="text-3xl font-extrabold text-amber-500">{analyticsData.metrics.totalPredictions}</div>
                </div>
                <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-bold block mb-1">TOP RECOMMENDATION</span>
                  <div className="text-2xl font-extrabold text-emerald-500">{analyticsData.metrics.mostRecommendedCrop}</div>
                </div>
              </div>
              
              <div className="p-8 rounded-3xl glass-card text-center text-slate-500 font-semibold text-xs border border-slate-200 dark:border-slate-800">
                <p>System metrics logs successfully synchronized with MongoDB database. All active diagnostics charts are rendered on the Dashboard panel.</p>
              </div>
            </div>
          )}

          {/* CROP CATALOG CRUD */}
          {activeTab === 'crops' && (
            <div className="space-y-6">
              
              {/* Form Add Button */}
              <div className="flex justify-between items-center print:hidden">
                <h3 className="font-bold text-lg">Crop Variety Catalog</h3>
                <button 
                  onClick={openCreateCrop}
                  className="px-4 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 transition"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                  <span>Add New Crop</span>
                </button>
              </div>

              {/* Crop Catalog Form (Modal mockup shown in layout context) */}
              {cropFormOpen && (
                <div className="glass-card p-6 rounded-3xl border-2 border-emerald-500/30 space-y-6">
                  <h4 className="font-extrabold text-lg">{editingCrop ? 'Edit Crop Details' : 'Add New Crop Metadata'}</h4>
                  <form onSubmit={handleCropSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Crop Name</label>
                      <input 
                        type="text" 
                        value={cropData.name}
                        onChange={(e) => setCropData({ ...cropData, name: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input"
                        placeholder="e.g. Rice"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Scientific Name</label>
                      <input 
                        type="text" 
                        value={cropData.scientificName}
                        onChange={(e) => setCropData({ ...cropData, scientificName: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input"
                        placeholder="e.g. Oryza sativa"
                        required
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-400">Description</label>
                      <input 
                        type="text" 
                        value={cropData.description}
                        onChange={(e) => setCropData({ ...cropData, description: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input"
                        placeholder="Brief agronomic summary..."
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Suitable Season</label>
                      <input 
                        type="text" 
                        value={cropData.suitableSeason}
                        onChange={(e) => setCropData({ ...cropData, suitableSeason: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input"
                        placeholder="e.g. Kharif (Rainy Season)"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Water Requirement</label>
                      <select 
                        value={cropData.waterRequirement}
                        onChange={(e) => setCropData({ ...cropData, waterRequirement: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input dark:bg-slate-900"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Expected Yield Rate</label>
                      <input 
                        type="text" 
                        value={cropData.expectedYield}
                        onChange={(e) => setCropData({ ...cropData, expectedYield: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input"
                        placeholder="e.g. 4.5 tons/hectare"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Market Demand Index</label>
                      <select 
                        value={cropData.marketDemand}
                        onChange={(e) => setCropData({ ...cropData, marketDemand: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input dark:bg-slate-900"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Profitability Percentage (0-100)</label>
                      <input 
                        type="number" 
                        value={cropData.profitability}
                        onChange={(e) => setCropData({ ...cropData, profitability: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Unsplash Cover Image Link</label>
                      <input 
                        type="text" 
                        value={cropData.imageUrl}
                        onChange={(e) => setCropData({ ...cropData, imageUrl: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg glass-input"
                        placeholder="https://images.unsplash.com/..."
                        required
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-400">Growing Advice / Tips (One tip per line)</label>
                      <textarea 
                        value={cropData.growingTips}
                        onChange={(e) => setCropData({ ...cropData, growingTips: e.target.value })}
                        className="w-full h-24 p-3 rounded-lg glass-input resize-none focus:outline-none"
                        placeholder="Provide clear step-by-step agricultural instructions..."
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2 mt-4 sm:col-span-2">
                      <button type="submit" className="px-5 h-10 rounded-lg bg-emerald-500 text-white font-bold transition">Save Catalog Crop</button>
                      <button type="button" onClick={() => setCropFormOpen(false)} className="px-5 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 font-bold transition">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Crops Catalog grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cropsList.map(crop => (
                  <div key={crop._id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/20 transition group">
                    <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${crop.imageUrl})` }}></div>
                    <div className="p-5 space-y-4 text-left">
                      <div>
                        <h4 className="font-extrabold text-base text-emerald-500 capitalize">{crop.name}</h4>
                        <span className="text-[10px] text-slate-400 italic font-medium">{crop.scientificName}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed truncate">{crop.description}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Yield: {crop.expectedYield.split(' ')[0]} tons</span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openEditCrop(crop)}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-500 transition"
                            title="Edit Crop Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleCropDelete(crop._id)}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition"
                            title="Delete Crop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
