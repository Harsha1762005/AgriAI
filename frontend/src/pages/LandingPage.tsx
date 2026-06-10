import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  Leaf, 
  BarChart3, 
  CloudSun, 
  LayoutDashboard, 
  MessageSquare, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Users, 
  TrendingUp, 
  Database,
  Quote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Features list
  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-emerald-500" />,
      title: "Crop Recommendation",
      desc: "Get personalized crop recommendations based on soil N-P-K content, temperature, humidity, and rainfall."
    },
    {
      icon: <Leaf className="w-8 h-8 text-emerald-500" />,
      title: "Fertilizer Suggestion",
      desc: "Analyze soil nutrient deficiencies and receive precise fertilizer recommendations (Urea, DAP, Potash)."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-emerald-500" />,
      title: "Yield Prediction",
      desc: "Predict estimated yield output, expected revenues, and net profits based on area size and environmental conditions."
    },
    {
      icon: <CloudSun className="w-8 h-8 text-emerald-500" />,
      title: "Weather Analytics",
      desc: "Track real-time microclimate weather metrics, UV Index, soil moisture levels, and 5-day crop forecasts."
    },
    {
      icon: <LayoutDashboard className="w-8 h-8 text-emerald-500" />,
      title: "Smart Dashboard",
      desc: "View predictive analytics, nutrient breakdown radar charts, and crop distribution analytics in one place."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-emerald-500" />,
      title: "AI Chat Assistant",
      desc: "Ask our intelligent agricultural assistant chatbot for instant advice on crops, diseases, and fertilizers."
    }
  ];

  // Process timeline
  const steps = [
    { num: "01", title: "Soil Input", desc: "Enter your soil parameters (N, P, K, pH) and location-specific weather variables." },
    { num: "02", title: "AI Analysis", desc: "Our Random Forest Classifier and agronomic intelligence analyze your conditions." },
    { num: "03", title: "Smart Reports", desc: "Receive highly detailed crop growing guidelines, water requirements, and market insights." },
    { num: "04", title: "Maximize Profits", desc: "Increase productivity by applying recommendations and optimizing farm yields." }
  ];

  // Stats
  const stats = [
    { value: "10,000+", label: "Active Farmers", icon: <Users className="w-6 h-6 text-sky-500" /> },
    { value: "95%+", label: "Prediction Accuracy", icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" /> },
    { value: "22+", label: "Crop Varieties", icon: <Sprout className="w-6 h-6 text-amber-500" /> },
    { value: "100k+", label: "Predictions Made", icon: <Database className="w-6 h-6 text-purple-500" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-x-hidden">
      
      {/* BACKGROUND PARTICLES EFFECT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl filter animate-pulse"></div>
        <div className="absolute top-2/3 right-1/10 w-96 h-96 bg-sky-400 rounded-full blur-3xl filter animate-pulse delay-2000"></div>
      </div>

      {/* HEADER NAVBAR */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-sans font-bold text-2xl tracking-tight text-gradient">AgriAI</span>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/login')} 
            className="text-slate-600 dark:text-slate-300 font-medium hover:text-emerald-500 dark:hover:text-emerald-400 transition"
          >
            Login
          </button>
          <button 
            onClick={handleGetStarted}
            className="px-5 h-11 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 active:scale-95 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-20 md:pb-32 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 flex flex-col items-start text-left space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50"
          >
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Agricultural Intelligence 2.0</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight font-sans"
          >
            AI-Powered Smart Farming for the <span className="text-gradient">Future</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed"
          >
            Predict the best crops, maximize yields, and make data-driven farming decisions using Artificial Intelligence.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-row space-x-4 w-full sm:w-auto"
          >
            <button 
              onClick={handleGetStarted}
              className="flex items-center justify-center space-x-2 px-6 h-13 rounded-2xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <a 
              href="https://www.youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-6 h-13 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium transition"
            >
              <Play className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              <span>Watch Demo</span>
            </a>
          </motion.div>
        </div>

        {/* HERO GRAPHIC ANIMATED */}
        <div className="md:w-1/2 mt-16 md:mt-0 flex justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl glass-card flex items-center justify-center border-emerald-500/20"
          >
            {/* Spinning decorative background */}
            <div className="absolute w-72 h-72 bg-gradient-to-tr from-emerald-400 to-sky-400 rounded-full opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
              <Sprout className="w-24 h-24 text-emerald-500 animate-bounce" />
              <div className="text-center">
                <div className="font-bold text-xl">Soil Analyzer Active</div>
                <div className="text-sm text-slate-500">Processing N-P-K datasets...</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-extrabold font-sans text-gradient">{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold font-sans">Full-Suite Farm Optimization</h2>
          <p className="text-slate-500">AgriAI leverages advanced machine learning to provide comprehensive diagnostics and actionable insights.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-8 rounded-2xl glass-card flex flex-col items-start space-y-4 cursor-pointer text-left group border border-slate-200 dark:border-slate-800"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center transition-all group-hover:bg-emerald-500 group-hover:text-white">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold font-sans group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition">{feat.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-24 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-sans">The Path to Higher Yields</h2>
            <p className="text-slate-500">Our streamlined pipeline connects raw agronomic conditions to intelligent recommendations in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-start space-y-4 text-left p-6 relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
                <span className="text-4xl font-extrabold text-emerald-500/30 font-sans">{step.num}</span>
                <h3 className="text-lg font-bold font-sans">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold font-sans">Trusted by Agri-Innovators</h2>
          <p className="text-slate-500">See how farmers and agricultural businesses use AgriAI to optimize harvests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl glass-card text-left space-y-6 relative">
            <Quote className="w-10 h-10 text-emerald-500/25 absolute top-6 right-6" />
            <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "AgriAI has completely transformed how we manage crop rotation. The Random Forest recommendations have reached over 98% accuracy on our soils, increasing our overall crop profits by 22% in just one season!"
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80')" }}></div>
              <div>
                <h4 className="font-bold">Marcus Thorne</h4>
                <p className="text-xs text-slate-500 font-medium">Head of Farm Operations, GreenFields Corp</p>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-2xl glass-card text-left space-y-6 relative">
            <Quote className="w-10 h-10 text-emerald-500/25 absolute top-6 right-6" />
            <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "The Fertilizer Advisor module is gold. Previously we would dump nitrogen blindly. With AgriAI we diagnosed a severe phosphorus deficit, got Urea/DAP measurements, and saved thousands in wasteful chemicals."
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80')" }}></div>
              <div>
                <h4 className="font-bold">Elena Rostova</h4>
                <p className="text-xs text-slate-500 font-medium">Independent Fruit Cultivator</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-sans font-bold text-xl text-white">AgriAI</span>
            </div>
            <p className="text-sm">AI-Powered crop suitability analysis and diagnostic farm analytics platform.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Modules</h4>
            <ul className="space-y-2 text-sm">
              <li>Crop Recommendation</li>
              <li>Fertilizer Deficits</li>
              <li>Yield Forecasting</li>
              <li>Weather Dashboard</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>About Operations</li>
              <li>Startup Blog</li>
              <li>Security Standards</li>
              <li>Contact Support</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Launch</h4>
            <p className="text-sm mb-4">Ready to start smart farming? Access the analytics dashboard today.</p>
            <button 
              onClick={handleGetStarted}
              className="w-full h-11 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
            >
              Get Started
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-xs text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} AgriAI Inc. All rights reserved. Built for modern farm diagnostics.</span>
          <div className="flex space-x-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>SaaS SLA</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
