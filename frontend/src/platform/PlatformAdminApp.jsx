import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, ShieldCheck, TrendingUp, Users, CheckCircle,
  AlertTriangle, RefreshCw, ExternalLink, Sliders, Smartphone, Check,
  X, DollarSign, Activity, MapPin, Phone, Mail, Award, Lock, ArrowUpRight, LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { useTenant } from '../context/TenantContext';
import PwaInstallButton from '../components/PwaInstallButton';

export default function PlatformAdminApp({ onLogout, onSwitchToAdmin, onSwitchToClient, onSwitchToTrainer }) {
  const { switchGym } = useTenant();
  const [stats, setStats] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [newGymData, setNewGymData] = useState({
    name: '',
    city: 'Vellore',
    address: '',
    owner_name: 'Karthik Raja',
    phone: '+91 98401 23456',
    email: 'karthik@healthyhowlz.com',
    gstin: '33AAAAE1234M1Z5',
    subscription_tier: 'pro_growth',
    monthly_fee: 2499,
    kiosk_pin: '1234',
    status: 'active'
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      const res = await api.getPlatformStats();
      if (res && res.platform) {
        setStats(res.platform);
        setGyms(res.gyms || []);
        setOwners(res.owners || []);
      }
    } catch (err) {
      console.error('Failed to load platform data:', err);
      showNotification('Failed to connect to SaaS platform backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // Handle Launch into specific gym
  const handleLaunchGym = (gymId) => {
    switchGym(gymId);
    if (onSwitchToAdmin) {
      onSwitchToAdmin();
    }
  };

  // Toggle gym status
  const handleToggleStatus = async (gym) => {
    const nextStatus = gym.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateGymStatus(gym.id, nextStatus);
      showNotification(`${gym.name} marked as ${nextStatus.toUpperCase()}`);
      loadPlatformData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Handle new gym provisioning
  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    if (!newGymData.name || !newGymData.owner_name) {
      alert('Please fill in Gym Name and Owner Name');
      return;
    }

    try {
      setProvisionLoading(true);
      await api.provisionGym(newGymData);
      showNotification(`Successfully provisioned ${newGymData.name}!`);
      setIsProvisionOpen(false);
      setNewGymData({
        name: '',
        city: 'Vellore',
        address: '',
        owner_name: 'Karthik Raja',
        phone: '+91 98401 23456',
        email: 'karthik@healthyhowlz.com',
        gstin: '33AAAAE1234M1Z5',
        subscription_tier: 'pro_growth',
        monthly_fee: 2499,
        kiosk_pin: '1234',
        status: 'active'
      });
      loadPlatformData();
    } catch (err) {
      alert('Error provisioning gym: ' + err.message);
    } finally {
      setProvisionLoading(false);
    }
  };

  // Filter gyms
  const filteredGyms = gyms.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top ${
          notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main SaaS Platform HQ Navbar */}
      <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center">
                <span className="text-xl">🐺</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider text-white">HEALTHYHOWLZ</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  HQ COMMAND
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Multi-Tenant SaaS Central Management Console
              </p>
            </div>
          </div>

          {/* Action Tools & Switchers */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PwaInstallButton compact={false} variant="navbar" />

            <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

            {/* Quick Portal Switcher Pills */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <button
                onClick={onSwitchToAdmin}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Open Gym Admin / Owner OS (App 1)"
              >
                <span>🏢</span>
                <span>Gym Admin</span>
              </button>
              <button
                onClick={onSwitchToTrainer}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Open Trainer App (App 3)"
              >
                <span>🏋️</span>
                <span>Trainer App</span>
              </button>
              <button
                onClick={onSwitchToClient}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Open Member Pass PWA (App 2)"
              >
                <span>📱</span>
                <span>Client Pass</span>
              </button>
            </div>

            <button
              onClick={loadPlatformData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Platform Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all active:scale-95"
                title="Sign Out of Platform HQ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main SaaS Platform Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero SaaS Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Gyms */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Gym Tenants</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.totalGyms || gyms.length}
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>{stats?.activeGyms || 4} Active Facilities</span>
            </div>
          </div>

          {/* 2. SaaS MRR */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Platform SaaS MRR</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              ₹{(stats?.totalMRR || 15895).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-medium">
              Monthly Subscription Revenue
            </div>
          </div>

          {/* 3. Total Members Across Gyms */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Platform Members</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.totalPlatformMembers || 16}+
            </div>
            <div className="mt-2 text-[11px] text-blue-400 font-medium">
              Across all tenant locations
            </div>
          </div>

          {/* 4. Multi-Branch Owners */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">SaaS Gym Owners</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats?.totalOwners || 3} Owners
            </div>
            <div className="mt-2 text-[11px] text-amber-400 font-medium truncate">
              Karthik Raja: 3 Gym Branches
            </div>
          </div>
        </section>

        {/* Multi-Gym Architecture Showcase Banner */}
        <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                MULTI-TENANCY ACTIVE
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">One Gym Owner — Multiple Gym Branches</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Owner <span className="font-bold text-white">Karthik Raja</span> owns and manages{' '}
              <span className="text-emerald-400 font-bold">3 connected facilities</span> (Gudiyatham HQ, Vellore East Club, Chennai Anna Nagar Arena).
              Switching branch from the top header automatically scopes member records, revenue, invoices, and floor coaches.
            </p>
          </div>
          <button
            onClick={() => setIsProvisionOpen(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Onboard New Gym</span>
          </button>
        </section>

        {/* Gym Tenants Directory Table */}
        <section className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gyms by name, city, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {['all', 'active', 'trial', 'suspended'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Gyms Table Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Gym Facility & City</th>
                    <th className="py-3.5 px-4">Owner & Contact</th>
                    <th className="py-3.5 px-4">Plan Tier</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4">Members</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGyms.map((gym) => {
                    const isKarthik = gym.owner_id === 'staff-owner';
                    return (
                      <tr key={gym.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Gym Name & City */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{gym.name}</span>
                                {isKarthik && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                                    Multi-Branch
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {gym.city}, {gym.state || 'Tamil Nadu'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner & Phone */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-200">{gym.owner_name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {gym.phone || '+91 98401 23456'}
                          </div>
                        </td>

                        {/* Plan Tier */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            gym.subscription_tier === 'enterprise'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : gym.subscription_tier === 'pro_growth'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}>
                            {gym.subscription_tier?.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Monthly Fee */}
                        <td className="py-4 px-4">
                          <span className="font-black text-slate-100 font-mono">
                            ₹{Number(gym.monthly_fee).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-500 block">/month</span>
                        </td>

                        {/* Members Count */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>{gym.total_members || 0}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleStatus(gym)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                              gym.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                                : gym.status === 'trial'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40'
                            }`}
                            title="Click to toggle status"
                          >
                            {gym.status}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleLaunchGym(gym.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm shadow-emerald-500/20"
                              title="Launch into Gym Admin Console"
                            >
                              <span>Launch OS</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SaaS Subscription Plans Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">HealthyHowlz SaaS Subscription Tiers</h3>
              <p className="text-xs text-slate-400">Available billing plans for new gym tenants</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Starter Tier */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Starter Tier</span>
                <span className="text-xs font-mono text-slate-400">1 Facility</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">₹899 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-400 mt-1">For single location gyms starting up</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to 150 members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Reception QR Kiosk Scanner</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic Member PWA App</span>
                </li>
              </ul>
            </div>

            {/* 2. Pro Growth Tier (Most Popular) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 space-y-4 relative">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                MOST POPULAR
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pro Growth Tier</span>
                <span className="text-xs font-mono text-slate-400">Multi-Coach</span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">₹2,499 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-400 mt-1">High-volume clubs & performance centers</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited active members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Trainer App 3 & Anti-Fraud PT PIN</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>POS Retail & Owner Expenses P&L</span>
                </li>
              </ul>
            </div>

            {/* 3. Enterprise Tier */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Enterprise Chain</span>
                <span className="text-xs font-mono text-slate-400">Unlimited Multi-Gym</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">₹4,999 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-400 mt-1">Gym chains with multi-branch cross access</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Multi-Facility Branch Switcher</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Cross-gym member check-in roaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Consolidated HQ profit & loss analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Provision New Gym Tenant Modal */}
      {isProvisionOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative my-8">
            <button
              onClick={() => setIsProvisionOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Provision New Gym Tenant</h3>
                <p className="text-xs text-slate-400">Instantly deploy a new facility into HealthyHowlz</p>
              </div>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Gym Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HealthyHowlz Arena — Salem West"
                  value={newGymData.name}
                  onChange={(e) => setNewGymData({ ...newGymData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salem"
                    value={newGymData.city}
                    onChange={(e) => setNewGymData({ ...newGymData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karthik Raja"
                    value={newGymData.owner_name}
                    onChange={(e) => setNewGymData({ ...newGymData, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Phone</label>
                  <input
                    type="text"
                    value={newGymData.phone}
                    onChange={(e) => setNewGymData({ ...newGymData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={newGymData.email}
                    onChange={(e) => setNewGymData({ ...newGymData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subscription Tier</label>
                  <select
                    value={newGymData.subscription_tier}
                    onChange={(e) => {
                      const tier = e.target.value;
                      const fee = tier === 'starter' ? 899 : tier === 'enterprise' ? 4999 : 2499;
                      setNewGymData({ ...newGymData, subscription_tier: tier, monthly_fee: fee });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="starter">Starter (₹899/mo)</option>
                    <option value="pro_growth">Pro Growth (₹2,499/mo)</option>
                    <option value="enterprise">Enterprise (₹4,999/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly SaaS Fee (₹)</label>
                  <input
                    type="number"
                    value={newGymData.monthly_fee}
                    onChange={(e) => setNewGymData({ ...newGymData, monthly_fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Facility Address</label>
                <input
                  type="text"
                  placeholder="e.g. 45, Omalur Main Road, Salem"
                  value={newGymData.address}
                  onChange={(e) => setNewGymData({ ...newGymData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisionLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {provisionLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Deploy Gym</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="border-t border-slate-800/80 py-5 px-6 text-center text-xs text-slate-500">
        <p>© 2026 HealthyHowlz Fitness OS • Multi-Tenant SaaS Cloud Platform • Powered by SQLite WAL</p>
      </footer>
    </div>
  );
}

