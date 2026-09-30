import React from 'react';
import { PortfolioCard } from './PortfolioCard';
import { PortfolioChart } from './PortfolioChart';
import { AssetList } from './AssetList';
import { RecentActivity } from './RecentActivity';
import { useWallet } from '../../context/WalletContext';
import { Zap, ArrowRight, ShieldCheck, Sparkles, Send } from 'lucide-react';

interface DashboardViewProps {
  onOpenDeposit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenDeposit }) => {
  const { setActiveTab, myPrismHandle } = useWallet();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Prism to Prism Liquid Glass Feature Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-ios-card p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Ambient specular light spots */}
        <div className="absolute top-0 right-0 w-80 h-80 liquid-ambient-blue rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 liquid-ambient-purple rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Prism Direct • Instant P2P Transfers
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                0% GAS FEE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Send tokens directly to usernames or tags like <span className="text-indigo-300 font-mono font-bold">@sarah_crypto</span> in under 1 second.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Prism Direct</span>
          </button>
        </div>
      </div>

      {/* Top Grid: Balance Card + Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <PortfolioCard onOpenDeposit={onOpenDeposit} />
        </div>
        <div className="lg:col-span-7">
          <PortfolioChart />
        </div>
      </div>

      {/* Bottom Grid: Assets List + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <AssetList />
        </div>
        <div className="lg:col-span-5">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};
