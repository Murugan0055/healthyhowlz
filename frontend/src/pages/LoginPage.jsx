import React, { useState } from 'react';
import { Lock, Phone, ShieldCheck, AlertCircle, ArrowRight, UserCheck, Dumbbell, Building2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!identifier.trim() || !secret.trim()) {
      setError('Please provide your Mobile Number / Email and Security PIN / Password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(identifier.trim(), secret.trim());
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your phone number / email and PIN / password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 items-center justify-center shadow-xl shadow-emerald-500/25 mb-1 ring-1 ring-white/20">
            <span className="text-2xl">🐺</span>
          </div>
          <h1 className="text-3xl font-black brand-font tracking-tight text-white">
            HEALTHYHOWLZ
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Enterprise Fitness OS
            </span>
            <span className="text-xs text-slate-400">Single Sign-On Authentication</span>
          </div>
        </div>

        {/* Unified Login Box */}
        <div className="p-7 sm:p-8 rounded-3xl bg-[#111827]/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/80 space-y-5">
          
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Sign In to Your Workspace
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically routes by your assigned role
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Mobile / Email / Member ID */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">
                Mobile Number, Email or Member ID <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="e.g. 9840123456 or admin@healthyhowlz.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-white text-xs placeholder-slate-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password or PIN */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">
                Password or Security PIN <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter 4-digit PIN or password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-white text-xs placeholder-slate-500 transition-all font-mono tracking-wider"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <span>{loading ? 'Authenticating & Routing...' : 'Sign In to HealthyHowlz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Access Roles Reference Drawer */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowRoleInfo(!showRoleInfo)}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-300 text-[11px] py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                Supported Roles & Workspaces
              </span>
              {showRoleInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRoleInfo && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-2 text-slate-300 animate-fadeIn">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Role Type</span>
                  <span>Destination Workspace</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-semibold">🐺 HealthyHowlz Admin</span>
                  <span className="text-slate-400 font-mono text-[10px]">Platform HQ Command</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 font-semibold">🏢 Gym Owner & Manager</span>
                  <span className="text-slate-400 font-mono text-[10px]">Multi-Gym OS & Finance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-300 font-semibold">🏋️ Floor Coach / Trainer</span>
                  <span className="text-slate-400 font-mono text-[10px]">Coach OS & Client Roster</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 font-semibold">📱 Gym Client Member</span>
                  <span className="text-slate-400 font-mono text-[10px]">Member App & Dynamic QR</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Production Footer */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-500">
            HealthyHowlz SaaS Platform • Protected by TLS 1.3 & Role-Based Access Control
          </p>
          <p className="text-[10px] text-slate-600">
            © 2026 HealthyHowlz Operating System. All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
