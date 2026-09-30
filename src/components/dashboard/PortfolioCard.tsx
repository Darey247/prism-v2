import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

interface PortfolioCardProps {
  onOpenDeposit: () => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ onOpenDeposit }) => {
  const { 
    totalPortfolioBalance, 
    portfolio24hChangeAmount, 
    portfolio24hChangePercent, 
    availableCashBalance,
    settings, 
    toggleHideBalance, 
    formatCurrency,
    setActiveTab,
    setReceiveModalOpen,
    myPrismHandle
  } = useWallet();

  const isPositive = portfolio24hChangeAmount >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl glass-ios-card p-6 sm:p-7 shadow-2xl">
      {/* Specular ambient blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 liquid-ambient-blue rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 liquid-ambient-purple rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Worth</span>
          <button
            type="button"
            onClick={toggleHideBalance}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            title={settings.hideBalance ? "Show balance" : "Hide balance"}
            aria-label="Toggle balance visibility"
          >
            {settings.hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[11px] font-mono font-bold">
          <Zap className="w-3 h-3 text-amber-300" />
          <span>{myPrismHandle}</span>
        </div>
      </div>

      {/* Balance Amount */}
      <div className="relative z-10 mt-3 sm:mt-4">
        <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-mono flex items-baseline gap-2">
          {settings.hideBalance ? (
            <span className="tracking-widest text-slate-400 text-3xl sm:text-4xl">••••••••••••</span>
          ) : (
            <span>{formatCurrency(totalPortfolioBalance)}</span>
          )}
        </div>

        {/* 24h P&L Indicator */}
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
            isPositive 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isPositive ? '+' : ''}{settings.hideBalance ? '•••' : formatCurrency(portfolio24hChangeAmount)} ({isPositive ? '+' : ''}{portfolio24hChangePercent.toFixed(2)}%)
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-slate-400 text-xs">
            Liquid: <span className="font-mono font-bold text-white">{settings.hideBalance ? '••••' : formatCurrency(availableCashBalance)}</span>
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="relative z-10 mt-6 sm:mt-8 grid grid-cols-4 gap-2 sm:gap-3">
        {/* Send & P2P */}
        <button
          type="button"
          onClick={() => setActiveTab('send')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
          <span>Send</span>
        </button>

        {/* Receive */}
        <button
          type="button"
          onClick={() => setReceiveModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl glass-ios-button text-slate-100 font-bold text-xs active:scale-95 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <span>Receive</span>
        </button>

        {/* Swap */}
        <button
          type="button"
          onClick={() => setActiveTab('swap')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl glass-ios-button text-slate-100 font-bold text-xs active:scale-95 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <ArrowLeftRight className="w-4 h-4 text-violet-400" />
          </div>
          <span>Swap</span>
        </button>

        {/* Deposit */}
        <button
          type="button"
          onClick={onOpenDeposit}
          className="flex flex-col items-center justify-center p-3 rounded-2xl glass-ios-button text-slate-100 font-bold text-xs active:scale-95 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4 text-blue-400" />
          </div>
          <span>Deposit</span>
        </button>
      </div>
    </div>
  );
};
