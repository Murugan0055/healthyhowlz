import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Wallet, 
  Flame, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Award,
  Zap,
  Tag,
  Smartphone,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useMemberAuth } from './MemberAuthContext';

export default function LoyaltyWallet({ onRenewalSuccess }) {
  const { member, refreshMemberProfile } = useMemberAuth();
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Renewal form state
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi_phonepe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [renewalInvoice, setRenewalInvoice] = useState(null);

  // Payment Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [upiRefId, setUpiRefId] = useState(`UPI-${Date.now().toString().slice(-8)}`);
  const [isCopiedVpa, setIsCopiedVpa] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'verifying', 'success'

  const POINTS_PER_RUPEE = 50; // 50 points = 1 INR

  const fetchWallet = async () => {
    if (!member) return;
    try {
      setIsLoading(true);
      const data = await api.getClientWallet(member.id);
      setWallet(data);
      if (data.renewalPlans && data.renewalPlans.length > 0) {
        // Select 1 Month Starter by default if available or first plan
        const defaultPlan = data.renewalPlans.find(p => p.id === 'plan-1m') || data.renewalPlans[0];
        setSelectedPlanId(defaultPlan.id);
        setPointsToRedeem(Math.min(data.loyaltyPoints, defaultPlan.maxRedeemablePoints));
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load wallet:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [member?.id]);

  const selectedPlan = wallet?.renewalPlans?.find(p => p.id === selectedPlanId) || wallet?.renewalPlans?.[0];
  const maxAllowedPoints = selectedPlan ? Math.min(wallet?.loyaltyPoints || 0, selectedPlan.maxRedeemablePoints) : 0;
  
  // Calculate discount in rupees: 50 points = 1 INR
  const discountInRupees = Math.floor(pointsToRedeem / POINTS_PER_RUPEE);
  const netPayable = selectedPlan ? Math.max(0, selectedPlan.originalPrice - discountInRupees) : 0;

  const handlePlanChange = (planId) => {
    setSelectedPlanId(planId);
    const plan = wallet?.renewalPlans?.find(p => p.id === planId);
    if (plan) {
      const maxRedeem = Math.min(wallet?.loyaltyPoints || 0, plan.maxRedeemablePoints);
      // Snap to step of 50
      setPointsToRedeem(Math.floor(maxRedeem / POINTS_PER_RUPEE) * POINTS_PER_RUPEE);
    }
  };

  // Open Payment Gateway Sheet
  const handleOpenPayment = () => {
    setUpiRefId(`UPI-${Date.now().toString().slice(-8)}`);
    setPaymentStatus('pending');
    setIsPaymentModalOpen(true);
  };

  // Execute Payment & Renewal
  const handleConfirmPayment = async () => {
    if (!selectedPlan || !member) return;
    setPaymentStatus('verifying');
    setIsSubmitting(true);

    try {
      // Simulate real-time bank verification delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const res = await api.clientRenew({
        memberId: member.id,
        planId: selectedPlan.id,
        pointsToRedeem,
        paymentMethod,
        paymentRef: upiRefId
      });

      setPaymentStatus('success');
      setRenewalInvoice(res.invoice);
      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
      refreshMemberProfile();
      fetchWallet();
      if (onRenewalSuccess) onRenewalSuccess(res);
    } catch (err) {
      alert('Payment Verification Failed: ' + err.message);
      setPaymentStatus('pending');
      setIsSubmitting(false);
    }
  };

  const vpa = wallet?.upiVpa || 'elitegymgudiyatham@okaxis';
  const upiIntentString = `upi://pay?pa=${vpa}&pn=EliteFitnessCenter&am=${netPayable}&cu=INR&tn=Renewal_${member?.member_code || 'EG-1001'}`;

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText(vpa);
    setIsCopiedVpa(true);
    setTimeout(() => setIsCopiedVpa(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Wallet className="w-8 h-8 mx-auto animate-bounce text-emerald-400 mb-2" />
        <p className="text-xs">Loading membership plans & loyalty rates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Wallet Balance & Attendance Streak Banner */}
      <div className="bg-gradient-to-br from-[#162230] via-[#101926] to-[#0c131e] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> Attendance Loyalty Wallet
          </span>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            50 pts = ₹1.00 INR
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
              {wallet?.loyaltyPoints ?? 360} <span className="text-sm font-normal text-slate-400">pts</span>
              <span className="text-base font-bold text-emerald-400">
                (₹{((wallet?.loyaltyPoints ?? 360) / POINTS_PER_RUPEE).toFixed(2)})
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">Available for up to 15% renewal discount</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> {wallet?.streakDays || 14} Days
            </span>
            <p className="text-[9px] text-slate-400 uppercase mt-0.5">Floor Streak</p>
          </div>
        </div>

        {/* Daily reward perk note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Daily Check-In Bonus:
          </span>
          <strong className="text-emerald-400 font-bold">+20 Points / Day</strong>
        </div>
      </div>

      {/* Plan Extension Selector Card */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Fast Renewals</span>
            <h3 className="text-base font-black text-white">Choose Membership Plan</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {wallet?.daysLeft ?? 45} days remaining
          </span>
        </div>

        {/* Official Synchronized Plans */}
        <div className="space-y-2">
          {wallet?.renewalPlans?.map((p) => {
            const isSelected = p.id === selectedPlanId;
            return (
              <div
                key={p.id}
                onClick={() => handlePlanChange(p.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                } flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      {p.durationDays} Days • {p.name.includes('PT') ? '10 Floor Sessions' : 'Full Floor Access'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-black text-emerald-400">
                    ₹{p.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[9px] text-slate-400">
                    Max savings: ₹{p.maxDiscountRupees || Math.floor((p.originalPrice * 0.15))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 15% Cap Points Redemption Slider (50 Points = 1 INR) */}
        {selectedPlan && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" /> Redeem Loyalty Points
                </span>
                <p className="text-[10px] text-slate-400">
                  Rate: 50 pts = ₹1.00 (Max 15% cap: {selectedPlan.maxRedeemablePoints} pts / -₹{selectedPlan.maxDiscountRupees})
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-400 font-mono block">
                  -₹{discountInRupees}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({pointsToRedeem} pts)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max={maxAllowedPoints}
              step={POINTS_PER_RUPEE}
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>0 pts (₹0)</span>
              <span>Slide in 50 pt steps</span>
              <span>Max: {maxAllowedPoints} pts</span>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {selectedPlan && (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Plan Base Price</span>
              <span className="font-mono">₹{selectedPlan.originalPrice.toLocaleString('en-IN')}</span>
            </div>
            {discountInRupees > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Loyalty Discount ({pointsToRedeem} pts @ 50:1)</span>
                <span className="font-mono">-₹{discountInRupees}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
              <span>Net Payable Amount</span>
              <span className="font-mono text-emerald-400 text-base">₹{netPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Proceed to Payment Trigger Button */}
        <button
          onClick={handleOpenPayment}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition"
        >
          <CreditCard className="w-4 h-4" />
          <span>Proceed to UPI Payment • ₹{netPayable.toLocaleString('en-IN')}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* UPI Payment Gateway Sheet / Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#101724] border border-slate-700/80 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Elite Fast UPI Checkout</h3>
                  <p className="text-[10px] text-emerald-400">Instant Verification & GST Receipt</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Amount Due</span>
              <h2 className="text-2xl font-black text-white font-mono mt-0.5">
                ₹{netPayable.toLocaleString('en-IN')}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Renewing: <strong className="text-emerald-400">{selectedPlan?.name}</strong>
              </p>
            </div>

            {/* Dynamic UPI QR Code Box */}
            <div className="p-4 bg-gradient-to-b from-[#141d2b] to-[#0e1520] border border-emerald-500/30 rounded-2xl text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> Scan UPI QR to Pay
              </span>
              
              <div className="p-2.5 bg-white rounded-2xl shadow-xl inline-block border-2 border-slate-700">
                <QRCodeSVG
                  value={upiIntentString}
                  size={150}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* VPA Copy Pill */}
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {vpa}
                </span>
                <button
                  onClick={handleCopyVpa}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 px-2"
                  title="Copy UPI VPA"
                >
                  {isCopiedVpa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[10px]">{isCopiedVpa ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Direct 1-Tap UPI Apps Triggers */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block px-1">
                Or Tap to Pay Directly with App
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi_phonepe', label: 'PhonePe', icon: '📱' },
                  { id: 'upi_gpay', label: 'Google Pay', icon: '⚡' },
                  { id: 'upi_paytm', label: 'Paytm / UPI', icon: '💳' }
                ].map((app) => (
                  <a
                    key={app.id}
                    href={upiIntentString}
                    onClick={() => setPaymentMethod(app.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      paymentMethod === app.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{app.icon}</span>
                    <span className="text-[11px]">{app.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Transaction Reference & Confirm Verification */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                UPI Reference / UTR Number
              </label>
              <input
                type="text"
                value={upiRefId}
                onChange={(e) => setUpiRefId(e.target.value)}
                placeholder="e.g. UPI-631892819201"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">
                Auto-detected from bank gateway simulation. Enter UTR if prompted.
              </p>
            </div>

            {/* Confirm & Verify Payment Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Payment with Bank...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Verify Payment (₹{netPayable})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Renewal Success Tax Invoice Modal */}
      {renewalInvoice && (
        <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-2xl animate-fadeIn space-y-3">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Membership Renewed Successfully!</span>
          </div>
          <p className="text-xs text-slate-300">
            Invoice <strong className="text-white font-mono">#{renewalInvoice.invoice_number}</strong> issued with 18% GST compliance.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Extended Plan:</span>
              <span className="text-white">{selectedPlan?.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Amount Paid:</span>
              <span className="text-emerald-400 font-bold">₹{renewalInvoice.total_amount}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment Mode:</span>
              <span className="text-white uppercase">{renewalInvoice.payment_method}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payment UTR:</span>
              <span className="text-slate-300">{renewalInvoice.payment_ref}</span>
            </div>
          </div>
          <button
            onClick={() => setRenewalInvoice(null)}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            Dismiss Receipt
          </button>
        </div>
      )}

      {/* 30-Day Check-in History Ledger */}
      <div className="space-y-2 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Check-In History (30 Days)
        </h3>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/80">
          {(wallet?.recentCheckins || []).length > 0 ? (
            wallet.recentCheckins.map((c, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      {new Date(c.checkin_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(c.checkin_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-emerald-400">+{c.points_awarded || 20} pts</span>
                  <p className="text-[10px] text-slate-400 capitalize">{c.verification_status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">
              No previous check-ins logged. Scan at reception to earn your first +20 points!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
