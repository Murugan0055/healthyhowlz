import React, { useState, useEffect } from 'react';
import { 
  Menu,
  X,
  Dumbbell, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Kanban, 
  AlertTriangle, 
  ShoppingBag, 
  FileText, 
  Settings, 
  Activity,
  KeyRound,
  LogOut,
  Crown,
  UserCheck,
  DollarSign,
  Smartphone,
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import GymSwitcher from './GymSwitcher';
import PwaInstallButton from './PwaInstallButton';

export default function Navbar({ activeTab, setActiveTab, onOpenManualCheckin, onSwitchToClient, onSwitchToTrainer, onSwitchToPlatform }) {
  const { user, logout, isSuperAdmin, isOwner, isManager } = useAuth();
  const { currentGymId, currentGym } = useTenant();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rush, setRush] = useState({ count: 4, level: 'Light', badgeColor: 'emerald' });

  const fetchRush = async () => {
    try {
      const data = await api.getFloorRush();
      setRush(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchRush();
    const interval = setInterval(fetchRush, 15000); // 15s polling
    return () => clearInterval(interval);
  }, [currentGymId]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navGroups = [
    {
      group: 'Front Desk Operations',
      items: [
        { id: 'kiosk', label: 'Reception Tablet Desk', icon: Dumbbell, desc: 'On-demand QR scan & manual check-in' },
        { id: 'members', label: 'Members Directory', icon: Users, desc: 'Directory, freeze & renewals' },
        { id: 'expiry', label: 'Expiry Alerts', icon: AlertTriangle, desc: 'Grace periods & WhatsApp alerts' },
        { id: 'pos', label: 'Retail & Lockers', icon: ShoppingBag, desc: 'Supplements POS & locker grid' }
      ]
    },
    {
      group: 'Financial & Business Command',
      items: [
        { id: 'dashboard', label: 'Revenue Intel', icon: TrendingUp, desc: 'Real-time sales & cash reconciliation' },
        { id: 'expenses', label: 'Income & Expense (P&L)', icon: DollarSign, desc: 'Overhead costs & net profit margin' },
        { id: 'invoices', label: 'Tax Invoices (GST)', icon: FileText, desc: '18% GST receipts & B2B compliance' },
        { id: 'crm', label: 'Sales CRM Pipeline', icon: Kanban, desc: 'Lead stages & trial guest passes' }
      ]
    },
    {
      group: 'Administration & System',
      items: [
        ...(isManager ? [{ id: 'users', label: 'Staff & Roles', icon: UserCheck, desc: 'Access permissions & sales bonuses' }] : []),
        { id: 'settings', label: 'Gym Facility Settings', icon: Settings, desc: 'Pricing plans, GSTIN & kiosk rules' }
      ]
    }
  ];

  const getRushColorClass = () => {
    if (rush.level === 'Peak Rush') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (rush.level === 'Moderate') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="text-purple-400 font-bold flex items-center gap-1"><Crown className="w-2.5 h-2.5" /> Super Admin</span>;
      case 'owner':
        return <span className="text-emerald-400 font-bold">Owner</span>;
      case 'manager':
        return <span className="text-blue-400 font-bold">Manager</span>;
      default:
        return <span className="text-amber-400 font-bold">Admin</span>;
    }
  };

  const handleLogout = () => {
    if (window.confirm('Sign out of the Elite Gym Operating Platform?')) {
      logout();
    }
  };

  const activeItemLabel = navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Reception Tablet Desk';

  return (
    <>
      {/* Top Production-Ready Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0c121d]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Hamburger Menu Button + Facility Branding */}
          <div className="flex items-center gap-3">
            {/* Hamburger Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700/80 transition-all active:scale-95 flex items-center justify-center gap-2 group shadow-sm"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline-block text-xs font-bold uppercase tracking-wider text-slate-300">
                Menu
              </span>
            </button>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
                <span className="text-lg">🐺</span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight brand-font text-white">
                    HEALTHYHOWLZ
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {currentGym?.city ? `${currentGym.city} Facility` : 'Facility OS'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="text-slate-500">View:</span>
                  <span className="text-emerald-400 font-semibold">{activeItemLabel}</span>
                </div>
              </div>
            </div>

            {/* Multi-Tenant Gym Facility Switcher */}
            <GymSwitcher onNavigatePlatform={onSwitchToPlatform} />
          </div>

          {/* Right Header Controls: PWA Install + Floor Rush + Switch to Member App + User Pill + Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* PWA Install Button */}
            <PwaInstallButton compact={false} variant="navbar" />

            {/* Live Floor Rush Pill */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${getRushColorClass()}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              <Activity className="w-3.5 h-3.5" />
              <span>Floor: {rush.count} Active ({rush.level})</span>
            </div>

            {/* Direct Switch to Member App Button (NO PWA text) */}
            {onSwitchToClient && (
              <button
                onClick={onSwitchToClient}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition shadow-sm active:scale-95"
                title="Open Client Member App"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Member App</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-200">{user?.name || 'Staff Officer'}</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider">{getRoleBadge(user?.role)}</p>
              </div>

              {/* Master PIN Override shortcut */}
              <button 
                onClick={onOpenManualCheckin}
                title="Master PIN Override"
                className="ml-1 p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-emerald-300 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Slide-Over Drawer Navigation (Hamburger Menu) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content Panel */}
          <div className="relative w-full max-w-sm bg-[#0d131f] border-r border-slate-800 shadow-2xl flex flex-col justify-between z-10 animate-slideRight">
            
            {/* Drawer Top Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-[#111927]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                  <span className="text-xl">🐺</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-white brand-font tracking-wide">
                    HEALTHYHOWLZ
                  </h2>
                  <p className="text-[11px] text-emerald-400 font-medium">Multi-Tenant Fitness OS</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation Groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Direct Ecosystem Switcher at top of Drawer (Only for Super Admin) */}
              {isSuperAdmin && onSwitchToPlatform && (
                <div className="space-y-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center justify-between px-3 py-0.5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                      SaaS HQ Navigation
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      onSwitchToPlatform();
                      setIsDrawerOpen(false);
                    }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 text-purple-300 flex items-center justify-between hover:bg-purple-900/40 transition shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                        🐺
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-white">HealthyHowlz HQ Command</p>
                        <p className="text-[10px] text-purple-300">SaaS Platform Admin & All Gyms</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                  </button>
                </div>
              )}

              {/* PWA Install Button inside Drawer */}
              <div className="pb-2 border-b border-slate-800/60">
                <PwaInstallButton compact={false} variant="drawer" />
              </div>

              {navGroups.map((grp, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1">
                    {grp.group}
                  </h3>
                  <div className="space-y-1">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsDrawerOpen(false);
                          }}
                          className={`w-full p-3 rounded-2xl transition flex items-center justify-between text-left group ${
                            isActive
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                              : 'text-slate-300 hover:text-white hover:bg-[#162132]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-xs ${isActive ? 'font-black' : 'font-semibold'}`}>
                                {item.label}
                              </p>
                              <p className={`text-[10px] ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Bottom Footer Profile */}
            <div className="p-4 border-t border-slate-800/80 bg-[#111927] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
                  <p className="text-[10px] uppercase text-emerald-400 font-semibold">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
