import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  ArrowDown, 
  ArrowLeftRight, 
  ChevronDown, 
  Settings2, 
  Check, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AssetSymbol, CryptoAsset } from '../../types/wallet';

export const SwapFlow: React.FC = () => {
  const { 
    assets, 
    swapCrypto, 
    formatCurrency, 
    selectedAssetForAction, 
    setActiveTab 
  } = useWallet();

  const [fromSymbol, setFromSymbol] = useState<AssetSymbol>(
    selectedAssetForAction?.symbol || 'ETH'
  );
  const [toSymbol, setToSymbol] = useState<AssetSymbol>('USDC');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fromAsset: CryptoAsset = assets.find(a => a.symbol === fromSymbol) || assets[0];
  const toAsset: CryptoAsset = assets.find(a => a.symbol === toSymbol) || assets[1];

  const parsedFromAmount = parseFloat(fromAmount) || 0;
  const exchangeRate = fromAsset.price / (toAsset.price || 1);
  const calculatedToAmount = parsedFromAmount * exchangeRate;
  const minimumReceived = calculatedToAmount * (1 - slippage / 100);
  const networkFeeUSD = 1.85;

  const handleFlip = () => {
    const temp = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(temp);
    setFromAmount('');
  };

  const handleSetMax = () => {
    setFromAmount(fromAsset.balance.toFixed(4));
  };

  const handleValidateAndReview = () => {
    setErrorMessage('');
    if (parsedFromAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }
    if (parsedFromAmount > fromAsset.balance) {
      setErrorMessage(`Insufficient ${fromSymbol} balance. Available: ${fromAsset.balance.toFixed(4)}`);
      return;
    }
    if (fromSymbol === toSymbol) {
      setErrorMessage('Please select two distinct assets to swap.');
      return;
    }
    setStep('confirm');
  };

  const handleExecuteSwap = async () => {
    setStep('processing');
    setTimeout(async () => {
      try {
        const res = await swapCrypto({
          fromSymbol,
          toSymbol,
          fromAmount: parsedFromAmount,
          toAmount: calculatedToAmount,
          network: fromAsset.network,
          fee: networkFeeUSD
        });

        if (res.success) {
          setTxHash(res.txHash);
          setStep('success');
        } else {
          setErrorMessage(res.error || 'Swap execution failed.');
          setStep('input');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Swap error');
        setStep('input');
      }
    }, 1600);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Specular ambient blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 liquid-ambient-blue rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 liquid-ambient-purple rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>Token Swap</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
                0% Protocol Fee
              </span>
            </h2>
            <p className="text-xs text-slate-400">Decentralized liquidity routing with slippage protection</p>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-2xl glass-ios-button text-slate-300 hover:text-white"
            title="Slippage settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Slippage Settings */}
        {showSettings && (
          <div className="relative z-10 my-3 p-3.5 rounded-2xl glass-ios border border-white/10 animate-in fade-in">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Slippage Tolerance</span>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlippage(s)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    slippage === s
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'glass-ios-button text-slate-300'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="relative z-10 mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2 text-rose-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: INPUT */}
        {step === 'input' && (
          <div className="relative z-10 mt-5 space-y-2">
            {/* Pay Box */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">You Pay</span>
                <span className="text-xs text-slate-400">
                  Balance: <span className="font-mono font-bold text-white">{fromAsset.balance.toFixed(4)}</span>
                  <button
                    onClick={handleSetMax}
                    className="ml-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    MAX
                  </button>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  step="any"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-2xl font-mono font-extrabold text-white placeholder-slate-600 focus:outline-none"
                />

                <select
                  value={fromSymbol}
                  onChange={(e) => setFromSymbol(e.target.value as AssetSymbol)}
                  className="bg-slate-800 border border-white/10 rounded-2xl px-3 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.symbol}>
                      {a.symbol} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                ≈ {formatCurrency(parsedFromAmount * fromAsset.price)}
              </span>
            </div>

            {/* Flip Button */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                type="button"
                onClick={handleFlip}
                className="w-10 h-10 rounded-2xl glass-ios border border-white/20 text-slate-200 hover:text-white shadow-xl flex items-center justify-center transition-transform hover:rotate-180 duration-200 active:scale-95"
                aria-label="Flip tokens"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Receive Box */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">You Receive (Estimated)</span>
                <span className="text-xs text-slate-400">
                  Balance: <span className="font-mono font-bold text-white">{toAsset.balance.toFixed(4)}</span>
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-mono font-extrabold text-white truncate">
                  {calculatedToAmount > 0 ? calculatedToAmount.toFixed(4) : '0.00'}
                </div>

                <select
                  value={toSymbol}
                  onChange={(e) => setToSymbol(e.target.value as AssetSymbol)}
                  className="bg-slate-800 border border-white/10 rounded-2xl px-3 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.symbol}>
                      {a.symbol} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                ≈ {formatCurrency(calculatedToAmount * toAsset.price)}
              </span>
            </div>

            {/* Rate info */}
            <div className="p-3.5 rounded-2xl glass-ios text-xs space-y-2 text-slate-400">
              <div className="flex justify-between items-center">
                <span>Exchange Rate</span>
                <span className="font-mono font-bold text-white">
                  1 {fromSymbol} = {exchangeRate.toFixed(4)} {toSymbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Guaranteed Minimum</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {minimumReceived.toFixed(4)} {toSymbol}
                </span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleValidateAndReview}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Review Swap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRM */}
        {step === 'confirm' && (
          <div className="relative z-10 mt-5 space-y-4 animate-in fade-in">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Swap Confirmation
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {parsedFromAmount} {fromSymbol} → {calculatedToAmount.toFixed(4)} {toSymbol}
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl glass-ios flex justify-between">
                <span className="text-slate-400">Guaranteed Minimum</span>
                <span className="font-mono font-bold text-emerald-400">{minimumReceived.toFixed(4)} {toSymbol}</span>
              </div>
              <div className="p-3.5 rounded-2xl glass-ios flex justify-between">
                <span className="text-slate-400">Slippage Limit</span>
                <span className="font-mono text-white">{slippage}%</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex-1 py-3 px-4 rounded-2xl glass-ios-button text-slate-200 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteSwap}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Confirm Swap</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING */}
        {step === 'processing' && (
          <div className="relative z-10 py-14 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mx-auto animate-spin">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Executing Swap...</h3>
              <p className="text-xs text-slate-400 mt-1">Routing automated market maker liquidity...</p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="relative z-10 py-8 text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Swap Succeeded!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Exchanged {parsedFromAmount} {fromSymbol} for {calculatedToAmount.toFixed(4)} {toSymbol}.
              </p>
            </div>

            <div className="flex gap-3 pt-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setFromAmount('');
                }}
                className="flex-1 py-2.5 px-4 rounded-2xl glass-ios-button text-slate-200 text-xs font-semibold"
              >
                Swap More
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg"
              >
                View Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
