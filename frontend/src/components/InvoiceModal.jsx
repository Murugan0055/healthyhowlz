import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Dumbbell } from 'lucide-react';

export default function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Actions bar (hidden during print) */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Official Tax Invoice
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="printable-invoice bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <Dumbbell className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950">ELITE FITNESS CENTER</h2>
                <p className="text-xs text-slate-600 font-medium">Gudiyatham Premium Strength Club</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                  Plot 14, Katpadi Main Road, Near New Bus Stand, Gudiyatham - 632602, TN
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                GST Tax Invoice
              </span>
              <p className="text-base font-extrabold text-slate-900 font-mono">{invoice.invoice_number}</p>
              <p className="text-xs text-slate-500">Date: {new Date(invoice.created_at).toLocaleDateString('en-IN')}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">GSTIN: <span className="font-mono">33AAAAE1234M1Z5</span></p>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Billed To (Member):</p>
              <p className="text-sm font-bold text-slate-900">{invoice.member_name}</p>
              <p className="text-slate-600">Phone: {invoice.member_phone}</p>
              {invoice.b2b_company_name && (
                <div className="mt-2 p-2 rounded bg-slate-50 border text-slate-700">
                  <p className="font-bold">B2B: {invoice.b2b_company_name}</p>
                  <p className="font-mono">GSTIN: {invoice.b2b_gstin}</p>
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Payment Details:</p>
              <p className="font-semibold text-slate-800 capitalize">Method: {invoice.payment_method}</p>
              <p className="text-slate-600 font-mono text-[11px]">Ref: {invoice.payment_ref || 'CONFIRMED'}</p>
              <p className="text-slate-600 text-[11px]">Handled by: {invoice.collected_by_staff_name || 'Front Desk Staff'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="text-left py-2 font-bold">Item Description</th>
                  <th className="text-center py-2 font-bold">Category</th>
                  <th className="text-right py-2 font-bold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-semibold text-slate-900">{invoice.item_description}</td>
                  <td className="py-3 text-center text-slate-500 capitalize">{invoice.item_type}</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-900">₹{invoice.subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Calculation Breakdown */}
          <div className="border-t pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value (Subtotal):</span>
              <span className="font-mono">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST (9.0%):</span>
              <span className="font-mono">₹{invoice.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST (9.0%):</span>
              <span className="font-mono">₹{invoice.sgst.toFixed(2)}</span>
            </div>

            {invoice.loyalty_points_redeemed > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                <span>Loyalty Points Redeemed ({invoice.loyalty_points_redeemed} pts):</span>
                <span className="font-mono">-₹{invoice.loyalty_discount_value.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-slate-950 border-t pt-2 mt-2">
              <span>Grand Total Paid (INR):</span>
              <span className="font-mono text-emerald-600">₹{invoice.grand_total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="mt-8 pt-4 border-t text-[10px] text-slate-400 text-center leading-relaxed">
            <p className="font-medium">Thank you for training at Elite Fitness Center Gudiyatham!</p>
            <p>Non-transferable • Non-refundable • Computer generated GST receipt.</p>
          </div>

        </div>

      </div>
    </div>
  );
}

