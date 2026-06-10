import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Sprout, 
  LayoutDashboard, 
  Leaf, 
  BarChart3, 
  History, 
  CloudSun, 
  MessageSquareCode, 
  UserCircle, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Crop Recommendation', path: '/dashboard/crop-recommendation', icon: <Sprout className="w-5 h-5" /> },
    { name: 'Fertilizer Deficits', path: '/dashboard/fertilizer', icon: <Leaf className="w-5 h-5" /> },
    { name: 'Yield Prediction', path: '/dashboard/yield', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Prediction History', path: '/dashboard/history', icon: <History className="w-5 h-5" /> },
    { name: 'Weather Monitor', path: '/dashboard/weather', icon: <CloudSun className="w-5 h-5" /> },
    { name: 'Agricultural Chatbot', path: '/dashboard/chatbot', icon: <MessageSquareCode className="w-5 h-5" /> },
    { name: 'Profile Settings', path: '/dashboard/profile', icon: <UserCircle className="w-5 h-5" /> }
  ];

  // Insert Admin panel link if role matches
  if (user?.role === 'admin') {
    navigationItems.push({ 
      name: 'Admin Control', 
      path: '/dashboard/admin', 
      icon: <ShieldAlert className="w-5 h-5 text-red-500 dark:text-red-400" /> 
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      
      {/* MOBILE SIDEBAR TRIGGER */}
      <div className="md:hidden absolute top-4 left-4 z-40">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm text-slate-600 dark:text-slate-300"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/60 flex flex-col justify-between
        transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-gradient">AgriAI</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center space-x-3 transition-all
                    ${active 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile bottom item */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 bg-cover bg-center overflow-hidden border border-slate-200/50" 
                 style={{ backgroundImage: `url(${user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})` }}>
            </div>
            <div className="text-left overflow-hidden">
              <div className="font-bold text-sm truncate">{user?.name}</div>
              <div className="text-xs text-slate-500 truncate capitalize">{user?.role} Account</div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex justify-between items-center mt-2">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 h-10 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 text-xs font-bold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN BODY AREA */}
      <main className="flex-1 min-w-0 flex flex-col relative">
        {/* Header bar */}
        <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 flex items-center justify-between z-10">
          <h2 className="font-sans font-bold text-lg text-slate-800 dark:text-slate-200 ml-10 md:ml-0">
            {navigationItems.find(item => item.path === location.pathname)?.name || 'Farm Analytics'}
          </h2>
          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500">
            <span>Server: <span className="text-emerald-500">Healthy</span></span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Local Time: {new Date().toLocaleDateString()}</span>
          </div>
        </header>

        {/* View viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};
