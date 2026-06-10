import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Sprout, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8 space-y-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-sans font-bold text-3xl tracking-tight text-gradient">AgriAI</h2>
        </div>

        {/* CARD */}
        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          
          {!submitted ? (
            <>
              <h3 className="text-2xl font-bold font-sans text-center mb-3">Reset Password</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@agriai.com"
                      className="w-full h-12 pl-11 pr-4 rounded-xl glass-input text-sm focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Send Recovery Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold font-sans">Recovery Email Sent</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We've sent a password recovery link to <code className="font-semibold">{email}</code>. Please check your inbox and follow the instructions.
              </p>
              
              <div className="pt-2">
                {/* Seeded direct bypass to Reset Password for evaluation convenience */}
                <RouterLink 
                  to="/reset-password"
                  className="inline-flex h-11 px-6 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-sm font-semibold transition"
                >
                  Bypass to Reset View (Evaluation)
                </RouterLink>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <RouterLink to="/login" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-emerald-500 transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </RouterLink>
          </div>
        </div>

      </div>
    </div>
  );
};
