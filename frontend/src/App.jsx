import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KioskScannerModal from './components/KioskScannerModal';
import StatusHudModal from './components/StatusHudModal';
import ManualCheckinModal from './components/ManualCheckinModal';
import InvoiceModal from './components/InvoiceModal';
import NewMemberModal from './components/NewMemberModal';
import RenewModal from './components/RenewModal';
import CashReconcileModal from './components/CashReconcileModal';
import AccessDeniedPage from './components/AccessDeniedPage';

// Pages
import LoginPage from './pages/LoginPage';
import ReceptionKioskPage from './pages/ReceptionKioskPage';
import DashboardPage from './pages/DashboardPage';
import LeadsCrmPage from './pages/LeadsCrmPage';
import MembersPage from './pages/MembersPage';
import ExpiryAlertsPage from './pages/ExpiryAlertsPage';
import PosRetailPage from './pages/PosRetailPage';
import InvoicesPage from './pages/InvoicesPage';
import ExpensesPage from './pages/ExpensesPage';
import UsersManagementPage from './pages/UsersManagementPage';
import SettingsPage from './pages/SettingsPage';

// Contexts & Applications
import { AuthProvider, useAuth } from './context/AuthContext';
import { MemberAuthProvider } from './client/MemberAuthContext';
import ClientPwaApp from './client/ClientPwaApp';

import { TrainerAuthProvider } from './trainer/TrainerAuthContext';
import TrainerApp from './trainer/TrainerApp';

import { TenantProvider, useTenant } from './context/TenantContext';
import PlatformAdminApp from './platform/PlatformAdminApp';

import { api } from './services/api';

