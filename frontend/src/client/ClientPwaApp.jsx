import React, { useState } from 'react';
import { 
  QrCode, 
  Dumbbell, 
  UtensilsCrossed, 
  Wallet, 
  Building2, 
  LogOut, 
  User, 
  ShieldCheck,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useMemberAuth } from './MemberAuthContext';
import DynamicQrPass from './DynamicQrPass';
import WorkoutLogger from './WorkoutLogger';
import DietMealTracker from './DietMealTracker';
import LoyaltyWallet from './LoyaltyWallet';
import ClubFloorRush from './ClubFloorRush';
import PwaInstallButton from '../components/PwaInstallButton';

export default function ClientPwaApp({ onLogout }) {
  const { member, logout } = useMemberAuth();
  const [activeTab, setActiveTab] = useState('pass');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  const navTabs = [
    { id: 'pass', label: 'QR Pass', icon: QrCode },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'diet', label: 'Nutrition', icon: UtensilsCrossed },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'club', label: 'Club', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Centered Mobile Container Wrapper for Responsive Viewports */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-[#0b0f17] border-x border-slate-800/80 shadow-2xl relative">
        
        {/* Top Production-Ready Header Bar */}
        <header className="sticky top-0 z-40 bg-[#0c121d]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-md">
          {/* Gym Brand Snip */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <span className="text-base">🐺</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide text-white brand-font leading-tight">
                HEALTHYHOWLZ
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">Member Digital Pass</p>
            </div>
          </div>

          {/* Member Profile Avatar, PWA Install & Sign Out */}
          <div className="flex items-center gap-2 relative">
            <PwaInstallButton compact={true} variant="navbar" />

            <button
              onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-full py-1 px-2.5 transition active:scale-95 shadow-sm"
              title="View Member Account"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 flex items-center justify-center text-[10px] font-bold">
                {member?.name ? member.name.charAt(0) : 'M'}
              </div>
              <span className="text-xs font-bold text-slate-200 max-w-[85px] truncate">
                {member?.name?.split(' ')[0] || 'Member'}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                {member?.member_code || 'PASS'}
              </span>
            </button>

            {/* Member Account Drawer Modal */}
            {showMemberDropdown && (
              <div className="absolute right-0 top-12 z-50 w-72 bg-[#121927] border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-3 animate-fadeIn">
                <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold text-white">{member?.name || 'Active Member'}</h3>
                    <p className="text-[10px] font-mono text-emerald-400">{member?.member_code || 'ID: --'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {member?.status || 'Active'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Plan:</span>
                    <span className="font-semibold text-white truncate max-w-[140px]">{member?.plan_title || 'Active Plan'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Facility:</span>
                    <span className="font-semibold text-emerald-400 truncate max-w-[140px]">{member?.gym_name || 'HealthyHowlz Gym'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Days Remaining:</span>
                    <span className="font-mono font-bold text-emerald-300">{member?.days_left ?? '--'} days</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowMemberDropdown(false);
                    handleLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Member App</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content View Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'pass' && <DynamicQrPass />}
          {activeTab === 'workout' && <WorkoutLogger />}
          {activeTab === 'diet' && <DietMealTracker />}
          {activeTab === 'wallet' && <LoyaltyWallet />}
          {activeTab === 'club' && <ClubFloorRush />}
        </main>

        {/* Mobile Bottom Navigation Bar (PWA Style) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f1622]/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around max-w-md mx-auto shadow-2xl">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all relative ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2 w-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]" />
                )}
                <div className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Spacing Pad */}
        <div className="h-16 w-full" />

      </div>
    </div>
  );
}
