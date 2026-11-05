import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  X, 
  Coins, 
  Calendar, 
  Phone, 
  ArrowRight,
  ShieldAlert,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export default function StatusHudModal({ result, onClose, onRenewClick }) {
  const [secondsRemaining, setSecondsRemaining] = useState(6);

  useEffect(() => {
    if (!result) return;

    // Play corresponding sound
    sounds.play(result.alertSound || 'success_chime');

    // Confetti celebration if green (+20 points)
    if (result.status === 'granted') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24']
        });
      } catch (e) {
        // ignore
      }
    }

    setSecondsRemaining(6);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [result]);

  if (!result) return null;

  const isGreen = result.status === 'granted';
  const isBlue = result.status === 're_entry';
  const isYellow = result.status === 'grace_entry';
  const isRed = result.status === 'denied';

  let hudClass = 'hud-green';
  let badgeText = 'ENTRY GRANTED';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let Icon = CheckCircle2;

  if (isBlue) {
    hudClass = 'hud-blue';
    badgeText = 'RE-ENTRY PERMITTED';
    badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    Icon = Info;
  } else if (isYellow) {
    hudClass = 'hud-yellow';
    badgeText = 'GRACE WINDOW ACTIVE';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    Icon = AlertTriangle;
  } else if (isRed) {
    hudClass = 'hud-red';
    badgeText = 'ACCESS BLOCKED';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    Icon = AlertOctagon;
  }

  const member = result.member;

  return (
    <div className="modal-overlay">
      <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 text-white ${hudClass} transition-all transform animate-in fade-in zoom-in-95 duration-200`}>
        
        {/* Top Dismiss Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${badgeColor}`}>
            {badgeText}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 font-mono">Auto-closing in {secondsRemaining}s</span>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Main HUD Content */}
        <div className="text-center my-6">
          
          {/* Main Status Icon & Title */}
          <div className="inline-flex p-4 rounded-2xl bg-white/10 mb-3 shadow-inner">
            <Icon className="w-12 h-12" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black brand-font tracking-tight mb-2">
            {result.title}
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-sm mx-auto leading-relaxed">
            {result.message}
          </p>

        </div>

        {/* Member Profile Verification Card */}
        {member && (
          <div className="bg-slate-900/80 border border-white/15 rounded-2xl p-4 flex items-center gap-4">
            
            {/* Member ID Photo */}
            <div className="relative flex-shrink-0">
              <img
                src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={member.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono font-bold border border-white/20">
                {member.code}
              </span>
            </div>

            {/* Member Details */}
            <div className="flex-1 min-w-0 text-left">
              <h4 className="font-extrabold text-lg text-white truncate">{member.name}</h4>
              <p className="text-xs text-emerald-400 font-semibold">{member.plan_name}</p>
              
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                
                {/* Days remaining badge */}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {member.daysRemaining > 0 
                      ? `${member.daysRemaining} days left` 
                      : `${Math.abs(member.daysRemaining)} days overdue`}
                  </span>
                </div>

                {/* Loyalty points balance */}
                <div className="flex items-center gap-1 font-semibold text-amber-300">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{member.loyalty_points} Loyalty pts (₹{member.loyalty_points})</span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Action Button Strip */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          
          {isRed && (
            <button
              onClick={() => {
                onClose();
                if (onRenewClick && member) onRenewClick(member);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 font-bold text-white shadow-lg shadow-rose-600/30 transition-all text-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Dues & Renew Now</span>
            </button>
          )}

          {isYellow && (
            <button
              onClick={() => {
                onClose();
                if (onRenewClick && member) onRenewClick(member);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all text-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Renewal Today</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`px-5 py-3 rounded-xl font-bold transition-all text-sm ${
              isGreen || isBlue
                ? 'w-full bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-black/20'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span>{isGreen || isBlue ? 'Done (Next Member)' : 'Dismiss'}</span>
          </button>

        </div>

      </div>
    </div>
  );
}

