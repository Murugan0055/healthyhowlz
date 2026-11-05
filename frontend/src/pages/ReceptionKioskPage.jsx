import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Search, 
  UserPlus, 
  Activity, 
  Flame, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  RefreshCw,
  Wallet,
  AlertTriangle,
  QrCode,
  Zap,
  CheckCircle2,
  KeyRound,
  Scan
} from 'lucide-react';
import { api } from '../services/api';

export default function ReceptionKioskPage({ 
  onOpenScanner, 
  onOpenManualCheckin, 
  onOpenNewMember, 
  onOpenCashReconcile,
  onCheckinResult
}) {
  const [rush, setRush] = useState({ count: 4, level: 'Light', badgeColor: 'emerald', capacityPercent: 8 });
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKioskData = async () => {
    try {
      setLoading(true);
      const [rushRes, recentsRes] = await Promise.all([
        api.getFloorRush(),
        api.getRecentCheckins()
      ]);
      setRush(rushRes);
      setRecentCheckins(recentsRes);
    } catch (e) {
      console.error('Fetch kiosk error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKioskData();
    const interval = setInterval(fetchKioskData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  // Quick simulated scan for quick reception testing
  const handleSimulatedScan = async (code) => {
    try {
      const res = await api.scanQr(code);
      if (onCheckinResult) onCheckinResult(res);
      fetchKioskData();
    } catch (err) {
      alert('Scan error: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner: Gudiyatham Reception Command */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#131b26] to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Reception Tablet Desk
            </span>
            <span className="text-xs text-slate-400 font-medium">Zero-Hardware Deployment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
            Member Access & Attendance Gate
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Front camera is idle by default to conserve tablet thermals and battery life. Tap below to initiate on-demand scan.
          </p>
        </div>

        {/* Quick Reception Action Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenNewMember}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>+ Walk-in Joining</span>
          </button>

          <button
            onClick={onOpenCashReconcile}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>EOD Cash Till</span>
          </button>
        </div>
      </div>

      {/* PRIMARY ACTION HUBS (TABLET DESK HERO ACTIONS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ACTION 1: ON-DEMAND QR SCANNER */}
        <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[#131d27] to-[#0d141e] border-2 border-emerald-500/40 hover:border-emerald-500 shadow-xl shadow-emerald-950/30 transition-all flex flex-col justify-between overflow-hidden">
          
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Action 1 • Instant QR Pass
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                &lt; 300ms Verification
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white brand-font tracking-tight mb-2">
              On-Demand QR Scan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Tap to open the tablet front camera. Reads member dynamic anti-screenshot rotating QR pass, validates plan validity, credits +20 loyalty points, and auto-shuts down.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={onOpenScanner}
              className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 font-black text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-950/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-5 h-5 text-slate-950 stroke-[2.4]" />
              </div>
              <span className="text-base sm:text-lg tracking-wide uppercase font-extrabold">
                SCAN MEMBER QR PASS
              </span>
            </button>
            <p className="text-center text-[11px] text-slate-400">
              * Camera activates on-demand only. Auto-terminates on scan or 15s timeout.
            </p>
          </div>

        </div>

        {/* ACTION 2: PROTECTED MANUAL CHECK-IN */}
        <div className="relative group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/30 via-[#181d24] to-[#0d141e] border-2 border-amber-500/40 hover:border-amber-500 shadow-xl shadow-amber-950/20 transition-all flex flex-col justify-between overflow-hidden">
          
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
                  Action 2 • Manual Override
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/20">
                PIN Gated • Audit Logged
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white brand-font tracking-tight mb-2">
              Protected Manual Check-In
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              For members who forgot their phone or have dead battery. Secured with 4-Digit Front Officer Master PIN to eliminate unauthorized proxy buddy entries.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={onOpenManualCheckin}
              className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:from-amber-400 hover:to-yellow-300 font-black text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-950/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <KeyRound className="w-5 h-5 text-slate-950 stroke-[2.4]" />
              </div>
              <span className="text-base sm:text-lg tracking-wide uppercase font-extrabold">
                MANUAL CHECK-IN (OFFICER PIN)
              </span>
            </button>
            <p className="text-center text-[11px] text-slate-400">
              * Requires Staff PIN. Shows member ID Photo for counter visual verification.
            </p>
          </div>

        </div>

      </div>

      {/* Floor Rush Meter & Quick Pass Test Simulator Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Floor Rush Gauge Box */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Live Floor Rush Volume
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                rush.level === 'Peak Rush' ? 'bg-rose-500/20 text-rose-300' :
                rush.level === 'Moderate' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {rush.level}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-black text-white font-mono">{rush.count}</span>
              <span className="text-xs text-slate-400 font-medium">members checked-in (last 90m)</span>
            </div>

            {/* Capacity progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  rush.level === 'Peak Rush' ? 'bg-rose-500' :
                  rush.level === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(5, rush.capacityPercent || 15)}%` }}
              ></div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800">
            2,500 sq. ft floor capacity: 50 max recommended simultaneous trainees.
          </p>
        </div>

        {/* Quick Testing Pass Tokens (Click to Trigger HUD Immediately) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              1-Tap Test Verification Tokens (Simulates Real QR Camera Scans)
            </span>
            <span className="text-[10px] text-slate-500">Tap any token to test HUD</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleSimulatedScan('EG-1001')}
              className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">EG-1001</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">+20 Pts</span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium mt-1">Vigneshwaran K</p>
              <p className="text-[10px] text-slate-400">Active (45 days left)</p>
            </button>

            <button
              onClick={() => handleSimulatedScan('EG-1002')}
              className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">EG-1002</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500 text-slate-950 font-black">Re-Entry</span>
              </div>
              <p className="text-[11px] text-blue-300 font-medium mt-1">Aravind Swamy</p>
              <p className="text-[10px] text-slate-400">Already logged today</p>
            </button>

            <button
              onClick={() => handleSimulatedScan('EG-1005')}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">EG-1005</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black">3d Left</span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium mt-1">Mohan Babu</p>
              <p className="text-[10px] text-slate-400">Urgent Renewal Target</p>
            </button>

            <button
              onClick={() => handleSimulatedScan('EG-1007')}
              className="p-3 rounded-2xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">EG-1007</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500 text-slate-950 font-black">Grace 1d</span>
              </div>
              <p className="text-[11px] text-yellow-300 font-medium mt-1">Saravanan R</p>
              <p className="text-[10px] text-slate-400">Permitted (Overdue Warning)</p>
            </button>

            <button
              onClick={() => handleSimulatedScan('EG-1008')}
              className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">EG-1008</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-black">Blocked</span>
              </div>
              <p className="text-[11px] text-rose-300 font-medium mt-1">Praveen Kumar</p>
              <p className="text-[10px] text-slate-400">Expired 15 days ago</p>
            </button>

            <button
              onClick={() => handleSimulatedScan('EG-1009')}
              className="p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">EG-1009</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500 text-white font-black">Frozen</span>
              </div>
              <p className="text-[11px] text-purple-300 font-medium mt-1">Deepak Raj</p>
              <p className="text-[10px] text-slate-400">Membership Paused</p>
            </button>
          </div>
        </div>

      </div>

      {/* Live Floor Activity & Audit Stream */}
      <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Real-Time Reception Activity Feed</h3>
          </div>
          <button
            onClick={fetchKioskData}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentCheckins.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500">No check-ins logged yet today.</p>
          ) : (
            recentCheckins.map((chk) => (
              <div key={chk.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={chk.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={chk.member_name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">{chk.member_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {chk.member_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      {chk.checkin_type === 'qr_scan' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <QrCode className="w-3 h-3" /> QR Pass Scan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <KeyRound className="w-3 h-3" /> Manual ({chk.manual_officer_name || 'Desk Officer'})
                        </span>
                      )}
                      <span>•</span>
                      <span>{new Date(chk.checkin_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  {chk.verification_status === 'granted' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      +{chk.points_awarded} Pts
                    </span>
                  )}
                  {chk.verification_status === 're_entry' && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
                      Re-Entry
                    </span>
                  )}
                  {chk.verification_status === 'grace_entry' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                      Grace
                    </span>
                  )}
                  {chk.verification_status === 'denied' && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

