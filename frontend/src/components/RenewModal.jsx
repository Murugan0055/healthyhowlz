import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Coins, CreditCard, Sparkles, Check } from 'lucide-react';
import { api } from '../services/api';

export default function RenewModal({ member, isOpen, onClose, onRenewed }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !member) return;
    const loadPlans = async () => {
      try {
        const data = await api.getPlans();
        setPlans(data);
        if (data.length > 0) {
          // Default to their current plan or 3 Month Pro
          const matching = data.find((p) => p.name === member.plan_name);
          setSelectedPlanId(matching ? matching.id : data[1]?.id || data[0].id);
        }
      } catch (e) {
        // ignore
      }
    };
    loadPlans();
    setPointsToRedeem(0);
  }, [isOpen, member]);

  if (!isOpen || !member) return null;

  const currentPlan = plans.find((p) => p.id === selectedPlanId);
  const planPrice = currentPlan ? currentPlan.total_price : 2499;

  // Max 15% redemption cap (50 points = 1 INR)
  const POINTS_PER_RUPEE = 50;
  const maxAllowedRupees = Math.round(planPrice * 0.15);
  const maxAllowedPoints = maxAllowedRupees * POINTS_PER_RUPEE;
  const availablePoints = member.loyalty_points || 0;
  const maxRedeemablePoints = Math.min(availablePoints, maxAllowedPoints);

  const discountRupees = Math.floor(pointsToRedeem / POINTS_PER_RUPEE);
  const finalAmount = Math.max(0, planPrice - discountRupees);

  const handleRenew = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.renewMember(member.id, {
        planId: selectedPlanId,
        paymentMethod,
        pointsToRedeem,
        staffId: 'staff-front-desk',
        staffName: 'Priya V'
      });
      alert(`🎉 Membership for ${member.name} successfully renewed! Extended for ${currentPlan.name}.`);
      onClose();
      onRenewed();
    } catch (err) {
      alert('Renewal failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="relative w-full max-w-lg bg-[#111827] border-2 border-emerald-500/40 rounded-3xl shadow-2xl p-6 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold brand-font text-white">Renew Membership</h3>
              <p className="text-xs text-slate-400">Apply loyalty credits & extend workout access</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Preview Card */}
        <div className="my-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <img
            src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={member.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white truncate">{member.name}</h4>
            <p className="text-xs text-slate-400 font-mono">{member.member_code} • {member.phone}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-amber-400 font-bold block flex items-center gap-1 justify-end">
              <Coins className="w-3.5 h-3.5" />
              {availablePoints} pts
            </span>
            <span className="text-[10px] text-slate-500">Wallet balance</span>
          </div>
        </div>

        {/* Renewal Form */}
        <form onSubmit={handleRenew} className="space-y-4 text-xs">
          
          {/* Plan Selection */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Select Renewal Package</label>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                setSelectedPlanId(e.target.value);
                setPointsToRedeem(0);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 text-sm"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.total_price} ({p.duration_months} Months)
                </option>
              ))}
            </select>
          </div>

          {/* Loyalty Points Redemption Box */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Redeem Attendance Points
              </span>
              <span className="text-[11px] text-amber-400/80 font-mono">
                50 pts = ₹1 (Max: ₹{maxAllowedRupees})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={maxRedeemablePoints}
                step={POINTS_PER_RUPEE}
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(parseInt(e.target.value, 10))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <div className="w-24 text-right">
                <span className="font-bold text-sm text-amber-300 font-mono">
                  -₹{discountInRupees}
                </span>
                <span className="text-[10px] text-slate-400 block">({pointsToRedeem} pts)</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-2 border-t border-amber-500/20">
              <span>Points available in wallet: {availablePoints} pts (₹{(availablePoints / POINTS_PER_RUPEE).toFixed(1)})</span>
              {pointsToRedeem > 0 && (
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(0)}
                  className="text-amber-400 hover:underline"
                >
                  Clear redemption
                </button>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Payment Method</label>
            <div className="grid grid-cols-4 gap-2">
              {['upi', 'cash', 'card', 'net_banking'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 rounded-xl border text-center font-bold capitalize transition-all ${
                    paymentMethod === m
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'net_banking' ? 'Net Bank' : m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Final Calculation Summary */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Plan MRP (incl. 18% GST):</span>
              <span className="font-mono">₹{planPrice.toFixed(2)}</span>
            </div>
            {pointsToRedeem > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Loyalty Discount ({pointsToRedeem} pts):</span>
                <span className="font-mono">-₹{pointsToRedeem.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Final Collectible Amount:</span>
              <span className="font-mono text-emerald-400 text-lg">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>{loading ? 'Processing...' : `Confirm & Extend (${currentPlan?.duration_months || 3} Months)`}</span>
          </button>

        </form>

      </div>
    </div>
  );
}

