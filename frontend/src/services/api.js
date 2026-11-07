const BASE_URL = '/api';

export const getActiveGymId = () => {
  try {
    return localStorage.getItem('healthyhowlz_active_gym_id') || 'gym-gudiyatham';
  } catch (e) {
    return 'gym-gudiyatham';
  }
};

// Auto-inject x-gym-id tenant header & Authorization token into all API requests
const originalFetch = window.fetch ? window.fetch.bind(window) : fetch;
const tenantFetch = (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('x-gym-id')) {
    headers.set('x-gym-id', getActiveGymId());
  }
  const token = localStorage.getItem('elite_gym_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return originalFetch(url, { ...options, headers });
};
const fetch = tenantFetch;

export const api = {
  // Kiosk & Attendance
  scanQr: async (token) => {
    const res = await fetch(`${BASE_URL}/kiosk/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return await res.json();
  },

  verifyManualPin: async (query, officerPin, staffId) => {
    const res = await fetch(`${BASE_URL}/kiosk/manual-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, officerPin, staffId })
    });
    return await res.json();
  },

  confirmManualCheckin: async (payload) => {
    const res = await fetch(`${BASE_URL}/kiosk/manual-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  getFloorRush: async () => {
    const res = await fetch(`${BASE_URL}/kiosk/rush-meter`);
    return await res.json();
  },

  getRecentCheckins: async () => {
    const res = await fetch(`${BASE_URL}/kiosk/recent`);
    return await res.json();
  },

  // Members
  getMembers: async (status = 'all', search = '') => {
    const res = await fetch(`${BASE_URL}/members?status=${status}&search=${encodeURIComponent(search)}`);
    return await res.json();
  },

  getMemberDetail: async (id) => {
    const res = await fetch(`${BASE_URL}/members/${id}`);
    return await res.json();
  },

  createMember: async (data) => {
    const res = await fetch(`${BASE_URL}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  freezeMember: async (id, freezeDays, reason) => {
    const res = await fetch(`${BASE_URL}/members/${id}/freeze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freezeDays, reason })
    });
    return await res.json();
  },

  unfreezeMember: async (id) => {
    const res = await fetch(`${BASE_URL}/members/${id}/unfreeze`, {
      method: 'POST'
    });
    return await res.json();
  },

  renewMember: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/members/${id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Membership Plans
  getPlans: async () => {
    const res = await fetch(`${BASE_URL}/plans`);
    return await res.json();
  },

  createPlan: async (data) => {
    const res = await fetch(`${BASE_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // Leads CRM
  getKanbanLeads: async () => {
    const res = await fetch(`${BASE_URL}/leads/kanban`);
    return await res.json();
  },

  createLead: async (data) => {
    const res = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  updateLeadStage: async (id, stage, notes, lostReason) => {
    const res = await fetch(`${BASE_URL}/leads/${id}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, notes, lostReason })
    });
    return await res.json();
  },

  getWinBackCampaigns: async (days = 30) => {
    const res = await fetch(`${BASE_URL}/leads/win-back?days=${days}`);
    return await res.json();
  },

  getStaffSalesPerformance: async () => {
    const res = await fetch(`${BASE_URL}/leads/staff-performance`);
    return await res.json();
  },

  // Revenue & Cash Flow
  getRevenueDashboard: async () => {
    const res = await fetch(`${BASE_URL}/revenue/dashboard`);
    return await res.json();
  },

  getCashFlowForecast: async () => {
    const res = await fetch(`${BASE_URL}/revenue/forecast`);
    return await res.json();
  },

  submitCashReconciliation: async (data) => {
    const res = await fetch(`${BASE_URL}/revenue/reconcile-cash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  getCashReconciliationHistory: async () => {
    const res = await fetch(`${BASE_URL}/revenue/reconciliations`);
    return await res.json();
  },

  // 3-Tier Expiry Alerts
  getExpiryAlerts: async () => {
    const res = await fetch(`${BASE_URL}/expiry/alerts`);
    return await res.json();
  },

  // Invoices & Billing
  getInvoices: async () => {
    const res = await fetch(`${BASE_URL}/invoices`);
    return await res.json();
  },

  getInvoice: async (id) => {
    const res = await fetch(`${BASE_URL}/invoices/${id}`);
    return await res.json();
  },

  // Retail POS & Lockers
  getPosProducts: async () => {
    const res = await fetch(`${BASE_URL}/pos/products`);
    return await res.json();
  },

  checkoutPos: async (payload) => {
    const res = await fetch(`${BASE_URL}/pos/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  getLockers: async () => {
    const res = await fetch(`${BASE_URL}/lockers`);
    return await res.json();
  },

  createLocker: async (data) => {
    const res = await fetch(`${BASE_URL}/lockers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create locker');
    }
    return await res.json();
  },

  deleteLocker: async (lockerId) => {
    const res = await fetch(`${BASE_URL}/lockers/${lockerId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete locker');
    }
    return await res.json();
  },

  assignLocker: async (data) => {
    const res = await fetch(`${BASE_URL}/lockers/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  releaseLocker: async (lockerId) => {
    const res = await fetch(`${BASE_URL}/lockers/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lockerId })
    });
    return await res.json();
  },

  // Unified Authentication & Session Management
  unifiedLogin: async (identifier, secret, deviceFingerprint = null, deviceName = null) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, secret, deviceFingerprint, deviceName })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    return await res.json();
  },

  // Staff & Authentication (Backward Compatibility)
  loginStaff: async (identifier, secret) => {
    const res = await fetch(`${BASE_URL}/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, secret, passwordOrPin: secret })
    });
    return await res.json();
  },

  getStaff: async (gymId = 'all') => {
    const query = gymId && gymId !== 'all' ? `?gymId=${gymId}` : '';
    const res = await fetch(`${BASE_URL}/staff${query}`);
    return await res.json();
  },

  createStaff: async (data) => {
    const res = await fetch(`${BASE_URL}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  updateStaff: async (id, data) => {
    const res = await fetch(`${BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  toggleStaffStatus: async (id) => {
    const res = await fetch(`${BASE_URL}/staff/${id}/toggle-status`, {
      method: 'PATCH'
    });
    return await res.json();
  },

  deleteStaff: async (id) => {
    const res = await fetch(`${BASE_URL}/staff/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  getSettings: async () => {
    const res = await fetch(`${BASE_URL}/settings`);
    return await res.json();
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  },

  // App 2: Client / Member PWA
  clientLogin: async ({ identifier, secret, deviceFingerprint, deviceName }) => {
    const res = await fetch(`${BASE_URL}/client/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, secret, deviceFingerprint, deviceName })
    });
    return await res.json();
  },

  getClientPass: async (memberId, fingerprint = 'fingerprint-pwa-iphone-safari') => {
    const res = await fetch(`${BASE_URL}/client/pass/${memberId}`, {
      headers: { 'x-device-fingerprint': fingerprint }
    });
    return await res.json();
  },

  getClientWorkout: async (memberId) => {
    const res = await fetch(`${BASE_URL}/client/workout/${memberId}`);
    return await res.json();
  },

  logWorkoutSet: async ({ memberId, exerciseName, setNumber, weightKg, reps }) => {
    const res = await fetch(`${BASE_URL}/client/workout/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, exerciseName, setNumber, weightKg, reps })
    });
    return await res.json();
  },

  getClientDiet: async (memberId) => {
    const res = await fetch(`${BASE_URL}/client/diet/${memberId}`);
    return await res.json();
  },

  toggleMealEaten: async (mealId, isEaten) => {
    const res = await fetch(`${BASE_URL}/client/diet/toggle-meal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealId, isEaten })
    });
    return await res.json();
  },

  getClientWallet: async (memberId) => {
    const res = await fetch(`${BASE_URL}/client/wallet/${memberId}`);
    return await res.json();
  },

  clientRenew: async ({ memberId, planId, pointsToRedeem, paymentMethod, paymentRef }) => {
    const res = await fetch(`${BASE_URL}/client/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, planId, pointsToRedeem, paymentMethod, paymentRef })
    });
    return await res.json();
  },

  getClientNotices: async () => {
    const res = await fetch(`${BASE_URL}/client/notices`);
    return await res.json();
  },

  getClientRush: async () => {
    const res = await fetch(`${BASE_URL}/client/rush`);
    return await res.json();
  },

  // Expenses & Gym Owner P&L
  getExpenses: async ({ category = 'All', month = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (month) params.append('month', month);
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/expenses?${params.toString()}`);
    return await res.json();
  },

  getExpenseSummary: async () => {
    const res = await fetch(`${BASE_URL}/expenses/summary`);
    return await res.json();
  },

  createExpense: async (expenseData) => {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    });
    return await res.json();
  },

  deleteExpense: async (id) => {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // App 3: Trainer & Floor Coach Platform
  getTrainersList: async () => {
    const res = await fetch(`${BASE_URL}/trainer/list`);
    return await res.json();
  },

  loginTrainer: async (phone, securityPin) => {
    const res = await fetch(`${BASE_URL}/trainer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, securityPin })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  getTrainerProfile: async (trainerId) => {
    const res = await fetch(`${BASE_URL}/trainer/profile/${trainerId}`);
    return await res.json();
  },

  getTrainerRoster: async (trainerId) => {
    const res = await fetch(`${BASE_URL}/trainer/roster/${trainerId}`);
    return await res.json();
  },

  markFloorAttendance: async ({ trainerId, memberId, notes }) => {
    const res = await fetch(`${BASE_URL}/trainer/floor-attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, memberId, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark floor attendance');
    return data;
  },

  verifyPtSession: async ({ trainerId, memberId, verificationCode, focusArea, notes }) => {
    const res = await fetch(`${BASE_URL}/trainer/verify-pt-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, memberId, verificationCode, focusArea, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'PT verification failed');
    return data;
  },

  getTrainerEarnings: async (trainerId, month) => {
    const url = month ? `${BASE_URL}/trainer/earnings/${trainerId}?month=${month}` : `${BASE_URL}/trainer/earnings/${trainerId}`;
    const res = await fetch(url);
    return await res.json();
  },

  getTemplates: async () => {
    const res = await fetch(`${BASE_URL}/trainer/templates`);
    return await res.json();
  },

  assignWorkoutTemplate: async ({ trainerId, memberId, templateId, customNotes }) => {
    const res = await fetch(`${BASE_URL}/trainer/assign-workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, memberId, templateId, customNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign workout');
    return data;
  },

  assignDietTemplate: async ({ trainerId, memberId, templateId, customNotes }) => {
    const res = await fetch(`${BASE_URL}/trainer/assign-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, memberId, templateId, customNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign diet');
    return data;
  },

  getMemberActiveProgram: async (memberId) => {
    const res = await fetch(`${BASE_URL}/trainer/member-program/${memberId}`);
    return await res.json();
  },

  saveCustomWorkoutProgram: async (payload) => {
    const res = await fetch(`${BASE_URL}/trainer/save-custom-workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save custom workout');
    return data;
  },

  saveCustomDietPlan: async (payload) => {
    const res = await fetch(`${BASE_URL}/trainer/save-custom-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save custom diet');
    return data;
  },

  assignClientToTrainer: async ({ trainerId, memberId }) => {
    const res = await fetch(`${BASE_URL}/trainer/assign-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId, memberId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign client');
    return data;
  },

  getAllMembersForAssignment: async () => {
    const res = await fetch(`${BASE_URL}/trainer/all-members`);
    return await res.json();
  },

  assignTrainerToMember: async (memberId, trainerId) => {
    const res = await fetch(`${BASE_URL}/members/${memberId}/assign-trainer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainerId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign trainer to member');
    return data;
  },

  getClientPtPass: async (memberId) => {
    const res = await fetch(`${BASE_URL}/client/pt-pass/${memberId}`);
    return await res.json();
  },

  // HealthyHowlz Platform & Multi-Tenant Gym API
  getPlatformStats: async () => {
    const res = await fetch(`${BASE_URL}/platform/stats`);
    return await res.json();
  },

  getPlatformGyms: async () => {
    const res = await fetch(`${BASE_URL}/platform/gyms`);
    return await res.json();
  },

  provisionGym: async (payload) => {
    const res = await fetch(`${BASE_URL}/platform/gyms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to provision gym');
    return data;
  },

  updateGymStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/platform/gyms/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update gym status');
    return data;
  },

  updateGym: async (id, payload) => {
    const res = await fetch(`${BASE_URL}/platform/gyms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update gym');
    return data;
  },

  deleteGym: async (id) => {
    const res = await fetch(`${BASE_URL}/platform/gyms/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  softDeleteGym: async (id) => {
    const res = await fetch(`${BASE_URL}/platform/gyms/${id}/soft-delete`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to soft delete gym');
    return data;
  },

  getAccessibleGyms: async (ownerId = 'staff-owner', role = 'owner') => {
    const res = await fetch(`${BASE_URL}/gyms/accessible?ownerId=${ownerId}&role=${role}`);
    return await res.json();
  },

  getCurrentGym: async () => {
    const res = await fetch(`${BASE_URL}/gyms/current`);
    return await res.json();
  },

  updateCurrentGym: async (payload) => {
    const res = await fetch(`${BASE_URL}/gyms/current`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};

