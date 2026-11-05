import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  KeyRound, 
  Building, 
  Coins, 
  Clock, 
  Save, 
  UserCheck,
  Dumbbell,
  Plus,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    gym_name: 'Elite Fitness Center',
    gym_address: 'Plot 14, Katpadi Main Road, Near New Bus Stand, Gudiyatham - 632602',
    gym_phone: '+91 98401 23456',
    gym_gstin: '33AAAAE1234M1Z5',
    officer_master_pin: '1234',
    grace_period_days: '2',
    daily_attendance_points: '20',
    max_loyalty_redemption_percent: '15.0',
    upi_vpa: 'elitegymgudiyatham@okaxis'
  });

  const [staff, setStaff] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  // New Plan Builder form state
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    durationMonths: 3,
    durationDays: 90,
    totalPrice: 6500,
    isOffPeak: false,
    ptSessionsIncluded: 0,
    maxFreezeDays: 15
  });

  const loadData = async () => {
    try {
      const [settingsRes, staffRes, plansRes] = await Promise.all([
        api.getSettings(),
        api.getStaff(),
        api.getPlans()
      ]);
      if (settingsRes && Object.keys(settingsRes).length > 0) {
        setSettings((prev) => ({ ...prev, ...settingsRes }));
      }
      setStaff(staffRes);
      setPlans(plansRes);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateSettings(settings);
      alert('✅ Gym Operating Platform settings successfully saved!');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlanForm.name || !newPlanForm.totalPrice) {
      alert('Plan Name and Total Price are required');
      return;
    }

    try {
      const basePrice = Math.round((newPlanForm.totalPrice / 1.18) * 100) / 100;
      await api.createPlan({
        ...newPlanForm,
        basePrice,
        durationDays: newPlanForm.durationDays || newPlanForm.durationMonths * 30
      });
      alert(`🎉 Membership plan "${newPlanForm.name}" created successfully!`);
      setShowAddPlanModal(false);
      setNewPlanForm({
        name: '',
        durationMonths: 3,
        durationDays: 90,
        totalPrice: 6500,
        isOffPeak: false,
        ptSessionsIncluded: 0,
        maxFreezeDays: 15
      });
      loadData();
    } catch (err) {
      alert('Failed to create plan: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-slate-800 text-slate-300 border border-slate-700">
            System Configuration
          </span>
          <span className="text-xs text-slate-400">Front Desk & Security Parameters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
          Facility & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure Reception Desk Officer Master PIN, attendance reward rules, grace periods, and membership plan structures.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Front Desk Security & Access Rules */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Front Desk Security & Access Rules</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Front Officer Master Security PIN (4 Digits) *
              </label>
              <input
                type="password"
                maxLength={4}
                value={settings.officer_master_pin}
                onChange={(e) => setSettings({ ...settings, officer_master_pin: e.target.value.replace(/\D/g, '') })}
                className="w-full text-center tracking-[0.5em] font-mono text-xl py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Required by front-desk tablet for all manual check-in overrides.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Grace Period Window (Days) *
              </label>
              <input
                type="number"
                min={0}
                max={7}
                value={settings.grace_period_days}
                onChange={(e) => setSettings({ ...settings, grace_period_days: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Number of days an expired member is granted floor entry with an overdue warning before access is locked.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Daily Attendance Points</label>
                <input
                  type="number"
                  value={settings.daily_attendance_points}
                  onChange={(e) => setSettings({ ...settings, daily_attendance_points: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Points credited per daily first check-in.</span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Max Loyalty Redemption (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.max_loyalty_redemption_percent}
                  onChange={(e) => setSettings({ ...settings, max_loyalty_redemption_percent: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono text-sm focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Cap per renewal to protect gym margins (e.g. 15%).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Facility Profile & GST Information */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Building className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Gudiyatham Facility Profile & Taxation</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Gym Name</label>
              <input
                type="text"
                value={settings.gym_name}
                onChange={(e) => setSettings({ ...settings, gym_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Official Address</label>
              <input
                type="text"
                value={settings.gym_address}
                onChange={(e) => setSettings({ ...settings, gym_address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Official Phone</label>
                <input
                  type="text"
                  value={settings.gym_phone}
                  onChange={(e) => setSettings({ ...settings, gym_phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Gym GSTIN</label>
                <input
                  type="text"
                  value={settings.gym_gstin}
                  onChange={(e) => setSettings({ ...settings, gym_gstin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Gym UPI VPA (For Direct Renewal Payments)</label>
              <input
                type="text"
                value={settings.upi_vpa}
                onChange={(e) => setSettings({ ...settings, upi_vpa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Staff & Officer PIN Roster */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Staff Roster & Officer PINs</h3>
            </div>
            <span className="text-xs text-slate-400">Total {staff.length} staff members</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {staff.map((s) => (
              <div key={s.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <p className="font-bold text-white text-sm">{s.name}</p>
                <p className="text-purple-400 font-semibold uppercase text-[10px]">{s.role}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Officer PIN:</span>
                  <span className="font-mono font-bold text-amber-400 tracking-wider">••••</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Commission:</span>
                  <span className="font-mono font-bold text-emerald-400">{s.commission_rate}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save System Settings'}</span>
            </button>
          </div>
        </div>

      </form>

      {/* SECTION 4: FLEXIBLE MEMBERSHIP PLAN BUILDER (Specification 2.5) */}
      <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Flexible Membership Builder & Pricing Structure
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard 1M/3M/6M/12M packages, couple plans, off-peak discount hours (11am-4pm), and PT combo packs.
            </p>
          </div>

          <button
            onClick={() => setShowAddPlanModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Custom Plan</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{p.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.duration_months} Months ({p.duration_days} Days)
                  </span>
                </div>
                {p.is_off_peak === 1 ? (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                    Off-Peak (11am-4pm)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    All-Hours
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] text-slate-500">Base Price: ₹{p.base_price.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block">+18% GST included</span>
                </div>
                <span className="text-lg font-black font-mono text-emerald-400">
                  ₹{p.total_price.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Freeze Quota: {p.max_freeze_days || 30} days</span>
                <span>PT Sessions: {p.pt_sessions_included || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE PLAN MODAL */}
      {showAddPlanModal && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Build New Membership Package</h3>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Summer Shred (3M)"
                  value={newPlanForm.name}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Duration (Months) *</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={newPlanForm.durationMonths}
                    onChange={(e) => setNewPlanForm({ 
                      ...newPlanForm, 
                      durationMonths: parseInt(e.target.value, 10),
                      durationDays: parseInt(e.target.value, 10) * 30
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Total MRP (₹ incl. GST) *</label>
                  <input
                    type="number"
                    required
                    value={newPlanForm.totalPrice}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, totalPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">PT Sessions Included</label>
                  <input
                    type="number"
                    min={0}
                    value={newPlanForm.ptSessionsIncluded}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, ptSessionsIncluded: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Max Freeze Days</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={newPlanForm.maxFreezeDays}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, maxFreezeDays: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Off peak checkbox */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  id="isOffPeak"
                  checked={newPlanForm.isOffPeak}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, isOffPeak: e.target.checked })}
                  className="rounded accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="isOffPeak" className="text-slate-300 cursor-pointer">
                  Off-Peak Discount Access (Restricted to 11 AM - 4 PM)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-sm shadow-md transition-all mt-2"
              >
                Create & Publish Membership Plan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
