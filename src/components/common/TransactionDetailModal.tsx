import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  ShieldCheck, 
  Clock, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { SUPPORTED_NETWORKS } from '../../lib/constants';

export const TransactionDetailModal: React.FC = () => {
  const { selectedTransaction, setSelectedTransaction, formatCurrency, showToast } = useWallet();
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedFrom, setCopiedFrom] = useState(false);
  const [copiedTo, setCopiedTo] = useState(false);

  if (!selectedTransaction) return null;

  const tx = selectedTransaction;

  const handleCopy = (text: string, type: 'hash' | 'from' | 'to') => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else if (type === 'from') {
      setCopiedFrom(true);
      setTimeout(() => setCopiedFrom(false), 2000);
    } else {
      setCopiedTo(true);
      setTimeout(() => setCopiedTo(false), 2000);
    }
    showToast('info', 'Copied to clipboard', text.length > 20 ? `${text.slice(0, 10)}...${text.slice(-8)}` : text);
  };

  const networkConfig = SUPPORTED_NETWORKS.find(
    n => n.name.toLowerCase() === tx.network.toLowerCase() || tx.network.toLowerCase().includes(n.id)
  ) || SUPPORTED_NETWORKS[0];

  const explorerLink = `${networkConfig.explorerUrl}${tx.txHash}`;

  const formattedDate = new Date(tx.timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl glass-ios-card p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              tx.isPrismDirect ? 'bg-amber-400/20 text-amber-300' :
              tx.type === 'send' ? 'bg-rose-500/20 text-rose-400' :
              tx.type === 'receive' ? 'bg-emerald-500/20 text-emerald-400' :
              tx.type === 'swap' ? 'bg-indigo-500/20 text-indigo-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {tx.isPrismDirect ? <Zap className="w-5 h-5" /> :
               tx.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> :
               tx.type === 'receive' ? <ArrowDownLeft className="w-5 h-5" /> :
               tx.type === 'swap' ? <Repeat className="w-5 h-5" /> :
               <ArrowDownLeft className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white capitalize">
                {tx.isPrismDirect ? 'Prism Direct Instant Transfer' : tx.type === 'swap' ? `Swap ${tx.asset} → ${tx.swapToAsset}` : `${tx.type} ${tx.asset}`}
              </h3>
              <p className="text-xs text-slate-400">{formattedDate}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedTransaction(null)}
            className="p-1.5 rounded-xl glass-ios-button text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount display */}
        <div className="my-5 p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Value</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.asset}
          </div>
          <span className="text-sm font-semibold text-slate-400 mt-1">
            ≈ {formatCurrency(tx.usdValue)}
          </span>

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Settled</span>
            </span>
            <span className="text-xs px-3 py-1 rounded-full glass-ios text-slate-300 font-semibold font-mono">
              {tx.network}
            </span>
          </div>
        </div>

        {/* Details list */}
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Reference / Tx Hash */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-1">
            <span className="text-slate-400 font-medium text-xs">Transaction Reference / Hash</span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-white truncate select-all">{tx.txHash}</span>
              <button
                onClick={() => handleCopy(tx.txHash, 'hash')}
                className="p-1 rounded text-slate-400 hover:text-white shrink-0"
              >
                {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* From / Sender */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-1">
            <span className="text-slate-400 font-medium text-xs">Sender (From)</span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-white truncate select-all">{tx.fromAddress}</span>
              <button
                onClick={() => handleCopy(tx.fromAddress, 'from')}
                className="p-1 rounded text-slate-400 hover:text-white shrink-0"
              >
                {copiedFrom ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* To / Recipient */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-1">
            <span className="text-slate-400 font-medium text-xs">Recipient (To)</span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-white truncate select-all">{tx.toAddress}</span>
              <button
                onClick={() => handleCopy(tx.toAddress, 'to')}
                className="p-1 rounded text-slate-400 hover:text-white shrink-0"
              >
                {copiedTo ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Network Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 font-medium text-xs block">Fee Paid</span>
              <span className="text-emerald-400 font-bold font-mono text-sm mt-0.5 block">
                {tx.fee === 0 ? '$0.00 (Zero Fee)' : formatCurrency(tx.fee)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
              <span className="text-slate-400 font-medium text-xs block">Date & Time</span>
              <span className="text-white font-medium text-xs mt-1 block">
                {formattedDate}
              </span>
            </div>
          </div>

          {tx.note && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/25 text-indigo-200 text-xs">
              <span className="font-bold block mb-0.5">Memo / Description:</span>
              {tx.note}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {!tx.isPrismDirect && (
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-2xl glass-ios-button text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>View On-Chain Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => setSelectedTransaction(null)}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
