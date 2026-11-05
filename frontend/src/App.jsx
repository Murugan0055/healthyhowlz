import React, { useState } from 'react';
import Navbar from './components/Navbar';
import KioskScannerModal from './components/KioskScannerModal';
import StatusHudModal from './components/StatusHudModal';
import ManualCheckinModal from './components/ManualCheckinModal';
import InvoiceModal from './components/InvoiceModal';
import NewMemberModal from './components/NewMemberModal';
import RenewModal from './components/RenewModal';
import CashReconcileModal from './components/CashReconcileModal';

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
 * Role-Based Application Router
 * Evaluates authenticated user role and renders corresponding dedicated portal:
 * - super_admin / platform_admin -> PlatformAdminApp
 * - trainer -> TrainerApp
 * - member -> ClientPwaApp
 * - owner / manager / admin -> MainAppLayout
 */
function AppRouter() {
  const { user, isAuthenticated, logout } = useAuth();
  const [platformInspectView, setPlatformInspectView] = useState(false);

  // 1. Not Authenticated -> Single Production Unified Login Page
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  // 2. HealthyHowlz Super Admin (Platform HQ Command)
  if (user.role === 'super_admin' || user.role === 'platform_admin' || user.app === 'platform') {
    if (platformInspectView) {
      return (
        <MainAppLayout
          onLogout={logout}
          onSwitchToPlatform={() => setPlatformInspectView(false)}
        />
      );
    }
    return (
      <PlatformAdminApp
        onLogout={logout}
        onSwitchToAdmin={() => setPlatformInspectView(true)}
      />
    );
  }

  // 3. Floor Coach & Trainer (Trainer Operating System - App 3)
  if (user.role === 'trainer' || user.app === 'trainer') {
    return (
      <TrainerAuthProvider>
        <TrainerApp onLogout={logout} />
      </TrainerAuthProvider>
    );
  }

  // 4. Client / Member (Member Mobile PWA - App 2)
  if (user.role === 'member' || user.app === 'client') {
    return (
      <MemberAuthProvider>
        <ClientPwaApp onLogout={logout} />
      </MemberAuthProvider>
    );
  }

  // 5. Gym Owner, Manager, Front Desk Admin (Gym Operating System - App 1)
  return <MainAppLayout onLogout={logout} />;
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
