import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Zap,
  Users,
  Wrench,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ExpensesPage({ currentGymId, currentGym }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Expense Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Rent');
  const [newAmount, setNewAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('upi');
  const [newPaymentRef, setNewPaymentRef] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVendor, setNewVendor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'All',
    'Rent',
    'Electricity (TNEB)',
    'Trainer Salaries',
    'Equipment Maintenance',
    'Supplements Stock',
    'Cleaning & Sanitation',
    'Internet & Utilities',
    'Marketing & Ads',
    'Other'
  ];

  const fetchExpensesAndSummary = async () => {
    try {
      setIsLoading(true);
      const [expData, sumData] = await Promise.all([
        api.getExpenses({ category: categoryFilter, search: searchQuery }),
        api.getExpenseSummary()
      ]);
      setExpenses(expData || []);
      setSummary(sumData);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndSummary();
  }, [categoryFilter, searchQuery, currentGymId]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newTitle || !newAmount) {
      alert('Please provide expense title and amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createExpense({
        title: newTitle,
        category: newCategory,
        amount: parseFloat(newAmount),
        paymentMethod: newPaymentMethod,
        paymentRef: newPaymentRef,
        expenseDate: newExpenseDate,
        vendorName: newVendor,
        notes: newNotes,
        loggedBy: user?.name || 'Karthik Raja (Owner)'
      });

      // Reset form
      setNewTitle('');
      setNewAmount('');
      setNewPaymentRef('');
      setNewVendor('');
      setNewNotes('');
      setIsAddModalOpen(false);
      setIsSubmitting(false);
      fetchExpensesAndSummary();
    } catch (err) {
      alert('Failed to log expense: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id, title) => {
    if (window.confirm(`Delete expense record "${title}"?`)) {
      try {
        await api.deleteExpense(id);
        fetchExpensesAndSummary();
      } catch (err) {
        alert('Failed to delete expense: ' + err.message);
      }
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Rent': return Building;
      case 'Electricity (TNEB)': return Zap;
      case 'Trainer Salaries': return Users;
      case 'Equipment Maintenance': return Wrench;
      case 'Supplements Stock': return ShoppingBag;
      default: return Receipt;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Gym Owner Financial Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white brand-font tracking-tight mt-1">
            Income & Expense Ledger (P&L)
          </h1>
          <p className="text-xs text-slate-400">
            Real-time cash flow, operational overheads, and net profit margins for Elite Fitness Center.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Operating Expense</span>
        </button>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0f1722] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono">
            ₹{(summary?.totalIncome || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            {summary?.invoiceCount || 0} Invoices (Memberships & Retail)
          </p>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0f1722] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-400 font-mono">
            ₹{(summary?.totalExpense || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {summary?.expenseCount || 0} Operating Vouchers Logged
          </p>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0f1722] border border-emerald-500/40 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Net Operating Profit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className={`text-2xl font-black font-mono ${
            (summary?.netProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            ₹{(summary?.netProfit || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-300 font-medium mt-1">
            Net Margin: <strong className="text-emerald-400 font-bold">{summary?.profitMarginPercent || '0.0'}%</strong>
          </p>
        </div>

        {/* Current Month Net Cash Flow */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#131b26] to-[#0f1722] border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MTD Net Cash Flow</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono">
            ₹{(summary?.mtdNetProfit || 0).toLocaleString('en-IN')}
          </h3>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>In: ₹{(summary?.mtdIncome || 0).toLocaleString('en-IN')}</span>
            <span>Out: ₹{(summary?.mtdExpense || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Expense Category Breakdown Pills */}
      {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#121926] border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Overhead Expense Breakdown
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total Outflow: ₹{(summary.totalExpense || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {summary.categoryBreakdown.map((item, idx) => {
              const Icon = getCategoryIcon(item.category);
              return (
                <div
                  key={idx}
                  onClick={() => setCategoryFilter(item.category)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer select-none ${
                    categoryFilter === item.category
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold mb-1 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span className="truncate">{item.category}</span>
                  </div>
                  <span className="text-sm font-black font-mono text-white block">
                    ₹{item.total.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.count} payments</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by expense title, vendor, or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121926] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#121926] border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Ledger List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recorded Expense Items ({expenses.length})
          </h2>
          {categoryFilter !== 'All' && (
            <button
              onClick={() => setCategoryFilter('All')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#121926] border border-slate-800 text-slate-500 text-xs">
            No expenses found matching the current criteria. Tap "Add Operating Expense" to log your first voucher.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expenses.map((exp) => {
              const Icon = getCategoryIcon(exp.category);

              return (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl bg-[#121926] border border-slate-800 hover:border-slate-700 transition shadow-md flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {exp.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {exp.expense_date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {exp.title}
                      </h4>
                      {exp.vendor_name && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Vendor: <span className="text-slate-300 font-medium">{exp.vendor_name}</span>
                        </p>
                      )}
                      {exp.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          "{exp.notes}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                        <span className="uppercase font-bold text-slate-400">{exp.payment_method}</span>
                        {exp.payment_ref && <span>• Ref: {exp.payment_ref}</span>}
                        <span>• By: {exp.logged_by}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between items-end h-full">
                    <span className="text-base font-black text-rose-400 font-mono">
                      -₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id, exp.title)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121927] border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Financial Management</span>
                <h3 className="text-lg font-black text-white">Record Operating Expense</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Monthly Diesel Generator Fuel, TNEB Bill, Protein restock"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                    <option value="cash">Cash in Drawer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    value={newExpenseDate}
                    onChange={(e) => setNewExpenseDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Vendor / Payee Name
                  </label>
                  <input
                    type="text"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="e.g. Tamil Nadu Electricity Board"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                    Transaction / Reference ID
                  </label>
                  <input
                    type="text"
                    value={newPaymentRef}
                    onChange={(e) => setNewPaymentRef(e.target.value)}
                    placeholder="e.g. UPI-TNEB-8921"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional context or invoice memo..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Save Expense Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

