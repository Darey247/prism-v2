import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  ChevronRight, 
  Zap 
} from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const { transactions, setSelectedTransaction, setActiveTab, formatCurrency, settings } = useWallet();

  const recent = transactions.slice(0, 5);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="rounded-3xl glass-ios-card p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>
          <p className="text-xs text-slate-400">Transactions & P2P transfers</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Activity list */}
      <div className="divide-y divide-white/5 mt-2">
        {recent.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No recent activity found.
          </div>
        ) : (
          recent.map(tx => {
            const isPrismDirect = tx.isPrismDirect;

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransaction(tx)}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-white/5 rounded-2xl px-2 transition-colors cursor-pointer group"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isPrismDirect ? 'bg-amber-400/15 text-amber-300 border border-amber-400/20' :
                    tx.type === 'send' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                    tx.type === 'receive' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                    tx.type === 'swap' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' :
                    'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  }`}>
                    {isPrismDirect ? <Zap className="w-4 h-4 text-amber-300" /> :
                     tx.type === 'send' ? <ArrowUpRight className="w-4 h-4" /> :
                     tx.type === 'receive' ? <ArrowDownLeft className="w-4 h-4" /> :
                     tx.type === 'swap' ? <Repeat className="w-4 h-4" /> :
                     <ArrowDownLeft className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-white capitalize truncate">
                        {isPrismDirect 
                          ? `Prism Direct • ${tx.recipientHandle || tx.toAddress}`
                          : tx.type === 'swap' ? `Swap ${tx.asset} → ${tx.swapToAsset}` : `${tx.type} ${tx.asset}`}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                      {formatTimeAgo(tx.timestamp)} • {isPrismDirect ? '⚡ 0 Fee' : tx.network}
                    </span>
                  </div>
                </div>

                {/* Right: Amount & Value */}
                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold text-xs sm:text-sm block ${
                    tx.type === 'send' ? 'text-white' : 'text-emerald-400'
                  }`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.asset}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {settings.hideBalance ? '••••' : formatCurrency(tx.usdValue)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
