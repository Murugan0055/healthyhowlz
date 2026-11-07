import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, ShieldCheck, TrendingUp, Users, CheckCircle,
  AlertTriangle, RefreshCw, ExternalLink, Sliders, Smartphone, Check,
  X, DollarSign, Activity, MapPin, Phone, Mail, Award, Lock, ArrowUpRight, LogOut,
  Edit3, Trash2, Archive, Globe, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useTenant } from '../context/TenantContext';
import PwaInstallButton from '../components/PwaInstallButton';

export default function PlatformAdminApp({ onLogout, onLaunchGym }) {
  const { switchGym } = useTenant();
  const [stats, setStats] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [newGymData, setNewGymData] = useState({
    name: '',
    slug: '',
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

  // Edit Gym state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    owner_name: '',
    owner_id: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    gstin: '',
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
  const handleLaunchGym = (gym) => {
    switchGym(gym.id);
    const gymPath = `/${gym.slug || gym.id}`;
    if (onLaunchGym) {
      onLaunchGym(gym);
    } else {
      window.history.pushState({}, '', gymPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Status Change / Soft Delete handler
  const handleStatusChange = async (gymId, nextStatus) => {
    try {
      await api.updateGymStatus(gymId, nextStatus);
      const actionLabel = nextStatus === 'inactive' ? 'Soft-deleted (Inactive)' : nextStatus.toUpperCase();
      showNotification(`Gym status changed to ${actionLabel}`);
      loadPlatformData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Quick Soft-Delete action
  const handleSoftDelete = async (gym) => {
    const confirmDelete = window.confirm(
      `Soft Delete Facility: Are you sure you want to soft-delete "${gym.name}"?\n\nThe status will be set to Inactive, and historical records will remain safe in the database.`
    );
    if (!confirmDelete) return;

    try {
      await api.softDeleteGym(gym.id);
      showNotification(`"${gym.name}" has been soft deleted (status set to Inactive).`);
      loadPlatformData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Open Edit Gym Modal
  const handleOpenEdit = (gym) => {
    setEditingGym(gym);
    setEditFormData({
      name: gym.name || '',
      slug: gym.slug || '',
      owner_name: gym.owner_name || '',
      owner_id: gym.owner_id || '',
      phone: gym.phone || '',
      email: gym.email || '',
      address: gym.address || '',
      city: gym.city || 'Gudiyatham',
      state: gym.state || 'Tamil Nadu',
      pincode: gym.pincode || '',
      gstin: gym.gstin || '',
      subscription_tier: gym.subscription_tier || 'pro_growth',
      monthly_fee: gym.monthly_fee || 2499,
      kiosk_pin: gym.kiosk_pin || '1234',
      status: gym.status || 'active'
    });
    setIsEditOpen(true);
  };

  // Submit Edit Gym
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingGym) return;

    try {
      setEditLoading(true);
      await api.updateGym(editingGym.id, editFormData);
      showNotification(`Successfully updated "${editFormData.name}"`);
      setIsEditOpen(false);
      setEditingGym(null);
      loadPlatformData();
    } catch (err) {
      alert('Error updating gym: ' + err.message);
    } finally {
      setEditLoading(false);
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
        slug: '',
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
      (g.slug && g.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

      {/* Main SaaS Platform HQ Navbar - Cleaned with NO bypass presets */}
      <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
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

          {/* Action Tools (Cleaned - No Cross-App Bypass Links) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PwaInstallButton compact={false} variant="navbar" />

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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        
        {/* Hero SaaS Metric Cards - Responsive grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Total Gyms */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Gym Tenants</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">
              {stats?.totalGyms || gyms.length}
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>{stats?.activeGyms || gyms.filter(g => g.status === 'active').length} Active Facilities</span>
            </div>
          </div>

          {/* 2. SaaS MRR */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Platform SaaS MRR</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-emerald-400">
              ₹{(stats?.totalMRR || 15895).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Monthly Subscription Revenue
            </div>
          </div>

          {/* 3. Total Members Across Gyms */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Platform Members</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">
              {stats?.totalPlatformMembers || 24}+
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-blue-400 font-medium">
              Across all tenant locations
            </div>
          </div>

          {/* 4. Multi-Branch Owners */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">SaaS Gym Owners</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">
              {stats?.totalOwners || 3} Owners
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-amber-400 font-medium truncate">
              Karthik Raja: 3 Gym Branches
            </div>
          </div>
        </section>

        {/* Multi-Gym Architecture Showcase Banner */}
        <section className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                MULTI-TENANCY ARCHITECTURE
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white">One Gym Owner — Multiple Facility Branches</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Owner <span className="font-bold text-white">Karthik Raja</span> manages 3 connected facilities: <span className="text-emerald-400 font-bold">Gudiyatham</span> (<code className="text-xs text-slate-200">/gudiyatham</code>), <span className="text-emerald-400 font-bold">Vellore East</span> (<code className="text-xs text-slate-200">/vellore</code>), and <span className="text-emerald-400 font-bold">Chennai Anna Nagar</span> (<code className="text-xs text-slate-200">/chennai</code>).
            </p>
          </div>
          <button
            onClick={() => setIsProvisionOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Onboard New Gym</span>
          </button>
        </section>

        {/* Gym Tenants Directory Section */}
        <section className="space-y-4">
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gyms by name, slug, city, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter Tabs (Includes Inactive / Soft-deleted) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'trial', label: 'Trial' },
                { id: 'suspended', label: 'Suspended' },
                { id: 'inactive', label: 'Inactive' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                    statusFilter === st.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. DESKTOP VIEW: Sleek Table (Visible on lg screens) */}
          <div className="hidden lg:block rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Gym Facility & Route</th>
                    <th className="py-3.5 px-4">Owner & Contact</th>
                    <th className="py-3.5 px-4">Plan Tier</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4">Members</th>
                    <th className="py-3.5 px-4">Status & State</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGyms.map((gym) => {
                    const isKarthik = gym.owner_id === 'staff-owner';
                    const gymRoute = `/${gym.slug || gym.id}`;
                    return (
                      <tr key={gym.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Gym Name, Slug & City */}
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
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {gym.city}, {gym.state || 'Tamil Nadu'}
                                </span>
                                <span className="text-slate-600">•</span>
                                <code className="text-[10px] text-emerald-400/90 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                  {gymRoute}
                                </code>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Owner & Phone */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-200">{gym.owner_name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <a href={`tel:${gym.phone}`} className="hover:text-emerald-400 transition-colors">
                              {gym.phone || '+91 98401 23456'}
                            </a>
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

                        {/* Status Change Dropdown */}
                        <td className="py-4 px-4">
                          <select
                            value={gym.status}
                            onChange={(e) => handleStatusChange(gym.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${
                              gym.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : gym.status === 'trial'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : gym.status === 'suspended'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            <option value="active" className="bg-slate-900 text-emerald-400">ACTIVE</option>
                            <option value="trial" className="bg-slate-900 text-amber-400">TRIAL</option>
                            <option value="suspended" className="bg-slate-900 text-rose-400">SUSPENDED</option>
                            <option value="inactive" className="bg-slate-900 text-slate-400">INACTIVE (SOFT-DELETED)</option>
                          </select>
                        </td>

                        {/* Actions: Edit, Launch OS, Soft-Delete */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(gym)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                              title="Edit Gym Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(gym)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                              title="Soft Delete Gym"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleLaunchGym(gym)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm shadow-emerald-500/20 ml-1"
                              title={`Launch into ${gym.name}`}
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

          {/* 2. MOBILE & TABLET VIEW: Responsive Gym Cards (Visible on screens < lg) */}
          <div className="block lg:hidden space-y-3">
            {filteredGyms.map((gym) => {
              const isKarthik = gym.owner_id === 'staff-owner';
              const gymRoute = `/${gym.slug || gym.id}`;
              return (
                <div
                  key={`card-${gym.id}`}
                  className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl"
                >
                  {/* Card Header: Icon, Name, Multi-Branch & City */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{gym.name}</span>
                          {isKarthik && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                              Multi-Branch
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {gym.city}, {gym.state || 'Tamil Nadu'}
                        </p>
                      </div>
                    </div>

                    {/* Dedicated URL badge */}
                    <code className="text-[10px] text-emerald-400/90 font-mono bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 shrink-0">
                      {gymRoute}
                    </code>
                  </div>

                  {/* Card Body: Owner & Plan Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 pb-1 border-y border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Owner / Lead</span>
                      <p className="font-bold text-slate-200 truncate">{gym.owner_name}</p>
                      <a href={`tel:${gym.phone}`} className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 hover:text-emerald-400">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{gym.phone || '+91 98401 23456'}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">SaaS Plan / MRR</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-emerald-400">₹{Number(gym.monthly_fee).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-500">/mo</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{gym.total_members || 0} Members</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Status Dropdown & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Status:</span>
                      <select
                        value={gym.status}
                        onChange={(e) => handleStatusChange(gym.id, e.target.value)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none flex-1 sm:flex-initial ${
                          gym.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : gym.status === 'trial'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : gym.status === 'suspended'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="active" className="bg-slate-900 text-emerald-400">ACTIVE</option>
                        <option value="trial" className="bg-slate-900 text-amber-400">TRIAL</option>
                        <option value="suspended" className="bg-slate-900 text-rose-400">SUSPENDED</option>
                        <option value="inactive" className="bg-slate-900 text-slate-400">INACTIVE (SOFT-DELETED)</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleOpenEdit(gym)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleSoftDelete(gym)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Soft Delete Gym"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleLaunchGym(gym)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm shadow-emerald-500/20"
                      >
                        <span>Launch OS</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 space-y-4 relative">
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
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
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

      {/* EDIT GYM MODAL */}
      {isEditOpen && editingGym && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative my-8">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Edit Gym Facility</h3>
                <p className="text-xs text-slate-400">Update tenant parameters, routes, and billing settings</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Custom Route Slug (e.g. salem)</label>
                  <input
                    type="text"
                    required
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.owner_name}
                    onChange={(e) => setEditFormData({ ...editFormData, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Contact Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City / Region</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plan Tier</label>
                  <select
                    value={editFormData.subscription_tier}
                    onChange={(e) => setEditFormData({ ...editFormData, subscription_tier: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro_growth">Pro Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fee (₹/mo)</label>
                  <input
                    type="number"
                    value={editFormData.monthly_fee}
                    onChange={(e) => setEditFormData({ ...editFormData, monthly_fee: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Facility Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive (Soft Deleted)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISION NEW GYM TENANT MODAL */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gym Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HealthyHowlz Arena — Salem West"
                    value={newGymData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      setNewGymData({ ...newGymData, name, slug: newGymData.slug || slug });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Route Slug (e.g. /salem)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. salem"
                    value={newGymData.slug}
                    onChange={(e) => setNewGymData({ ...newGymData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
