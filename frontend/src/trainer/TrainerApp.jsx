import React, { useState } from 'react';
import { useTrainerAuth } from './TrainerAuthContext';
import ClientRosterTab from './tabs/ClientRosterTab';
import PtPunchInTab from './tabs/PtPunchInTab';
import EarningsDashboardTab from './tabs/EarningsDashboardTab';
import WorkoutDietBuilderTab from './tabs/WorkoutDietBuilderTab';
import PwaInstallButton from '../components/PwaInstallButton';
import { Building2, LogOut } from 'lucide-react';

export default function TrainerApp({ onLogout }) {
  const { trainer, logout } = useTrainerAuth();
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'punchin' | 'earnings' | 'builder'
  const [ptTargetMember, setPtTargetMember] = useState(null);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  const handleSelectMemberForPt = (member) => {
    setPtTargetMember(member);
    setActiveTab('punchin');
  };

  const navItems = [
    { id: 'roster', label: 'Roster & Floor', icon: '📋', badge: null },
    { id: 'punchin', label: 'PT Punch-In', icon: '⚡', badge: 'Anti-Fraud' },
    { id: 'earnings', label: 'Earnings & Comm.', icon: '💰', badge: null },
    { id: 'builder', label: 'Program Builder', icon: '🏋️', badge: '1-Click' }
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-28 sm:pb-12">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Left: Branding & Facility Switcher */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              🏋️
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white uppercase">
                  HEALTHYHOWLZ
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  App 3 • Floor Coach
                </span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider">
                COACH OPERATING SYSTEM
              </div>
            </div>

            {/* Fixed Assigned Facility Badge (Trainers belong to their gym; managed from admin) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs shadow-sm">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-slate-200 truncate max-w-[130px] sm:max-w-[190px]">
                  {trainer?.gym_name || 'HealthyHowlz Facility'}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {trainer?.gym_city ? `${trainer.gym_city} Branch` : 'Assigned Branch'}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                  activeTab === item.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && activeTab !== item.id && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right: Active Coach Badge, PWA Install & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Coach Profile Badge */}
            <div className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30">
                {trainer?.name ? trainer.name.charAt(0) : '🏋️'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-200 text-xs leading-none">
                  {trainer?.name || 'Assigned Coach'}
                </div>
                <div className="text-[10px] text-teal-400 font-medium leading-none mt-0.5">
                  Floor Coach
                </div>
              </div>
            </div>

            {/* PWA Install Button */}
            <PwaInstallButton compact={true} variant="navbar" />

            {/* Clean Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all active:scale-95"
              title="Sign Out of Trainer Workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {activeTab === 'roster' && (
          <ClientRosterTab
            trainer={trainer}
            onSelectForPt={handleSelectMemberForPt}
          />
        )}

        {activeTab === 'punchin' && (
          <PtPunchInTab
            trainer={trainer}
            preselectedMember={ptTargetMember}
            onSessionVerified={() => {}}
          />
        )}

        {activeTab === 'earnings' && (
          <EarningsDashboardTab
            trainer={trainer}
          />
        )}

        {activeTab === 'builder' && (
          <WorkoutDietBuilderTab
            trainer={trainer}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c121e]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 pb-3.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-emerald-400 font-bold bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label.split(' ')[0]}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <footer className="no-print border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Elite Fitness Center Gudiyatham • App 3: Floor Coach & Trainer Operating Hub</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToAdmin}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 text-xs"
            >
              Admin Portal →
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={onSwitchToClient}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 text-xs"
            >
              Client Member App →
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
