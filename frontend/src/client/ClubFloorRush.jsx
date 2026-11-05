import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Activity, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function ClubFloorRush() {
  const [rush, setRush] = useState({ count: 4, level: 'Light', badgeColor: 'emerald', maxCapacity: 35 });
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClubData = async () => {
    try {
      setIsLoading(true);
      const [rushData, noticesData] = await Promise.all([
        api.getClientRush(),
        api.getClientNotices()
      ]);
      if (rushData) setRush(rushData);
      if (noticesData) setNotices(noticesData);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load club info:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubData();
    const interval = setInterval(fetchClubData, 30000); // 30s live polling
    return () => clearInterval(interval);
  }, []);

  const getRushLevelColor = (level) => {
    if (level === 'Peak Rush') return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40', bar: 'bg-rose-500' };
    if (level === 'Moderate') return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', bar: 'bg-amber-500' };
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', bar: 'bg-emerald-500' };
  };

  const colors = getRushLevelColor(rush?.level);
  const occupancyPercent = Math.min(100, Math.round(((rush?.count || 4) / (rush?.maxCapacity || 35)) * 100));

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Live Floor Rush Meter Gauge Card */}
      <div className="bg-gradient-to-br from-[#162130] via-[#101826] to-[#0d131f] border-2 border-emerald-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Live Floor Occupancy
          </span>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Sensors
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
              {rush?.count || 4}
              <span className="text-sm font-normal text-slate-400">/ {rush?.maxCapacity || 35} active on floor</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">Gudiyatham 2,800 sq.ft main workout floor</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 text-xs font-black uppercase px-2.5 py-1 rounded-xl border ${colors.bg} ${colors.text} ${colors.border}`}>
              {rush?.level || 'Light'}
            </span>
          </div>
        </div>

        {/* Occupancy Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1.5">
          <span>{occupancyPercent}% Floor Density</span>
          <span>{rush?.level === 'Light' ? 'Squat racks & dumbbells 100% free' : 'Expect moderate machine wait'}</span>
        </div>

        {/* Recommended Training Time Hint */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Best Quiet Hours Today:
          </span>
          <strong className="text-emerald-400 font-semibold">11:00 AM – 04:00 PM</strong>
        </div>
      </div>

      {/* Facility Operating Hours */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Gudiyatham Operating Hours
          </h3>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Open Now
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Morning Session</span>
            <p className="font-mono font-bold text-white text-sm">05:30 AM – 11:30 AM</p>
            <p className="text-[10px] text-emerald-400 mt-1">CrossFit & Cardio Prime</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Evening Session</span>
            <p className="font-mono font-bold text-white text-sm">04:30 PM – 09:30 PM</p>
            <p className="text-[10px] text-amber-400 mt-1">Strength & Hypertrophy</p>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-2.5 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Sunday Special Hours:</span>
          <span className="text-white font-bold">06:00 AM – 12:00 PM (No Evening)</span>
        </div>
      </div>

      {/* Official Facility Notice Board */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Official Gym Notices
        </h3>

        <div className="space-y-2">
          {notices.map((n) => (
            <div
              key={n.id}
              className="bg-[#121926] border border-slate-800 rounded-2xl p-4 shadow-md space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> {n.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(n.published_date || n.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {n.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Front Desk Support Hotline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Reception Desk WhatsApp</h4>
            <p className="text-[10px] text-slate-400">Near New Bus Stand, Gudiyatham</p>
          </div>
        </div>
        <a
          href="https://wa.me/919840123456?text=Hi%20Elite%20Gym%20Gudiyatham%20Desk"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" /> Chat
        </a>
      </div>
    </div>
  );
}
