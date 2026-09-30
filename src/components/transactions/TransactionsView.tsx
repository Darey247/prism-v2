import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  Calendar, 
  ChevronRight, 
  Download,
  Zap
} from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus } from '../../types/wallet';

export const TransactionsView: React.FC = () => {
  const { transactions, setSelectedTransaction, formatCurrency, settings, showToast } = useWallet();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');

  const filtered = transactions.filter(tx => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchAsset = tx.asset.toLowerCase().includes(q);
      const matchFrom = tx.fromAddress.toLowerCase().includes(q);
      const matchTo = tx.toAddress.toLowerCase().includes(q);
      const matchHandle = tx.recipientHandle?.toLowerCase().includes(q);
      const matchNote = tx.note?.toLowerCase().includes(q);
      if (!matchHash && !matchAsset && !matchFrom && !matchTo && !matchHandle && !matchNote) {
        return false;
      }
    }

    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

    if (dateFilter !== 'all') {
      const now = Date.now();
      const diff = now - tx.timestamp;
      if (dateFilter === '24h' && diff > 24 * 60 * 60 * 1000) return false;
      if (dateFilter === '7d' && diff > 7 * 24 * 60 * 60 * 1000) return false;
      if (dateFilter === '30d' && diff > 30 * 24 * 60 * 60 * 1000) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Type,Asset,Amount,USD Value,Status,Network,Fee,Timestamp,TxHash\n';
    const rows = filtered.map(t => 
      `"${t.id}","${t.type}","${t.asset}","${t.amount}","${t.usdValue}","${t.status}","${t.network}","${t.fee}","${new Date(t.timestamp).toISOString()}","${t.txHash}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prism-wallet-ledger-${Date.now()}.csv`;
    a.click();
    showToast('success', 'Export Complete', 'Exported transaction ledger.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Activity Ledger</h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit trail including on-chain and Prism Direct transfers
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 rounded-2xl glass-ios-button text-slate-200 text-xs font-bold flex items-center justify-center gap-2 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-3xl glass-ios p-4 shadow-xl space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hash, @handle, address or memo..."
            className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Type Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/10 text-xs">
            {(['all', 'send', 'receive', 'swap', 'deposit'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-xl font-bold capitalize transition-all ${
                  typeFilter === t ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/10 text-xs">
            {(['all', 'completed', 'pending', 'failed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-xl font-bold capitalize transition-all ${
                  statusFilter === s ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/10 text-xs">
            {(['all', '24h', '7d', '30d'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  dateFilter === d ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'all' ? 'All' : d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-3xl glass-ios-card shadow-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-300">No Transactions Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(tx => {
              const formattedDate = new Date(tx.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      tx.isPrismDirect ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                      tx.type === 'send' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      tx.type === 'receive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      tx.type === 'swap' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {tx.isPrismDirect ? <Zap className="w-5 h-5 text-amber-300" /> :
                       tx.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> :
                       tx.type === 'receive' ? <ArrowDownLeft className="w-5 h-5" /> :
                       tx.type === 'swap' ? <Repeat className="w-5 h-5" /> :
                       <ArrowDownLeft className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white capitalize truncate">
                          {tx.isPrismDirect ? `Prism Direct • ${tx.recipientHandle || tx.toAddress}` :
                           tx.type === 'swap' ? `Swap ${tx.asset} → ${tx.swapToAsset}` : `${tx.type} ${tx.asset}`}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize border ${
                          tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                          tx.status === 'pending' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                          'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}>
                          {tx.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="truncate max-w-[120px] sm:max-w-[200px] font-mono text-[11px] text-slate-400">
                          {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-indigo-300">{tx.network}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`font-mono font-bold text-sm block ${
                        tx.type === 'send' ? 'text-white' : 'text-emerald-400'
                      }`}>
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.asset}
                      </span>
                      <span className="text-xs text-slate-400 font-medium block mt-0.5 font-mono">
                        {settings.hideBalance ? '••••' : formatCurrency(tx.usdValue)}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
