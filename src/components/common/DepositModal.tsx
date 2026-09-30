import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { X, ArrowDownToLine, CheckCircle2 } from 'lucide-react';
import { AssetSymbol } from '../../types/wallet';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { assets, depositSimulatedFunds, formatCurrency } = useWallet();
  const [selectedSymbol, setSelectedSymbol] = useState<AssetSymbol>('ETH');
  const [amount, setAmount] = useState<string>('1.0');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];

  const presetAmounts: Record<AssetSymbol, number[]> = {
    BTC: [0.1, 0.5, 1.0],
    ETH: [0.5, 1.0, 5.0],
    SOL: [5.0, 10.0, 50.0],
    USDT: [500, 1000, 5000],
    USDC: [500, 1000, 5000],
    BNB: [1.0, 5.0, 10.0],
    XRP: [250, 500, 1000]
  };

  const handleDeposit = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    depositSimulatedFunds(selectedSymbol, num);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl glass-ios-card p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Deposit Crypto</h3>
              <p className="text-xs text-slate-400">Add test crypto to trial wallet features</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl glass-ios-button text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3 animate-bounce shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Deposit Simulated!</h4>
            <p className="text-xs text-slate-400 mt-1">
              +{amount} {selectedSymbol} added to your balance.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Select Asset */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Asset</label>
              <div className="grid grid-cols-4 gap-1.5">
                {assets.map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setSelectedSymbol(asset.symbol);
                      setAmount(String(presetAmounts[asset.symbol][1]));
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                      asset.symbol === selectedSymbol
                        ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-400/50 shadow-md'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: asset.color }}
                    >
                      {asset.icon}
                    </span>
                    <span className="text-xs font-bold">{asset.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount</label>
                <span className="text-xs text-slate-400">Current: {currentAsset.balance.toFixed(4)} {currentAsset.symbol}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900/70 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="0.0"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {selectedSymbol}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ≈ {formatCurrency((parseFloat(amount) || 0) * currentAsset.price)} USD
              </p>
            </div>

            {/* Quick preset amount chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Presets</span>
              <div className="flex gap-2">
                {presetAmounts[selectedSymbol].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className="flex-1 py-1.5 rounded-xl glass-ios-button text-xs font-bold font-mono text-slate-200"
                  >
                    +{val} {selectedSymbol}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleDeposit}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Confirm Deposit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
