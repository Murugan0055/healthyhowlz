import React, { useState, useRef, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';
import { Building2, ChevronDown, Check, Sparkles, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

export default function GymSwitcher({ onNavigatePlatform }) {
  const { currentGym, currentGymId, availableGyms, switchGym } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectGym = (gymId) => {
    if (gymId !== currentGymId) {
      switchGym(gymId);
    }
    setIsOpen(false);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'pro_growth':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'starter':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  const displayName = currentGym?.name || 'HealthyHowlz Fitness OS';
  const displayCity = currentGym?.city || 'Gudiyatham';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Switcher Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-800/90 transition-all text-xs text-slate-200 group shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
        title="Switch Gym Facility / Branch"
      >
        <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="font-semibold text-slate-200 truncate max-w-[130px] sm:max-w-[180px]">
            {displayName}
          </span>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />
            {displayCity} • Branch Switcher
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0f172a] border border-slate-700/90 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Select Gym Facility ({availableGyms.length})
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                Multi-Tenant
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Switching facility reloads members, check-ins, finances, and floor operations for that location.
            </p>
          </div>

          {/* List of Accessible Gyms */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1.5">
            {availableGyms.map((g) => {
              const isSelected = g.id === currentGymId;
              return (
                <button
                  key={g.id}
                  onClick={() => handleSelectGym(g.id)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                    isSelected
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-white'
                      : 'hover:bg-slate-800/70 text-slate-300'
                  }`}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Building2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate text-slate-100">
                        {g.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-500" />
                        {g.city}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase ${getTierColor(g.subscription_tier)}`}>
                        {g.subscription_tier?.replace('_', ' ')}
                      </span>
                      {g.total_members !== undefined && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          👥 {g.total_members}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Platform Super Admin Shortcut Footer */}
          {onNavigatePlatform && (
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>HealthyHowlz Platform</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigatePlatform();
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 hover:underline"
              >
                <span>HQ Platform Manager</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

