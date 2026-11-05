import React, { useState } from 'react';
import { 
  Dumbbell, 
  Smartphone, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';
import { useMemberAuth, DEMO_MEMBERS } from './MemberAuthContext';

export default function ClientLogin({ onSwitchToAdmin }) {
  const { loginWithIdentifier, switchDemoMember, isLoading, error } = useMemberAuth();
  const [identifier, setIdentifier] = useState('9876543210');
  const [pin, setPin] = useState('3210');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await loginWithIdentifier(identifier, pin);
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  const handleSelectDemo = async (demo) => {
    setIdentifier(demo.phone);
    setPin(demo.pin);
    setLocalError(null);
    try {
      await switchDemoMember(demo);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lights */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 space-y-5 animate-fadeIn">
        {/* App Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 mb-1">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black tracking-wide text-white brand-font">
            ELITE FITNESS CENTER
          </h1>
          <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
            Client Member Mobile Portal
          </p>
          <p className="text-[11px] text-slate-400">Gudiyatham Premier Facility • Zero Hardware Access</p>
        </div>

        {/* Login Box */}
        <div className="bg-[#121927]/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" /> Member Login
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Single-Device Locked
            </span>
          </div>

          {(error || localError) && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                Mobile Number or Member ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or EG-1001"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                4-Digit Security PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Default: last 4 digits of phone"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 tracking-widest text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition disabled:opacity-50"
            >
              {isLoading ? (
                'Connecting to Member Account...'
              ) : (
                <>
                  <span>Access Dynamic Pass & Workouts</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Tap Demo Member Selector */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1-Tap Demo Member Accounts (Testing)
            </span>
            <div className="space-y-1.5">
              {DEMO_MEMBERS.map((demo) => (
                <button
                  key={demo.memberCode}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{demo.name}</span>
                    <span className="text-[10px] text-slate-400">{demo.memberCode} • {demo.plan}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    PIN: {demo.pin}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Switch to Admin Engine Portal */}
        {onSwitchToAdmin && (
          <div className="text-center">
            <button
              onClick={onSwitchToAdmin}
              className="text-xs text-slate-400 hover:text-emerald-400 transition font-medium underline underline-offset-4"
            >
              ← Switch to Reception Desk & Admin Operating Engine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

