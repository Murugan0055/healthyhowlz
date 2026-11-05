import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Crown, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Lock, 
  RefreshCw, 
  Search,
  Phone,
  Mail,
  Percent,
  Play,
  Pause,
  LayoutGrid,
  List
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UsersManagementPage() {
  const { user: currentUser, isSuperAdmin, isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    name: '',
    role: 'admin',
    phone: '',
    email: '',
    password: '',
    pin: '1234',
    commissionRate: 5.0
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert('Name and Phone are required');
      return;
    }

    if (form.role === 'super_admin') {
      alert('Super Admin role cannot be created. Please select Owner, Manager, or Admin.');
      return;
    }

    try {
      await api.createStaff(form);
      alert(`🎉 User "${form.name}" with role "${form.role.toUpperCase()}" created successfully!`);
      setShowCreateModal(false);
      setForm({
        name: '',
        role: 'admin',
        phone: '',
        email: '',
        password: '',
        pin: '1234',
        commissionRate: 5.0
      });
      loadUsers();
    } catch (err) {
      alert('Failed to create user: ' + err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'super_admin') {
      alert('Super Admin user cannot be deactivated.');
      return;
    }
    try {
      await api.toggleStaffStatus(user.id);
      loadUsers();
    } catch (err) {
      alert('Status change failed: ' + err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === 'super_admin') {
      alert('Super Admin cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    try {
      await api.deleteStaff(user.id);
      loadUsers();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.updateStaff(editingUser.id, editingUser);
      alert('User updated successfully');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3 h-3 text-purple-400" />
            Super Admin
          </span>
        );
      case 'owner':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
            Owner
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider">
            Manager
          </span>
        );
      case 'admin':
      case 'front_desk':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
            Admin (Desk)
          </span>
        );
      case 'trainer':
        return (
          <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
            Floor Coach
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
            {role}
          </span>
        );
    }
  };

  // Filter users by role and search query
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all') {
      if (roleFilter === 'super_admin' && u.role !== 'super_admin') return false;
      if (roleFilter === 'owner' && u.role !== 'owner') return false;
      if (roleFilter === 'manager' && u.role !== 'manager') return false;
      if (roleFilter === 'admin' && u.role !== 'admin' && u.role !== 'front_desk') return false;
      if (roleFilter === 'trainer' && u.role !== 'trainer') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchRole = u.role?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchRole;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#131b26] border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Role-Based Access Control
            </span>
            <span className="text-xs text-slate-400">Total {users.length} authorized users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight brand-font">
            Staff & Admin User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create and manage Owner, Manager, and Admin users with custom Officer PINs and access privileges.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* User Search Input with Clear Button */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear search (show all users)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create Admin / Staff User</span>
          </button>
        </div>
      </div>

      {/* Role Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#131b26] border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Staff</span>
          <p className="text-2xl font-black text-white font-mono mt-0.5">{users.length}</p>
          <span className="text-[10px] text-slate-500">All registered users</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131b26] border border-purple-500/30">
          <span className="text-[10px] font-bold uppercase text-purple-400 block">Root Super Admin</span>
          <p className="text-2xl font-black text-purple-300 font-mono mt-0.5">
            {users.filter(u => u.role === 'super_admin').length}
          </p>
          <span className="text-[10px] text-purple-400/80">Protected Root Master</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131b26] border border-emerald-500/30">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block">Owners & Managers</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
            {users.filter(u => u.role === 'owner' || u.role === 'manager').length}
          </p>
          <span className="text-[10px] text-emerald-400/80">Management Tier</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131b26] border border-amber-500/30">
          <span className="text-[10px] font-bold uppercase text-amber-400 block">Front Desk / Admins</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">
            {users.filter(u => u.role === 'admin' || u.role === 'front_desk').length}
          </p>
          <span className="text-[10px] text-amber-400/80">Reception Kiosk Desk</span>
        </div>
      </div>

      {/* Filter Tabs & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'super_admin', label: 'Super Admin' },
            { id: 'owner', label: 'Owners' },
            { id: 'manager', label: 'Managers' },
            { id: 'admin', label: 'Admins / Desk' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                roleFilter === tab.id
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* RESPONSIVE STAFF USER CARDS GRID */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#131b26] border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Users Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? (
              <>
                No users match "{searchQuery}".{' '}
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-purple-400 hover:underline font-semibold ml-1"
                >
                  Clear search and show all {users.length} users
                </button>
              </>
            ) : (
              'No users found in this role category.'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const isSuper = u.role === 'super_admin';
            const isActive = u.is_active === 1;

            return (
              <div
                key={u.id}
                className="rounded-3xl bg-[#131b26] border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between space-y-4 shadow-lg relative group overflow-hidden"
              >
                {/* Top Accent Strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isSuper ? 'bg-purple-500' : u.role === 'owner' ? 'bg-emerald-500' : u.role === 'manager' ? 'bg-blue-500' : 'bg-amber-500'
                }`} />

                <div>
                  {/* Header: Name, Role Badge, Status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-base text-white truncate">{u.name}</h4>
                        {isSuper && <Crown className="w-4 h-4 text-purple-400 flex-shrink-0" title="Root Super Admin" />}
                      </div>
                      <div className="mt-1">{getRoleBadge(u.role)}</div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Contact & Security Info */}
                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        Phone:
                      </span>
                      <span className="font-mono font-bold text-white">{u.phone}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        Email:
                      </span>
                      <span className="text-slate-300 truncate max-w-[160px]">{u.email || '—'}</span>
                    </div>

                    {/* Security PIN Box */}
                    <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        Desk PIN:
                      </span>
                      <span className="font-mono font-black text-amber-300 tracking-wider">
                        {u.security_pin ? `•••• (${u.security_pin})` : '••••'}
                      </span>
                    </div>

                    {/* Sales Commission */}
                    <div className="flex items-center justify-between text-slate-400 text-xs pt-1">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3 text-emerald-400" />
                        Sales Commission:
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{u.commission_rate}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {!isSuper && (
                    <>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isActive ? 'Pause' : 'Activate'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {isSuper && (
                    <span className="text-[10px] text-purple-400/80 font-semibold italic py-1 px-2">
                      Root Master (Protected)
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW ADMIN USER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Create New Admin User</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5 text-xs">
              
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Assigned Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:outline-none"
                >
                  <option value="admin">Admin (Front Desk Operations & Kiosk)</option>
                  <option value="manager">Manager (Operations, Leads & Finances)</option>
                  <option value="owner">Owner (Full Business Authority)</option>
                  <option value="trainer">Trainer / Floor Coach</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * Note: Another Super Admin cannot be created. Super Admin is root system authority.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="staff@elitegym.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Desk PIN (4 Digits) *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="4-digit PIN"
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Login password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Sales Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20 transition-all mt-4"
              >
                Create Staff User & Authorize Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Edit User: {editingUser.name}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Role</label>
                {editingUser.role === 'super_admin' ? (
                  <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                    Super Admin (Immutable Root Role)
                  </div>
                ) : (
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="admin">Admin (Front Desk Operations & Kiosk)</option>
                    <option value="manager">Manager (Operations, Leads & Finances)</option>
                    <option value="owner">Owner (Full Business Authority)</option>
                    <option value="trainer">Trainer / Floor Coach</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Security PIN (4 Digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editingUser.security_pin || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, security_pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingUser.commission_rate}
                    onChange={(e) => setEditingUser({ ...editingUser, commission_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20 transition-all mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
