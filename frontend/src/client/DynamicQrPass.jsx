import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  Smartphone, 
  RotateCw, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Award, 
  Dumbbell,
  Wifi,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useMemberAuth } from './MemberAuthContext';

export default function DynamicQrPass({ onTestScan }) {
  const { member, boundDevice } = useMemberAuth();
  const [passData, setPassData] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-IN', { hour12: true }));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch rotating pass token from backend
  const fetchPass = async () => {
    if (!member) return;
    try {
      setIsRefreshing(true);
      const res = await api.getClientPass(member.id);
      setPassData(res);
      setSecondsRemaining(res.remainingSeconds || 20);
      setIsRefreshing(false);
    } catch (err) {
      console.error('Failed to generate dynamic pass:', err);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh loop
  useEffect(() => {
    fetchPass();

    // 1-second countdown interval
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour12: true }));
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchPass();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [member?.id]);

  // Calculate SVG circular countdown ring progress (circumference = 2 * PI * r = 2 * 3.14159 * 26 ≈ 163.36)
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsRemaining / 20) * circumference;

  const handleSimulateScan = async () => {
    if (!passData?.token) return;
    try {
      const res = await api.scanQr(passData.token);
      setTestResult(res);
      if (onTestScan) onTestScan(res);
    } catch (err) {
      alert('Scan error: ' + err.message);
    }
  };

  return (
    <div className="space-y-3.5 pb-24 animate-fadeIn">
      {/* Anti-Pass Sharing & Bound Device Badge */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">
                {boundDevice?.device_name?.replace(' PWA', '').replace('• Mobile PWA', '• Mobile Device') || 'iPhone 15 Pro • Bound Hardware'}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Bound
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Single-device locked • Zero pass fraud</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Main Dynamic Holographic Pass Card */}
      <div className="relative rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-[#151f2e] via-[#101724] to-[#0d131e] border-2 border-emerald-500/30 shadow-2xl overflow-hidden text-center">
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header: Gym Brand */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-left">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-white tracking-wide brand-font">ELITE FITNESS CENTER</h2>
              <p className="text-[9px] text-emerald-400 font-medium">Gudiyatham Premier Facility</p>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {member?.status || 'Active Pass'}
          </span>
        </div>

        {/* Member Profile Snip */}
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <img
            src={member?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={member?.name}
            className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500/50 shadow-md"
          />
          <div className="text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              {member?.name || 'Vigneshwaran K'}
            </h3>
            <p className="text-[11px] font-mono text-emerald-400 font-semibold">{member?.member_code || 'EG-1001'}</p>
            <p className="text-[10px] text-slate-400">{member?.plan_name || 'Annual Elite All-Access'}</p>
          </div>
        </div>

        {/* QR Code Container with 20s Dynamic Rotating Ring */}
        <div className="relative inline-block my-1">
          {/* Animated Glowing Ring Wrapper */}
          <div className="p-2.5 bg-white rounded-2xl shadow-xl inline-block border-4 border-slate-800">
            {passData?.token ? (
              <QRCodeSVG
                value={passData.token}
                size={160}
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="w-[160px] h-[160px] flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-mono">
                Generating Pass...
              </div>
            )}
          </div>

          {/* Floating Live Badge */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-emerald-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-bold text-emerald-400 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>ROTATING PASS</span>
          </div>
        </div>

        {/* Circular Countdown Progress Ring & Timer */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-2.5 border-t border-slate-800/80">
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 -rotate-90">
              <circle
                cx="22"
                cy="22"
                r={20}
                stroke="#1e293b"
                strokeWidth="3.5"
                fill="none"
              />
              <circle
                cx="22"
                cy="22"
                r={20}
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={(2 * Math.PI * 20) - (secondsRemaining / 20) * (2 * Math.PI * 20)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-white font-mono">
              {secondsRemaining}s
            </span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expires in {secondsRemaining}s</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Scan at reception tablet on entry
            </p>
          </div>

          <button
            onClick={fetchPass}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
            title="Force Refresh Token"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Anti-Screenshot Watermark Warning Banner */}
        <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-left flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-300 leading-snug">
            <strong className="font-semibold text-amber-200">Anti-Screenshot Security:</strong> Screenshots or shared photos are rejected at the front-desk scanner. Token rotates every 20s.
          </p>
        </div>
      </div>

      {/* Instant Action: Test Scan Verification Button */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
        <h4 className="text-xs font-bold text-slate-300 mb-1">Reception Check-In Simulation</h4>
        <p className="text-[11px] text-slate-400 mb-3">
          Simulate presenting this 20s pass to the front desk tablet scanner.
        </p>
        <button
          onClick={handleSimulateScan}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-98"
        >
          <Sparkles className="w-4 h-4" />
          Test Check-In Scan on Front-Desk Kiosk
        </button>

        {/* Scan HUD feedback banner */}
        {testResult && (
          <div className={`mt-3 p-3 rounded-xl border text-left text-xs transition animate-fadeIn ${
            testResult.status === 'granted'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : testResult.status === 're_entry'
              ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Kiosk Status: {testResult.message}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
              <span>Points Credited: <strong className="text-white">+{testResult.points_awarded || 0} pts</strong></span>
              <span>New Balance: <strong className="text-emerald-400">₹{testResult.member?.loyalty_points || member?.loyalty_points}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Plan Validity & Attendance Stats Pills */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <p className="text-[11px] text-slate-400 font-medium">Plan Validity</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-white">{member?.days_left ?? 45}</span>
            <span className="text-xs text-emerald-400 font-semibold">days left</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Expires {member?.expiry_date || '2026-12-18'}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <p className="text-[11px] text-slate-400 font-medium">Loyalty Reward Balance</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-400">{member?.loyalty_points ?? 360}</span>
            <span className="text-xs text-slate-400 font-semibold">pts (₹{((member?.loyalty_points ?? 360) / 50).toFixed(1)})</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">+20 pts / day • 50 pts = ₹1 INR</p>
        </div>
      </div>

      {/* Personal Training (PT) Pass & Anti-Fraud Verification Gate Card */}
      {member?.pt_sessions_remaining > 0 && (
        <div className="bg-gradient-to-br from-[#121c2e] to-[#0c1422] border-2 border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Personal Training (PT) Pass
                </h4>
                <p className="text-[10px] text-emerald-400">
                  Assigned: {member?.trainer_name || 'Coach Murugan S'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              {member?.pt_sessions_remaining} of {member?.pt_sessions_total || 10} Left
            </span>
          </div>

          {/* 4-Digit Verification Code HUD */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Your 4-Digit PT Sign-Off Code
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Share with coach after your session
              </div>
            </div>
            <div className="text-xl font-black font-mono tracking-widest text-emerald-400 bg-slate-900 px-3.5 py-1.5 rounded-lg border border-emerald-500/30 shadow-inner">
              {member?.pt_session_pin || '4821'}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight italic">
            🛡️ Anti-Fraud Guarantee: Your coach cannot punch in or deduct sessions from your package without this 4-digit code.
          </p>
        </div>
      )}
    </div>
  );
}
