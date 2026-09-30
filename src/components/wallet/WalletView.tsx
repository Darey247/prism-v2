import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  Send, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Plus, 
  Copy, 
  PieChart,
  Check,
  Zap
} from 'lucide-react';
import { CryptoAsset } from '../../types/wallet';

interface WalletViewProps {
  onOpenDeposit: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onOpenDeposit }) => {
  const { 
    assets, 
    totalPortfolioBalance, 
    formatCurrency, 
    settings, 
    openSendWithAsset, 
    openReceiveWithAsset, 
    openSwapWithAssets,
    myPrismHandle,
    showToast 
  } = useWallet();

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    showToast('info', 'Address Copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Wallet Master Banner */}
      <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 liquid-ambient-blue rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 liquid-ambient-purple rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Worth</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-indigo-300 font-mono font-bold">
                {myPrismHandle}
              </span>
            </div>
            <div className="text-3xl sm:text-5xl font-mono font-extrabold text-white mt-2">
              {settings.hideBalance ? '••••••••••••' : formatCurrency(totalPortfolioBalance)}
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Decentralized multi-chain custody across Bitcoin, Ethereum, and Solana networks.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => openSendWithAsset('ETH')}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Crypto</span>
            </button>
            <button
              onClick={() => openReceiveWithAsset('ETH')}
              className="py-2.5 px-4 rounded-2xl glass-ios-button text-slate-200 font-bold text-xs flex items-center gap-2"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Receive</span>
            </button>
            <button
              onClick={onOpenDeposit}
              className="py-2.5 px-4 rounded-2xl glass-ios-button text-slate-200 font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Deposit</span>
            </button>
          </div>
        </div>

        {/* Asset Allocation Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2.5">
            <span className="flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-400" />
              <span>Portfolio Allocation</span>
            </span>
            <span className="text-slate-400">{assets.length} Active Holdings</span>
          </div>

          <div className="h-3 rounded-full overflow-hidden flex bg-slate-900 border border-white/10 p-0.5">
            {assets.map(asset => {
              const pct = totalPortfolioBalance > 0 ? (asset.usdValue / totalPortfolioBalance) * 100 : 0;
              if (pct <= 0) return null;
              return (
                <div
                  key={asset.id}
                  style={{ width: `${pct}%`, backgroundColor: asset.color }}
                  className="h-full rounded-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                  title={`${asset.name}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            {assets.map(asset => {
              const pct = totalPortfolioBalance > 0 ? (asset.usdValue / totalPortfolioBalance) * 100 : 0;
              return (
                <div key={asset.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="text-slate-200 font-medium">{asset.symbol}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 tracking-tight">Holdings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assets.map(asset => {
            const isPositive = asset.change24h >= 0;
            const isCopied = copiedId === asset.id;

            return (
              <div 
                key={asset.id}
                className="rounded-3xl glass-ios-card p-5 shadow-xl hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: asset.color }}
                      >
                        {asset.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-white">{asset.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-slate-300 px-1 rounded bg-white/10">
                            {asset.symbol}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{asset.network}</span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
                    <div className="font-mono text-lg font-extrabold text-white mt-0.5">
                      {settings.hideBalance ? '••••••' : `${asset.balance.toFixed(4)} ${asset.symbol}`}
                    </div>
                    <span className="text-xs text-slate-400 font-semibold block mt-0.5 font-mono">
                      {settings.hideBalance ? '••••' : `≈ ${formatCurrency(asset.usdValue)}`}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-xl glass-ios">
                    <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                      {asset.address}
                    </span>
                    <button
                      onClick={() => handleCopy(asset.address, asset.id)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Copy address"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openSendWithAsset(asset.symbol)}
                    className="py-2 px-2 rounded-xl glass-ios-button text-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3 text-indigo-400" />
                    <span>Send</span>
                  </button>
                  <button
                    onClick={() => openReceiveWithAsset(asset.symbol)}
                    className="py-2 px-2 rounded-xl glass-ios-button text-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                    <span>Receive</span>
                  </button>
                  <button
                    onClick={() => openSwapWithAssets(asset.symbol)}
                    className="py-2 px-2 rounded-xl glass-ios-button text-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-violet-400" />
                    <span>Swap</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
