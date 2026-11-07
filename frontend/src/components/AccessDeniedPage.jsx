import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Building2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDeniedPage({
  title = 'Access Restricted',
  reason = 'You do not have permission to access this facility or resource.',
  recommendedPath,
  recommendedLabel,
  onNavigate
}) {
  const { user, logout } = useAuth();

  const handleGoRecommended = () => {
    if (onNavigate && recommendedPath) {
      onNavigate(recommendedPath);
    } else if (recommendedPath) {
      window.history.pushState({}, '', recommendedPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSignOut = () => {
    logout();
    if (onNavigate) {
      onNavigate('/login');
    } else {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111827]/90 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl relative z-10 text-center space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Multi-Tenant Security Isolation
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {reason}
          </p>
        </div>

        {/* Authenticated Identity Pill */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Currently Signed In As:
            </span>
            <div className="flex items-center justify-between text-white font-semibold">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {user.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-bold uppercase">
                {user.role}
              </span>
            </div>
            {user.gym_name && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                <Building2 className="w-3 h-3 text-slate-500" />
                {user.gym_name} ({user.gym_city})
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {recommendedPath && (
            <button
              onClick={handleGoRecommended}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
            >
              <span>{recommendedLabel || 'Go to My Authorized Portal'}</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-800 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>

      </div>
    </div>
  );
}

