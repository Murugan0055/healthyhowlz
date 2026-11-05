import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Coins, 
  Calendar, 
  ShieldAlert, 
  PauseCircle, 
  PlayCircle, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard,
  Phone,
  QrCode,
  Clock,
  FileText,
  Dumbbell,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function MembersPage({ currentGymId, currentGym, onOpenNewMember, onRenewMember, onCheckinResult }) {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);
  const [memberHistoryLoading, setMemberHistoryLoading] = useState(false);
  const [memberHistoryData, setMemberHistoryData] = useState(null);

  const [freezeModalMember, setFreezeModalMember] = useState(null);
  const [freezeDays, setFreezeDays] = useState(15);
  const [freezeReason, setFreezeReason] = useState('Medical recovery');

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await api.getTrainersList();
        setTrainers(data.trainers || []);
      } catch (e) {
        console.error('Failed to load trainers:', e);
      }
    };
    fetchTrainers();
  }, []);

  const handleAssignTrainer = async (memberId, trainerId) => {
    try {
      const res = await api.assignTrainerToMember(memberId, trainerId || null);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? { ...m, assigned_trainer_id: trainerId || null, trainer_name: res.trainerName || null }
            : m
        )
      );
      if (selectedMemberDetail && selectedMemberDetail.id === memberId) {
        setSelectedMemberDetail((prev) => ({
          ...prev,
          assigned_trainer_id: trainerId || null,
          trainer_name: res.trainerName || null
        }));
      }
    } catch (err) {
      alert('Failed to assign trainer: ' + err.message);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await api.getMembers(statusFilter, search);
      setMembers(data);
    } catch (e) {
      console.error('Fetch members error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [statusFilter, search, currentGymId]);

  const handleOpenMemberDetail = async (mem) => {
    setSelectedMemberDetail(mem);
    setMemberHistoryLoading(true);
    try {
      const data = await api.getMemberDetail(mem.id);
      setMemberHistoryData(data);
    } catch (e) {
      console.error('Failed to load member history:', e);
    } finally {
      setMemberHistoryLoading(false);
    }
  };

  const handleUnfreeze = async (memberId) => {
    try {
      const res = await api.unfreezeMember(memberId);
      alert(`✅ Membership unfrozen! Shifted expiry date forward to ${res.newExpiryDate} (+${res.daysFrozenPushed} days added).`);
      fetchMembers();
    } catch (err) {
      alert('Unfreeze error: ' + err.message);
    }
  };

  const handleFreezeSubmit = async (e) => {
    e.preventDefault();
    if (!freezeModalMember) return;
    try {
      const res = await api.freezeMember(freezeModalMember.id, freezeDays, freezeReason);
      alert(`❄️ Membership paused for ${res.freezeDaysAdded} days! Remaining annual freeze quota: ${res.remainingAllowed} days.`);
      setFreezeModalMember(null);
      fetchMembers();
    } catch (err) {
      alert('Freeze failed: ' + err.message);
    }
  };

  const handleSimulatePassScan = async (code) => {
    try {
      const res = await api.scanQr(code);
      if (onCheckinResult) onCheckinResult(res);
    } catch (e) {
      alert('Scan simulation failed: ' + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#131b26] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {currentGym?.name || 'Member Directory'}
            </span>
            <span className="text-xs text-slate-400">Total {members.length} records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
            Gym Member Roster & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Attendance loyalty wallet tracking, plan freeze rules (max 30d/yr), and 1-click renewals. Tap any member to view full attendance history.
          </p>
        </div>

        <button
          onClick={onOpenNewMember}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131b26] p-4 rounded-2xl border border-slate-800">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active Floor' },
            { id: 'grace', label: 'Grace Period' },
            { id: 'expired', label: 'Expired / Due' },
            { id: 'frozen', label: 'Frozen' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input with Clear Button */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear search (show all members)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((mem) => {
          const isActive = mem.status === 'active';
          const isGrace = mem.status === 'grace';
          const isExpired = mem.status === 'expired';
          const isFrozen = mem.status === 'frozen';

          return (
            <div
              key={mem.id}
              className="p-5 rounded-3xl bg-[#131b26] border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              {/* Member Top Bar (Clickable to view details) */}
              <div 
                onClick={() => handleOpenMemberDetail(mem)}
                className="cursor-pointer group"
                title="Click to view full attendance history"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={mem.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={mem.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md group-hover:border-emerald-400 transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">{mem.name}</h4>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 font-bold block">
                        {mem.member_code}
                      </span>
                      <p className="text-[11px] text-slate-400">📱 {mem.phone}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : isGrace
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : isFrozen
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {mem.status}
                  </span>
                </div>

                {/* Plan & Validity Info */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Current Plan:</span>
                    <span className="font-semibold text-slate-200">{mem.plan_title || mem.plan_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Expiry Date:</span>
                    <span className="font-mono font-bold text-slate-200">{mem.expiry_date}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Days Status:</span>
                    <span
                      className={`font-semibold font-mono ${
                        mem.days_left > 7
                          ? 'text-emerald-400'
                          : mem.days_left >= 0
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {mem.days_left >= 0 ? `${mem.days_left} days remaining` : `${Math.abs(mem.days_left)} days overdue`}
                    </span>
                  </div>
                </div>

                {/* Loyalty Wallet & Locker Info */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>{mem.loyalty_points || 0} pts (₹{Math.floor((mem.loyalty_points || 0) / 50)})</span>
                  </div>

                  {mem.locker_number ? (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-blue-400" />
                      <span>Locker: {mem.locker_number}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">No locker assigned</span>
                  )}
                </div>

                {/* Assigned Floor Coach Selector */}
                <div 
                  className="mt-2.5 flex items-center justify-between text-xs bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-slate-400 flex items-center gap-1 font-medium text-[11px]">
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Coach:</span>
                  </span>
                  <select
                    value={mem.assigned_trainer_id || ''}
                    onChange={(e) => handleAssignTrainer(mem.id, e.target.value)}
                    className={`font-semibold text-[11px] px-2 py-1 rounded-lg border focus:outline-none transition-all cursor-pointer ${
                      mem.assigned_trainer_id
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <option value="">Unassigned</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medical flags cue */}
                {mem.medical_flags && mem.medical_flags !== 'None' && (
                  <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{mem.medical_flags}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Renew, Freeze/Unfreeze, Simulate Scan */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onRenewMember(mem)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Renew</span>
                </button>

                {isFrozen ? (
                  <button
                    onClick={() => handleUnfreeze(mem.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs transition-all"
                    title="Unfreeze plan & shift expiry forward"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setFreezeModalMember(mem)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
                    title="Freeze / Pause plan (max 30 days/yr)"
                  >
                    <PauseCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleSimulatePassScan(mem.member_code)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-all text-xs"
                  title="Simulate Check-In Pass Scan at Desk"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* MEMBER FULL PROFILE & ATTENDANCE HISTORY MODAL */}
      {selectedMemberDetail && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMemberDetail.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={selectedMemberDetail.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedMemberDetail.name}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-emerald-400">
                      {selectedMemberDetail.member_code}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">📱 {selectedMemberDetail.phone} • {selectedMemberDetail.email || 'No email'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Plan</span>
                <span className="font-bold text-white text-[11px] truncate block">{selectedMemberDetail.plan_name}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Expiry</span>
                <span className="font-bold font-mono text-emerald-400 text-xs">{selectedMemberDetail.expiry_date}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Loyalty Balance</span>
                <span className="font-bold font-mono text-amber-400 text-xs">{selectedMemberDetail.loyalty_points || 0} pts</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Status</span>
                <span className="font-bold uppercase text-xs text-white">{selectedMemberDetail.status}</span>
              </div>
            </div>

            {/* Assigned Coach Bar inside Member Detail Modal */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Assigned Floor Coach</span>
                  <span className="font-bold text-emerald-300 text-xs">
                    {selectedMemberDetail.trainer_name ? `🏋️ ${selectedMemberDetail.trainer_name}` : 'Unassigned (No Floor Coach)'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Reassign:</span>
                <select
                  value={selectedMemberDetail.assigned_trainer_id || ''}
                  onChange={(e) => handleAssignTrainer(selectedMemberDetail.id, e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Unassigned</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendance History Trail */}
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Floor Attendance Trail (Last 30 Check-ins)
              </h4>

              {memberHistoryLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading attendance history...</div>
              ) : memberHistoryData?.checkins?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic">No check-ins logged yet.</div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {memberHistoryData?.checkins?.map((chk) => (
                    <div key={chk.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">
                          {chk.checkin_type === 'qr_scan' ? '📷 QR Scan Pass' : `🔍 Manual Override (${chk.manual_officer_name || 'Staff'})`}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {new Date(chk.checkin_time).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        chk.verification_status === 'granted' ? 'bg-emerald-500/20 text-emerald-300' :
                        chk.verification_status === 're_entry' ? 'bg-blue-500/20 text-blue-300' :
                        chk.verification_status === 'grace_entry' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {chk.verification_status} ({chk.points_awarded > 0 ? `+${chk.points_awarded} pts` : '0 pts'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invoices Trail */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Previous Billing Invoices
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {memberHistoryData?.invoices?.map((inv) => (
                  <div key={inv.id} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-mono text-emerald-400 font-bold">{inv.invoice_number}</span>
                      <span className="text-slate-400 ml-2">{inv.item_description}</span>
                    </div>
                    <span className="font-mono font-bold text-white">₹{inv.grand_total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FREEZE MODAL */}
      {freezeModalMember && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Pause Membership Plan</h3>
              <button
                onClick={() => setFreezeModalMember(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFreezeSubmit} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-300">
                Member: <span className="font-bold text-white">{freezeModalMember.name}</span>
              </p>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Pause Duration (Days) *</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={freezeDays}
                  onChange={(e) => setFreezeDays(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Enforces maximum freeze limits per year (up to 30 days total).
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Reason for Pause</label>
                <select
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="Medical recovery">Medical / Health Recovery</option>
                  <option value="Official Travel">Out-of-Town Official Travel</option>
                  <option value="Exam Preparation">College / Academic Exams</option>
                  <option value="Personal Emergency">Personal Emergency</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 font-bold text-sm text-white shadow-md transition-all"
              >
                Confirm Plan Pause ({freezeDays} Days)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
