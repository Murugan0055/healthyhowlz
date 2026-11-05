import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle, Wallet, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function CashReconcileModal({ isOpen, onClose, onReconciled }) {
  const [expectedCash, setExpectedCash] = useState(0);
  const [physicalCash, setPhysicalCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCounters = async () => {
      try {
        const rev = await api.getRevenueDashboard();
        setExpectedCash(rev.counters?.todayExpectedCash || 0);
        setPhysicalCash(String(rev.counters?.todayExpectedCash || 0));
      } catch (e) {
        // ignore
      }
    };
    fetchCounters();
  }, [isOpen]);

  if (!isOpen) return null;

  const physicalNum = parseFloat(physicalCash || '0');
  const discrepancy = physicalNum - expectedCash;

  let status = 'balanced';
  if (discrepancy < 0) status = 'shortage';
  if (discrepancy > 0) status = 'surplus';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitCashReconciliation({
        staffId: 'staff-front-desk',
        staffName: 'Priya V (Front Desk)',
        physicalCashCounted: physicalNum,
        notes
      });
      alert(`✅ End-of-Day Cash Reconciliation Submitted! Status: ${status.toUpperCase()} (${discrepancy >= 0 ? '+' : ''}₹${discrepancy})`);
      onClose();
      if (onReconciled) onReconciled();
    } catch (err) {
      alert('Reconciliation submission failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold brand-font text-white">EOD Cash-in-Drawer Check</h3>
              <p className="text-xs text-slate-400">Match physical drawer cash against invoices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Expected from system */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-400">System Expected Cash (Today's Cash Invoices):</p>
              <p className="text-2xl font-black text-white font-mono">₹{expectedCash.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Auto-calculated</span>
            </div>
          </div>

          {/* Physical Cash Counted Input */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Physical Cash Counted in Till Drawer (₹) *
            </label>
            <input
              type="number"
              step="any"
              required
              autoFocus
              value={physicalCash}
              onChange={(e) => setPhysicalCash(e.target.value)}
              className="w-full text-2xl font-mono font-bold px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-amber-500 text-amber-400 focus:outline-none"
            />
          </div>

          {/* Discrepancy Alert HUD */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            status === 'balanced'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : status === 'shortage'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {status === 'balanced' && <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
            {status === 'shortage' && <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />}
            {status === 'surplus' && <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />}
            
            <div>
              <p className="font-bold text-sm uppercase">
                {status === 'balanced' ? 'Drawer Perfectly Balanced' : `${status.toUpperCase()} Flagged`}
              </p>
              <p className="text-xs opacity-90">
                Variance: <span className="font-mono font-bold">{discrepancy >= 0 ? '+' : ''}₹{discrepancy.toFixed(2)}</span>
                {status === 'shortage' && ' (Shortage will be reported to Owner)'}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">Shift Notes / Explanations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Count verified with closing manager, cash bag sealed."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-slate-500 text-xs"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            {loading ? 'Submitting...' : 'Submit End-of-Day Reconciliation'}
          </button>

        </form>

      </div>
    </div>
  );
}

