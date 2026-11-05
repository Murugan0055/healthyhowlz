import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Lock, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  CreditCard, 
  Wallet, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  UserCheck,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function PosRetailPage({ onViewInvoice }) {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'lockers'
  
  // POS State
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerName, setCustomerName] = useState('Walk-in Member');
  const [customerPhone, setCustomerPhone] = useState('9840123456');
  const [posLoading, setPosLoading] = useState(false);

  // Locker State
  const [lockerData, setLockerData] = useState({ lockers: [], summary: {} });
  const [members, setMembers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [assignMemberId, setAssignMemberId] = useState('');
  const [lockerLoading, setLockerLoading] = useState(false);
  const [showAddLockerModal, setShowAddLockerModal] = useState(false);
  const [newLockerForm, setNewLockerForm] = useState({
    locker_number: '',
    zone: 'Main Floor',
    monthly_rent: 500
  });

  const loadData = async () => {
    try {
      const [prodsRes, lockersRes, membersRes] = await Promise.all([
        api.getPosProducts(),
        api.getLockers(),
        api.getMembers('active')
      ]);
      setProducts(prodsRes);
      setLockerData(lockersRes);
      setMembers(membersRes);
      if (membersRes.length > 0 && !assignMemberId) {
        setAssignMemberId(membersRes[0].id);
      }
    } catch (e) {
      console.error('Failed to load POS/Locker data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cart actions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock_quantity) {
          alert('Cannot add more than available stock');
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setPosLoading(true);
    try {
      const payload = {
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
        paymentMethod,
        customerName,
        customerPhone,
        staffId: 'staff-front-desk',
        staffName: 'Priya V (Front Desk)'
      };
      const result = await api.checkoutPos(payload);
      alert(`✅ POS Sale Completed! Invoice: ${result.invoice.invoice_number} (₹${result.grandTotal})`);
      setCart([]);
      loadData();
      if (onViewInvoice) onViewInvoice(result.invoice);
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setPosLoading(false);
    }
  };

  // Locker Actions
  const handleAssignLocker = async (e) => {
    e.preventDefault();
    if (!selectedLocker || !assignMemberId) return;
    setLockerLoading(true);
    try {
      await api.assignLocker({
        lockerId: selectedLocker.id,
        memberId: assignMemberId
      });
      alert(`🔐 Locker ${selectedLocker.locker_number} successfully assigned!`);
      setSelectedLocker(null);
      loadData();
    } catch (err) {
      alert('Locker assignment failed: ' + err.message);
    } finally {
      setLockerLoading(false);
    }
  };

  const handleReleaseLocker = async (lockerId) => {
    if (!window.confirm('Release this locker and mark it Available?')) return;
    try {
      await api.releaseLocker(lockerId);
      loadData();
    } catch (err) {
      alert('Release failed: ' + err.message);
    }
  };

  const handleCreateLocker = async (e) => {
    e?.preventDefault();
    if (!newLockerForm.locker_number) {
      alert('Please enter a locker number (e.g. L-25)');
      return;
    }

    try {
      await api.createLocker(newLockerForm);
      alert(`🎉 Locker "${newLockerForm.locker_number.toUpperCase()}" added successfully!`);
      setShowAddLockerModal(false);
      setNewLockerForm({ locker_number: '', zone: 'Main Floor', monthly_rent: 500 });
      loadData();
    } catch (err) {
      alert('Failed to add locker: ' + err.message);
    }
  };

  const handleDeleteLocker = async (locker) => {
    const isOccupied = locker.status === 'occupied';
    const warning = isOccupied
      ? `Locker "${locker.locker_number}" is currently assigned to "${locker.assigned_member_name}". Deleting it will release the assignment. Are you sure you want to delete this locker?`
      : `Are you sure you want to permanently delete Locker "${locker.locker_number}"?`;

    if (!window.confirm(warning)) return;

    try {
      await api.deleteLocker(locker.id);
      alert(`🗑️ Locker "${locker.locker_number}" deleted successfully.`);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#131b26] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Retail & Floor Assets
            </span>
            <span className="text-xs text-slate-400">Tap-to-add POS + Visual Locker Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
            Retail POS & Locker Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Rapid front-desk checkout for shakes, beverages & apparel, and member locker assignments.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pos'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Retail POS Checkout</span>
          </button>

          <button
            onClick={() => setActiveTab('lockers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lockers'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Visual Locker Grid</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: RETAIL POS CHECKOUT */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Products Catalog (Tap to Add) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tap Item to Add to Register ({products.length} Products Available)
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">18% GST Handled Automatically</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-4 rounded-3xl bg-[#131b26] hover:bg-[#192332] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl mb-2">{p.image_emoji || '🥤'}</div>
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{p.category}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="font-black text-sm text-emerald-400 font-mono">₹{p.price}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Stock: {p.stock_quantity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* POS Cart / Register Till */}
          <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Current Register Cart</span>
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-slate-500 hover:text-rose-400"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Cart is empty. Tap any product on the left to add.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">₹{item.price} each</p>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold font-mono text-white text-xs w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-emerald-400 ml-1">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checkout Form */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                
                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Mobile Phone</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['upi', 'cash', 'card'].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`py-1.5 rounded-xl border text-center font-bold capitalize text-xs ${
                          paymentMethod === m
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-300">Total Due (INR):</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">₹{cartTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={posLoading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{posLoading ? 'Processing Sale...' : 'Complete Sale & Issue Receipt'}</span>
                </button>

              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW 2: VISUAL LOCKER GRID */}
      {activeTab === 'lockers' && (
        <div className="space-y-6">
          
          {/* Locker Actions & Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#131b26] border border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Facility Lockers Management</span>
              </h3>
              <p className="text-xs text-slate-400">
                Locker allocation, availability mapping, and automatic expiration synchronization with membership.
              </p>
            </div>

            <button
              onClick={() => setShowAddLockerModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Locker</span>
            </button>
          </div>

          {/* Locker Summary Badges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#131b26] border border-slate-800 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Lockers</span>
              <p className="text-2xl font-black text-white font-mono">{lockerData.summary?.total || lockerData.lockers?.length || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#131b26] border border-emerald-500/30 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-400">Available</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">{lockerData.summary?.available || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#131b26] border border-blue-500/30 text-center">
              <span className="text-[10px] font-bold uppercase text-blue-400">Occupied</span>
              <p className="text-2xl font-black text-blue-400 font-mono">{lockerData.summary?.occupied || 0}</p>
            </div>
          </div>

          {/* Lockers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {lockerData.lockers?.map((locker) => {
              const isOccupied = locker.status === 'occupied';

              return (
                <div
                  key={locker.id}
                  className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between min-h-[145px] relative group ${
                    isOccupied
                      ? 'bg-blue-950/30 border-blue-500/40'
                      : 'bg-[#131b26] border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  {/* Delete Locker Quick Action Button */}
                  <button
                    onClick={() => handleDeleteLocker(locker)}
                    title={`Delete Locker ${locker.locker_number}`}
                    className="absolute top-2 right-2 p-1 rounded-md text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1 pr-6">
                      <span className="font-black text-lg text-white font-mono">{locker.locker_number}</span>
                      <Lock className={`w-3.5 h-3.5 ${isOccupied ? 'text-blue-400' : 'text-emerald-400'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">{locker.zone}</span>
                    <span className="text-[10px] text-slate-400 font-mono">₹{locker.monthly_rent || 500}/m</span>
                  </div>

                  {isOccupied ? (
                    <div className="mt-2 pt-2 border-t border-blue-500/20 text-xs">
                      <p className="font-bold text-white truncate text-[11px]">{locker.assigned_member_name}</p>
                      <p className="text-[10px] text-blue-300 font-mono">Exp: {locker.expiry_date}</p>
                      <button
                        onClick={() => handleReleaseLocker(locker.id)}
                        className="text-[10px] text-rose-400 hover:underline mt-1 font-semibold block"
                      >
                        Vacate Locker
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-xs">
                      <span className="text-[10px] text-emerald-400 font-bold block mb-1">Available</span>
                      <button
                        onClick={() => setSelectedLocker(locker)}
                        className="w-full py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold text-center transition-colors"
                      >
                        Assign Member
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODAL: ADD NEW LOCKER */}
      {showAddLockerModal && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Add New Locker</h3>
              </div>
              <button
                onClick={() => setShowAddLockerModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocker} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Locker Number / Tag *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. L-25 or VIP-01"
                  value={newLockerForm.locker_number}
                  onChange={(e) => setNewLockerForm({ ...newLockerForm, locker_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Locker Zone / Location</label>
                <select
                  value={newLockerForm.zone}
                  onChange={(e) => setNewLockerForm({ ...newLockerForm, zone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="Main Floor">Main Floor (Unisex)</option>
                  <option value="Men Floor">Men Changing Room</option>
                  <option value="Women Floor">Women Changing Room</option>
                  <option value="VIP Lounge">VIP Floor Lounge</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Monthly Rental Rate (₹)</label>
                <input
                  type="number"
                  value={newLockerForm.monthly_rent}
                  onChange={(e) => setNewLockerForm({ ...newLockerForm, monthly_rent: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20 transition-all mt-4"
              >
                Add Locker to Floor Grid
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN LOCKER MODAL */}
      {selectedLocker && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                Assign Locker {selectedLocker.locker_number} ({selectedLocker.zone})
              </h3>
              <button
                onClick={() => setSelectedLocker(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignLocker} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Select Active Member *</label>
                <select
                  value={assignMemberId}
                  onChange={(e) => setAssignMemberId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.member_code} • {m.plan_name})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Locker validity automatically synchronizes with the member's plan expiry date.
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Monthly Locker Fee:</span>
                <span className="font-mono font-bold text-white">₹{selectedLocker.monthly_rent || 500}.00 / month</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={lockerLoading}
                  className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 font-bold text-sm text-white shadow-md transition-all"
                >
                  {lockerLoading ? 'Assigning...' : `Assign Locker ${selectedLocker.locker_number}`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const lockerToDelete = selectedLocker;
                    setSelectedLocker(null);
                    handleDeleteLocker(lockerToDelete);
                  }}
                  className="px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs transition-colors"
                  title="Delete this locker"
                >
                  Delete Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

