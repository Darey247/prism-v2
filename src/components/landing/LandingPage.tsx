import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Globe, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Repeat, 
  ChevronRight,
  ChevronDown,
  Layers,
  Smartphone,
  Mail,
  UserCheck
} from 'lucide-react';
import { PRISM_DIRECTORY } from '../../context/WalletContext';

export const LandingPage: React.FC = () => {
  const { 
    setViewMode, 
    openAuthModal, 
    startGuestSession,
    guestRemainingSeconds,
    isRegisteredUser,
    myPrismHandle,
    totalPortfolioBalance,
    formatCurrency
  } = useWallet();

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [demoAmount, setDemoAmount] = useState('250');
  const [demoRecipient, setDemoRecipient] = useState('@sarah_crypto');
  const [demoSuccess, setDemoSuccess] = useState(false);

  const handleLaunchApp = () => {
    startGuestSession();
    setViewMode('app');
  };

  const handleSimulateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSuccess(true);
    setTimeout(() => setDemoSuccess(false), 3000);
  };

  const formatMinutesRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const faqs = [
    {
      q: 'How does Prism Direct transfer tokens with $0.00 gas fees?',
      a: 'Prism Direct uses off-chain ledger settlement between verified unique Prism Tags. When sending to another registered user, balances are reallocated instantly on the internal ledger with zero blockchain gas fees and sub-second confirmation.'
    },
    {
      q: 'Is my unique Prism Username really exclusive to me?',
      a: 'Yes. Every username is registered atomically in our database with strict unique constraint security rules. No two users can ever register or use the same tag. Once claimed during signup, your tag belongs exclusively to your account.'
    },
    {
      q: 'What is the 1-hour guest trial policy?',
      a: 'You can explore all wallet functions, deposit test funds, and simulate swaps without signing up. For security, unauthenticated guest sessions automatically return to this landing page after 1 hour. Creating a free account permanently preserves your wallet state.'
    },
    {
      q: 'How does Supabase power the email service?',
      a: 'We integrate Supabase Auth as the primary email service provider for secure account verification, password resets, and magic link delivery with enterprise-grade email infrastructure.'
    },
    {
      q: 'Which blockchain networks are supported?',
      a: 'Prism Wallet provides native tracking and on-chain support for Ethereum Mainnet, Bitcoin, Solana, Arbitrum One, Polygon, and Binance Smart Chain.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Liquid Ambient Background Lighting */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[650px] liquid-ambient-blue rounded-full blur-[140px] pointer-events-none -translate-y-1/2 -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] liquid-ambient-purple rounded-full blur-[150px] pointer-events-none translate-y-1/3 -z-10" />
      <div className="fixed top-1/2 right-10 w-[450px] h-[450px] liquid-ambient-emerald rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top iOS Liquid Glass Navbar */}
      <header className="sticky top-0 z-40 w-full glass-ios-dock border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setViewMode('landing')}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Prism Wallet</span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono font-bold">
                <Zap className="w-3 h-3 text-amber-300" />
                Prism Direct 0% Fee
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#prism-direct" className="hover:text-white transition-colors">Prism Direct</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {isRegisteredUser ? (
              <button
                type="button"
                onClick={() => setViewMode('app')}
                className="py-2 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Open Wallet ({myPrismHandle})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="py-2 px-3.5 rounded-2xl glass-ios-button text-slate-200 hover:text-white text-xs font-semibold"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="py-2 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Claim Unique Tag</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1-Hour Guest Policy Notice Bar if active */}
      {!isRegisteredUser && guestRemainingSeconds > 0 && guestRemainingSeconds < 3600 && (
        <div className="bg-indigo-950/60 border-b border-indigo-500/20 px-4 py-2 text-center text-xs text-indigo-200 flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Active trial session: <strong>{formatMinutesRemaining(guestRemainingSeconds)}</strong> remaining before auto-returning to landing page.</span>
          <button
            onClick={() => openAuthModal('signup')}
            className="underline font-bold text-white hover:text-indigo-300 ml-1"
          >
            Sign up to keep permanently
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        {/* Left Column: Value Prop */}
        <div className="flex-1 space-y-6 max-w-2xl">
          {/* Liquid Glass Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-ios text-xs font-semibold text-indigo-300 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Apple Liquid Glass UI • Supabase Email Auth • 0-Fee P2P</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Next-Gen Crypto <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300 bg-clip-text text-transparent">
              Zero-Gas Transfers.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Send tokens instantly to exclusive unique <strong>@usernames</strong> with zero network gas fees. Experience Apple-grade liquid glass interfaces, multi-chain custody across Bitcoin, Ethereum, and Solana, and institutional-grade encryption.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Claim Your Unique @Tag Free</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchApp}
              className="py-3.5 px-6 rounded-2xl glass-ios-button text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Launch Web App (1-Hour Trial)</span>
            </button>
          </div>

          {/* Highlights & Security Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Non-Custodial Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Supabase Email Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>1-Hour Guest Session Protection</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Liquid Glass Wallet Card */}
        <div className="flex-1 w-full max-w-md mx-auto lg:max-w-none">
          <div className="relative">
            {/* Background specular glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/30 to-violet-600/30 rounded-3xl blur-xl opacity-75" />

            <div className="relative rounded-3xl glass-ios-card p-6 sm:p-7 shadow-2xl border border-white/15 space-y-6">
              {/* Card Top */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Portfolio Net Worth</span>
                  <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
                    $42,850.25
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  +8.45% 24h
                </div>
              </div>

              {/* Liquid Asset Pills */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { sym: 'ETH', price: '$3,420', col: '#627EEA' },
                  { sym: 'BTC', price: '$64,200', col: '#F7931A' },
                  { sym: 'SOL', price: '$154', col: '#14F195' },
                  { sym: 'USDC', price: '$1.00', col: '#2775CA' }
                ].map(a => (
                  <div key={a.sym} className="p-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-center">
                    <span className="text-[10px] font-bold text-white block">{a.sym}</span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{a.price}</span>
                  </div>
                ))}
              </div>

              {/* Prism Direct Simulator Box */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Instant Prism Direct Transfer</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    $0.00 GAS FEE
                  </span>
                </div>

                <form onSubmit={handleSimulateTransfer} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={demoRecipient}
                      onChange={(e) => setDemoRecipient(e.target.value)}
                      placeholder="@recipient"
                      className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={demoAmount}
                      onChange={(e) => setDemoAmount(e.target.value)}
                      placeholder="USDC"
                      className="w-20 bg-slate-900/80 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-mono text-right focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Zap className="w-3 h-3 text-amber-300" />
                    <span>Test Instant Transfer</span>
                  </button>
                </form>

                {demoSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 font-medium animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Transferred {demoAmount} USDC to {demoRecipient} with $0.00 fee!</span>
                  </div>
                )}
              </div>

              {/* Quick Launch CTA */}
              <button
                type="button"
                onClick={handleLaunchApp}
                className="w-full py-2.5 px-4 rounded-2xl glass-ios-button text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Enter Live Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 1-HOUR TIMEOUT EXPLANATION CALLOUT */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto py-8">
        <div className="rounded-3xl glass-ios p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                1-Hour Unauthenticated Session Protection
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                You can try the wallet immediately as a guest. If no account has been signed within <strong>1 hour</strong>, the platform automatically returns here to protect unreserved data. Create your free account anytime to secure your unique 1-of-1 Prism tag and keep your portfolio forever.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 whitespace-nowrap active:scale-95 transition-all self-start md:self-auto"
          >
            Create Permanent Account
          </button>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="px-4 sm:px-6 max-w-7xl mx-auto py-16">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Architecture & Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Crafted for Unmatched Speed & Security
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered from first principles with Apple iOS liquid glass design, strict unique username registries, and multi-chain execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-3xl glass-ios-card p-6 sm:p-7 shadow-xl space-y-4 hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Prism Direct (Zero Gas Fee)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Send tokens directly to any user's unique <strong>@username</strong> without paying volatile blockchain gas fees or waiting on congested blocks.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl glass-ios-card p-6 sm:p-7 shadow-xl space-y-4 hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">1-of-1 Unique Username Claims</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Each Prism username is globally unique and enforced at the database level. No one else can claim or impersonate your handle once registered.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl glass-ios-card p-6 sm:p-7 shadow-xl space-y-4 hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Supabase Email Service Provider</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Powered by your Supabase account for reliable transactional email delivery, instant magic links, password resets, and account verification.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-3xl glass-ios-card p-6 sm:p-7 shadow-xl space-y-4 hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Layers className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Liquid Glass iOS Design</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              True frosted glass surfaces, specular highlights, spring touch responses, floating mobile navigation docks, and seamless responsiveness from 320px to 4K.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-3xl glass-ios-card p-6 sm:p-7 shadow-xl space-y-4 hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Repeat className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Multi-Token Swap</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Exchange tokens with customizable slippage limits, live rate calculations, and zero hidden markup across supported cryptocurrencies.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-3xl glass-ios-card p-6 sm:p-7 shadow-xl space-y-4 hover:border-white/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white">12-Word Seed & 2FA Security</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Non-custodial cryptographic key derivation, optional PIN confirmation on outgoing transactions, and sensitive balance masking for public environments.
            </p>
          </div>
        </div>
      </section>

      {/* PRISM DIRECT EXPLAINER */}
      <section id="prism-direct" className="px-4 sm:px-6 max-w-7xl mx-auto py-12">
        <div className="rounded-3xl glass-ios-card p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-5">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Exclusive Prism Protocol</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Say Goodbye to 40-Character Hex Addresses & Gas Fees
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transferring crypto between Prism users no longer requires double-checking hex strings or paying high gas fees during network peaks. Simply enter their verified <strong>@handle</strong>, review the confirmation, and the tokens settle immediately.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => openAuthModal('signup')}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Register Your Unique Tag</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleLaunchApp}
                className="py-3 px-5 rounded-2xl glass-ios-button text-slate-200 text-xs font-semibold"
              >
                Try in Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="px-4 sm:px-6 max-w-4xl mx-auto py-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Questions & Answers</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-2xl glass-ios border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="font-bold text-xs sm:text-sm text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/10 glass-ios-dock px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-extrabold text-slate-200">Prism Wallet</span>
            <span>•</span>
            <span>Liquid Glass iOS Web3 Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('landing')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => openAuthModal('signup')} className="hover:text-white transition-colors">Sign Up</button>
            <button onClick={handleLaunchApp} className="hover:text-white transition-colors">Launch App</button>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
