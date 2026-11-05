import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function PtPunchInTab({ trainer, preselectedMember, onSessionVerified }) {
  const [roster, setRoster] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(preselectedMember?.id || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [focusArea, setFocusArea] = useState('Chest & Triceps Hypertrophy');
  const [coachingNotes, setCoachingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Fetch roster of clients assigned to this trainer
  const fetchRoster = async () => {
    if (!trainer?.id) return;
    try {
      const data = await api.getTrainerRoster(trainer.id);
      const membersWithPt = (data.roster || []).filter((m) => m.pt_sessions_remaining > 0);
      setRoster(membersWithPt);
      if (!selectedMemberId && membersWithPt.length > 0) {
        setSelectedMemberId(membersWithPt[0].id);
      }
    } catch (err) {
      console.error('Failed to load PT clients:', err);
    }
  };

  // Fetch recent completed PT sessions for this coach
  const fetchRecentSessions = async () => {
    if (!trainer?.id) return;
    setLoadingSessions(true);
    try {
      const data = await api.getTrainerEarnings(trainer.id);
      setRecentSessions(data.earnings?.sessions || []);
    } catch (err) {
      console.error('Failed to load recent PT sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchRoster();
    fetchRecentSessions();
  }, [trainer?.id]);

  useEffect(() => {
    if (preselectedMember?.id) {
      setSelectedMemberId(preselectedMember.id);
    }
  }, [preselectedMember]);

  const selectedMember = roster.find((m) => m.id === selectedMemberId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessResult(null);

    if (!selectedMemberId) {
      setError('Please select a client with active PT sessions.');
      return;
    }

    if (!verificationCode || verificationCode.trim().length !== 4) {
      setError('Please enter the 4-digit client sign-off code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.verifyPtSession({
        trainerId: trainer.id,
        memberId: selectedMemberId,
        verificationCode: verificationCode.trim(),
        focusArea,
        notes: coachingNotes
      });

      setSuccessResult(res);
      setVerificationCode('');
      setCoachingNotes('');
      // Refresh list & recent sessions
      await fetchRoster();
      await fetchRecentSessions();
      if (onSessionVerified) onSessionVerified();
    } catch (err) {
      setError(err.message || 'PT verification failed. Check the 4-digit code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusOptions = [
    'Chest & Triceps Hypertrophy',
    'Back & Lat Width / Postural Rehab',
    'Legs & Posterior Chain Power',
    'Shoulders & Upper Body Sculpting',
    'Cardio HIIT & Metabolic Conditioning',
    'Core Stability & Lumbar Rehabilitation'
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & Anti-Fraud Explanation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            🔐
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Anti-Fraud PT Session Punch-In</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-emerald-500/30">
                Zero Ghost Punch Protection
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Requires client's verbal/app 4-digit verification code before deducting from session balance.
            </p>
          </div>
        </div>

        <div className="text-xs text-right text-emerald-400 font-medium hidden sm:block">
          Commission: <span className="font-bold text-white font-mono">₹50 / session</span>
        </div>
      </div>

      {/* Main Punch-In Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-[#101726] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Client Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Client with Active PT
              </label>
              {roster.length === 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs">
                  No assigned clients currently have remaining PT sessions.
                </div>
              ) : (
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {roster.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.member_code}) — {m.pt_sessions_remaining} of {m.pt_sessions_total} Sessions Left
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Client Overview Card */}
            {selectedMember && (
              <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current PT Balance:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    {selectedMember.pt_sessions_remaining} / {selectedMember.pt_sessions_total} Sessions
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Next Session to Punch:</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    Session {(selectedMember.pt_sessions_total - selectedMember.pt_sessions_remaining) + 1} of {selectedMember.pt_sessions_total}
                  </span>
                </div>

                {selectedMember.medical_flags && selectedMember.medical_flags.toLowerCase() !== 'none' && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] uppercase font-bold text-amber-400">
                      ⚠️ Medical Caution for this Session:
                    </div>
                    <div className="text-xs text-amber-200 mt-0.5">
                      {selectedMember.medical_flags}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Anti-Fraud 4-Digit Code Gate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Client 4-Digit Sign-Off Code</span>
                  <span className="text-rose-400 font-mono">*</span>
                </label>
                {selectedMember && (
                  <button
                    type="button"
                    onClick={() => setVerificationCode(selectedMember.pt_session_pin || '4821')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
                  >
                    Demo Auto-Fill ({selectedMember.pt_session_pin || '4821'})
                  </button>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                  🔒
                </span>
                <input
                  type="text"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-900 border-2 border-slate-700 focus:border-emerald-500 rounded-xl text-center text-xl font-mono tracking-widest text-emerald-400 placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>ℹ️</span>
                <span>The client sees this code in their Member App under "My PT Pass".</span>
              </p>
            </div>

            {/* 3. Focus Area */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Session Focus Area
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {focusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Coaching Notes & Form Cues */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                4. Coaching Notes & Progression Highlights
              </label>
              <textarea
                rows={3}
                value={coachingNotes}
                onChange={(e) => setCoachingNotes(e.target.value)}
                placeholder="E.g., Bench press bar path adjusted. Completed 70kg x 8 reps with paused reps. Zero shoulder discomfort."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <span className="text-base">❌</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Success Celebration Card */}
            {successResult && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl space-y-2">
                <div className="font-bold text-sm flex items-center gap-2 text-emerald-400">
                  <span>🎉</span>
                  <span>{successResult.message}</span>
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-emerald-500/20 font-mono">
                  <span>Remaining Balance: {successResult.remainingSessions} Sessions</span>
                  <span className="text-emerald-400 font-bold">+₹{successResult.commissionEarned} Commission</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedMemberId}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying Code...' : '🔐 Verify & Sign Off PT Session'}</span>
            </button>

          </form>

        </div>

        {/* Right Column: Recent Verified Sessions Ledger */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#101726] border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📋</span>
                <span>Verified Sessions Log (MTD)</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {recentSessions.length} Total
              </span>
            </div>

            {loadingSessions ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading sessions log...</div>
            ) : recentSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No verified sessions yet this month.</div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {recentSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{s.member_name}</span>
                      <span className="text-emerald-400 font-mono">+₹{s.commission_earned}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Session #{s.session_number}</span>
                      <span>{s.session_date}</span>
                    </div>

                    <div className="text-[11px] text-cyan-300 font-medium">
                      🎯 {s.focus_area}
                    </div>

                    {s.notes && (
                      <div className="text-[10px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                        "{s.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

