import React, { useState } from 'react';
import { useTrainerAuth, DEMO_TRAINERS } from './TrainerAuthContext';

export default function TrainerLogin({ onSwitchToAdmin, onSwitchToClient }) {
  const { login, switchTrainer } = useTrainerAuth();
  const [phone, setPhone] = useState('9840123458');
  const [securityPin, setSecurityPin] = useState('5555');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(phone, securityPin);
    } catch (err) {
      setError(err.message || 'Login failed. Please check phone and PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = (t) => {
    setPhone(t.phone);
    setSecurityPin(t.pin);
    switchTrainer(t);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#0e1626]/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20 mb-3">
            🏋️
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Trainer & Floor Coach Portal
          </h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mt-1">
            ELITE FITNESS CLUB • GUDIYATHAM
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Client floor check-ins, anti-fraud PT verification & commission tracking
          </p>
        </div>

        {/* 1-Tap Quick Demo Trainer Switcher */}
        <div className="mb-6 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            1-Tap Quick Demo Trainer Login
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_TRAINERS.map((t) => (
              <button
                key={t.id}
                type="button"
                data-demo-trainer={t.id}
                onClick={() => handleSelectDemo(t)}
                className="text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-950/50 hover:border-emerald-500/50 border border-slate-700/60 transition-all group"
              >
                <div className="font-bold text-xs text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                  <span>{t.name.split(' ')[0]} {t.name.split(' ')[1]}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">PIN: {t.pin}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {t.tagline}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trainer Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-medium">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9840123458"
                className="w-full pl-12 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Security PIN (4-Digit)</span>
              <span className="text-[10px] text-slate-400 font-normal">Murugan: 5555 | Dinesh: 7777</span>
            </label>
            <input
              type="password"
              required
              maxLength={6}
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all tracking-widest font-mono text-center text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating Coach...' : 'Enter Trainer Floor Hub →'}
          </button>
        </form>

        {/* Portal Switching Navigation */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            🏢 <span>Admin & Owner Portal</span>
          </button>
          <span className="hidden sm:inline text-slate-700">•</span>
          <button
            type="button"
            onClick={onSwitchToClient}
            className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            📱 <span>Client Member App</span>
          </button>
        </div>

      </div>
    </div>
  );
}
