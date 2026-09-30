import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  X, 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  ArrowLeftRight, 
  Send, 
  ArrowDownLeft, 
  History, 
  Settings, 
  LogOut,
  Zap,
  Plus,
  Home,
  Clock,
  UserPlus
} from 'lucide-react';
import { NavigationTab } from '../../types/wallet';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onOpenDeposit,
  onOpenAuth
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    supabaseUser,
    demoUser, 
    authMode, 
    logout, 
    myPrismHandle,
    setReceiveModalOpen,
    setViewMode,
    isRegisteredUser,
    guestRemainingSeconds,
    openAuthModal
  } = useWallet();

  if (!isOpen) return null;

  const handleNav = (tab: NavigationTab) => {
    setActiveTab(tab);
    onClose();
  };

  const displayName = authMode === 'firebase' 
    ? (user?.displayName || user?.email?.split('@')[0] || 'User')
    : authMode === 'supabase'
      ? (supabaseUser?.user_metadata?.displayName || supabaseUser?.email?.split('@')[0] || 'User')
      : (demoUser?.displayName || 'Alex Vanguard');

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'wallet', label: 'Wallet & Holdings', icon: <Wallet className="w-5 h-5" /> },
    { tab: 'send', label: 'Send & Prism P2P', icon: <Send className="w-5 h-5" />, badge: '⚡ 0 Fee' },
    { tab: 'swap', label: 'Instant Token Swap', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { tab: 'markets', label: 'Crypto Markets', icon: <TrendingUp className="w-5 h-5" /> },
    { tab: 'transactions', label: 'Activity Ledger', icon: <History className="w-5 h-5" /> },
    { tab: 'settings', label: 'Settings & Security', icon: <Settings className="w-5 h-5" /> },
  ];

  const formatMinutesRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs h-full glass-ios-dock border-r border-white/10 p-5 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
              </svg>
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">Prism Wallet</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl glass-ios-button text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="my-3 p-3 rounded-2xl glass-ios border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold text-xs shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">{displayName}</span>
              <span className="text-[11px] font-mono text-indigo-300 block truncate">{myPrismHandle}</span>
            </div>
          </div>
          {isRegisteredUser ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-2.5 py-1 rounded-xl bg-indigo-600 text-[10px] font-bold text-white shadow-md"
            >
              Connect
            </button>
          )}
        </div>

        {/* 1-Hour Guest Session Warning Banner if guest */}
        {!isRegisteredUser && (
          <div className="mb-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>1-Hour Guest Trial</span>
              </span>
              <span className="font-mono text-[10px] text-amber-200 font-bold">
                {formatMinutesRemaining(guestRemainingSeconds)}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                openAuthModal('signup');
              }}
              className="w-full py-1 px-2 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-bold shadow-sm"
            >
              Sign Up to Keep
            </button>
          </div>
        )}

        {/* Return to Landing Page Button */}
        <button
          onClick={() => {
            setViewMode('landing');
            onClose();
          }}
          className="w-full mb-3 flex items-center gap-2.5 px-3 py-2 rounded-xl glass-ios-button text-xs font-semibold text-slate-200 hover:text-white"
        >
          <Home className="w-4 h-4 text-indigo-400" />
          <span>Return to Landing Page</span>
        </button>

        {/* Quick Send / Receive / Deposit Shortcuts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => handleNav('send')}
            className="p-2.5 rounded-2xl glass-ios text-center flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-bold text-slate-200">Send</span>
          </button>
          <button
            onClick={() => {
              setReceiveModalOpen(true);
              onClose();
            }}
            className="p-2.5 rounded-2xl glass-ios text-center flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-200">Receive</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenDeposit();
            }}
            className="p-2.5 rounded-2xl glass-ios text-center flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-200">Deposit</span>
          </button>
        </div>

        {/* Navigation links */}
        <div className="space-y-1 flex-1">
          {navItems.map(item => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => handleNav(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
