import React, { useState, useEffect } from 'react';
import { 
  Kanban, 
  UserPlus, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Sparkles, 
  Award, 
  Clock, 
  ChevronRight, 
  XCircle, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  Send,
  Zap,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function LeadsCrmPage() {
  const [kanbanData, setKanbanData] = useState({ columns: [] });
  const [winBackLeads, setWinBackLeads] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'winback', 'performance'
  const [winBackDays, setWinBackDays] = useState(30);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMobileStage, setSelectedMobileStage] = useState('all');

  // New Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    goal: 'Fat Loss (Target -10kg)',
    budget: 6500,
    source: 'Walk-in',
    assignedStaffName: 'Priya V (Front Desk)',
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [kanbanRes, winBackRes, perfRes] = await Promise.all([
        api.getKanbanLeads(),
        api.getWinBackCampaigns(winBackDays),
        api.getStaffSalesPerformance()
      ]);
      setKanbanData(kanbanRes);
      setWinBackLeads(winBackRes);
      setStaffPerformance(perfRes);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [winBackDays]);

  const handleStageChange = async (leadId, newStage) => {
    try {
      await api.updateLeadStage(leadId, newStage);
      loadData();
    } catch (err) {
      alert('Failed to update stage: ' + err.message);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) {
      alert('Name and Phone are required');
      return;
    }

    try {
      const created = await api.createLead(leadForm);
      setShowNewLeadModal(false);
      setLeadForm({
        name: '',
        phone: '',
        goal: 'Fat Loss (Target -10kg)',
        budget: 6500,
        source: 'Walk-in',
        assignedStaffName: 'Priya V (Front Desk)',
        notes: ''
      });
      loadData();
      alert(`🎉 Lead captured! 1-Day Trial Pass Code generated: ${created.passCode}`);
    } catch (err) {
      alert('Failed to create lead: ' + err.message);
    }
  };

  const nextStageMap = {
    new_inquiry: 'call_scheduled',
    call_scheduled: 'trial_booked',
    trial_booked: 'trial_attended',
    trial_attended: 'price_negotiation',
    price_negotiation: 'closed_won'
  };

  // Total leads count across all columns
  const totalLeadsCount = kanbanData.columns.reduce((sum, col) => sum + (col.items?.length || 0), 0);

  // Filter columns for mobile if a specific stage is selected
  const visibleColumns = selectedMobileStage === 'all'
    ? kanbanData.columns
    : kanbanData.columns.filter((c) => c.id === selectedMobileStage);

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
      
      {/* Top Banner (Compact & Sleek to save vertical space) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 rounded-2xl bg-[#131b26] border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Kanban className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight brand-font">
                Sales CRM & Pipeline
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                {totalLeadsCount} Prospects
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Speed-to-lead: Green (&lt;2h) • Amber (2-24h) • Red (&gt;24h overdue) + 1-Tap WhatsApp Trial Passes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewLeadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Capture Lead (15s)</span>
        </button>
      </div>

      {/* CRM Sub-Navigation Tabs & Mobile Stage Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveTab('winback')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'winback'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Win-Back ({winBackLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'performance'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Staff Commission</span>
          </button>
        </div>

        {/* Mobile Stage Quick Filter (visible only on Kanban view on smaller devices) */}
        {activeTab === 'kanban' && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none sm:hidden text-[10px]">
            <span className="text-slate-400 whitespace-nowrap mr-1">Stage:</span>
            <button
              onClick={() => setSelectedMobileStage('all')}
              className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                selectedMobileStage === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 bg-slate-900'
              }`}
            >
              All
            </button>
            {kanbanData.columns.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedMobileStage(c.id)}
                className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                  selectedMobileStage === c.id ? 'bg-blue-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                {c.label.split(' ')[0]} ({c.items.length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: VISUAL KANBAN PIPELINE (Zero Vertical Scroll on Desktop!) */}
      {activeTab === 'kanban' && (
        <div className="w-full h-[calc(100vh-210px)] min-h-[460px] overflow-x-auto overflow-y-hidden pb-1 scrollbar-thin">
          <div className="flex items-stretch gap-3 h-full min-w-[1260px] pb-2">
            {visibleColumns.map((col) => (
              <div
                key={col.id}
                className="w-72 md:w-80 flex-shrink-0 bg-[#101722] rounded-2xl border border-slate-800/90 p-3 flex flex-col h-full shadow-md"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      {col.label}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                    {col.items.length}
                  </span>
                </div>

                {/* Lead Cards List (Scrolls Internally Inside Column Only) */}
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  {col.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-600 text-xs italic">
                      <p>No prospects in stage</p>
                    </div>
                  ) : (
                    col.items.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl bg-[#151f2d] border border-slate-700/80 hover:border-slate-500/80 transition-all space-y-2 shadow-sm"
                      >
                        {/* Name + Urgency Tag */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-white truncate">{lead.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">📱 {lead.phone}</p>
                          </div>

                          {/* Urgency Badge */}
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 flex-shrink-0 ${
                              lead.urgency === 'green'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : lead.urgency === 'amber'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                            }`}
                            title={`Contacted ${lead.hoursSinceContact}h ago`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{lead.urgencyLabel}</span>
                          </span>
                        </div>

                        {/* Goal & Budget */}
                        <div className="p-1.5 rounded-lg bg-slate-900/90 text-[10px] space-y-0.5">
                          <p className="text-slate-300 font-medium truncate">🎯 {lead.goal}</p>
                          <p className="text-emerald-400 font-mono font-semibold">💰 Budget: ₹{lead.budget}</p>
                        </div>

                        {/* Notes */}
                        {lead.notes && (
                          <p className="text-[10px] text-slate-400 italic line-clamp-1">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Action buttons: WhatsApp Trial Pass + Advance Stage */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                          <a
                            href={lead.whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-400" />
                            <span>WhatsApp Pass</span>
                          </a>

                          <div className="flex items-center gap-1">
                            {nextStageMap[col.id] && (
                              <button
                                onClick={() => handleStageChange(lead.id, nextStageMap[col.id])}
                                className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold transition-all"
                              >
                                <span>Next</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}

                            {col.id !== 'closed_lost' && col.id !== 'closed_won' && (
                              <button
                                onClick={() => handleStageChange(lead.id, 'closed_lost')}
                                title="Mark as Closed Lost"
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: LOST LEAD WIN-BACK CAMPAIGNS */}
      {activeTab === 'winback' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Lost Lead Win-Back Campaigns
              </h3>
              <p className="text-xs text-slate-400">
                Prospects who attended a workout trial but did not join. 1-Tap send branded comeback incentive offer.
              </p>
            </div>

            {/* Filter buttons (30d / 60d / 90d) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Trial Window:</span>
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setWinBackDays(days)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    winBackDays === days
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Last {days} Days
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {winBackLeads.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-500">
                No lost trial leads found in the last {winBackDays} days window.
              </p>
            ) : (
              winBackLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{lead.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                        {lead.stage === 'closed_lost' ? 'Lost Prospect' : 'Attended Trial — Unconverted'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      📱 {lead.phone} • Goal: {lead.goal} • Budget: ₹{lead.budget}
                    </p>
                    <p className="text-[11px] text-amber-300/90 mt-1">
                      🎁 Promo Offer: "500 Bonus Renewal Loyalty Credits + Zero Joining Fee"
                    </p>
                  </div>

                  <a
                    href={lead.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Comeback Offer</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: STAFF CONVERSION & COMMISSION TRACKER */}
      {activeTab === 'performance' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Staff Lead Conversion & Commission Tracker
            </h3>
            <p className="text-xs text-slate-400">
              Front desk and sales performance metrics based on closed plans and collected revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffPerformance.map((staff) => (
              <div key={staff.staffId} className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">{staff.staffName}</h4>
                    <span className="text-[10px] text-purple-400 font-semibold uppercase">{staff.role}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                    {staff.commissionRate}% Commission
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Assigned</span>
                    <span className="text-base sm:text-lg font-black text-white">{staff.totalLeads}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Closed</span>
                    <span className="text-base sm:text-lg font-black text-emerald-400">{staff.closedWon}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Conversion</span>
                    <span className="text-base sm:text-lg font-black text-blue-400">{staff.conversionRate}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Total Revenue Collected:</span>
                  <span className="font-mono font-bold text-white">₹{staff.revenueCollected.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-semibold">Accrued Commission:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    ₹{staff.commissionEarned.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: 15-SECOND LEAD CAPTURE MODAL */}
      {showNewLeadModal && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Capture Walk-In Prospect (15s)</h3>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Prospect Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Vignesh R"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Goal</label>
                  <select
                    value={leadForm.goal}
                    onChange={(e) => setLeadForm({ ...leadForm, goal: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Powerlifting">Powerlifting</option>
                    <option value="General Health">General Health</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={leadForm.budget}
                    onChange={(e) => setLeadForm({ ...leadForm, budget: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Source</label>
                <select
                  value={leadForm.source}
                  onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="Walk-in">Walk-in Inquiry</option>
                  <option value="Instagram">Instagram / Facebook</option>
                  <option value="Google">Google Search</option>
                  <option value="Referral">Member Referral</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Quick Note</label>
                <input
                  type="text"
                  placeholder="e.g. Inquiring for 6m transformation pack"
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all mt-3"
              >
                Create Lead & Issue VIP Guest Pass
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
