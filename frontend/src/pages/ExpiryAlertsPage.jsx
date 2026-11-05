import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Send, 
  CreditCard, 
  Calendar, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  CheckCircle,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export default function ExpiryAlertsPage({ onRenewMember }) {
  const [alerts, setAlerts] = useState({ tier1EarlyBird: [], tier2Urgent: [], tier3FinalNotice: [] });
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getExpiryAlerts();
      setAlerts(data);
    } catch (e) {
      console.error('Failed to load expiry alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#131b26] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Retention & Automated Renewals
            </span>
            <span className="text-xs text-slate-400 font-medium">3-Tier Interception Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
            3-Tier Expiry Notification Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Early bird incentives (7d), urgent UPI reminders (3d), and final expiry notices to maximize renewals.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* 3 TIERS SECTIONS */}
      <div className="space-y-6">
        
        {/* TIER 2: URGENT 3-DAY REMINDER (Highest Priority) */}
        <div className="p-6 rounded-3xl bg-[#131b26] border-2 border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Tier 2: Urgent 3-Day Renewal Reminders</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black font-mono">
                    {alerts.tier2Urgent.length} Due
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Direct UPI payment link sent via WhatsApp to retain uninterrupted workouts</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.tier2Urgent.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No members due in the 3-day window.</p>
            ) : (
              alerts.tier2Urgent.map((mem) => (
                <div key={mem.id} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={mem.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={mem.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{mem.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold font-mono">
                        Expires in {mem.days_left} days ({mem.expiry_date})
                      </p>
                      <p className="text-[11px] text-slate-400">{mem.plan_title || mem.plan_name} • ₹{mem.plan_price || 6500}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={mem.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors"
                      title="Send Urgent UPI WhatsApp Reminder"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                    </a>
                    <button
                      onClick={() => onRenewMember(mem)}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TIER 1: EARLY BIRD INCENTIVE (7 Days Before) */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Tier 1: 7-Day Early Bird Loyalty Incentive</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                    {alerts.tier1EarlyBird.length} Due
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Offer: "Renew before expiry to lock in rate + earn 200 bonus loyalty credits"</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.tier1EarlyBird.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No members in the 7-day early bird window.</p>
            ) : (
              alerts.tier1EarlyBird.map((mem) => (
                <div key={mem.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={mem.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={mem.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{mem.name}</h4>
                      <p className="text-xs text-emerald-400 font-semibold font-mono">
                        Expires in {mem.days_left} days ({mem.expiry_date})
                      </p>
                      <p className="text-[11px] text-slate-400">{mem.plan_title || mem.plan_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={mem.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Early Bird WA</span>
                    </a>
                    <button
                      onClick={() => onRenewMember(mem)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                    >
                      Renew
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TIER 3: DAY OF EXPIRY / OVERDUE GRACE (0 to -2 Days) */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-rose-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Tier 3: Day of Expiry & Grace Window Overdue Alerts</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-black font-mono">
                    {alerts.tier3FinalNotice.length} Action Needed
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Final notice: Warns members of scanner gate lock after grace period ends</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.tier3FinalNotice.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No members overdue in grace window.</p>
            ) : (
              alerts.tier3FinalNotice.map((mem) => (
                <div key={mem.id} className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={mem.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={mem.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{mem.name}</h4>
                      <p className="text-xs text-rose-400 font-bold font-mono">
                        {mem.days_left === 0 ? 'Expires Today!' : `Overdue by ${Math.abs(mem.days_left)} days (Grace active)`}
                      </p>
                      <p className="text-[11px] text-slate-400">{mem.plan_title || mem.plan_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={mem.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                      title="Send Grace Warning WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-rose-400" />
                    </a>
                    <button
                      onClick={() => onRenewMember(mem)}
                      className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md"
                    >
                      Collect Dues
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

