import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Send, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  MoreVertical,
  Search,
  Zap
} from 'lucide-react';
import { CryptoAsset, AssetSymbol } from '../../types/wallet';

export const AssetList: React.FC = () => {
  const { 
    assets, 
    formatCurrency, 
    settings, 
    openSendWithAsset, 
    openReceiveWithAsset, 
    openSwapWithAssets 
  } = useWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuAssetId, setActiveMenuAssetId] = useState<string | null>(null);

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-3xl glass-ios-card p-6 shadow-2xl">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Assets</h3>
          <p className="text-xs text-slate-400">Multi-chain portfolio balances</p>
        </div>

        <div className="relative sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Assets List */}
      <div className="divide-y divide-white/5 mt-2">
        {filteredAssets.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No crypto assets found matching "{searchQuery}"
          </div>
        ) : (
          filteredAssets.map(asset => {
            const isPositive = asset.change24h >= 0;
            const isMenuOpen = activeMenuAssetId === asset.id;

            return (
              <div 
                key={asset.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-white/5 rounded-2xl px-2 transition-colors relative"
              >
                {/* Left: Icon & Asset Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-extrabold text-white shadow-md shrink-0"
                    style={{ backgroundColor: asset.color }}
                  >
                    <span>{asset.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white truncate">{asset.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                        {asset.symbol}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5 font-mono">
                      {formatCurrency(asset.price)}
                    </span>
                  </div>
                </div>

                {/* Center: Mini Sparkline */}
                <div className="hidden md:flex items-center justify-center w-24 h-8 shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    <path
                      d={generateMiniSparkline(asset.sparkline)}
                      fill="none"
                      stroke={isPositive ? '#10B981' : '#F43F5E'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Right: Balance & Value */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-white block">
                      {settings.hideBalance ? '••••••' : `${asset.balance.toFixed(4)} ${asset.symbol}`}
                    </span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-400 font-medium">
                        {settings.hideBalance ? '••••' : formatCurrency(asset.usdValue)}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuAssetId(isMenuOpen ? null : asset.id)}
                      className="p-1.5 rounded-xl glass-ios-button text-slate-400 hover:text-white"
                      aria-label="Asset options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 glass-ios-dock rounded-2xl shadow-2xl p-1.5 z-30 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuAssetId(null);
                            openSendWithAsset(asset.symbol);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Send {asset.symbol}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuAssetId(null);
                            openReceiveWithAsset(asset.symbol);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Receive</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuAssetId(null);
                            openSwapWithAssets(asset.symbol);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10 text-left transition-colors"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-violet-400" />
                          <span>Swap</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function generateMiniSparkline(values: number[]): string {
  if (!values || values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * 100;
    const y = 30 - ((val - min) / range) * 26 - 2;
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}
