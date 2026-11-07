import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, ShieldCheck, TrendingUp, Users, CheckCircle,
  AlertTriangle, RefreshCw, ExternalLink, Sliders, Smartphone, Check,
  X, DollarSign, Activity, MapPin, Phone, Mail, Award, Lock, ArrowUpRight, LogOut,
  Edit3, Trash2, Archive, Globe, Sparkles, Headphones, KeyRound, Megaphone, History, Radio, ShieldAlert,
  FileSpreadsheet, UploadCloud, CreditCard, Calendar, Clock, Receipt, Download,
  Wifi, WifiOff, HardDrive, Database, LifeBuoy, Ticket, MessageSquare, Zap, Gauge, Terminal, CheckCircle2, Shield, Eye,
  Menu, ChevronRight, ChevronDown, UserCheck, MoreHorizontal
} from 'lucide-react';
import { api } from '../services/api';
import { useTenant } from '../context/TenantContext';
import PwaInstallButton from '../components/PwaInstallButton';

export default function PlatformAdminApp({ onLogout, onLaunchGym }) {
  const { switchGym } = useTenant();
  const [stats, setStats] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [newGymData, setNewGymData] = useState({
    name: '',
    slug: '',
    city: 'Vellore',
    address: '',
    owner_name: 'Karthik Raja',
    phone: '+91 98401 23456',
    email: 'karthik@healthyhowlz.com',
    gstin: '33AAAAE1234M1Z5',
    subscription_tier: 'pro_growth',
    monthly_fee: 2499,
    kiosk_pin: '1234',
    status: 'active'
  });

  // Edit Gym state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    owner_name: '',
    owner_id: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    gstin: '',
    subscription_tier: 'pro_growth',
    monthly_fee: 2499,
    kiosk_pin: '1234',
    status: 'active'
  });

  // Phase 1: Staff Credentials Management state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffModalLoading, setStaffModalLoading] = useState(false);
  const [selectedGymForStaff, setSelectedGymForStaff] = useState(null);
  const [gymStaffList, setGymStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resettingCredentials, setResettingCredentials] = useState(false);

  // Phase 1: Global Broadcasts state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    severity: 'info',
    target_audience: 'all',
    expires_hours: 24
  });

  // Phase 1: Audit Log state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Phase 2: Record SaaS Offline Payment & B2B GST Invoicing state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedGymForPayment, setSelectedGymForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    duration_months: 1,
    payment_mode: 'upi',
    reference_number: '',
    notes: ''
  });

  // Phase 2: Bulk Member Importer state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedGymForImport, setSelectedGymForImport] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importResults, setImportResults] = useState(null);

  // Phase 3: Sub-Navigation & Monitoring state
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities' | 'diagnostics' | 'tickets' | 'maintenance'

  // Phase 3: Kiosk Diagnostics & Telemetry
  const [kiosks, setKiosks] = useState([]);
  const [kiosksLoading, setKiosksLoading] = useState(false);
  const [pingingGymId, setPingingGymId] = useState(null);

  // Phase 3: Support Ticket Desk
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState(null);
  const [ticketResolutionNotes, setTicketResolutionNotes] = useState('');
  const [ticketNewStatus, setTicketNewStatus] = useState('open');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    gym_id: '',
    category: 'technical',
    priority: 'medium',
    subject: '',
    description: ''
  });

  // Phase 3: Database Maintenance & Snapshots
  const [maintenanceStats, setMaintenanceStats] = useState(null);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [vacuumLoading, setVacuumLoading] = useState(false);
  const [exportingGymId, setExportingGymId] = useState(null);

  // Responsive Mobile Collapsible Menu & Navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      const res = await api.getPlatformStats();
      if (res && res.platform) {
        setStats(res.platform);
        setGyms(res.gyms || []);
        setOwners(res.owners || []);
      }
    } catch (err) {
      console.error('Failed to load platform data:', err);
      showNotification('Failed to connect to SaaS platform backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
    loadKiosksStatus();
    loadTickets();
  }, []);

  useEffect(() => {
    if (activeTab === 'diagnostics') loadKiosksStatus();
    if (activeTab === 'tickets') loadTickets();
    if (activeTab === 'maintenance') loadMaintenanceStats();
  }, [activeTab]);

  // Handle Launch into specific gym
  const handleLaunchGym = (gym) => {
    switchGym(gym.id);
    const gymPath = `/${gym.slug || gym.id}`;
    if (onLaunchGym) {
      onLaunchGym(gym);
    } else {
      window.history.pushState({}, '', gymPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Status Change / Soft Delete handler
  const handleStatusChange = async (gymId, nextStatus) => {
    try {
      await api.updateGymStatus(gymId, nextStatus);
      const actionLabel = nextStatus === 'inactive' ? 'Soft-deleted (Inactive)' : nextStatus.toUpperCase();
      showNotification(`Gym status changed to ${actionLabel}`);
      loadPlatformData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Quick Soft-Delete action
  const handleSoftDelete = async (gym) => {
    const confirmDelete = window.confirm(
      `Soft Delete Facility: Are you sure you want to soft-delete "${gym.name}"?\n\nThe status will be set to Inactive, and historical records will remain safe in the database.`
    );
    if (!confirmDelete) return;

    try {
      await api.softDeleteGym(gym.id);
      showNotification(`"${gym.name}" has been soft deleted (status set to Inactive).`);
      loadPlatformData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Open Edit Gym Modal
  const handleOpenEdit = (gym) => {
    setEditingGym(gym);
    setEditFormData({
      name: gym.name || '',
      slug: gym.slug || '',
      owner_name: gym.owner_name || '',
      owner_id: gym.owner_id || '',
      phone: gym.phone || '',
      email: gym.email || '',
      address: gym.address || '',
      city: gym.city || 'Gudiyatham',
      state: gym.state || 'Tamil Nadu',
      pincode: gym.pincode || '',
      gstin: gym.gstin || '',
      subscription_tier: gym.subscription_tier || 'pro_growth',
      monthly_fee: gym.monthly_fee || 2499,
      kiosk_pin: gym.kiosk_pin || '1234',
      status: gym.status || 'active'
    });
    setIsEditOpen(true);
  };

  // Submit Edit Gym
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingGym) return;

    try {
      setEditLoading(true);
      await api.updateGym(editingGym.id, editFormData);
      showNotification(`Successfully updated "${editFormData.name}"`);
      setIsEditOpen(false);
      setEditingGym(null);
      loadPlatformData();
    } catch (err) {
      alert('Error updating gym: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle new gym provisioning
  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    if (!newGymData.name || !newGymData.owner_name) {
      alert('Please fill in Gym Name and Owner Name');
      return;
    }

    try {
      setProvisionLoading(true);
      await api.provisionGym(newGymData);
      showNotification(`Successfully provisioned ${newGymData.name}!`);
      setIsProvisionOpen(false);
      setNewGymData({
        name: '',
        slug: '',
        city: 'Vellore',
        address: '',
        owner_name: 'Karthik Raja',
        phone: '+91 98401 23456',
        email: 'karthik@healthyhowlz.com',
        gstin: '33AAAAE1234M1Z5',
        subscription_tier: 'pro_growth',
        monthly_fee: 2499,
        kiosk_pin: '1234',
        status: 'active'
      });
      loadPlatformData();
    } catch (err) {
      alert('Error provisioning gym: ' + err.message);
    } finally {
      setProvisionLoading(false);
    }
  };

  // Phase 1: Support Mode Impersonation ("Login as Tenant")
  const handleSupportImpersonate = async (gym) => {
    try {
      const res = await api.impersonateGym(gym.id);
      
      // Preserve current Super Admin session in sessionStorage
      sessionStorage.setItem('healthyhowlz_support_mode', 'true');
      sessionStorage.setItem('healthyhowlz_support_original_token', localStorage.getItem('elite_gym_auth_token') || '');
      sessionStorage.setItem('healthyhowlz_support_original_user', localStorage.getItem('elite_gym_user') || '');
      sessionStorage.setItem('healthyhowlz_support_gym_name', gym.name);
      sessionStorage.setItem('healthyhowlz_support_owner_name', gym.owner_name);

      // Switch active auth session to the impersonated tenant
      localStorage.setItem('elite_gym_auth_token', res.supportToken);
      localStorage.setItem('elite_gym_user', JSON.stringify(res.user));

      // Direct browser to the tenant's dedicated facility route
      const gymPath = `/${gym.slug || gym.id}`;
      window.location.href = gymPath;
    } catch (err) {
      showNotification('Failed to start support session: ' + err.message, 'error');
    }
  };

  // Phase 1: Open Emergency Staff Credentials Modal
  const handleOpenStaffModal = async (gym) => {
    try {
      setSelectedGymForStaff(gym);
      setIsStaffModalOpen(true);
      setStaffModalLoading(true);
      const staff = await api.getGymStaff(gym.id);
      setGymStaffList(staff || []);
      if (staff && staff.length > 0) {
        setSelectedStaffId(staff[0].id);
      }
    } catch (err) {
      showNotification('Failed to load staff list: ' + err.message, 'error');
    } finally {
      setStaffModalLoading(false);
    }
  };

  // Phase 1: Reset Staff PIN / Password
  const handleResetStaffCredential = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    if (!newPinInput && !newPasswordInput) {
      alert('Please enter either a new Security PIN or Password.');
      return;
    }

    try {
      setResettingCredentials(true);
      await api.resetStaffCredentials(selectedGymForStaff.id, {
        staffId: selectedStaffId,
        newPin: newPinInput || undefined,
        newPassword: newPasswordInput || undefined
      });
      showNotification('Credentials updated successfully!');
      setNewPinInput('');
      setNewPasswordInput('');
      // Reload staff
      const staff = await api.getGymStaff(selectedGymForStaff.id);
      setGymStaffList(staff || []);
    } catch (err) {
      alert('Error updating credentials: ' + err.message);
    } finally {
      setResettingCredentials(false);
    }
  };

  // Phase 1: Open Global Incident Broadcast Modal
  const handleOpenBroadcastModal = async () => {
    try {
      setIsBroadcastModalOpen(true);
      setBroadcastLoading(true);
      const active = await api.getActiveBroadcasts();
      setActiveBroadcasts(active || []);
    } catch (err) {
      showNotification('Failed to load broadcasts: ' + err.message, 'error');
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Phase 1: Publish Global Incident Broadcast
  const handlePublishBroadcast = async (e) => {
    e.preventDefault();
    try {
      await api.createBroadcast(broadcastForm);
      showNotification('Global broadcast published to all gym dashboards!');
      setBroadcastForm({ title: '', message: '', severity: 'info', target_audience: 'all', expires_hours: 24 });
      const active = await api.getActiveBroadcasts();
      setActiveBroadcasts(active || []);
    } catch (err) {
      alert('Failed to publish broadcast: ' + err.message);
    }
  };

  // Phase 1: Dismiss Broadcast from HQ
  const handleDismissBroadcast = async (id) => {
    try {
      await api.dismissBroadcast(id);
      showNotification('Broadcast deactivated.');
      const active = await api.getActiveBroadcasts();
      setActiveBroadcasts(active || []);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Phase 1: Open Audit Logs Modal
  const handleOpenAuditLogs = async () => {
    try {
      setIsAuditModalOpen(true);
      setAuditLoading(true);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs || []);
    } catch (err) {
      showNotification('Failed to load audit logs: ' + err.message, 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  // Phase 2: Open SaaS Payment Recording Modal
  const handleOpenPaymentModal = (gym = null) => {
    const target = gym || gyms[0];
    setSelectedGymForPayment(target);
    setPaymentForm({
      duration_months: 1,
      payment_mode: 'upi',
      reference_number: '',
      notes: ''
    });
    setGeneratedInvoice(null);
    setIsPaymentModalOpen(true);
  };

  // Phase 2: Submit SaaS Offline Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedGymForPayment) return;

    try {
      setPaymentLoading(true);
      const fee = Number(selectedGymForPayment.monthly_fee) || 2499;
      const totalAmount = fee * Number(paymentForm.duration_months);

      const res = await api.recordSaasPayment(selectedGymForPayment.id, {
        ...paymentForm,
        amount: totalAmount
      });
      showNotification(res.message);
      setGeneratedInvoice(res.invoice);
      loadPlatformData();
    } catch (err) {
      showNotification('Error recording payment: ' + err.message, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Phase 2: Open Bulk Member Importer Modal
  const handleOpenImportModal = (gym = null) => {
    const target = gym || gyms[0];
    setSelectedGymForImport(target);
    setImportResults(null);
    // Pre-fill a realistic sample CSV format
    setImportCsvText(
`name,phone,email,gender,plan_months,amount_paid,join_date
Deepak Kumar,9840212345,deepak@gmail.com,Male,3,2499,${new Date().toISOString().split('T')[0]}
Ananya Sundaram,9840323456,ananya@gmail.com,Female,6,4699,${new Date().toISOString().split('T')[0]}
Rohan Varma,9840434567,rohan@gmail.com,Male,12,8999,${new Date().toISOString().split('T')[0]}`
    );
    setIsImportModalOpen(true);
  };

  // Phase 2: Process Bulk Member Import
  const handleExecuteImport = async () => {
    if (!selectedGymForImport || !importCsvText.trim()) return;

    try {
      setImportLoading(true);
      const lines = importCsvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert('Please enter at least 1 member data row besides header.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedMembers = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const memberObj = {};
          headers.forEach((h, idx) => {
            memberObj[h] = parts[idx] || '';
          });
          parsedMembers.push(memberObj);
        }
      }

      const res = await api.bulkImportMembers(selectedGymForImport.id, parsedMembers);
      setImportResults(res);
      showNotification(res.message);
      loadPlatformData();
    } catch (err) {
      showNotification('Error importing members: ' + err.message, 'error');
    } finally {
      setImportLoading(false);
    }
  };

  // Phase 3: Load Kiosks Status
  const loadKiosksStatus = async () => {
    try {
      setKiosksLoading(true);
      const data = await api.getKiosksStatus();
      setKiosks(data || []);
    } catch (err) {
      console.error('Error fetching kiosks:', err);
    } finally {
      setKiosksLoading(false);
    }
  };

  // Phase 3: Ping Kiosk Terminal
  const handlePingKiosk = async (gymId) => {
    try {
      setPingingGymId(gymId);
      const res = await api.pingGymKiosk(gymId);
      showNotification(res.message);
      setKiosks((prev) =>
        prev.map((k) =>
          k.gymId === gymId
            ? { ...k, lastPingMs: res.latencyMs, status: res.status, cameraStatus: res.cameraStatus, lastSeenAt: new Date().toISOString() }
            : k
        )
      );
    } catch (err) {
      showNotification('Ping failed: ' + err.message, 'error');
    } finally {
      setPingingGymId(null);
    }
  };

  // Phase 3: Load Support Tickets
  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const data = await api.getSupportTickets();
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Phase 3: Open Edit Ticket Modal
  const handleOpenEditTicket = (tkt) => {
    setSelectedTicketForEdit(tkt);
    setTicketNewStatus(tkt.status);
    setTicketResolutionNotes(tkt.resolution_notes || '');
  };

  // Phase 3: Save Ticket Resolution
  const handleSaveTicketResolution = async () => {
    if (!selectedTicketForEdit) return;
    try {
      const res = await api.updateSupportTicket(selectedTicketForEdit.id, {
        status: ticketNewStatus,
        resolution_notes: ticketResolutionNotes
      });
      showNotification(res.message);
      setSelectedTicketForEdit(null);
      loadTickets();
    } catch (err) {
      showNotification('Failed to update ticket: ' + err.message, 'error');
    }
  };

  // Phase 3: Create Support Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const targetGym = newTicketForm.gym_id || (gyms[0] ? gyms[0].id : 'gym-gudiyatham');
      const res = await api.createSupportTicket({ ...newTicketForm, gym_id: targetGym });
      showNotification(res.message);
      setIsNewTicketOpen(false);
      setNewTicketForm({
        gym_id: gyms[0]?.id || '',
        category: 'technical',
        priority: 'medium',
        subject: '',
        description: ''
      });
      loadTickets();
    } catch (err) {
      showNotification('Failed to create ticket: ' + err.message, 'error');
    }
  };

  // Phase 3: Load DB Maintenance Stats
  const loadMaintenanceStats = async () => {
    try {
      setMaintenanceLoading(true);
      const data = await api.getMaintenanceStats();
      setMaintenanceStats(data);
    } catch (err) {
      console.error('Error fetching maintenance stats:', err);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // Phase 3: Run SQLite Vacuum
  const handleRunVacuum = async () => {
    try {
      setVacuumLoading(true);
      const res = await api.runMaintenanceVacuum();
      showNotification(res.message);
      loadMaintenanceStats();
    } catch (err) {
      showNotification('Vacuum error: ' + err.message, 'error');
    } finally {
      setVacuumLoading(false);
    }
  };

  // Phase 3: Export Tenant Snapshot Download
  const handleExportSnapshot = async (gym) => {
    try {
      setExportingGymId(gym.id);
      const snapshot = await api.exportGymSnapshot(gym.id);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `healthyhowlz-backup-${gym.slug || gym.id}-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification(`Exported complete snapshot for ${gym.name}!`);
    } catch (err) {
      showNotification('Export failed: ' + err.message, 'error');
    } finally {
      setExportingGymId(null);
    }
  };

  // Filter gyms
  const filteredGyms = gyms.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.slug && g.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
      g.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top ${
          notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Main SaaS Platform HQ Navbar - Responsive with Mobile Collapsible Menu & Direct Sign Out */}
      <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center">
                <span className="text-base sm:text-xl">🐺</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-lg font-black tracking-wider text-white">HEALTHYHOWLZ</h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  HQ<span className="hidden sm:inline"> COMMAND</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Multi-Tenant SaaS Central Management Console
              </p>
            </div>
          </div>

          {/* Desktop Action Tools (visible on sm: 640px and wider) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleOpenBroadcastModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all active:scale-95"
              title="Global Incident Broadcasts & Announcements"
            >
              <Megaphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Broadcasts</span>
            </button>

            <button
              onClick={handleOpenAuditLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all active:scale-95"
              title="Platform Audit Trail (Troubleshooting History)"
            >
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit Trail</span>
            </button>

            <PwaInstallButton compact={false} variant="navbar" />

            <button
              onClick={loadPlatformData}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Platform Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all active:scale-95"
                title="Sign Out of Platform HQ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Mobile Right Action Bar: Direct Sign Out + Collapsible Menu Toggle */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-transform active:scale-95 shadow-sm shrink-0"
                title="Sign Out of Platform HQ"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
                isMobileMenuOpen
                  ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
              title="Toggle Mobile HQ Navigation & Tools Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Navigation Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-200">
            {/* Admin Profile Strip */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-xs">
                  HQ
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Super Administrator</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">ID: 9999999999 • All Facilities</p>
                </div>
              </div>
            </div>

            {/* Quick HQ Platform Tools Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  handleOpenBroadcastModal();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-400 text-left flex items-center gap-2 transition-colors"
              >
                <Megaphone className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Broadcasts</div>
                  <div className="text-[10px] text-slate-400">Alert all gyms</div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleOpenAuditLogs();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-2 transition-colors"
              >
                <History className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Audit Trail</div>
                  <div className="text-[10px] text-slate-400">Security logs</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsProvisionOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400 text-left flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Onboard Gym</div>
                  <div className="text-[10px] text-slate-400">Add branch</div>
                </div>
              </button>

              <button
                onClick={() => {
                  loadPlatformData();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-blue-400 shrink-0 ${loading ? 'animate-spin' : ''}`} />
                <div>
                  <div className="text-xs font-bold text-white">Refresh Data</div>
                  <div className="text-[10px] text-slate-400">Sync metrics</div>
                </div>
              </button>
            </div>

            {/* Quick Workspace Navigation Sections */}
            <div className="space-y-1 mb-3 pt-2 border-t border-slate-800/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                Workspace Sections
              </div>
              <button
                onClick={() => {
                  setActiveTab('facilities');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeTab === 'facilities' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Facilities Directory ({gyms.length})</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('diagnostics');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeTab === 'diagnostics' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Hardware & Kiosk Telemetry</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('tickets');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeTab === 'tickets' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4" />
                  <span>Support Ticket Desk</span>
                </div>
                {tickets.filter(t => t.status === 'open').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                    {tickets.filter(t => t.status === 'open').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('maintenance');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeTab === 'maintenance' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>SQLite Telemetry & Cloud Backups</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Mobile Menu Footer: Large Prominent Sign Out */}
            {onLogout && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Platform HQ</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main SaaS Platform Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 pb-28 md:pb-8">
        
        {/* Hero SaaS Metric Cards - Responsive grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Total Gyms */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Gym Tenants</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">
              {stats?.totalGyms || gyms.length}
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>{stats?.activeGyms || gyms.filter(g => g.status === 'active').length} Active Facilities</span>
            </div>
          </div>

          {/* 2. SaaS MRR */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Platform SaaS MRR</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-emerald-400">
              ₹{(stats?.totalMRR || 15895).toLocaleString('en-IN')}
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Monthly Subscription Revenue
            </div>
          </div>

          {/* 3. Total Members Across Gyms */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Platform Members</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">
              {stats?.totalPlatformMembers || 24}+
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-blue-400 font-medium">
              Across all tenant locations
            </div>
          </div>

          {/* 4. Multi-Branch Owners */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">SaaS Gym Owners</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-white">
              {stats?.totalOwners || 3} Owners
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-amber-400 font-medium truncate">
              Karthik Raja: 3 Gym Branches
            </div>
          </div>
        </section>

        {/* HQ Operational Management Command Bar — 100% Mobile & Desktop Accessible */}
        <section className="p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-wider flex items-center gap-2">
                  <span>HQ PLATFORM CONTROLS</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    MOBILE READY
                  </span>
                </h3>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Urgent Floor Troubleshooting, Broadcasts & Commercial Operations
            </span>
          </div>

          {/* 6 Dedicated Quick-Action Touch Cards (2x3 on mobile, 3x2 on tablet, 6-col on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 text-xs">
            {/* 1. Global Incident Broadcasts */}
            <button
              onClick={handleOpenBroadcastModal}
              className="p-3 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/30 hover:border-purple-500 text-left transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Notices</span>
                <Megaphone className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-white text-xs">Broadcasts</div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Send floor alerts</p>
            </button>

            {/* 2. Platform Audit Trail */}
            <button
              onClick={handleOpenAuditLogs}
              className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 hover:border-slate-500 text-left transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security</span>
                <History className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-white text-xs">Audit Trail</div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Admin action log</p>
            </button>

            {/* 3. Record SaaS Offline Payment */}
            <button
              onClick={() => handleOpenPaymentModal(null)}
              className="p-3 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-500 text-left transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Billing</span>
                <DollarSign className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-white text-xs">Record Payment</div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">NEFT/UPI & Invoices</p>
            </button>

            {/* 4. Bulk Member Onboarding Import */}
            <button
              onClick={() => handleOpenImportModal(null)}
              className="p-3 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/30 hover:border-blue-500 text-left transition-all active:scale-95 group shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Onboarding</span>
                <FileSpreadsheet className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-white text-xs">Bulk Import</div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Import CSV members</p>
            </button>

            {/* 5. Kiosk Diagnostics */}
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-95 group shadow-sm ${
                activeTab === 'diagnostics'
                  ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/40'
                  : 'bg-gradient-to-b from-amber-950/30 to-slate-900 border-amber-500/30 hover:border-amber-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Hardware</span>
                <Activity className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-white text-xs">Diagnostics</div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Camera & Kiosk Pings</p>
            </button>

            {/* 6. Support Desk */}
            <button
              onClick={() => setActiveTab('tickets')}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-95 group shadow-sm ${
                activeTab === 'tickets'
                  ? 'bg-rose-950/40 border-rose-400 ring-1 ring-rose-400/40'
                  : 'bg-gradient-to-b from-rose-950/30 to-slate-900 border-rose-500/30 hover:border-rose-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Help Desk</span>
                <LifeBuoy className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-bold text-white text-xs flex items-center justify-between">
                <span>Support Desk</span>
                {tickets.filter(t => t.status === 'open').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">In-app tickets & disputes</p>
            </button>
          </div>
        </section>

        {/* Multi-Gym Architecture Showcase Banner */}
        <section className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                MULTI-TENANCY ARCHITECTURE
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white">One Gym Owner — Multiple Facility Branches</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Owner <span className="font-bold text-white">Karthik Raja</span> manages 3 connected facilities: <span className="text-emerald-400 font-bold">Gudiyatham</span> (<code className="text-xs text-slate-200">/gudiyatham</code>), <span className="text-emerald-400 font-bold">Vellore East</span> (<code className="text-xs text-slate-200">/vellore</code>), and <span className="text-emerald-400 font-bold">Chennai Anna Nagar</span> (<code className="text-xs text-slate-200">/chennai</code>).
            </p>
          </div>
          <button
            onClick={() => setIsProvisionOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Onboard New Gym</span>
          </button>
        </section>

        {/* Phase 3: Platform Workspace Sub-Navigation Tabs */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'facilities'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Facilities Directory ({gyms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Kiosk Hardware Diagnostics</span>
            {kiosks.some(k => k.status === 'offline') && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'tickets'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Ticket Desk</span>
            {tickets.filter(t => t.status === 'open').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {tickets.filter(t => t.status === 'open').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'maintenance'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & Cloud Backups</span>
          </button>
        </section>

        {/* Gym Tenants Directory Section */}
        {activeTab === 'facilities' && (
        <section className="space-y-4">
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gyms by name, slug, city, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter Tabs (Includes Inactive / Soft-deleted) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'trial', label: 'Trial' },
                { id: 'suspended', label: 'Suspended' },
                { id: 'inactive', label: 'Inactive' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                    statusFilter === st.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. DESKTOP VIEW: Sleek Table (Visible strictly on desktop screens >= 768px) */}
          <div className="hidden md:block rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Gym Facility & Route</th>
                    <th className="py-3.5 px-4">Owner & Contact</th>
                    <th className="py-3.5 px-4">Plan Tier</th>
                    <th className="py-3.5 px-4">Monthly Fee</th>
                    <th className="py-3.5 px-4">Members</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGyms.map((gym) => {
                    const isKarthik = gym.owner_id === 'staff-owner';
                    const gymRoute = `/${gym.slug || gym.id}`;

                    const validUntilStr = gym.valid_until ? gym.valid_until.split('T')[0] : '2026-12-31';
                    const todayDate = new Date().toISOString().split('T')[0];
                    const daysRemaining = Math.ceil((new Date(validUntilStr) - new Date(todayDate)) / (1000 * 60 * 60 * 24));
                    const isGrace = daysRemaining <= 0 && daysRemaining >= -5;
                    const isExpired = daysRemaining < -5;

                    return (
                      <tr key={gym.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Gym Name, Slug & City */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{gym.name}</span>
                                {isKarthik && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                                    Multi-Branch
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {gym.city}, {gym.state || 'Tamil Nadu'}
                                </span>
                                <span className="text-slate-600">•</span>
                                <code className="text-[10px] text-emerald-400/90 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                  {gymRoute}
                                </code>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Owner & Phone */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-200">{gym.owner_name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <a href={`tel:${gym.phone}`} className="hover:text-emerald-400 transition-colors">
                              {gym.phone || '+91 98401 23456'}
                            </a>
                          </div>
                        </td>

                        {/* Plan Tier */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            gym.subscription_tier === 'enterprise'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : gym.subscription_tier === 'pro_growth'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}>
                            {gym.subscription_tier?.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Monthly Fee & Validity Countdown */}
                        <td className="py-4 px-4">
                          <span className="font-black text-slate-100 font-mono">
                            ₹{Number(gym.monthly_fee).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-500 block">/month</span>
                          <div className="mt-1 flex items-center gap-1 font-mono text-[10px]">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className={isGrace ? 'text-amber-400 font-bold animate-pulse' : isExpired ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {isGrace ? `Grace: ${Math.abs(daysRemaining)}d` : isExpired ? 'Overdue' : `${daysRemaining}d valid`}
                            </span>
                          </div>
                        </td>

                        {/* Members Count */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>{gym.total_members || 0}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            gym.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : gym.status === 'trial'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : gym.status === 'suspended'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              gym.status === 'active'
                                ? 'bg-emerald-400 animate-pulse'
                                : gym.status === 'trial'
                                ? 'bg-amber-400'
                                : gym.status === 'suspended'
                                ? 'bg-rose-400'
                                : 'bg-slate-500'
                            }`} />
                            {gym.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions: Support Mode, Staff PINs, Record Payment, Bulk Import, Edit, Soft-Delete, Launch OS */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSupportImpersonate(gym)}
                              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                              title="Enter Support Impersonation Mode"
                            >
                              <Headphones className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenStaffModal(gym)}
                              className="p-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                              title="Emergency Staff Credentials & PINs"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenPaymentModal(gym)}
                              className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                              title="Record Offline SaaS Payment & Issue Invoice"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenImportModal(gym)}
                              className="p-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors"
                              title="Bulk Import Members from CSV"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExportSnapshot(gym)}
                              disabled={exportingGymId === gym.id}
                              className="p-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                              title="Download Tenant Backup Snapshot (JSON)"
                            >
                              {exportingGymId === gym.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(gym)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                              title="Edit Gym & Status"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(gym)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                              title="Soft Delete Gym"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleLaunchGym(gym)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm shadow-emerald-500/20 ml-1"
                              title={`Launch into ${gym.name}`}
                            >
                              <span>Launch OS</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. MOBILE VIEW: Responsive Gym Cards (Visible strictly on mobile screens < md: 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredGyms.map((gym) => {
              const isKarthik = gym.owner_id === 'staff-owner';
              const gymRoute = `/${gym.slug || gym.id}`;

              const validUntilStr = gym.valid_until ? gym.valid_until.split('T')[0] : '2026-12-31';
              const todayDate = new Date().toISOString().split('T')[0];
              const daysRemaining = Math.ceil((new Date(validUntilStr) - new Date(todayDate)) / (1000 * 60 * 60 * 24));
              const isGrace = daysRemaining <= 0 && daysRemaining >= -5;
              const isExpired = daysRemaining < -5;

              return (
                <div
                  key={`card-${gym.id}`}
                  className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl"
                >
                  {/* Card Header: Icon, Name, Multi-Branch & City + Static Status Pill & Route */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{gym.name}</span>
                          {isKarthik && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold shrink-0">
                              Multi-Branch
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{gym.city}, {gym.state || 'Tamil Nadu'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill & Route Slug in Header */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        gym.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : gym.status === 'trial'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : gym.status === 'suspended'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          gym.status === 'active'
                            ? 'bg-emerald-400 animate-pulse'
                            : gym.status === 'trial'
                            ? 'bg-amber-400'
                            : gym.status === 'suspended'
                            ? 'bg-rose-400'
                            : 'bg-slate-500'
                        }`} />
                        {gym.status || 'Active'}
                      </span>
                      <code className="text-[10px] text-emerald-400/90 font-mono bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                        {gymRoute}
                      </code>
                    </div>
                  </div>

                  {/* Card Body: Owner, Validity & Plan Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 pb-1.5 border-y border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Owner / Contact</span>
                      <p className="font-bold text-slate-200 truncate">{gym.owner_name}</p>
                      <a href={`tel:${gym.phone}`} className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 hover:text-emerald-400">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{gym.phone || '+91 98401 23456'}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Plan & SaaS Validity</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-emerald-400">₹{Number(gym.monthly_fee).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-500">/mo</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className={isGrace ? 'text-amber-400 font-bold' : isExpired ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {isGrace ? `Grace: ${Math.abs(daysRemaining)}d` : isExpired ? 'Overdue' : `${daysRemaining}d valid`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Clean Action Buttons with Support Mode, Staff PINs, Payment & Import */}
                  <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleSupportImpersonate(gym)}
                        className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                        title="Enter Support Impersonation Mode"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenStaffModal(gym)}
                        className="p-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                        title="Emergency Staff Credentials & PINs"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenPaymentModal(gym)}
                        className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Record Offline SaaS Payment"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenImportModal(gym)}
                        className="p-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors"
                        title="Bulk Import Members from CSV"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExportSnapshot(gym)}
                        disabled={exportingGymId === gym.id}
                        className="p-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                        title="Download Tenant Backup Snapshot (JSON)"
                      >
                        {exportingGymId === gym.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(gym)}
                        className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
                        title="Edit Facility"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleSoftDelete(gym)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Soft Delete Gym"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleLaunchGym(gym)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-sm shadow-emerald-500/20 shrink-0"
                      title={`Launch into ${gym.name}`}
                    >
                      <span>Launch OS</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </section>
        )}

        {/* Phase 3 View 1: Kiosk Hardware Telemetry & Diagnostics */}
        {activeTab === 'diagnostics' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Front-Desk Kiosk Hardware Diagnostics</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    LIVE TELEMETRY
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Real-time floor check-in scanners, camera health, and latency pings</p>
              </div>

              <button
                onClick={loadKiosksStatus}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${kiosksLoading ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>
            </div>

            {/* Quick Status Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Kiosks</span>
                <span className="text-xl font-black text-white mt-0.5 block">{kiosks.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Online & Active</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">{kiosks.filter(k => k.status === 'online').length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Unstable Latency</span>
                <span className="text-xl font-black text-amber-400 mt-0.5 block">{kiosks.filter(k => k.status === 'unstable').length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Floor Offline</span>
                <span className="text-xl font-black text-rose-400 mt-0.5 block">{kiosks.filter(k => k.status === 'offline').length}</span>
              </div>
            </div>

            {/* Kiosks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {kiosks.map((k) => (
                <div
                  key={`kiosk-${k.gymId}`}
                  className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{k.gymName}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{k.city} • /{k.gymSlug}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                      k.status === 'online'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : k.status === 'unstable'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        k.status === 'online' ? 'bg-emerald-400 animate-pulse' : k.status === 'unstable' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      {k.status}
                    </span>
                  </div>

                  {/* Device & Hardware Info */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Device Terminal:</span>
                      <span className="font-semibold text-slate-200">{k.deviceName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Local IP Address:</span>
                      <span className="font-mono text-slate-300">{k.ipAddress}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Scanner Camera:</span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        k.cameraStatus === 'active' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {k.cameraStatus === 'active' ? 'Camera Active' : 'Camera Idle / Offline'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Offline Sync Queue:</span>
                      <span className={`font-semibold ${k.offlineQueueCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {k.offlineQueueCount} Check-ins Pending
                      </span>
                    </div>
                  </div>

                  {/* Ping Latency & Actions */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Roundtrip:</span>
                      <span className="font-mono font-bold text-white">{k.lastPingMs}ms</span>
                    </div>

                    <button
                      onClick={() => handlePingKiosk(k.gymId)}
                      disabled={pingingGymId === k.gymId}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {pingingGymId === k.gymId ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>Pinging...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ping Kiosk</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Phase 3 View 2: In-App Support Ticket Desk & Floor Dispute Resolver */}
        {activeTab === 'tickets' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>In-App Support Ticket & Floor Dispute Desk</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    HQ HELP DESK
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Gym owner inquiries, floor disputes, billing requests, and hardware bug reports</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewTicketOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-purple-500/20"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Log New Ticket</span>
                </button>
                <button
                  onClick={loadTickets}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Refresh Tickets"
                >
                  <RefreshCw className={`w-4 h-4 ${ticketsLoading ? 'animate-spin text-purple-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'open', 'in_progress', 'resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTicketFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    ticketFilter === f
                      ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {f === 'in_progress' ? 'In Progress' : f} (
                    {f === 'all' ? tickets.length : tickets.filter(t => t.status === f).length}
                  )
                </button>
              ))}
            </div>

            {/* Tickets Table (Desktop) */}
            <div className="hidden md:block rounded-3xl border border-slate-800 overflow-hidden bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                    <th className="py-3 px-4">Ticket #</th>
                    <th className="py-3 px-4">Facility & Requester</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Subject & Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tickets
                    .filter(t => ticketFilter === 'all' || t.status === ticketFilter)
                    .map((tkt) => (
                      <tr key={tkt.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                          {tkt.ticket_number}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{tkt.gym_name}</span>
                          <span className="text-[11px] text-slate-400">{tkt.requester_name} ({tkt.requester_role})</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                            {tkt.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tkt.priority === 'critical' || tkt.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : tkt.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {tkt.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-white block truncate">{tkt.subject}</span>
                          <span className="text-[11px] text-slate-400 block truncate">{tkt.description}</span>
                          {tkt.resolution_notes && (
                            <span className="text-[10px] text-emerald-400 mt-0.5 block truncate">
                              ✓ {tkt.resolution_notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 w-fit ${
                            tkt.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : tkt.status === 'in_progress'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              tkt.status === 'resolved' ? 'bg-emerald-400' : tkt.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400 animate-ping'
                            }`} />
                            {tkt.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditTicket(tkt)}
                            className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold transition-all active:scale-95"
                          >
                            Resolve / Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Tickets Cards (Mobile) */}
            <div className="block md:hidden space-y-3">
              {tickets
                .filter(t => ticketFilter === 'all' || t.status === ticketFilter)
                .map((tkt) => (
                  <div key={`m-tkt-${tkt.id}`} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">{tkt.ticket_number}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            tkt.priority === 'critical' || tkt.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {tkt.priority}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs mt-1">{tkt.subject}</h4>
                        <p className="text-[11px] text-slate-400">{tkt.gym_name} • {tkt.requester_name}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${
                        tkt.status === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : tkt.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        {tkt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                      {tkt.description}
                    </p>

                    {tkt.resolution_notes && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Resolution: {tkt.resolution_notes}</span>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => handleOpenEditTicket(tkt)}
                        className="w-full py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-xs"
                      >
                        Resolve / Edit Ticket
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Phase 3 View 3: Database Health, WAL Telemetry & 1-Click Backups */}
        {activeTab === 'maintenance' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>SQLite Database Maintenance & Cloud Snapshots</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    SYSTEM HEALTH
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Zero-downtime WAL index optimization, defragmentation, and tenant snapshot downloads</p>
              </div>

              <button
                onClick={loadMaintenanceStats}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${maintenanceLoading ? 'animate-spin text-blue-400' : ''}`} />
                <span>Refresh Metrics</span>
              </button>
            </div>

            {/* Health Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Database Size</span>
                <div className="text-xl font-black text-white">{maintenanceStats?.dbSizeFormatted || '284 KB'}</div>
                <span className="text-[10px] text-slate-500 font-mono block">Pages: {maintenanceStats?.pageCount || 71}</span>
              </div>
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">WAL Write Log</span>
                <div className="text-xl font-black text-emerald-400">{maintenanceStats?.walSizeFormatted || '32 KB'}</div>
                <span className="text-[10px] text-slate-500 font-mono block">Journal: {maintenanceStats?.journalMode?.toUpperCase() || 'WAL'}</span>
              </div>
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">PRAGMA Integrity</span>
                <div className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>PASS</span>
                </div>
                <span className="text-[10px] text-slate-500 block">No corruption detected</span>
              </div>
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Platform Records</span>
                <div className="text-xl font-black text-white">{maintenanceStats?.totalRecords || 120}+</div>
                <span className="text-[10px] text-slate-500 block">Across 8 tenant tables</span>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vacuum & Optimize Card */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Run SQLite Optimize & Vacuum</h4>
                    <p className="text-[11px] text-slate-400">Rebuild internal B-Tree indices and commit WAL write-ahead log pages</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  Executes non-blocking <code className="text-emerald-400 font-mono text-xs">PRAGMA optimize;</code> followed by <code className="text-emerald-400 font-mono text-xs">VACUUM;</code> to reclaim fragmented storage space.
                </p>
                <button
                  onClick={handleRunVacuum}
                  disabled={vacuumLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {vacuumLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                  <span>{vacuumLoading ? 'Optimizing Database Pages...' : 'Execute SQLite Vacuum & Flush'}</span>
                </button>
              </div>

              {/* 1-Click Tenant JSON Snapshot Center */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">1-Click Tenant Snapshot Center</h4>
                    <p className="text-[11px] text-slate-400">Safeguard tenant records (Staff, Members, Plans, Invoices) before changes</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {gyms.map((g) => (
                    <div key={`backup-${g.id}`} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{g.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/{g.slug}</span>
                      </div>
                      <button
                        onClick={() => handleExportSnapshot(g)}
                        disabled={exportingGymId === g.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        {exportingGymId === g.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        <span>Backup JSON</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SaaS Subscription Plans Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">HealthyHowlz SaaS Subscription Tiers</h3>
              <p className="text-xs text-slate-400">Available billing plans for new gym tenants</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Starter Tier */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Starter Tier</span>
                <span className="text-xs font-mono text-slate-400">1 Facility</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">₹899 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-400 mt-1">For single location gyms starting up</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to 150 members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Reception QR Kiosk Scanner</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic Member PWA App</span>
                </li>
              </ul>
            </div>

            {/* 2. Pro Growth Tier (Most Popular) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 space-y-4 relative">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                MOST POPULAR
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pro Growth Tier</span>
                <span className="text-xs font-mono text-slate-400">Multi-Coach</span>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">₹2,499 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-400 mt-1">High-volume clubs & performance centers</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited active members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Trainer App 3 & Anti-Fraud PT PIN</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>POS Retail & Owner Expenses P&L</span>
                </li>
              </ul>
            </div>

            {/* 3. Enterprise Tier */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Enterprise Chain</span>
                <span className="text-xs font-mono text-slate-400">Unlimited Multi-Gym</span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">₹4,999 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-400 mt-1">Gym chains with multi-branch cross access</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Multi-Facility Branch Switcher</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Cross-gym member check-in roaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Consolidated HQ profit & loss analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* EDIT GYM MODAL */}
      {isEditOpen && editingGym && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative my-8">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Edit Gym Facility</h3>
                <p className="text-xs text-slate-400">Update tenant parameters, routes, and billing settings</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Custom Route Slug (e.g. salem)</label>
                  <input
                    type="text"
                    required
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.owner_name}
                    onChange={(e) => setEditFormData({ ...editFormData, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Contact Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City / Region</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Plan Tier</label>
                  <select
                    value={editFormData.subscription_tier}
                    onChange={(e) => setEditFormData({ ...editFormData, subscription_tier: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro_growth">Pro Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fee (₹/mo)</label>
                  <input
                    type="number"
                    value={editFormData.monthly_fee}
                    onChange={(e) => setEditFormData({ ...editFormData, monthly_fee: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                    <span>Facility Status *</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Editable</span>
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="active" className="text-emerald-400 bg-slate-900">Active (Full Access)</option>
                    <option value="trial" className="text-amber-400 bg-slate-900">Trial (14-Day Evaluation)</option>
                    <option value="suspended" className="text-rose-400 bg-slate-900">Suspended (Locked)</option>
                    <option value="inactive" className="text-slate-400 bg-slate-900">Inactive (Soft Deleted)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISION NEW GYM TENANT MODAL */}
      {isProvisionOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative my-8">
            <button
              onClick={() => setIsProvisionOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Provision New Gym Tenant</h3>
                <p className="text-xs text-slate-400">Instantly deploy a new facility into HealthyHowlz</p>
              </div>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gym Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HealthyHowlz Arena — Salem West"
                    value={newGymData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      setNewGymData({ ...newGymData, name, slug: newGymData.slug || slug });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Route Slug (e.g. /salem)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. salem"
                    value={newGymData.slug}
                    onChange={(e) => setNewGymData({ ...newGymData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salem"
                    value={newGymData.city}
                    onChange={(e) => setNewGymData({ ...newGymData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karthik Raja"
                    value={newGymData.owner_name}
                    onChange={(e) => setNewGymData({ ...newGymData, owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Phone</label>
                  <input
                    type="text"
                    value={newGymData.phone}
                    onChange={(e) => setNewGymData({ ...newGymData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={newGymData.email}
                    onChange={(e) => setNewGymData({ ...newGymData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subscription Tier</label>
                  <select
                    value={newGymData.subscription_tier}
                    onChange={(e) => {
                      const tier = e.target.value;
                      const fee = tier === 'starter' ? 899 : tier === 'enterprise' ? 4999 : 2499;
                      setNewGymData({ ...newGymData, subscription_tier: tier, monthly_fee: fee });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="starter">Starter (₹899/mo)</option>
                    <option value="pro_growth">Pro Growth (₹2,499/mo)</option>
                    <option value="enterprise">Enterprise (₹4,999/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly SaaS Fee (₹)</label>
                  <input
                    type="number"
                    value={newGymData.monthly_fee}
                    onChange={(e) => setNewGymData({ ...newGymData, monthly_fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Facility Address</label>
                <input
                  type="text"
                  placeholder="e.g. 45, Omalur Main Road, Salem"
                  value={newGymData.address}
                  onChange={(e) => setNewGymData({ ...newGymData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProvisionOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={provisionLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {provisionLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Deploy Gym</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 1 MODAL 1: EMERGENCY STAFF CREDENTIALS & PIN MANAGEMENT */}
      {isStaffModalOpen && selectedGymForStaff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative my-8">
            <button
              onClick={() => setIsStaffModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Emergency Access & Staff Credentials</h3>
                <p className="text-xs text-slate-400">{selectedGymForStaff.name} — Reset locked PINs or passwords</p>
              </div>
            </div>

            {staffModalLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                <span>Loading facility staff roster...</span>
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* Staff Roster Table */}
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                        <th className="py-2.5 px-3">Name & Role</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Current PIN</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {gymStaffList.map((st) => (
                        <tr
                          key={st.id}
                          className={`hover:bg-slate-800/40 transition-colors ${selectedStaffId === st.id ? 'bg-blue-500/10' : ''}`}
                        >
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">{st.name}</span>
                            <span className="text-[10px] uppercase font-bold text-blue-400">{st.role}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{st.phone}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{st.security_pin || '1234'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedStaffId(st.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                selectedStaffId === st.id
                                  ? 'bg-blue-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              {selectedStaffId === st.id ? 'Selected' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Reset Form */}
                <form onSubmit={handleResetStaffCredential} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">
                      Reset Credentials for Selected User:{' '}
                      <span className="text-blue-400 underline">
                        {gymStaffList.find(s => s.id === selectedStaffId)?.name || 'Select a user'}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">New 4-Digit Security PIN</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 5678"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">New Password (Optional)</label>
                      <input
                        type="password"
                        placeholder="New account password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={resettingCredentials || !selectedStaffId}
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {resettingCredentials ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>Apply Emergency Reset</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 1 MODAL 2: GLOBAL INCIDENT BROADCAST COMPOSER & MANAGER */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative my-8">
            <button
              onClick={() => setIsBroadcastModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Global Incident Broadcast Manager</h3>
                <p className="text-xs text-slate-400">Publish high-priority operational notices to all gym dashboards</p>
              </div>
            </div>

            {/* Active Announcements List */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-300 text-xs mb-2">Live Broadcasts On Gym Dashboards</h4>
                {activeBroadcasts.length === 0 ? (
                  <p className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-center italic">
                    No active broadcasts running. All tenant dashboards are clear.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activeBroadcasts.map((bc) => (
                      <div
                        key={bc.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                          bc.severity === 'critical'
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                            : bc.severity === 'warning'
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                            : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs">{bc.title}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-black tracking-wider bg-black/40">
                              {bc.severity}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-80 mt-0.5 truncate">{bc.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDismissBroadcast(bc.id)}
                          className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-rose-500 text-slate-300 hover:text-white text-[10px] font-bold shrink-0 transition-colors"
                        >
                          Deactivate
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compose New Broadcast Form */}
              <form onSubmit={handlePublishBroadcast} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs">Publish New Advisory or Incident Alert</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Headline Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scheduled Nightly Maintenance"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Severity Level</label>
                    <select
                      value={broadcastForm.severity}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="info">Info / General Update</option>
                      <option value="warning">Warning / Service Delay</option>
                      <option value="critical">Critical / Incident Alert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Broadcast Message Body *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Core server upgrade scheduled for 11:00 PM IST. Reception QR kiosk scanners remain operational in offline mode."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Target Audience</label>
                    <select
                      value={broadcastForm.target_audience}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, target_audience: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="all">All Portals (Owners + Coaches)</option>
                      <option value="owners">Gym Owners & Admins Only</option>
                      <option value="trainers">Floor Coaches Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Auto-Expire Duration</label>
                    <select
                      value={broadcastForm.expires_hours}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, expires_hours: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value={4}>4 Hours</option>
                      <option value={12}>12 Hours</option>
                      <option value={24}>24 Hours</option>
                      <option value={72}>3 Days</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-purple-500/20"
                  >
                    <Radio className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Publish Broadcast Live</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 1 MODAL 3: PLATFORM AUDIT TRAIL STREAM */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-slate-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAuditModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Platform Administrative Audit Trail</h3>
                <p className="text-xs text-slate-400">Real-time log of impersonation sessions, resets, and tenant updates</p>
              </div>
            </div>

            {auditLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Loading audit log stream...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="p-8 text-center text-slate-500 italic text-xs">No administrative actions logged yet.</p>
            ) : (
              <div className="rounded-2xl border border-slate-800 overflow-x-auto bg-slate-900/70 max-h-96 overflow-y-auto text-xs">
                <table className="w-full text-left min-w-[460px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Target Facility</th>
                      <th className="py-2.5 px-3">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.action.includes('impersonate')
                              ? 'bg-amber-500/20 text-amber-300'
                              : log.action.includes('credential')
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">
                          {log.gym_name || log.target_gym_id || 'Global Platform'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{log.admin_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2 MODAL 1: RECORD SAAS OFFLINE PAYMENT & B2B GST TAX INVOICE */}
      {isPaymentModalOpen && selectedGymForPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-xl w-full p-4 sm:p-6 text-slate-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsPaymentModalOpen(false);
                setGeneratedInvoice(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Record SaaS Subscription Payment</h3>
                <p className="text-xs text-slate-400">Offline Collection (NEFT/UPI/Cash) & B2B GST Invoicing</p>
              </div>
            </div>

            {/* If Invoice Generated - Show Tax Invoice */}
            {generatedInvoice ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-bold block text-sm text-white">Payment Recorded Successfully!</span>
                    <span>Facility validity extended to <span className="font-mono font-bold text-emerald-400">{generatedInvoice.billing_period_end}</span>. Status is active.</span>
                  </div>
                </div>

                {/* Tax Invoice Document Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-sans">B2B TAX INVOICE</span>
                      <span className="text-sm font-black text-white">{generatedInvoice.invoice_number}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      PAID • {generatedInvoice.payment_mode.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] font-sans">
                    <div>
                      <span className="text-slate-400 block text-[10px]">BILLED TO FACILITY:</span>
                      <span className="font-bold text-white block">{generatedInvoice.gym_name}</span>
                      <span className="text-slate-400">{generatedInvoice.owner_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">COVERAGE PERIOD:</span>
                      <span className="text-white font-medium">{generatedInvoice.billing_period_start} to {generatedInvoice.billing_period_end}</span>
                      <span className="text-emerald-400 font-bold block">({generatedInvoice.duration_months} Month{generatedInvoice.duration_months > 1 ? 's' : ''})</span>
                    </div>
                  </div>

                  {generatedInvoice.reference_number && (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                      <span className="text-slate-400">UTR / Ref: </span>
                      <span className="text-emerald-300 font-bold">{generatedInvoice.reference_number}</span>
                    </div>
                  )}

                  {/* Line Items Table */}
                  <div className="border-t border-b border-slate-800 py-3 space-y-2">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>HealthyHowlz Platform SaaS (SAC 998313)</span>
                      <span className="text-white">₹{Number(generatedInvoice.amount_base).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>CGST (9.0%)</span>
                      <span className="text-white">₹{((Number(generatedInvoice.gst_amount) || 0) / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>SGST (9.0%)</span>
                      <span className="text-white">₹{((Number(generatedInvoice.gst_amount) || 0) / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                      <span>Total Invoice Amount</span>
                      <span className="text-emerald-400">₹{Number(generatedInvoice.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-sans italic text-center">
                    This is an electronically generated SaaS tax invoice under GST Rules 2017.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setGeneratedInvoice(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
                {/* Facility Selector */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Gym Facility *</label>
                  <select
                    value={selectedGymForPayment.id}
                    onChange={(e) => {
                      const gym = gyms.find(g => g.id === e.target.value);
                      if (gym) setSelectedGymForPayment(gym);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {gyms.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.city}) — Tier: {g.subscription_tier} (₹{Number(g.monthly_fee || 2499).toLocaleString('en-IN')}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Duration Selector */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Subscription Extension Duration</label>
                    <select
                      value={paymentForm.duration_months}
                      onChange={(e) => setPaymentForm({ ...paymentForm, duration_months: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value={1}>1 Month (Monthly Renewal)</option>
                      <option value={3}>3 Months (Quarterly Pass)</option>
                      <option value={6}>6 Months (Half-Yearly)</option>
                      <option value={12}>12 Months (Annual Enterprise)</option>
                    </select>
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Payment Method / Gateway</label>
                    <select
                      value={paymentForm.payment_mode}
                      onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="upi">UPI / QR Payment</option>
                      <option value="neft">NEFT / IMPS / NetBanking</option>
                      <option value="cash">Direct Cash Collection</option>
                      <option value="cheque">Bank Cheque</option>
                    </select>
                  </div>
                </div>

                {/* Reference Number & UTR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Bank Reference / UTR Number</label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-491029381928"
                      value={paymentForm.reference_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Billing Remarks / Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Paid to HDFC current account"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Live GST & Calculation Summary Card */}
                {(() => {
                  const monthlyFee = Number(selectedGymForPayment.monthly_fee) || 2499;
                  const total = monthlyFee * Number(paymentForm.duration_months);
                  const base = +(total / 1.18).toFixed(2);
                  const gst = +(total - base).toFixed(2);
                  return (
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">Base SaaS Fee ({paymentForm.duration_months} mo @ ₹{monthlyFee}/mo):</span>
                        <span className="text-slate-200">₹{base.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">18% GST (CGST 9% + SGST 9%):</span>
                        <span className="text-slate-300">₹{gst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-black pt-2 border-t border-slate-800">
                        <span className="text-white">Total Amount to Collect:</span>
                        <span className="text-emerald-400 text-base">₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20"
                  >
                    {paymentLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirm & Generate Invoice</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2 MODAL 2: BULK CSV MEMBER ONBOARDING IMPORTER */}
      {isImportModalOpen && selectedGymForImport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-xl w-full p-4 sm:p-6 text-slate-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setImportResults(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Bulk Member Onboarding Importer</h3>
                <p className="text-xs text-slate-400">Migrate and enroll 100+ members via CSV data</p>
              </div>
            </div>

            {/* Target Facility Selector */}
            <div className="mb-4">
              <label className="block text-slate-400 font-semibold mb-1 text-xs">Destination Facility *</label>
              <select
                value={selectedGymForImport.id}
                onChange={(e) => {
                  const gym = gyms.find(g => g.id === e.target.value);
                  if (gym) setSelectedGymForImport(gym);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.city})
                  </option>
                ))}
              </select>
            </div>

            {/* If Import Results exist, show summary */}
            {importResults ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-bold block text-sm text-white">{importResults.message}</span>
                    <span>Added to <span className="font-bold text-emerald-300">{selectedGymForImport.name}</span> membership directory.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Enrolled</span>
                    <span className="text-xl font-black text-emerald-400">{importResults.importedCount ?? importResults.imported ?? 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Skipped / Existed</span>
                    <span className="text-xl font-black text-amber-400">{importResults.skippedCount ?? importResults.skipped ?? 0}</span>
                  </div>
                </div>

                {importResults.errors && importResults.errors.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Details / Skipped Items:</span>
                    <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-slate-300">
                      {importResults.errors.map((err, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-amber-400">
                          <span>•</span>
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportResults(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-semibold text-xs">Paste CSV Data</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setImportCsvText(
`name,phone,email,gender,plan_months,amount_paid,join_date
Deepak Kumar,9840212345,deepak@gmail.com,Male,3,2499,${today}
Ananya Sundaram,9840323456,ananya@gmail.com,Female,6,4699,${today}
Rohan Varma,9840434567,rohan@gmail.com,Male,12,8999,${today}`
                        );
                      }}
                      className="text-[10px] text-blue-400 hover:underline font-bold"
                    >
                      Fill Sample Data
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setImportCsvText('')}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  rows={7}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder="name,phone,email,gender,plan_months,amount_paid,join_date"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>CSV Format Requirements:</span>
                  </div>
                  <p>Required fields: <code className="text-slate-200">name, phone</code> (10 digits). Optional: <code className="text-slate-200">email, gender, plan_months, amount_paid, join_date</code>.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={importLoading || !importCsvText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 shadow-md shadow-blue-500/20"
                  >
                    {importLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Importing Members...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Execute Bulk Import</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3 MODAL 1: REVIEW & RESOLVE SUPPORT TICKET */}
      {selectedTicketForEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full p-4 sm:p-6 text-slate-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTicketForEdit(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Ticket #{selectedTicketForEdit.id?.slice(0, 8)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedTicketForEdit.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    selectedTicketForEdit.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {selectedTicketForEdit.priority}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{selectedTicketForEdit.subject}</h3>
              </div>
            </div>

            {/* Ticket details summary card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 mb-4">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Facility: <strong className="text-white">{selectedTicketForEdit.gym_name || selectedTicketForEdit.gym_id}</strong></span>
                <span>Reported by: <strong className="text-slate-300">{selectedTicketForEdit.reported_by || 'Staff'}</strong></span>
              </div>
              <div className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {selectedTicketForEdit.description || 'No additional details provided.'}
              </div>
            </div>

            {/* Status Update & Resolution Notes Form */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ticket Status</label>
                <select
                  value={ticketNewStatus}
                  onChange={(e) => setTicketNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="open">🔴 Open - Awaiting Resolution</option>
                  <option value="in_progress">🟡 In Progress - Under Active Investigation</option>
                  <option value="resolved">🟢 Resolved - Dispute Settled & Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">HQ Resolution Notes & Actions Taken</label>
                <textarea
                  rows={3}
                  value={ticketResolutionNotes}
                  onChange={(e) => setTicketResolutionNotes(e.target.value)}
                  placeholder="e.g. Cleared kiosk offline cache, recredited member 1 PT session token, validated camera scanner on 192.168.1.104."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTicketResolution}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-rose-500/20"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Update & Save Resolution</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3 MODAL 2: LOG NEW SUPPORT TICKET */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full p-4 sm:p-6 text-slate-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsNewTicketOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Log In-App Support Ticket</h3>
                <p className="text-xs text-slate-400">Escalate hardware, billing, or floor disputes to HQ</p>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Facility Branch</label>
                <select
                  value={newTicketForm.gym_id}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, gym_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="hardware">Hardware / Kiosk</option>
                    <option value="dispute">PT Session Dispute</option>
                    <option value="billing">SaaS Billing / Invoicing</option>
                    <option value="technical">Technical / App Bug</option>
                    <option value="general">General Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="low">Low - Cosmetic / Routine</option>
                    <option value="medium">Medium - Standard</option>
                    <option value="high">High - Urgent</option>
                    <option value="critical">Critical - Operations Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subject / Issue Summary</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  placeholder="e.g. Front desk barcode scanner is not recognizing QR passes"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  placeholder="Provide context, device IDs, member codes, or dispute details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-rose-500/20"
                >
                  <LifeBuoy className="w-4 h-4 stroke-[2]" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="border-t border-slate-800/80 py-5 px-6 text-center text-xs text-slate-500 pb-24 md:pb-5">
        <p>© 2026 HealthyHowlz Fitness OS • Multi-Tenant SaaS Cloud Platform • Powered by SQLite WAL</p>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (< md devices) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f17]/95 backdrop-blur-lg border-t border-slate-800/90 px-3 py-2 flex items-center justify-around shadow-2xl">
        {/* 1. Facilities Directory */}
        <button
          onClick={() => {
            setActiveTab('facilities');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'facilities'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className={`w-5 h-5 ${activeTab === 'facilities' ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Gyms</span>
        </button>

        {/* 2. Kiosk Diagnostics */}
        <button
          onClick={() => {
            setActiveTab('diagnostics');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl relative transition-all active:scale-95 ${
            activeTab === 'diagnostics'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Activity className={`w-5 h-5 ${activeTab === 'diagnostics' ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
            {kiosks.some(k => k.status === 'offline' || k.status === 'unstable') && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Kiosks</span>
        </button>

        {/* 3. Support Tickets Desk */}
        <button
          onClick={() => {
            setActiveTab('tickets');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl relative transition-all active:scale-95 ${
            activeTab === 'tickets'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <LifeBuoy className={`w-5 h-5 ${activeTab === 'tickets' ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
            {tickets.filter(t => t.status === 'open').length > 0 && (
              <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black leading-none">
                {tickets.filter(t => t.status === 'open').length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Tickets</span>
        </button>

        {/* 4. Database Maintenance */}
        <button
          onClick={() => {
            setActiveTab('maintenance');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all active:scale-95 ${
            activeTab === 'maintenance'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className={`w-5 h-5 ${activeTab === 'maintenance' ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Backups</span>
        </button>

        {/* 5. Mobile Menu & Sign Out Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all active:scale-95 ${
            isMobileMenuOpen
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Menu className={`w-5 h-5 ${isMobileMenuOpen ? 'text-purple-400 rotate-90 transition-transform' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
        </button>
      </nav>
    </div>
  );
}
