import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Moon, 
  Key, 
  Laptop, 
  Smartphone, 
  AlertTriangle, 
  Check, 
  Copy, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { SupportedCurrency } from '../../types/wallet';

export const SettingsView: React.FC = () => {
  const { 
    user, 
    demoUser, 
    authMode, 
    settings, 
    updateSettings, 
    claimUsername,
    resetToDefault,
    myPrismHandle,
    showToast 
  } = useWallet();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'devices'>('profile');

  const [displayName, setDisplayName] = useState(
    authMode === 'firebase' ? (user?.displayName || 'User') : (demoUser?.displayName || 'Alex Vanguard')
  );
  const [handle, setHandle] = useState(myPrismHandle.replace(/^@/, ''));
  const [country, setCountry] = useState('United States (US)');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Recovery phrase modal
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedPassword, setSeedPassword] = useState('');
  const [seedRevealed, setSeedRevealed] = useState(false);
  const [seedError, setSeedError] = useState('');
  const [seedCopied, setSeedCopied] = useState(false);

  const mockSeedPhrase = [
    'prism', 'velocity', 'galaxy', 'quantum', 'cipher', 'horizon',
    'echo', 'stellar', 'matrix', 'crystal', 'beacon', 'vanguard'
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);

    try {
      const clean = handle.trim().replace(/^@/, '').toLowerCase();
      if (!clean || clean.length < 3) {
        setProfileError('Prism handle must be at least 3 characters.');
        setSavingProfile(false);
        return;
      }

      // Claim unique handle
      const res = await claimUsername(clean, displayName);
      if (!res.success) {
        setProfileError(res.error || `@${clean} is already claimed by another user.`);
        setSavingProfile(false);
        return;
      }

      updateSettings({ prismHandle: `@${clean}` });
      showToast('success', 'Profile Updated', `Your exclusive tag @${clean} has been reserved.`);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRevealSeed = (e: React.FormEvent) => {
    e.preventDefault();
    setSeedError('');
    if (!seedPassword || seedPassword.length < 4) {
      setSeedError('Please enter your account security PIN/password.');
      return;
    }
    setSeedRevealed(true);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(mockSeedPhrase.join(' '));
    setSeedCopied(true);
    showToast('warning', 'Secret Recovery Phrase Copied', 'Never share your 12-word seed phrase with anyone!');
    setTimeout(() => setSeedCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Settings Header */}
      <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Settings & Security</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your Prism Tag, currency preferences, active sessions, and wallet backup
          </p>
        </div>

        {/* iOS Segmented Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
          {(['profile', 'preferences', 'security', 'devices'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{displayName}</h3>
              <span className="text-xs font-mono text-indigo-300 block mt-0.5">
                {myPrismHandle}
              </span>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                <ShieldCheck className="w-3 h-3" />
                {authMode === 'firebase' ? 'Firebase Verified' : 'Demo Session'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Prism Direct Tag (Zero-Fee P2P Handle)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-slate-900/70 border border-white/10 rounded-2xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Prism Direct
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Friends can send you crypto instantly without gas fees using this tag.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Country / Region</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-900/70 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="United States (US)">United States (US)</option>
                <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                <option value="European Union (EU)">European Union (EU)</option>
                <option value="Canada (CA)">Canada (CA)</option>
                <option value="Australia (AU)">Australia (AU)</option>
                <option value="Japan (JP)">Japan (JP)</option>
                <option value="Singapore (SG)">Singapore (SG)</option>
              </select>
            </div>

            {profileError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {savingProfile ? 'Verifying & Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* --- PREFERENCES TAB --- */}
      {activeTab === 'preferences' && (
        <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="pb-6 border-b border-white/10">
            <h3 className="text-sm font-bold text-white mb-1">Primary Display Currency</h3>
            <p className="text-xs text-slate-400 mb-3">All balances are calculated in this unit</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-md">
              {(['USD', 'EUR', 'GBP', 'JPY', 'AUD'] as SupportedCurrency[]).map(curr => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => updateSettings({ currency: curr })}
                  className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all ${
                    settings.currency === curr
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'glass-ios-button text-slate-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="pb-6 border-b border-white/10">
            <h3 className="text-sm font-bold text-white mb-1">Interface Appearance</h3>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                className="flex items-center gap-2 py-2 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md"
              >
                <Moon className="w-4 h-4" />
                <span>Liquid Glass Dark</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 max-w-lg">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            <div className="flex items-center justify-between p-3.5 rounded-2xl glass-ios">
              <div>
                <span className="text-xs font-bold text-white block">Transaction Confirmations</span>
                <span className="text-[11px] text-slate-400">Receive alerts when on-chain or Prism transfers settle</span>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.txConfirmations}
                onChange={(e) => updateSettings({
                  notifications: { ...settings.notifications, txConfirmations: e.target.checked }
                })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- SECURITY TAB --- */}
      {activeTab === 'security' && (
        <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Cryptographic Security</h3>
              <p className="text-xs text-slate-400">Manage non-custodial backup, 2FA, and inactivity timeouts</p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl">
            {/* 2FA */}
            <div className="p-4 rounded-2xl glass-ios flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Active</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Require confirmation for all outgoing sends</p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ twoFactorEnabled: !settings.twoFactorEnabled })}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                  settings.twoFactorEnabled ? 'bg-indigo-600 text-white' : 'glass-ios-button text-slate-400'
                }`}
              >
                {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Backup Seed Modal Trigger */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">12-Word Secret Recovery Backup</span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  View and securely backup your master cryptographic recovery phrase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSeedModal(true)}
                className="py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-md"
              >
                View Phrase
              </button>
            </div>

            {/* Reset Demo Data */}
            <div className="p-4 rounded-2xl glass-ios flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">Reset Wallet State</span>
                <p className="text-xs text-slate-400 mt-0.5">Restores demo assets, balances and transactions to factory state</p>
              </div>
              <button
                type="button"
                onClick={resetToDefault}
                className="py-1.5 px-3 rounded-xl glass-ios-button text-slate-300 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEVICES TAB --- */}
      {activeTab === 'devices' && (
        <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Authorized Sessions</h3>
            <p className="text-xs text-slate-400">Devices authorized with signing access</p>
          </div>

          <div className="space-y-3 max-w-xl">
            <div className="p-4 rounded-2xl glass-ios flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Chrome on macOS (Current)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Active</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">IP: 192.168.1.1 • Active right now</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-ios flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-white block">iPhone 16 Pro (Mobile App)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">London, UK • Active 20m ago</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('info', 'Session Revoked')}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Seed Modal */}
      {showSeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-ios-card p-6 relative border border-amber-500/40">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Secret Recovery Phrase</h3>
              </div>
              <button
                onClick={() => {
                  setShowSeedModal(false);
                  setSeedRevealed(false);
                  setSeedPassword('');
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {!seedRevealed ? (
              <form onSubmit={handleRevealSeed} className="mt-4 space-y-4">
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Anyone who gains access to your recovery phrase can steal all of your cryptocurrency assets. Never screenshot or share this.
                </p>

                {seedError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs">
                    {seedError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Confirm PIN / Password</label>
                  <input
                    type="password"
                    value={seedPassword}
                    onChange={(e) => setSeedPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg"
                >
                  Reveal Secret Phrase
                </button>
              </form>
            ) : (
              <div className="mt-4 space-y-4 animate-in fade-in">
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-900/90 border border-white/10">
                  {mockSeedPhrase.map((word, i) => (
                    <div key={i} className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-800/80 font-mono text-xs">
                      <span className="text-[10px] text-slate-500">{i + 1}.</span>
                      <span className="font-bold text-amber-300">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopySeed}
                    className="flex-1 py-2.5 px-3 rounded-2xl glass-ios-button text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {seedCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{seedCopied ? 'Copied' : 'Copy All'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSeedModal(false);
                      setSeedRevealed(false);
                      setSeedPassword('');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
                  >
                    I Have Backed It Up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
