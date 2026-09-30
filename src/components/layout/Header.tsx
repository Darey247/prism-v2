import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Menu, 
  ShieldCheck, 
  ChevronDown, 
  LogOut, 
  User as UserIcon,
  Zap,
  Clock,
  Home
} from 'lucide-react';
import { SUPPORTED_NETWORKS } from '../../lib/constants';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMobileMenu, 
  onOpenDeposit, 
  onOpenAuth 
}) => {
  const { 
    user, 
    supabaseUser,
    demoUser, 
    authMode, 
    logout, 
    totalPortfolioBalance, 
    settings, 
    toggleHideBalance, 
    formatCurrency,
    setActiveTab,
    myPrismHandle,
    isRegisteredUser,
    guestRemainingSeconds,
    setViewMode,
    openAuthModal
  } = useWallet();

  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState(SUPPORTED_NETWORKS[0]);

  const displayName = authMode === 'firebase' 
    ? (user?.displayName || user?.email?.split('@')[0] || 'User')
    : authMode === 'supabase'
      ? (supabaseUser?.user_metadata?.displayName || supabaseUser?.email?.split('@')[0] || 'User')
      : (demoUser?.displayName || 'Alex Vanguard');

  const photoURL = authMode === 'firebase'
    ? user?.photoURL
    : demoUser?.photoURL;

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-ios-dock border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-2xl glass-ios-button text-slate-300 hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Prism
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/10 font-mono font-bold">
                {myPrismHandle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Network Switcher, Balance, 1-Hour Guest Countdown */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Landing Page link */}
          <button
            type="button"
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-ios-button text-xs font-semibold text-slate-300 hover:text-white"
          >
            <Home className="w-3.5 h-3.5 text-indigo-400" />
            <span>Landing</span>
          </button>

          {/* 1-Hour Guest Countdown Pill */}
          {!isRegisteredUser && guestRemainingSeconds > 0 && (
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-bold transition-colors"
              title="1-hour guest trial. Click to create a permanent account and keep your portfolio."
            >
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>{formatTimeRemaining(guestRemainingSeconds)} trial</span>
            </button>
          )}

          {/* Network Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-ios-button text-xs font-semibold text-slate-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
              <span>{activeNetwork.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {networkDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 glass-ios-dock rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400">Networks</div>
                {SUPPORTED_NETWORKS.map(net => (
                  <button
                    key={net.id}
                    onClick={() => {
                      setActiveNetwork(net);
                      setNetworkDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors ${
                      net.id === activeNetwork.id ? 'bg-indigo-600/30 text-indigo-200' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{net.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{net.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Balance Header Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl glass-ios text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Balance:</span>
            <span className="font-mono font-bold text-white">
              {settings.hideBalance ? '••••••••' : formatCurrency(totalPortfolioBalance)}
            </span>
            <button
              onClick={toggleHideBalance}
              className="text-slate-400 hover:text-white ml-0.5 p-0.5"
              aria-label="Toggle balance visibility"
            >
              {settings.hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right actions: Faucet, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Faucet / Top-up Test Funds */}
          <button
            type="button"
            onClick={onOpenDeposit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-ios-button text-indigo-300 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xs:inline">Deposit</span>
          </button>

          {/* User Profile */}
          {isRegisteredUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-2xl glass-ios"
              >
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={displayName} 
                    className="w-7 h-7 rounded-xl object-cover ring-1 ring-indigo-500/40" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-ios-dock rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <span className="text-xs font-bold text-white block truncate">{displayName}</span>
                    <span className="text-[11px] font-mono text-indigo-300 block truncate">{myPrismHandle}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      {authMode === 'supabase' ? 'Supabase Verified' : 'Firebase Verified'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 text-left transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Settings & Security</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('landing');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 text-left transition-colors"
                  >
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>Landing Page</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 text-left transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <span>Connect</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
