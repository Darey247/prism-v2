import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { DashboardView } from './components/dashboard/DashboardView';
import { WalletView } from './components/wallet/WalletView';
import { MarketsView } from './components/markets/MarketsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { SendFlow } from './components/send/SendFlow';
import { SwapFlow } from './components/swap/SwapFlow';
import { SettingsView } from './components/settings/SettingsView';
import { LandingPage } from './components/landing/LandingPage';
import { ReceiveModal } from './components/common/ReceiveModal';
import { DepositModal } from './components/common/DepositModal';
import { AuthModal } from './components/common/AuthModal';
import { ClaimUsernameModal } from './components/common/ClaimUsernameModal';
import { TransactionDetailModal } from './components/common/TransactionDetailModal';
import { ToastContainer } from './components/common/ToastContainer';
import { Clock, UserPlus } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    viewMode,
    activeTab, 
    authModalOpen, 
    setAuthModalOpen, 
    authModalInitialMode, 
    claimUsernameModalOpen, 
    setClaimUsernameModalOpen,
    openAuthModal,
    isRegisteredUser,
    guestRemainingSeconds
  } = useWallet();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const formatMinutesRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // If in landing page view, render LandingPage with shared modals
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage />

        {/* Global Modals */}
        <ReceiveModal />
        <DepositModal
          isOpen={depositModalOpen}
          onClose={() => setDepositModalOpen(false)}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalInitialMode}
          onClose={() => setAuthModalOpen(false)}
        />
        <ClaimUsernameModal
          isOpen={claimUsernameModalOpen}
          onClose={() => setClaimUsernameModalOpen(false)}
        />
        <TransactionDetailModal />
        <ToastContainer />
      </>
    );
  }

  // Dashboard App View
  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Background Liquid Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] liquid-ambient-blue rounded-full blur-[130px] pointer-events-none -translate-y-1/2 -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[550px] h-[550px] liquid-ambient-purple rounded-full blur-[140px] pointer-events-none translate-y-1/3 -z-10" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] liquid-ambient-emerald rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* 1-Hour Guest Session Protection Sticky Top Alert for App View */}
      {!isRegisteredUser && guestRemainingSeconds > 0 && guestRemainingSeconds <= 3600 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-indigo-900/40 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 flex flex-wrap items-center justify-center gap-2 z-50">
          <div className="flex items-center gap-1.5 font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>1-Hour Guest Trial: {formatMinutesRemaining(guestRemainingSeconds)} left</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">• Returns to landing page if no account is signed.</span>
          <button
            onClick={() => openAuthModal('signup')}
            className="py-1 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all ml-1"
          >
            <UserPlus className="w-3 h-3" />
            <span>Sign Up to Keep</span>
          </button>
        </div>
      )}

      {/* Top iOS Header */}
      <Header
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenDeposit={() => setDepositModalOpen(true)}
        onOpenAuth={() => openAuthModal('login')}
      />

      <div className="flex flex-1 relative">
        {/* Desktop Liquid Glass Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 overflow-y-auto max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' && <DashboardView onOpenDeposit={() => setDepositModalOpen(true)} />}
          {activeTab === 'wallet' && <WalletView onOpenDeposit={() => setDepositModalOpen(true)} />}
          {activeTab === 'markets' && <MarketsView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'send' && <SendFlow />}
          {activeTab === 'swap' && <SwapFlow />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Floating Liquid Glass Dock */}
      <BottomNav onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Mobile Slide-Over Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenDeposit={() => setDepositModalOpen(true)}
        onOpenAuth={() => openAuthModal('login')}
      />

      {/* Modals */}
      <ReceiveModal />
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalInitialMode}
        onClose={() => setAuthModalOpen(false)}
      />
      <ClaimUsernameModal
        isOpen={claimUsernameModalOpen}
        onClose={() => setClaimUsernameModalOpen(false)}
      />
      <TransactionDetailModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <MainAppContent />
    </WalletProvider>
  );
}
