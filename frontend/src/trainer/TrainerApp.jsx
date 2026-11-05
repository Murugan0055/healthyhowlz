import React, { useState } from 'react';
import { useTrainerAuth, DEMO_TRAINERS } from './TrainerAuthContext';
import ClientRosterTab from './tabs/ClientRosterTab';
import PtPunchInTab from './tabs/PtPunchInTab';
import EarningsDashboardTab from './tabs/EarningsDashboardTab';
import WorkoutDietBuilderTab from './tabs/WorkoutDietBuilderTab';

export default function TrainerApp({ onSwitchToAdmin, onSwitchToClient }) {
  const { trainer, switchTrainer, logout } = useTrainerAuth();
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'punchin' | 'earnings' | 'builder'
  const [ptTargetMember, setPtTargetMember] = useState(null);
  const [isTrainerMenuOpen, setIsTrainerMenuOpen] = useState(false);

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
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              🏋️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white uppercase">
                  Elite Fitness Club
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  App 3 • Floor Coach
                </span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider">
                GUDIYATHAM • ZERO-HARDWARE SYSTEM
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsTrainerMenuOpen(false);
                }}
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

          {/* Right: Active Trainer Switcher & Portals */}
          <div className="flex items-center gap-2">
            
            {/* Quick Demo Trainer Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTrainerMenuOpen(!isTrainerMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 transition-all text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {trainer.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-slate-200 text-xs leading-none">
                    {trainer.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono leading-none mt-0.5">
                    PIN: {trainer.security_pin || trainer.pin || '5555'}
                  </div>
                </div>
                <span className="text-slate-500 text-[10px]">▼</span>
              </button>

              {isTrainerMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0e1626] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">
                    Switch Active Coach
                  </div>
                  {DEMO_TRAINERS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTrainer(t);
                        setIsTrainerMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                        trainer.id === t.id
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{t.name}</div>
                        <div className="text-[10px] text-slate-400">{t.tagline}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {t.pin}
                      </span>
                    </button>
                  ))}

                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between px-1 text-xs">
                    <button
                      onClick={logout}
                      className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Portal Switcher Dropdown / Buttons */}
            <button
              onClick={onSwitchToAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-all"
              title="Open Admin & Owner Portal"
            >
              <span>🏢</span>
              <span>Admin Portal</span>
            </button>

            <button
              onClick={onSwitchToClient}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-all"
              title="Open Client Member App"
            >
              <span>📱</span>
              <span>Client App</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main Tab Content */}
      <main onClick={() => setIsTrainerMenuOpen(false)} className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
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
