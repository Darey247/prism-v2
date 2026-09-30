import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { X, Copy, Check, Share2, AlertTriangle, ChevronDown, Zap, QrCode } from 'lucide-react';
import { QRCodeSVG } from './QRCodeSVG';
import { SUPPORTED_NETWORKS } from '../../lib/constants';
import { AssetSymbol } from '../../types/wallet';

export const ReceiveModal: React.FC = () => {
  const { 
    receiveModalOpen, 
    setReceiveModalOpen, 
    assets, 
    selectedAssetForAction,
    myPrismHandle,
    showToast 
  } = useWallet();

  const [receiveTab, setReceiveTab] = useState<'prismDirect' | 'onChain'>('prismDirect');
  const [selectedSymbol, setSelectedSymbol] = useState<AssetSymbol>(
    selectedAssetForAction?.symbol || 'ETH'
  );
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Ethereum Mainnet');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);

  React.useEffect(() => {
    if (selectedAssetForAction) {
      setSelectedSymbol(selectedAssetForAction.symbol);
      setSelectedNetwork(selectedAssetForAction.network);
    }
  }, [selectedAssetForAction]);

  if (!receiveModalOpen) return null;

  const currentAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const walletAddress = currentAsset.address;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    showToast('success', 'Address Copied', 'Wallet address copied to clipboard.');
    setTimeout(() => setCopiedAddress(false), 2200);
  };

  const handleCopyHandle = () => {
    navigator.clipboard.writeText(myPrismHandle);
    setCopiedHandle(true);
    showToast('success', 'Prism Tag Copied', `${myPrismHandle} copied for zero-fee transfer.`);
    setTimeout(() => setCopiedHandle(false), 2200);
  };

  const handleShare = async () => {
    const textToShare = receiveTab === 'prismDirect'
      ? `Send me crypto on Prism Wallet using my Prism Tag: ${myPrismHandle} (Zero Gas Fee)`
      : `Send ${currentAsset.symbol} to my address: ${walletAddress} on ${selectedNetwork}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Prism Deposit Info',
          text: textToShare,
        });
      } catch (e) {}
    } else {
      if (receiveTab === 'prismDirect') handleCopyHandle();
      else handleCopyAddress();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl glass-ios-card p-6 relative max-h-[92vh] overflow-y-auto shadow-2xl border border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Receive Crypto</h3>
            <p className="text-xs text-slate-400">Share your Prism tag or blockchain deposit address</p>
          </div>
          <button 
            onClick={() => setReceiveModalOpen(false)}
            className="p-1.5 rounded-xl glass-ios-button text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* iOS Segmented Mode Switcher: Prism Direct vs On-Chain */}
        <div className="mt-4 p-1 rounded-2xl bg-slate-900/80 border border-white/10 flex gap-1">
          <button
            type="button"
            onClick={() => setReceiveTab('prismDirect')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              receiveTab === 'prismDirect'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Prism Tag (0 Fee)</span>
          </button>

          <button
            type="button"
            onClick={() => setReceiveTab('onChain')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              receiveTab === 'onChain'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-blue-300" />
            <span>On-Chain QR</span>
          </button>
        </div>

        {/* PRISM DIRECT TAB */}
        {receiveTab === 'prismDirect' ? (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/25 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block mb-1">
                Your Universal Prism Tag
              </span>
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
                {myPrismHandle}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Anyone on Prism Wallet can send you BTC, ETH, SOL, or USDC instantly with zero gas fees.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG value={myPrismHandle} size={160} symbol="PRISM" />
              </div>
              <span className="text-xs text-slate-400 font-mono mt-2">{myPrismHandle}</span>
            </div>

            <div className="p-3 rounded-2xl glass-ios border border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Prism ID</span>
                <span className="font-mono text-sm font-bold text-white block truncate">{myPrismHandle}</span>
              </div>
              <button
                onClick={handleCopyHandle}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {copiedHandle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHandle ? 'Copied' : 'Copy Tag'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ON-CHAIN QR TAB */
          <div className="mt-4 space-y-4">
            {/* Asset Selector */}
            <div className="relative">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Asset</label>
              <button
                type="button"
                onClick={() => setAssetDropdownOpen(!assetDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-left hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span 
                    className="w-7 h-7 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: currentAsset.color }}
                  >
                    {currentAsset.icon}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-white">{currentAsset.name}</span>
                    <span className="text-xs text-slate-400 ml-1.5 font-mono">({currentAsset.symbol})</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {assetDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 glass-ios rounded-2xl p-1.5 max-h-52 overflow-y-auto">
                  {assets.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setSelectedSymbol(asset.symbol);
                        setSelectedNetwork(asset.network);
                        setAssetDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 text-slate-200 text-xs"
                    >
                      <span>{asset.name} ({asset.symbol})</span>
                      <span className="font-mono text-slate-400">{asset.balance.toFixed(4)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* QR Code Presentation */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG value={walletAddress} size={160} symbol={currentAsset.symbol} />
              </div>
              <span className="text-xs text-slate-400 font-mono mt-2">{currentAsset.network}</span>
            </div>

            {/* Address with copy */}
            <div className="p-3 rounded-2xl glass-ios border border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">On-Chain Address</span>
                <span className="font-mono text-xs text-white truncate block select-all mt-0.5">
                  {walletAddress}
                </span>
              </div>
              <button
                onClick={handleCopyAddress}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200/90">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Only send {currentAsset.name} ({currentAsset.symbol}) via the {selectedNetwork} network.</span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2.5 px-3 rounded-2xl glass-ios-button text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={() => setReceiveModalOpen(false)}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
