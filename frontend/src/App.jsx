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

import { AuthProvider, useAuth } from './context/AuthContext';
import { MemberAuthProvider, useMemberAuth } from './client/MemberAuthContext';
import ClientPwaApp from './client/ClientPwaApp';
import ClientLogin from './client/ClientLogin';

import { TrainerAuthProvider, useTrainerAuth } from './trainer/TrainerAuthContext';
import TrainerApp from './trainer/TrainerApp';
import TrainerLogin from './trainer/TrainerLogin';

import { api } from './services/api';

function MainAppLayout({ onSwitchToClient, onSwitchToTrainer }) {
  const { user, isSuperAdmin, isOwner, isManager } = useAuth();
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

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenManualCheckin={handleOpenManualCheckin}
        onSwitchToClient={onSwitchToClient}
        onSwitchToTrainer={onSwitchToTrainer}
      />

      {/* Main App Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'kiosk' && (
          <ReceptionKioskPage
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenManualCheckin={handleOpenManualCheckin}
            onOpenNewMember={() => setIsNewMemberOpen(true)}
            onOpenCashReconcile={() => setIsCashReconcileOpen(true)}
            onCheckinResult={(res) => setHudResult(res)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onOpenCashReconcile={() => setIsCashReconcileOpen(true)}
            onViewInvoice={(inv) => setActiveInvoice(inv)}
          />
        )}

        {activeTab === 'crm' && (
          <LeadsCrmPage />
        )}

        {activeTab === 'members' && (
          <MembersPage
            onOpenNewMember={() => setIsNewMemberOpen(true)}
            onRenewMember={(mem) => setRenewMemberTarget(mem)}
            onCheckinResult={(res) => setHudResult(res)}
          />
        )}

        {activeTab === 'expiry' && (
          <ExpiryAlertsPage
            onRenewMember={(mem) => setRenewMemberTarget(mem)}
          />
        )}

        {activeTab === 'pos' && (
          <PosRetailPage
            onViewInvoice={(inv) => setActiveInvoice(inv)}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesPage
            onViewInvoice={(inv) => setActiveInvoice(inv)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesPage />
        )}

        {activeTab === 'users' && isManager && (
          <UsersManagementPage />
        )}

        {activeTab === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* MODALS */}

      {/* 1. On-Demand Camera QR Scanner Modal */}
      <KioskScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* 2. Visual Status HUD Modal (Green / Blue / Yellow / Red) */}
      <StatusHudModal
        result={hudResult}
        onClose={() => setHudResult(null)}
        onRenewClick={(member) => setRenewMemberTarget(member)}
      />

      {/* 3. Protected Manual Check-in Modal (Officer PIN Security Gate - Fresh PIN required on EVERY click) */}
      <ManualCheckinModal
        key={`manual-checkin-session-${manualCheckinKey}`}
        isOpen={isManualCheckinOpen}
        onClose={() => setIsManualCheckinOpen(false)}
        onCheckinComplete={handleManualCheckinComplete}
      />

      {/* 4. GST Invoice / Receipt Modal */}
      <InvoiceModal
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />

      {/* 5. Register New Member Modal */}
      <NewMemberModal
        isOpen={isNewMemberOpen}
        onClose={() => setIsNewMemberOpen(false)}
        onCreated={() => {}}
      />

      {/* 6. Renew Membership Modal (with Loyalty points slider up to 15% cap) */}
      <RenewModal
        member={renewMemberTarget}
        isOpen={!!renewMemberTarget}
        onClose={() => setRenewMemberTarget(null)}
        onRenewed={() => {}}
      />

      {/* 7. EOD Cash-in-Drawer Reconciliation Modal */}
      <CashReconcileModal
        isOpen={isCashReconcileOpen}
        onClose={() => setIsCashReconcileOpen(false)}
        onReconciled={() => {}}
      />

      {/* Footer Branding */}
      <footer className="no-print border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Elite Fitness Center Gudiyatham • Operating Platform App 1: Admin & Owner Engine</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToTrainer}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 text-xs flex items-center gap-1"
            >
              <span>🏋️</span>
              <span>Trainer & Floor Coach App (App 3) →</span>
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={onSwitchToClient}
              className="text-slate-400 hover:text-white font-semibold underline underline-offset-2 text-xs"
            >
              Client Member App (App 2) →
            </button>
            <span className="text-slate-600">•</span>
            <p className="text-slate-400 font-medium">
              Logged in as: <span className="font-bold text-slate-300">{user?.name} ({user?.role})</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

function AdminPortalContainer({ onSwitchToClient, onSwitchToTrainer }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <LoginPage onSwitchToClient={onSwitchToClient} onSwitchToTrainer={onSwitchToTrainer} />;
  }
  return <MainAppLayout onSwitchToClient={onSwitchToClient} onSwitchToTrainer={onSwitchToTrainer} />;
}

function ClientPwaContainer({ onSwitchToAdmin, onSwitchToTrainer }) {
  const { isAuthenticated } = useMemberAuth();
  if (!isAuthenticated) {
    return <ClientLogin onSwitchToAdmin={onSwitchToAdmin} />;
  }
  return <ClientPwaApp onSwitchToAdmin={onSwitchToAdmin} onSwitchToTrainer={onSwitchToTrainer} />;
}

function TrainerPortalContainer({ onSwitchToAdmin, onSwitchToClient }) {
  const { isAuthenticated } = useTrainerAuth();
  if (!isAuthenticated) {
    return <TrainerLogin onSwitchToAdmin={onSwitchToAdmin} onSwitchToClient={onSwitchToClient} />;
  }
  return <TrainerApp onSwitchToAdmin={onSwitchToAdmin} onSwitchToClient={onSwitchToClient} />;
}

export default function App() {
  const [portalMode, setPortalMode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const p = urlParams.get('portal');
      if (p === 'client' || p === 'trainer') return p;
      return localStorage.getItem('elite_gym_active_portal') || 'admin';
    } catch (e) {
      return 'admin';
    }
  });

  const handleSwitchPortal = (mode) => {
    setPortalMode(mode);
    try {
      localStorage.setItem('elite_gym_active_portal', mode);
      const url = new URL(window.location);
      url.searchParams.set('portal', mode);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  };

  return (
    <AuthProvider>
      {portalMode === 'trainer' ? (
        <TrainerAuthProvider>
          <TrainerPortalContainer
            onSwitchToAdmin={() => handleSwitchPortal('admin')}
            onSwitchToClient={() => handleSwitchPortal('client')}
          />
        </TrainerAuthProvider>
      ) : portalMode === 'client' ? (
        <MemberAuthProvider>
          <ClientPwaContainer
            onSwitchToAdmin={() => handleSwitchPortal('admin')}
            onSwitchToTrainer={() => handleSwitchPortal('trainer')}
          />
        </MemberAuthProvider>
      ) : (
        <AdminPortalContainer
          onSwitchToClient={() => handleSwitchPortal('client')}
          onSwitchToTrainer={() => handleSwitchPortal('trainer')}
        />
      )}
    </AuthProvider>
  );
}
