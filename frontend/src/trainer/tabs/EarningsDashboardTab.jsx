import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function EarningsDashboardTab({ trainer }) {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    if (!trainer?.id) return;
    setLoading(true);
    try {
      const data = await api.getTrainerEarnings(trainer.id);
      setEarningsData(data.earnings);
    } catch (err) {
      console.error('Failed to load trainer earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [trainer?.id]);

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Calculating trainer earnings & commissions...</div>;
  }

  const baseSalary = earningsData?.baseSalary || 18000;
  const totalSessions = earningsData?.totalSessions || 0;
  const totalCommissions = earningsData?.totalCommissions || 0;
  const estimatedPayout = earningsData?.estimatedPayout || (baseSalary + totalCommissions);
  const monthlyTarget = earningsData?.monthlyTarget || 25;
  const targetPercent = Math.min(100, Math.round((totalSessions / monthlyTarget) * 100));
  const sessions = earningsData?.sessions || [];

  return (
    <div className="space-y-6">
      
      {/* Top Profile & Salary Header Card */}
      <div className="bg-gradient-to-r from-[#10192e] to-[#0d1424] border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{trainer.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {trainer.role || 'Floor Coach'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Month: <span className="font-semibold text-slate-200">November 2026</span> • Commission Rate: <span className="text-emerald-400 font-bold font-mono">20% (₹50/PT)</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 px-5 py-3 rounded-2xl text-right">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Estimated Total Monthly Payout
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
              ₹{estimatedPayout.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Base Pay + Accrued Commissions</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Base Salary */}
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Guaranteed Base Pay
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1.5">
            ₹{baseSalary.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Monthly floor coaching base</div>
        </div>

        {/* Card 2: Verified PT Sessions */}
        <div className="bg-[#101726] border border-cyan-500/20 rounded-2xl p-4">
          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            Completed PT Sessions
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1.5">
            {totalSessions} <span className="text-xs text-slate-400 font-normal">/ {monthlyTarget} Target</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% Client PIN Verified</div>
        </div>

        {/* Card 3: Accrued Commission */}
        <div className="bg-[#101726] border border-emerald-500/20 rounded-2xl p-4">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            Accrued PT Commission
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">
            +₹{totalCommissions.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">₹50 credited per session</div>
        </div>

        {/* Card 4: Target Progress */}
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Session Quota Met
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">
            {targetPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{monthlyTarget - totalSessions} sessions to target bonus</div>
        </div>

      </div>

      {/* Monthly Target Progress Meter */}
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-300 uppercase tracking-wider">
            Monthly PT Quota Milestone ({totalSessions} of {monthlyTarget} Sessions)
          </span>
          <span className="text-emerald-400 font-mono">{targetPercent}% Completed</span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${targetPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>0 Sessions</span>
          <span>15 Sessions (Mid Target)</span>
          <span>25 Sessions (Max Milestone Bonus)</span>
        </div>
      </div>

      {/* Verified PT Sessions Ledger Breakdown */}
      <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>📋</span>
              <span>Month-to-Date Verified Session Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable list of sessions verified with 4-digit client sign-off code
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            {sessions.length} Records
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No completed sessions recorded for this month yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-[#0b101c] border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{s.member_name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/20">
                      Session #{s.session_number}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ Verified
                    </span>
                  </div>

                  <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>{s.focus_area}</span>
                  </div>

                  {s.notes && (
                    <div className="text-[10px] text-slate-400 italic bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80 mt-1 max-w-xl">
                      "{s.notes}"
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60 font-mono shrink-0">
                  <span className="text-emerald-400 font-black text-sm sm:text-base">
                    +₹{Number(s.commission_earned).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {s.session_date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <p>
            ℹ️ All verified commissions are credited directly to your registered bank account on the 1st of every month via NEFT.
          </p>
          <span className="font-semibold text-slate-300">Elite Fitness Center Accounts • Gudiyatham</span>
        </div>
      </div>

    </div>
  );
}

