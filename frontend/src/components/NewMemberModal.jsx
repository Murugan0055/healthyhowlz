import React, { useState, useEffect } from 'react';
import { X, UserPlus, Dumbbell, ShieldAlert, Check } from 'lucide-react';
import { api } from '../services/api';

export default function NewMemberModal({ isOpen, onClose, onCreated }) {
  const [plans, setPlans] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    planId: '',
    fitnessGoals: 'Strength & Hypertrophy',
    medicalFlags: 'None',
    emergencyContactName: '',
    emergencyContactPhone: '',
    assignedTrainerId: '',
    paymentMethod: 'upi'
  });

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const [plansRes, staffRes] = await Promise.all([api.getPlans(), api.getStaff()]);
        setPlans(plansRes);
        setStaff(staffRes);
        if (plansRes.length > 0 && !formData.planId) {
          setFormData((prev) => ({ ...prev, planId: plansRes[1]?.id || plansRes[0].id }));
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.planId) {
      alert('Name, Phone and Plan are required');
      return;
    }

    setLoading(true);
    try {
      const result = await api.createMember({
        ...formData,
        staffId: 'staff-front-desk',
        staffName: 'Priya V'
      });
      alert(`🎉 Member ${formData.name} successfully registered! Member ID: ${result.memberCode}`);
      onClose();
      onCreated();
    } catch (err) {
      alert('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === formData.planId);

  return (
    <div className="modal-overlay">
      <div className="relative w-full max-w-xl bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold brand-font text-white">Register New Elite Member</h3>
              <p className="text-xs text-slate-400">Creates member pass, initial invoice & opens floor access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Karthikeyan S"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="client@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Membership Plan Selection */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Membership Plan *</label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.total_price} ({p.duration_months} Months)
                </option>
              ))}
            </select>
          </div>

          {/* Medical Flags / Limitations */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Medical Notes / Physical Limitations (e.g. knee, shoulder, lower back)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Lower Back Tightness, Avoid Deep Squats"
              value={formData.medicalFlags}
              onChange={(e) => setFormData({ ...formData, medicalFlags: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Goals & Assigned Trainer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Primary Fitness Goal</label>
              <select
                value={formData.fitnessGoals}
                onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              >
                <option value="Fat Loss & Transformation">Fat Loss & Transformation</option>
                <option value="Muscle Hypertrophy">Muscle Hypertrophy</option>
                <option value="Powerlifting & Pure Strength">Powerlifting & Pure Strength</option>
                <option value="General Health & Stamina">General Health & Stamina</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Assigned Floor Coach</label>
              <select
                value={formData.assignedTrainerId}
                onChange={(e) => setFormData({ ...formData, assignedTrainerId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
              >
                <option value="">-- Auto-assign on floor --</option>
                {staff.filter((s) => s.role === 'trainer').map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Initial Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {['upi', 'cash', 'card', 'net_banking'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setFormData({ ...formData, paymentMethod: m })}
                  className={`py-2 rounded-xl border text-center font-bold capitalize transition-all ${
                    formData.paymentMethod === m
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'net_banking' ? 'Net Banking' : m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          {selectedPlan && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-slate-400">Total Due Today (incl. 18% GST):</p>
                <p className="text-xl font-extrabold text-emerald-400 font-mono">₹{selectedPlan.total_price.toFixed(2)}</p>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <p>Base: ₹{selectedPlan.base_price}</p>
                <p>CGST+SGST (18%): ₹{(selectedPlan.total_price - selectedPlan.base_price).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Complete Registration & Collect Payment'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}

