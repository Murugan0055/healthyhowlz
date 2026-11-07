import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { api } from '../services/api';

export default function GlobalBroadcastBanner() {
  const [broadcast, setBroadcast] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBroadcast = async () => {
      try {
        const broadcasts = await api.getActiveBroadcasts();
        if (isMounted && broadcasts && broadcasts.length > 0) {
          const active = broadcasts[0];
          const dismissedId = sessionStorage.getItem(`dismissed_bc_${active.id}`);
          if (!dismissedId) {
            setBroadcast(active);
          }
        }
      } catch (e) {
        // Silently ignore if offline
      }
    };

    fetchBroadcast();
    const interval = setInterval(fetchBroadcast, 60000); // Check every minute
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!broadcast || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(`dismissed_bc_${broadcast.id}`, 'true');
    setDismissed(true);
  };

  const isCritical = broadcast.severity === 'critical';
  const isWarning = broadcast.severity === 'warning';

  const containerClasses = isCritical
    ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-rose-500/50 text-rose-100'
    : isWarning
    ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-500/50 text-amber-100'
    : 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-blue-500/50 text-blue-100';

  const badgeClasses = isCritical
    ? 'bg-rose-500 text-white'
    : isWarning
    ? 'bg-amber-500 text-slate-950'
    : 'bg-blue-500 text-white';

  return (
    <div className={`relative border-b px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top ${containerClasses}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0">
          {isCritical ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <Info className="w-4 h-4 text-blue-400" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClasses}`}>
            {broadcast.severity === 'critical' ? 'CRITICAL ALERT' : broadcast.severity === 'warning' ? 'IMPORTANT NOTICE' : 'HQ ANNOUNCEMENT'}
          </span>
          <span className="font-bold text-white">{broadcast.title}:</span>
          <span className="text-slate-300 font-medium truncate">{broadcast.message}</span>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
        title="Dismiss Notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

