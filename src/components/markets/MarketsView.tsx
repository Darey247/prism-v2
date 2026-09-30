import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ArrowUpDown, 
  Send, 
  ArrowLeftRight 
} from 'lucide-react';

export const MarketsView: React.FC = () => {
  const { assets, formatCurrency, openSendWithAsset, openSwapWithAssets } = useWallet();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'marketCap' | 'price' | 'change24h' | 'volume24h'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAssets = assets
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      return sortOrder === 'desc' ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
    });

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Markets Header */}
      <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Crypto Markets</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time decentralized asset pricing, 24h high/low and volume tracking
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crypto or ticker..."
            className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Markets Table */}
      <div className="rounded-3xl glass-ios-card shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4 sm:px-6">Asset</th>
                <th 
                  className="py-4 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-4 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('change24h')}
                >
                  <div className="flex items-center gap-1">
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="hidden lg:table-cell py-4 px-4">24h High / Low</th>
                <th 
                  className="hidden md:table-cell py-4 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('volume24h')}
                >
                  <div className="flex items-center gap-1">
                    <span>24h Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="hidden sm:table-cell py-4 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('marketCap')}
                >
                  <div className="flex items-center gap-1">
                    <span>Market Cap</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.map(asset => {
                const isPositive = asset.change24h >= 0;

                return (
                  <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                    {/* Asset Name & Icon */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
                          style={{ backgroundColor: asset.color }}
                        >
                          {asset.icon}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-white block">{asset.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{asset.symbol}</span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-mono font-bold text-sm text-white">
                      {formatCurrency(asset.price)}
                    </td>

                    {/* 24h Change */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%</span>
                      </span>
                    </td>

                    {/* 24h High / Low */}
                    <td className="hidden lg:table-cell py-4 px-4 text-slate-300 font-mono">
                      <div>High: {formatCurrency(asset.high24h)}</div>
                      <div className="text-[11px] text-slate-500">Low: {formatCurrency(asset.low24h)}</div>
                    </td>

                    {/* 24h Volume */}
                    <td className="hidden md:table-cell py-4 px-4 text-slate-300 font-mono">
                      {formatLargeNumber(asset.volume24h)}
                    </td>

                    {/* Market Cap */}
                    <td className="hidden sm:table-cell py-4 px-4 text-slate-300 font-mono">
                      {formatLargeNumber(asset.marketCap)}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openSwapWithAssets(asset.symbol)}
                          className="py-1.5 px-3 rounded-xl glass-ios-button text-indigo-300 text-xs font-bold"
                        >
                          Swap
                        </button>
                        <button
                          onClick={() => openSendWithAsset(asset.symbol)}
                          className="py-1.5 px-3 rounded-xl glass-ios-button text-slate-200 text-xs font-bold"
                        >
                          Send
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
