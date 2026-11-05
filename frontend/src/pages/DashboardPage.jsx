import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  PieChart, 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage({ currentGymId, currentGym, onOpenCashReconcile, onViewInvoice }) {
  const [revenueData, setRevenueData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [revRes, forecastRes, recRes] = await Promise.all([
          api.getRevenueDashboard(),
          api.getCashFlowForecast(),
          api.getCashReconciliationHistory()
        ]);
        setRevenueData(revRes);
        setForecast(forecastRes);
        setReconciliations(recRes);
      } catch (err) {
        console.error('Failed to load revenue dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentGymId]);

  if (loading || !revenueData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const { counters, paymentMethods, categoryBreakdown } = revenueData;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
            Revenue Intelligence & Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time collections, cash-flow renewal forecasting, and ARPM yield metrics
          </p>
        </div>

        <button
          onClick={onOpenCashReconcile}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>EOD Cash Drawer Till</span>
        </button>
      </div>

      {/* TOP STATS COUNTERS (Real-Time Revenue Counters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Collections */}
        <div className="p-5 rounded-3xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Collections</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-white font-mono">₹{counters.todayRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <span>{counters.todayInvoices} invoices generated today</span>
          </p>
        </div>

        {/* Month-to-Date (MTD) */}
        <div className="p-5 rounded-3xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Month-to-Date (MTD)</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-white font-mono">₹{counters.mtdRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-blue-400 font-semibold mt-1">
            {counters.mtdInvoices} memberships & retail billing
          </p>
        </div>

        {/* Year-to-Date (YTD) */}
        <div className="p-5 rounded-3xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Year-to-Date (YTD)</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-white font-mono">₹{counters.ytdRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-purple-400 font-semibold mt-1">
            Fiscal cumulative revenue
          </p>
        </div>

        {/* ARPM Yield */}
        <div className="p-5 rounded-3xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Revenue/Member (ARPM)</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono">₹{counters.arpm.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {counters.activeMembersCount} active members
          </p>
        </div>

      </div>

      {/* RENEWAL CASH FLOW FORECAST & PAYMENT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Renewal Cash Flow Forecast (Next 7, 14, 30 Days) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Projected Cash Flow & Renewal Forecast
              </h3>
              <p className="text-xs text-slate-400">Memberships expiring in upcoming cycles and potential renewal revenue</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ₹{forecast?.totalUpcoming30DaysRevenue?.toLocaleString('en-IN')} Expected (30d)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Next 7 Days */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Next 7 Days
              </span>
              <p className="text-2xl font-black text-white font-mono">
                ₹{forecast?.forecasts?.next7Days?.potentialRevenue?.toLocaleString('en-IN') || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {forecast?.forecasts?.next7Days?.count || 0} memberships expiring
              </p>
            </div>

            {/* Next 14 Days */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                Next 14 Days
              </span>
              <p className="text-2xl font-black text-white font-mono">
                ₹{forecast?.forecasts?.next14Days?.potentialRevenue?.toLocaleString('en-IN') || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {forecast?.forecasts?.next14Days?.count || 0} memberships expiring
              </p>
            </div>

            {/* Next 30 Days */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                Next 30 Days
              </span>
              <p className="text-2xl font-black text-white font-mono">
                ₹{forecast?.forecasts?.next30Days?.potentialRevenue?.toLocaleString('en-IN') || 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {forecast?.forecasts?.next30Days?.count || 0} memberships expiring
              </p>
            </div>

          </div>

          {/* Expiring Members List Preview */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Upcoming Expirations in Next 7 Days (Early Bird Trigger Targets):
            </h4>
            <div className="space-y-2">
              {forecast?.forecasts?.next7Days?.members?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No memberships due in the next 7 days.</p>
              ) : (
                forecast?.forecasts?.next7Days?.members?.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{m.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({m.plan_name})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-semibold font-mono">
                        Expires in {Math.ceil(m.days_left)} days ({m.expiry_date})
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ₹{m.renewal_estimate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Collections by Channel (MTD)
            </h3>
            <p className="text-xs text-slate-400">UPI, Cash drawer, card and net banking</p>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.payment_method} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-slate-200 capitalize">
                    {pm.payment_method === 'upi' ? '⚡ UPI (GPay/PhonePe)' :
                     pm.payment_method === 'cash' ? '💵 Cash in Drawer' :
                     pm.payment_method === 'card' ? '💳 Card POS Swipe' : '🏦 Net Banking'}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{pm.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{pm.invoice_count} transactions</span>
                  <span>{Math.round((pm.total_amount / (counters.mtdRevenue || 1)) * 100)}% of total</span>
                </div>
              </div>
            ))}
          </div>

          {/* Cash Drawer EOD Box */}
          <div className="pt-2 border-t border-slate-800">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-amber-300">Expected Physical Cash in Till:</p>
                <p className="text-xl font-mono font-black text-amber-400">₹{counters.todayExpectedCash.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={onOpenCashReconcile}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 text-xs"
              >
                Reconcile
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Auxiliary Revenue Yields & EOD Reconciliation Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown (Secondary Spends) */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            Auxiliary Revenue Streams & Secondary Spend
          </h3>
          <p className="text-xs text-slate-400 mb-4">Membership fees vs retail POS, locker rentals and personal training</p>

          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.item_type} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200 capitalize">
                    {cat.item_type === 'membership' ? '🏋️ Core Gym Memberships' :
                     cat.item_type === 'pos_retail' ? '🥤 Retail POS (Shakes & Apparel)' :
                     cat.item_type === 'locker_rental' ? '🔐 Locker Rentals' : '🎯 Personal Training Combos'}
                  </span>
                  <p className="text-[10px] text-slate-500">{cat.count} invoices logged</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-white">₹{cat.total_amount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">{Math.round((cat.total_amount / (counters.mtdRevenue || 1)) * 100)}% share</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EOD Reconciliation Audit Log */}
        <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Cash-in-Drawer End-of-Day (EOD) Audit Log
          </h3>
          <p className="text-xs text-slate-400 mb-4">Historical physical cash reconciliation by front-desk officers</p>

          <div className="space-y-2.5">
            {reconciliations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No past reconciliations recorded.</p>
            ) : (
              reconciliations.slice(0, 5).map((rec) => (
                <div key={rec.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">Date: {rec.reconciliation_date}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.status === 'balanced' ? 'bg-emerald-500/20 text-emerald-300' :
                      rec.status === 'shortage' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rec.status} ({rec.discrepancy >= 0 ? '+' : ''}₹{rec.discrepancy})
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Officer: {rec.staff_name}</span>
                    <span>Counted: ₹{rec.physical_cash_counted} / Exp: ₹{rec.system_cash_expected}</span>
                  </div>
                  {rec.notes && <p className="text-[10px] text-slate-500 mt-1 italic">Note: "{rec.notes}"</p>}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

