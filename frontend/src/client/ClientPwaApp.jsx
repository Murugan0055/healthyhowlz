import React, { useState } from 'react';
import { 
  QrCode, 
  Dumbbell, 
  UtensilsCrossed, 
  Wallet, 
  Building2, 
  LogOut, 
  User, 
  ArrowLeftRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useMemberAuth, DEMO_MEMBERS } from './MemberAuthContext';
import DynamicQrPass from './DynamicQrPass';
import WorkoutLogger from './WorkoutLogger';
import DietMealTracker from './DietMealTracker';
import LoyaltyWallet from './LoyaltyWallet';
import ClubFloorRush from './ClubFloorRush';

export default function ClientPwaApp({ onSwitchToAdmin, onSwitchToTrainer }) {
  const { member, logout, switchDemoMember } = useMemberAuth();
  const [activeTab, setActiveTab] = useState('pass');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

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
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide text-white brand-font leading-tight">
                ELITE FITNESS CLUB
              </h1>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">Gudiyatham Member App</p>
            </div>
          </div>

          {/* Member Profile Avatar & Demo Switcher */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-full py-1 px-2.5 transition active:scale-95 shadow-sm"
              title="Switch Member Profile"
            >
              <img
                src={member?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={member?.name}
                className="w-5 h-5 rounded-full object-cover border border-emerald-400"
              />
              <span className="text-xs font-bold text-slate-200 max-w-[85px] truncate">
                {member?.name?.split(' ')[0] || 'Vignesh'}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                {member?.member_code || 'EG-1001'}
              </span>
            </button>

            {/* Portal Switcher Button (Switch to Admin Portal) */}
            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 active:scale-95"
                title="Switch to Admin & Owner Portal"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Member Switcher Dropdown */}
            {showMemberDropdown && (
              <div className="absolute right-0 top-12 z-50 w-64 bg-[#121927] border border-slate-700 rounded-2xl p-2.5 shadow-2xl space-y-2 animate-fadeIn">
                <div className="px-2 py-1 border-b border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Switch Demo Member</span>
                </div>
                {DEMO_MEMBERS.map((demo) => (
                  <button
                    key={demo.memberCode}
                    onClick={() => {
                      switchDemoMember(demo);
                      setShowMemberDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between text-xs ${
                      member?.member_code === demo.memberCode
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{demo.name}</p>
                      <p className="text-[10px] text-slate-400">{demo.memberCode}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">
                      PIN: {demo.pin}
                    </span>
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-800 space-y-1">
                  {onSwitchToTrainer && (
                    <button
                      onClick={() => {
                        setShowMemberDropdown(false);
                        onSwitchToTrainer();
                      }}
                      className="w-full text-left p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold flex items-center gap-2"
                    >
                      <span>🏋️</span>
                      <span>Trainer & Floor Coach Portal</span>
                    </button>
                  )}
                  {onSwitchToAdmin && (
                    <button
                      onClick={() => {
                        setShowMemberDropdown(false);
                        onSwitchToAdmin();
                      }}
                      className="w-full text-left p-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center gap-2"
                    >
                      <span>🏢</span>
                      <span>Admin & Owner Engine</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowMemberDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
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
                className={`flex-1 py-1 px-1 flex flex-col items-center justify-center transition select-none relative ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-emerald-500/15' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                </div>
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -bottom-1" />
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}

