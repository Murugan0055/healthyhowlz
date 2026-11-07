import React from 'react';
import { ShieldAlert, ArrowLeft, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function SupportModeBanner() {
  const isImpersonated = sessionStorage.getItem('healthyhowlz_support_mode') === 'true';
  const targetGymName = sessionStorage.getItem('healthyhowlz_support_gym_name') || 'Facility';
  const targetOwnerName = sessionStorage.getItem('healthyhowlz_support_owner_name') || 'Owner';

  if (!isImpersonated) return null;

  const handleExitSupport = async () => {
    try {
      await api.exitImpersonation();
    } catch (e) {
      // Ignore background log error
    }

    // Restore original Super Admin session
    const originalToken = sessionStorage.getItem('healthyhowlz_support_original_token');
    const originalUser = sessionStorage.getItem('healthyhowlz_support_original_user');

    if (originalToken) {
      localStorage.setItem('elite_gym_auth_token', originalToken);
    }
    if (originalUser) {
      localStorage.setItem('elite_gym_user', originalUser);
    }

    // Clean up support session storage
    sessionStorage.removeItem('healthyhowlz_support_mode');
    sessionStorage.removeItem('healthyhowlz_support_original_token');
    sessionStorage.removeItem('healthyhowlz_support_original_user');
    sessionStorage.removeItem('healthyhowlz_support_gym_name');
    sessionStorage.removeItem('healthyhowlz_support_owner_name');

    // Return to HQ Command Dashboard
    window.location.href = '/';
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-3 sm:px-6 py-2 shadow-lg border-b border-amber-400 flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-top">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-slate-950/20 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-slate-950 animate-bounce" />
        </div>
        <div className="truncate">
          <span className="font-black uppercase tracking-wider text-[11px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full mr-2 shrink-0">
            HQ SUPPORT SESSION
          </span>
          <span className="font-bold">Viewing facility as </span>
          <span className="font-black underline decoration-slate-950/40">{targetOwnerName}</span>
          <span className="hidden sm:inline text-slate-900/80 font-medium"> ({targetGymName})</span>
        </div>
      </div>

      <button
        onClick={handleExitSupport}
        className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-md"
        title="Exit Support Mode and Return to HealthyHowlz HQ"
      >
        <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
        <span>Exit Support Mode</span>
      </button>
    </div>
  );
}

