import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  CheckCircle, 
  CreditCard, 
  Dumbbell, 
  Building2, 
  Percent, 
  DollarSign, 
  Calendar, 
  User, 
  Phone,
  Filter,
  Receipt
} from 'lucide-react';
import { api } from '../services/api';

export default function InvoicesPage({ onViewInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'membership', 'pos_retail', 'b2b'
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.getInvoices();
      setInvoices(data);
    } catch (e) {
      console.error('Fetch invoices error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices by search and category
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.member_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.member_phone?.includes(search) ||
      inv.b2b_company_name?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'membership') return inv.item_type === 'membership';
    if (categoryFilter === 'pos_retail') return inv.item_type === 'pos_retail';
    if (categoryFilter === 'b2b') return Boolean(inv.b2b_company_name);

    return true;
  });

  // Calculate totals
  const totalBilled = invoices.reduce((sum, i) => sum + (i.grand_total || 0), 0);
  const totalTax = invoices.reduce((sum, i) => sum + (i.cgst || 0) + (i.sgst || 0), 0);
  const totalSubtotal = invoices.reduce((sum, i) => sum + (i.subtotal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#131b26] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Taxation & Billing
            </span>
            <span className="text-xs text-slate-400">GST Compliance (CGST 9% + SGST 9%)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
            GST Invoices & Billing Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Card-based audit-ready B2C and B2B invoices with instant downloadable & printable tax receipts.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Invoices</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{invoices.length}</p>
          <span className="text-[10px] text-slate-400">Generated to date</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ₹{totalBilled.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">All payment channels</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Tax (18% GST)</span>
            <Percent className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400 font-mono">
            ₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">CGST 9% + SGST 9%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131b26] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Taxable Subtotal</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300 font-mono">
            ₹{totalSubtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-slate-400">Before GST application</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Invoices (${invoices.length})` },
          { id: 'membership', label: 'Membership Plans' },
          { id: 'pos_retail', label: 'Retail & POS' },
          { id: 'b2b', label: 'B2B Corporate' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card Grid Layout */}
      {filteredInvoices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#131b26] border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Invoices Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or filter tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((inv) => {
            const isB2B = Boolean(inv.b2b_company_name);
            const formattedDate = new Date(inv.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={inv.id}
                className="rounded-3xl bg-[#131b26] border border-slate-800/80 hover:border-slate-700 transition-all p-5 flex flex-col justify-between shadow-lg relative group overflow-hidden"
              >
                {/* Subtle top accent border */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isB2B ? 'bg-amber-500' : inv.item_type === 'pos_retail' ? 'bg-blue-500' : 'bg-emerald-500'
                }`} />

                <div>
                  {/* Card Header: Invoice # + Status Badge */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="font-mono font-bold text-sm text-emerald-400 block tracking-tight">
                        {inv.invoice_number}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                        <span>PAID</span>
                      </span>

                      {isB2B ? (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          B2B Corporate
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase bg-slate-800 text-slate-400">
                          {inv.item_type === 'pos_retail' ? 'Retail POS' : 'B2C Member'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Member / Client Info */}
                  <div className="py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-white text-sm">{inv.member_name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{inv.member_phone}</span>
                    </div>

                    {isB2B && (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-2 text-[11px] text-amber-200">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{inv.b2b_company_name}</span>
                        </div>
                        {inv.b2b_gstin && (
                          <p className="font-mono text-[10px] text-amber-300/80 mt-0.5">
                            GSTIN: {inv.b2b_gstin}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Item Description Box */}
                  <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Billed Item</span>
                    <p className="text-slate-200 font-medium line-clamp-2">{inv.item_description}</p>
                  </div>

                  {/* GST & Financial Breakdown */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Subtotal:</span>
                      <span className="font-mono font-medium text-slate-300">₹{inv.subtotal?.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>CGST (9%):</span>
                      <span className="font-mono text-slate-400">₹{inv.cgst?.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>SGST (9%):</span>
                      <span className="font-mono text-slate-400">₹{inv.sgst?.toFixed(2)}</span>
                    </div>

                    {inv.loyalty_discount_value > 0 && (
                      <div className="flex justify-between text-emerald-400 text-[11px] font-semibold">
                        <span>Loyalty Discount:</span>
                        <span className="font-mono">-₹{inv.loyalty_discount_value?.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="font-bold text-white text-xs">Grand Total:</span>
                      <span className="font-mono font-black text-emerald-400 text-base">
                        ₹{inv.grand_total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Payment Method Badge + View & Print Button */}
                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-bold uppercase text-slate-300 tracking-wider">
                    💳 {inv.payment_method}
                  </span>

                  <button
                    onClick={() => onViewInvoice(inv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors border border-emerald-500/30 hover:border-emerald-500/50"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View / Print Receipt</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
