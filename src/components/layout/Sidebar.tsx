import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  ArrowLeftRight, 
  Send, 
  ArrowDownLeft, 
  History, 
  Settings, 
  ShieldCheck,
  Zap,
  Home,
  Clock,
  UserPlus
} from 'lucide-react';
import { NavigationTab } from '../../types/wallet';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setReceiveModalOpen, 
    transactions, 
    myPrismHandle,
    setViewMode,
    isRegisteredUser,
    guestRemainingSeconds,
    openAuthModal
  } = useWallet();

  const navItems: { tab: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { tab: 'send', label: 'Send & P2P', icon: <Send className="w-4 h-4" />, badge: '⚡ 0 Fee' },
    { tab: 'swap', label: 'Swap', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { tab: 'markets', label: 'Markets', icon: <TrendingUp className="w-4 h-4" /> },
    { 
      tab: 'transactions', 
      label: 'Activity', 
      icon: <History className="w-4 h-4" />,
      badge: String(transactions.length)
    },
    { tab: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const formatMinutesRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-61px)] sticky top-[61px] glass-ios border-r border-white/10 p-4 shrink-0 select-none overflow-y-auto">
      {/* Return to Landing Page Button */}
      <button
        type="button"
        onClick={() => setViewMode('landing')}
        className="w-full mb-3 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-ios-button text-xs font-semibold text-slate-300 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4 text-indigo-400" />
        <span>Landing Page</span>
      </button>

      {/* Primary Navigation */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
          Menu
        </span>
        {navItems.map(item => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.badge.includes('0 Fee')
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/10 text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1-Hour Guest Session Protection Notice */}
      {!isRegisteredUser && (
        <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Trial Session
            </span>
            <span className="font-mono text-[11px] text-amber-200 font-bold">
              {formatMinutesRemaining(guestRemainingSeconds)}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 leading-snug">
            Returns to landing page after 1 hour if no account is signed.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="w-full py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-3 h-3" />
            <span>Sign Up to Keep</span>
          </button>
        </div>
      )}

      {/* Prism to Prism Quick Card */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900/30 via-slate-900/50 to-slate-900/20 border border-indigo-500/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Prism Direct
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
            0% FEE
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Send instantly to any username with zero gas fees.
        </p>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-indigo-300 font-mono">
          <span>Your ID:</span>
          <span className="font-bold text-white truncate max-w-[120px]">{myPrismHandle}</span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl glass-ios-button text-slate-200 text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span>Send</span>
          </button>
          <button
            type="button"
            onClick={() => setReceiveModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl glass-ios-button text-slate-200 text-xs font-semibold"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Receive</span>
          </button>
        </div>
      </div>

      {/* Security Status card */}
      <div className="mt-auto pt-3">
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Non-Custodial</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
