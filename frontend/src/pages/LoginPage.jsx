import React, { useState } from 'react';
import { Dumbbell, Lock, Phone, KeyRound, ShieldCheck, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onSwitchToClient, onSwitchToTrainer }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('9999999999');
  const [secret, setSecret] = useState('9999');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!identifier || !secret) {
      setError('Please provide your Phone/Email and Password or PIN');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(identifier, secret);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (phoneOrEmail, pinOrPw) => {
    setIdentifier(phoneOrEmail);
    setSecret(pinOrPw);
    setLoading(true);
    setError('');
    try {
      await login(phoneOrEmail, pinOrPw);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 items-center justify-center shadow-xl shadow-emerald-500/20 mb-2">
            <Dumbbell className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-black brand-font tracking-tight text-white">
            ELITE FITNESS CENTER
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Gudiyatham
            </span>
            <span className="text-xs text-slate-400">Admin & Owner Operating Portal</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="p-7 rounded-3xl bg-[#111827]/90 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-5">
          
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Staff & Officer Sign-In
            </h2>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Phone or Email */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Registered Mobile Phone or Email *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9840123456 or owner@elitegym.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-xs placeholder-slate-600"
                />
              </div>
            </div>

            {/* Password or PIN */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Password or 4-Digit Security PIN *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Password or 4-digit PIN"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-xs placeholder-slate-600"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Quick Demo Login Preset - Super Admin Only */}
          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick 1-Tap Sign-In Preset:
            </p>

            <button
              type="button"
              onClick={() => handleQuickLogin('9999999999', '9999')}
              className="w-full p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-purple-200">Super Admin</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-300 font-semibold uppercase">Root Master</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Phone: 9999999999 • PIN: 9999</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Fill & Enter →
              </span>
            </button>
          </div>

          {/* Switch to Client or Trainer Portal */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {onSwitchToTrainer && (
              <button
                type="button"
                onClick={onSwitchToTrainer}
                className="w-full py-2.5 px-3 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-bold transition flex items-center justify-center gap-2 active:scale-98"
              >
                <span>🏋️ Switch to Trainer & Floor Coach App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {onSwitchToClient && (
              <button
                type="button"
                onClick={onSwitchToClient}
                className="w-full py-2.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2 active:scale-98"
              >
                <span>📱 Switch to Client / Member Mobile App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500">
          Role-based security: Super Admin • Owner • Manager • Admin Operations
        </p>

      </div>
    </div>
  );
}