function MainAppLayout({ onLogout, onSwitchToPlatform }) {
  const { user, isSuperAdmin, isOwner, isManager, logout } = useAuth();
  const { currentGymId, currentGym } = useTenant();
  const [activeTab, setActiveTab] = useState('kiosk');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualCheckinOpen, setIsManualCheckinOpen] = useState(false);
  const [manualCheckinKey, setManualCheckinKey] = useState(0);
  const [isNewMemberOpen, setIsNewMemberOpen] = useState(false);
  const [isCashReconcileOpen, setIsCashReconcileOpen] = useState(false);
  const [renewMemberTarget, setRenewMemberTarget] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [hudResult, setHudResult] = useState(null);

  // Force PIN authentication fresh on EVERY manual check-in click
  const handleOpenManualCheckin = () => {
    setManualCheckinKey((prev) => prev + 1);
    setIsManualCheckinOpen(true);
  };

  // Handle QR scanner decode
  const handleScanSuccess = async (decodedText) => {
    setIsScannerOpen(false);
    try {
      const result = await api.scanQr(decodedText);
      setHudResult(result);
    } catch (err) {
      alert('Verification error: ' + err.message);
    }
  };

  // Handle manual checkin completion
  const handleManualCheckinComplete = (result) => {
    setHudResult(result);
  };

  const handleSignOut = () => {
    if (onLogout) onLogout();
    else logout();
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenManualCheckin={handleOpenManualCheckin}
        onSwitchToPlatform={onSwitchToPlatform}
      />

      {/* Main App Content View - Dynamically keyed to active gym */}
      <main key={currentGymId} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'kiosk' && (
          <ReceptionKioskPage
            key={`kiosk-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenManualCheckin={handleOpenManualCheckin}
            onOpenNewMember={() => setIsNewMemberOpen(true)}
            onOpenCashReconcile={() => setIsCashReconcileOpen(true)}
            onCheckinResult={(res) => setHudResult(res)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            key={`dashboard-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
            onOpenCashReconcile={() => setIsCashReconcileOpen(true)}
            onViewInvoice={(inv) => setActiveInvoice(inv)}
          />
        )}

        {activeTab === 'crm' && (
          <LeadsCrmPage
            key={`crm-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
          />
        )}

        {activeTab === 'members' && (
          <MembersPage
            key={`members-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
            onOpenNewMember={() => setIsNewMemberOpen(true)}
            onRenewMember={(mem) => setRenewMemberTarget(mem)}
            onCheckinResult={(res) => setHudResult(res)}
          />
        )}

        {activeTab === 'expiry' && (
          <ExpiryAlertsPage
            key={`expiry-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
            onRenewMember={(mem) => setRenewMemberTarget(mem)}
          />
        )}

        {activeTab === 'pos' && (
          <PosRetailPage
            key={`pos-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
            onViewInvoice={(inv) => setActiveInvoice(inv)}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesPage
            key={`invoices-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
            onViewInvoice={(inv) => setActiveInvoice(inv)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesPage
            key={`expenses-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
          />
        )}

        {activeTab === 'users' && isManager && (
          <UsersManagementPage
            key={`users-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            key={`settings-${currentGymId}`}
            currentGymId={currentGymId}
            currentGym={currentGym}
          />
        )}
      </main>

      {/* MODALS */}
      <KioskScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      <StatusHudModal
        result={hudResult}
        onClose={() => setHudResult(null)}
        onRenewClick={(member) => setRenewMemberTarget(member)}
      />

      <ManualCheckinModal
        key={`manual-checkin-session-${manualCheckinKey}`}
        isOpen={isManualCheckinOpen}
        onClose={() => setIsManualCheckinOpen(false)}
        onCheckinComplete={handleManualCheckinComplete}
      />

      <InvoiceModal
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />

      <NewMemberModal
        isOpen={isNewMemberOpen}
        onClose={() => setIsNewMemberOpen(false)}
        onCreated={() => {}}
      />

      <RenewModal
        member={renewMemberTarget}
        isOpen={!!renewMemberTarget}
        onClose={() => setRenewMemberTarget(null)}
        onRenewed={() => {}}
      />

      <CashReconcileModal
        isOpen={isCashReconcileOpen}
        onClose={() => setIsCashReconcileOpen(false)}
        onReconciled={() => {}}
      />

      {/* Production Footer Branding */}
      <footer className="no-print border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 HealthyHowlz Fitness OS • Multi-Tenant Facility Management Engine</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isSuperAdmin && onSwitchToPlatform && (
              <>
                <button
                  onClick={onSwitchToPlatform}
                  className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 text-xs flex items-center gap-1"
                >
                  <span>🐺</span>
                  <span>HealthyHowlz Platform HQ →</span>
                </button>
                <span className="text-slate-600">•</span>
              </>
            )}
            <p className="text-slate-400 font-medium">
              Authorized: <span className="font-bold text-slate-300">{user?.name} ({user?.role?.toUpperCase()})</span>
            </p>
            <span className="text-slate-600">•</span>
            <button
              onClick={handleSignOut}
              className="text-rose-400 hover:text-rose-300 font-semibold text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

/**
 * Parses URL Path into Structured Route
 * - / -> { type: 'root' }
 * - /login -> { type: 'login' }
 * - /:gymSlug -> { type: 'gym', gymIdentifier: 'gudiyatham' }
 * - /:gymSlug/trainer/:trainerId -> { type: 'trainer', gymIdentifier: 'gudiyatham', trainerId: 'staff-trainer-1' }
 * - /:gymSlug/client/:clientId -> { type: 'client', gymIdentifier: 'gudiyatham', clientId: 'mem-1001' }
 */
function parseRoute(path) {
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '') {
    return { type: 'root', path: '/' };
  }
  if (clean === '/login') {
    return { type: 'login', path: '/login' };
  }
  const parts = clean.split('/').filter(Boolean);
  if (parts.length >= 3 && parts[1] === 'trainer') {
    return { type: 'trainer', gymIdentifier: parts[0], trainerId: parts[2] };
  }
  if (parts.length >= 3 && parts[1] === 'client') {
    return { type: 'client', gymIdentifier: parts[0], clientId: parts[2] };
  }
  if (parts.length === 1) {
    return { type: 'gym', gymIdentifier: parts[0] };
  }
  return { type: 'unknown', path: clean };
}

/**
 * Returns default authorized route for a user upon sign-in
 */
function getDefaultRouteForUser(u) {
  if (!u) return '/login';
  if (u.role === 'super_admin' || u.role === 'platform_admin' || u.app === 'platform') {
    return '/';
  }
  const gymSlug = u.gym_slug || u.gym_id?.replace('gym-', '') || 'gudiyatham';
  if (u.role === 'trainer' || u.app === 'trainer') {
    return `/${gymSlug}/trainer/${u.id}`;
  }
  if (u.role === 'member' || u.app === 'client') {
    return `/${gymSlug}/client/${u.id || u.member_code}`;
  }
  return `/${gymSlug}`;
}

/**
 * Production URL Path Router with Clean Multi-Tenant Authorization
 */
function AppRouter() {
  const { user, isAuthenticated, logout } = useAuth();
  const { availableGyms, switchGym, findGymByIdOrSlug, currentGymId } = useTenant();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePop = () => setCurrentPath(window.location.pathname || '/');
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (nextPath) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      setCurrentPath(nextPath);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const route = parseRoute(currentPath);

  // 1. UNAUTHENTICATED OR EXPLICIT /login ROUTE
  if (!isAuthenticated || !user || route.type === 'login') {
    if (isAuthenticated && user && route.type === 'login') {
      const home = getDefaultRouteForUser(user);
      navigate(home);
      return null;
    }
    return (
      <LoginPage
        onSuccess={(u) => {
          const target = (route.type !== 'login' && route.type !== 'root') ? currentPath : getDefaultRouteForUser(u);
          navigate(target);
        }}
        redirectMessage={
          route.type !== 'root' && route.type !== 'login'
            ? 'Please sign in to access your requested facility terminal.'
            : null
        }
      />
    );
  }

  // 2. ROOT ROUTE ('/') -> HealthyHowlz HQ Command
  if (route.type === 'root') {
    // Only Super Admins can access HQ Command at '/'
    if (user.role === 'super_admin' || user.role === 'platform_admin' || user.app === 'platform') {
      return (
        <PlatformAdminApp
          onLogout={handleLogout}
          onLaunchGym={(gym) => {
            switchGym(gym.id);
            navigate(`/${gym.slug || gym.id}`);
          }}
        />
      );
    }

    // For any other authenticated role, redirect them directly to their dedicated app
    const home = getDefaultRouteForUser(user);
    if (home !== '/') {
      navigate(home);
      return null;
    }
  }

  // 3. GYM OWNER / FACILITY OS ('/:gymSlug')
  if (route.type === 'gym') {
    const gym = findGymByIdOrSlug(route.gymIdentifier);
    const resolvedGymId = gym ? gym.id : (route.gymIdentifier.startsWith('gym-') ? route.gymIdentifier : `gym-${route.gymIdentifier}`);

    // Authorization checks:
    const isSuper = user.role === 'super_admin' || user.role === 'platform_admin';
    const isOwnerOfThisGym = user.role === 'owner' && (
      !gym || gym.owner_id === user.id || user.gym_id === resolvedGymId || user.id === 'staff-owner'
    );
    const isManagerOfThisGym = (user.role === 'manager' || user.role === 'admin') && (
      user.gym_id === resolvedGymId || (gym && user.gym_id === gym.id)
    );

    if (isSuper || isOwnerOfThisGym || isManagerOfThisGym) {
      if (currentGymId !== resolvedGymId) {
        switchGym(resolvedGymId);
      }
      return (
        <MainAppLayout
          onLogout={handleLogout}
          onSwitchToPlatform={() => navigate('/')}
        />
      );
    }

    // Role is Trainer or Member, or Owner trying to access another owner's gym:
    if (user.role === 'trainer') {
      return (
        <AccessDeniedPage
          title="Floor Coach Access Restriction"
          reason="Coach credentials cannot access the Facility Management OS. Please use your Floor Coach terminal."
          recommendedPath={getDefaultRouteForUser(user)}
          recommendedLabel="Open My Coach Terminal"
          onNavigate={navigate}
        />
      );
    }

    if (user.role === 'member') {
      return (
        <AccessDeniedPage
          title="Member Access Restriction"
          reason="Member accounts cannot access Facility Operations. Please view your digital QR pass."
          recommendedPath={getDefaultRouteForUser(user)}
          recommendedLabel="Open My Member Pass"
          onNavigate={navigate}
        />
      );
    }

    // Owner accessing another owner's gym (e.g. Suresh from Coimbatore visiting /gudiyatham)
    return (
      <AccessDeniedPage
        title="Multi-Tenant Isolation Guard"
        reason={`You are signed in as ${user.name} (Owner). You do not have ownership or management permissions for "${gym?.name || route.gymIdentifier}".`}
        recommendedPath={getDefaultRouteForUser(user)}
        recommendedLabel={`Go to My Facility (${user.gym_name || 'My Gym'})`}
        onNavigate={navigate}
      />
    );
  }

  // 4. INDIVIDUAL TRAINER OS ('/:gymSlug/trainer/:trainerId')
  if (route.type === 'trainer') {
    const isSuper = user.role === 'super_admin' || user.role === 'platform_admin';
    const gym = findGymByIdOrSlug(route.gymIdentifier);
    const isOwnerOfGym = user.role === 'owner' && (gym ? gym.owner_id === user.id : true);
    const isThisTrainer = user.role === 'trainer' && (user.id === route.trainerId || route.trainerId === 'me');

    if (isSuper || isOwnerOfGym || isThisTrainer) {
      if (gym && currentGymId !== gym.id) {
        switchGym(gym.id);
      }
      return (
        <TrainerAuthProvider>
          <TrainerApp onLogout={handleLogout} />
        </TrainerAuthProvider>
      );
    }

    if (user.role === 'trainer') {
      return (
        <AccessDeniedPage
          title="Trainer Terminal Isolation"
          reason={`You are authenticated as ${user.name}. You cannot access another coach's private client schedule or earnings ledger.`}
          recommendedPath={getDefaultRouteForUser(user)}
          recommendedLabel="Open My Coaching Terminal"
          onNavigate={navigate}
        />
      );
    }

    return (
      <AccessDeniedPage
        title="Unauthorized Coaching Terminal Access"
        reason="Your account does not have authorization to view this trainer terminal."
        recommendedPath={getDefaultRouteForUser(user)}
        recommendedLabel="Return to My Portal"
        onNavigate={navigate}
      />
    );
  }

  // 5. INDIVIDUAL CLIENT / MEMBER PWA ('/:gymSlug/client/:clientId')
  if (route.type === 'client') {
    const isSuper = user.role === 'super_admin' || user.role === 'platform_admin';
    const gym = findGymByIdOrSlug(route.gymIdentifier);
    const isOwnerOfGym = user.role === 'owner' && (gym ? gym.owner_id === user.id : true);
    const isThisMember = user.role === 'member' && (
      user.id === route.clientId ||
      user.member_code === route.clientId ||
      user.phone === route.clientId ||
      route.clientId === 'me'
    );

    if (isSuper || isOwnerOfGym || isThisMember) {
      if (gym && currentGymId !== gym.id) {
        switchGym(gym.id);
      }
      return (
        <MemberAuthProvider>
          <ClientPwaApp onLogout={handleLogout} />
        </MemberAuthProvider>
      );
    }

    if (user.role === 'member') {
      return (
        <AccessDeniedPage
          title="Member Privacy Protection"
          reason={`You are authenticated as ${user.name}. You cannot view or access another member's dynamic QR pass or workout logs.`}
          recommendedPath={getDefaultRouteForUser(user)}
          recommendedLabel="Open My Member Pass"
          onNavigate={navigate}
        />
      );
    }

    return (
      <AccessDeniedPage
        title="Unauthorized Member Pass Access"
        reason="Your account is not authorized to inspect this member's private pass."
        recommendedPath={getDefaultRouteForUser(user)}
        recommendedLabel="Return to My Workspace"
        onNavigate={navigate}
      />
    );
  }

  // 6. UNKNOWN ROUTE FALLBACK
  return (
    <AccessDeniedPage
      title="Page Not Found"
      reason={`The requested path "${currentPath}" does not match any valid HealthyHowlz application.`}
      recommendedPath={getDefaultRouteForUser(user)}
      recommendedLabel="Return to Authorized Dashboard"
      onNavigate={navigate}
    />
  );
}

export default function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </TenantProvider>
  );
}
