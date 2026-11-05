import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function ClientRosterTab({ trainer, onSelectForPt }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'floor_today' | 'pt_active' | 'absent_alert'
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToMessage] = useState(null);

  // Client Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [allGymMembers, setAllGymMembers] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignFilter, setAssignFilter] = useState('all'); // 'all' | 'unassigned'
  const [claimingId, setClaimingId] = useState(null);

  const fetchRoster = async () => {
    if (!trainer?.id) return;
    setLoading(true);
    try {
      const data = await api.getTrainerRoster(trainer.id);
      setRoster(data.roster || []);
    } catch (err) {
      console.error('Failed to fetch trainer roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [trainer?.id]);

  const showToast = (msg) => {
    setToMessage(msg);
    setTimeout(() => setToMessage(null), 4000);
  };

  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    setAssignLoading(true);
    try {
      const data = await api.getAllMembersForAssignment();
      setAllGymMembers(data.members || []);
    } catch (err) {
      console.error('Failed to load members for assignment:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleClaimClient = async (member) => {
    setClaimingId(member.id);
    try {
      const res = await api.assignClientToTrainer({
        trainerId: trainer.id,
        memberId: member.id
      });
      showToast(`🎉 ${res.message || `${member.name} assigned to your roster!`}`);
      setAllGymMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? { ...m, assigned_trainer_id: trainer.id, trainer_name: trainer.name }
            : m
        )
      );
      fetchRoster();
    } catch (err) {
      alert('Assignment failed: ' + err.message);
    } finally {
      setClaimingId(null);
    }
  };

  const handle1TapFloorCheckin = async (member) => {
    setActionLoadingId(member.id);
    try {
      const res = await api.markFloorAttendance({
        trainerId: trainer.id,
        memberId: member.id,
        notes: `Floor coaching supervised by ${trainer.name}`
      });
      showToast(`✅ ${res.message || `Floor check-in confirmed for ${member.name}!`}`);
      // Refresh roster data
      await fetchRoster();
    } catch (err) {
      alert('Floor check-in error: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered members
  const filteredRoster = roster.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search);

    if (!matchesSearch) return false;

    if (filter === 'floor_today') return m.checkedInFloorToday;
    if (filter === 'pt_active') return m.pt_sessions_remaining > 0;
    if (filter === 'absent_alert') return m.isAbsentAlert;
    return true;
  });

  const totalAssigned = roster.length;
  const floorTodayCount = roster.filter((m) => m.checkedInFloorToday).length;
  const ptActiveCount = roster.filter((m) => m.pt_sessions_remaining > 0).length;
  const absentAlertCount = roster.filter((m) => m.isAbsentAlert).length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce text-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Roster Top Action Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#101726] p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0">
              Coach Workspace
            </span>
            <span className="text-xs text-slate-400">Supervising: {trainer.name}</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">
            Floor Client Roster & PT Management
          </h2>
          <p className="text-xs text-slate-400">
            Track daily attendance, supercharge workouts, and claim clients to your coaching roster.
          </p>
        </div>

        <button
          onClick={handleOpenAssignModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
        >
          <span>➕</span>
          <span>Assign Client to My Roster</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Assigned Clients
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {totalAssigned}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Floor & PT roster</div>
        </div>

        <div className="bg-[#101726] border border-emerald-500/20 rounded-2xl p-3.5">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Floor Today
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {floorTodayCount} <span className="text-xs text-slate-400 font-normal">/ {totalAssigned}</span>
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">1-Tap verified</div>
        </div>

        <div className="bg-[#101726] border border-cyan-500/20 rounded-2xl p-3.5">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
            Active PT Clients
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">
            {ptActiveCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">With PT balance</div>
        </div>

        <div className="bg-[#101726] border border-rose-500/20 rounded-2xl p-3.5">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <span>Absent 4+ Days</span>
            {absentAlertCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {absentAlertCount}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">1-Tap WhatsApp nudge</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101726] p-3 rounded-2xl border border-slate-800">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            All Assigned ({totalAssigned})
          </button>

          <button
            onClick={() => setFilter('floor_today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'floor_today'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Floor Today ({floorTodayCount})
          </button>

          <button
            onClick={() => setFilter('pt_active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'pt_active'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Active PT ({ptActiveCount})
          </button>

          <button
            onClick={() => setFilter('absent_alert')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'absent_alert'
                ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            ⚠️ Absent 4+ Days ({absentAlertCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name or code..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Roster Client Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Loading assigned client roster...
        </div>
      ) : filteredRoster.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm bg-[#101726] rounded-2xl border border-slate-800">
          No clients match the current filter or search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoster.map((m) => {
            const hasMedicalFlag = m.medical_flags && m.medical_flags.toLowerCase() !== 'none';
            const isCriticalAbsent = m.isAbsentAlert;

            return (
              <div
                key={m.id}
                className={`bg-[#0f1728] border rounded-2xl p-4 transition-all hover:border-slate-600 flex flex-col justify-between ${
                  isCriticalAbsent
                    ? 'border-rose-500/40 bg-gradient-to-b from-[#191018] to-[#0f1728]'
                    : m.checkedInFloorToday
                    ? 'border-emerald-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar: Member Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base font-black text-emerald-400 shrink-0">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          m.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{m.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {m.member_code}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>📞 {m.phone}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">{m.fitness_goals || 'General Fitness'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Floor Checkin Status Badge */}
                    <div>
                      {m.checkedInFloorToday ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ✓ On Floor Today
                        </span>
                      ) : isCriticalAbsent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                          ⚠️ Absent {m.daysAbsent} Days
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-800/80">
                          {m.daysAbsent === 0 ? 'Seen Today' : `Last: ${m.daysAbsent}d ago`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Medical Limitation Alert Banner */}
                  <div className="mt-3.5">
                    {hasMedicalFlag ? (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                        <span className="text-sm shrink-0">⚠️</span>
                        <div className="flex-1">
                          <span className="font-bold uppercase text-[10px] tracking-wider text-amber-400 block">
                            Medical & Injury Restriction:
                          </span>
                          <span className="font-medium text-amber-200/90 text-xs leading-relaxed">
                            {m.medical_flags}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 text-[11px] flex items-center gap-1.5">
                        <span className="text-emerald-400 text-xs">✅</span>
                        <span>No known medical restrictions • Cleared for progressive load</span>
                      </div>
                    )}
                  </div>

                  {/* PT Session Balance */}
                  <div className="mt-3 flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">⚡</span>
                      <span className="text-slate-300 font-semibold">PT Session Balance:</span>
                    </div>
                    {m.pt_sessions_remaining > 0 ? (
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 font-mono">
                        {m.pt_sessions_remaining} of {m.pt_sessions_total} Remaining
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        0 Sessions (Floor Membership)
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  
                  {/* 1-Tap Floor Check-In Button */}
                  <button
                    onClick={() => handle1TapFloorCheckin(m)}
                    disabled={m.checkedInFloorToday || actionLoadingId === m.id}
                    className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      m.checkedInFloorToday
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    <span>{m.checkedInFloorToday ? '✓' : '🏋️'}</span>
                    <span>
                      {actionLoadingId === m.id
                        ? 'Recording...'
                        : m.checkedInFloorToday
                        ? 'Floor Verified'
                        : '1-Tap Floor Check-In'}
                    </span>
                  </button>

                  {/* 1-Tap WhatsApp Nudge for 4+ Days Absentees */}
                  {isCriticalAbsent ? (
                    <a
                      href={m.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-[#25D366]/20 transition-all shrink-0"
                      title="Send personalized attendance check-in on WhatsApp"
                    >
                      <span>💬</span>
                      <span>WhatsApp Nudge</span>
                    </a>
                  ) : null}

                  {/* Quick Shortcut to PT Punch-in */}
                  {m.pt_sessions_remaining > 0 && (
                    <button
                      onClick={() => onSelectForPt && onSelectForPt(m)}
                      className="py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <span>⚡</span>
                      <span>Punch PT</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ASSIGN CLIENT MODAL */}
      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="relative w-[94%] sm:w-full max-w-2xl bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-4 sm:p-6 text-white max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 flex-shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>➕</span>
                  <span>Assign Gym Member to Your Roster</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Browse gym members and claim them to Coach {trainer.name}'s active training roster
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAssignFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    assignFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Members ({allGymMembers.length})
                </button>
                <button
                  onClick={() => setAssignFilter('unassigned')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    assignFilter === 'unassigned'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Unassigned ({allGymMembers.filter((m) => !m.assigned_trainer_id).length})
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input
                  type="text"
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  placeholder="Search name, code, phone..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Modal Member List */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1 mt-2 max-h-[60vh]">
              {assignLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading gym members directory...
                </div>
              ) : (
                (() => {
                  const filtered = allGymMembers.filter((m) => {
                    const matchesSearch =
                      m.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                      m.member_code.toLowerCase().includes(assignSearch.toLowerCase()) ||
                      (m.phone && m.phone.includes(assignSearch));
                    if (!matchesSearch) return false;
                    if (assignFilter === 'unassigned') return !m.assigned_trainer_id;
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-500 text-xs italic">
                        No members found matching criteria.
                      </div>
                    );
                  }

                  return filtered.map((mem) => {
                    const isAssignedToMe = mem.assigned_trainer_id === trainer.id;
                    const isUnassigned = !mem.assigned_trainer_id;

                    return (
                      <div
                        key={mem.id}
                        className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={mem.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={mem.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{mem.name}</span>
                              <span className="font-mono text-[10px] text-emerald-400">{mem.member_code}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>📱 {mem.phone}</span>
                              {mem.plan_name && <span>• {mem.plan_name}</span>}
                              {mem.fitness_goals && <span className="text-slate-500">• {mem.fitness_goals}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Assignment Action or Status Badge */}
                        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                          {isAssignedToMe ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                              ✓ In Your Roster
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaimClient(mem)}
                              disabled={claimingId === mem.id}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                                isUnassigned
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              <span>{isUnassigned ? '➕ Claim to My Roster' : '🔄 Reassign to Me'}</span>
                              {!isUnassigned && mem.trainer_name && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  (from {mem.trainer_name})
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

