import React, { useState, useEffect } from 'react';
import { useWallet, PRISM_DIRECTORY } from '../../context/WalletContext';
import { 
  Send, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Copy, 
  ChevronDown, 
  BookOpen, 
  Zap, 
  Globe, 
  ArrowLeft,
  User,
  CheckCircle2,
  Sparkles,
  Loader2,
  Lock,
  UserPlus
} from 'lucide-react';
import { SUPPORTED_NETWORKS } from '../../lib/constants';
import { AssetSymbol, CryptoAsset, PrismUserLookup } from '../../types/wallet';
import { lookupRegisteredUsername, normalizeUsername } from '../../lib/firebase';

export const SendFlow: React.FC = () => {
  const { 
    assets, 
    contacts, 
    sendCrypto, 
    formatCurrency, 
    selectedAssetForAction,
    setActiveTab,
    myPrismHandle,
    isRegisteredUser,
    openAuthModal,
    setClaimUsernameModalOpen,
    showToast 
  } = useWallet();

  // Mode: 'prismDirect' (Prism-to-Prism Zero Fee) vs 'onChain'
  const [transferMode, setTransferMode] = useState<'prismDirect' | 'onChain'>('prismDirect');

  // Multi-step state: 'input' -> 'confirm' -> 'processing' -> 'success'
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');

  // Form State
  const [selectedSymbol, setSelectedSymbol] = useState<AssetSymbol>(
    selectedAssetForAction?.symbol || 'ETH'
  );
  const [recipientHandle, setRecipientHandle] = useState<string>('@sarah_crypto');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('Ethereum Mainnet');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [showAddressBook, setShowAddressBook] = useState<boolean>(false);
  const [assetDropdownOpen, setAssetDropdownOpen] = useState<boolean>(false);

  // Recipient Lookup State
  const [isLookingUpRecipient, setIsLookingUpRecipient] = useState(false);
  const [verifiedRecipient, setVerifiedRecipient] = useState<{
    uid: string;
    username: string;
    displayName: string;
    avatar?: string;
    verified: boolean;
  } | null>(null);

  // Result state
  const [txResultHash, setTxResultHash] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);

  // Sync if pre-selected asset changes
  useEffect(() => {
    if (selectedAssetForAction) {
      setSelectedSymbol(selectedAssetForAction.symbol);
      setSelectedNetwork(selectedAssetForAction.network);
    }
  }, [selectedAssetForAction]);

  // Real-time lookup for Prism Direct recipient
  useEffect(() => {
    if (transferMode !== 'prismDirect') {
      setVerifiedRecipient(null);
      return;
    }

    const clean = normalizeUsername(recipientHandle);
    if (!clean || clean.length < 3) {
      setVerifiedRecipient(null);
      return;
    }

    setIsLookingUpRecipient(true);
    const timer = setTimeout(async () => {
      try {
        const found = await lookupRegisteredUsername(clean);
        setVerifiedRecipient(found);
      } catch (e) {
        setVerifiedRecipient(null);
      } finally {
        setIsLookingUpRecipient(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [recipientHandle, transferMode]);

  const currentAsset: CryptoAsset = assets.find(a => a.symbol === selectedSymbol) || assets[0];
  const networkConfig = SUPPORTED_NETWORKS.find(n => n.name === selectedNetwork) || SUPPORTED_NETWORKS[0];

  const parsedAmount = parseFloat(amount) || 0;
  const isPrismDirect = transferMode === 'prismDirect';

  // In Prism Direct, fee is strictly ZERO ($0.00)
  const estimatedFeeUSD = isPrismDirect ? 0 : networkConfig.baseFee;
  const estimatedFeeInAsset = estimatedFeeUSD / currentAsset.price;
  const netRecipientAmount = isPrismDirect ? parsedAmount : Math.max(0, parsedAmount - (currentAsset.symbol === networkConfig.symbol ? estimatedFeeInAsset : 0));

  const validateForm = (): boolean => {
    setValidationError('');

    if (isPrismDirect) {
      // Must be registered to use Prism Send
      if (!isRegisteredUser) {
        setValidationError('You must sign up and claim an exclusive Prism tag before you can send via Prism Direct.');
        return false;
      }

      const cleanTarget = normalizeUsername(recipientHandle);
      const cleanSelf = normalizeUsername(myPrismHandle);

      if (!cleanTarget) {
        setValidationError('Please enter a recipient unique Prism username (@tag).');
        return false;
      }

      if (cleanTarget === cleanSelf) {
        setValidationError('You cannot send crypto to your own Prism handle.');
        return false;
      }

      if (!verifiedRecipient) {
        setValidationError(`Prism user @${cleanTarget} not found. Only registered users with a unique Prism tag can receive Prism Direct transfers.`);
        return false;
      }
    } else {
      const cleanAddress = recipientAddress.trim();
      if (!cleanAddress) {
        setValidationError('Please enter a recipient blockchain address.');
        return false;
      }

      if (selectedNetwork.toLowerCase().includes('ethereum') || selectedNetwork.toLowerCase().includes('polygon') || selectedNetwork.toLowerCase().includes('bsc') || selectedNetwork.toLowerCase().includes('arbitrum')) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
          setValidationError('Invalid EVM address format. Must begin with 0x followed by 40 hex characters.');
          return false;
        }
      } else if (selectedNetwork.toLowerCase().includes('bitcoin')) {
        if (!/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(cleanAddress)) {
          setValidationError('Invalid Bitcoin address format. Must begin with 1, 3, or bc1.');
          return false;
        }
      } else if (selectedNetwork.toLowerCase().includes('solana')) {
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanAddress)) {
          setValidationError('Invalid Solana address format (Base58 32-44 characters).');
          return false;
        }
      }
    }

    if (parsedAmount <= 0) {
      setValidationError('Please enter an amount greater than 0.');
      return false;
    }

    if (parsedAmount > currentAsset.balance) {
      setValidationError(`Insufficient ${currentAsset.symbol} balance. Available: ${currentAsset.balance.toFixed(4)} ${currentAsset.symbol}.`);
      return false;
    }

    return true;
  };

  const handleProceedToConfirm = () => {
    if (validateForm()) {
      setStep('confirm');
    }
  };

  const handleExecuteSend = async () => {
    setStep('processing');
    setValidationError('');

    const delay = isPrismDirect ? 1000 : 1800; // Prism Direct settles faster

    setTimeout(async () => {
      try {
        const res = await sendCrypto({
          assetSymbol: currentAsset.symbol,
          recipientAddress: isPrismDirect ? `@${normalizeUsername(recipientHandle)}` : recipientAddress.trim(),
          amount: parsedAmount,
          network: isPrismDirect ? 'Prism Direct (0 Fee)' : selectedNetwork,
          fee: estimatedFeeUSD,
          note,
          isPrismDirect,
          recipientHandle: isPrismDirect ? `@${normalizeUsername(recipientHandle)}` : undefined
        });

        if (res.success) {
          setTxResultHash(res.txHash);
          setStep('success');
        } else {
          setValidationError(res.error || 'Failed to submit transaction.');
          setStep('input');
        }
      } catch (err: any) {
        setValidationError(err.message || 'Execution error.');
        setStep('input');
      }
    }, delay);
  };

  const setPercentage = (pct: number) => {
    const val = (currentAsset.balance * pct).toFixed(4);
    setAmount(val);
    setValidationError('');
  };

  const handleResetFlow = () => {
    setStep('input');
    setAmount('');
    setRecipientAddress('');
    setNote('');
    setTxResultHash('');
    setValidationError('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* iOS Liquid Glass Card Container */}
      <div className="rounded-3xl glass-ios-card p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Specular ambient background lighting */}
        <div className="absolute top-0 right-0 w-72 h-72 liquid-ambient-blue rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 liquid-ambient-purple rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header */}
        <div className="relative z-10 pb-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'confirm' && (
              <button
                onClick={() => setStep('input')}
                className="p-1.5 rounded-xl glass-ios-button text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Send Crypto
              </h2>
              <p className="text-xs text-slate-400">
                Instant peer-to-peer Prism username transfers or multi-chain on-chain broadcast
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${step === 'input' ? 'bg-indigo-400 ring-4 ring-indigo-500/20' : 'bg-emerald-400'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-indigo-400 ring-4 ring-indigo-500/20' : step === 'processing' || step === 'success' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 'success' ? 'bg-emerald-400 ring-4 ring-emerald-500/20' : 'bg-slate-700'}`} />
          </div>
        </div>

        {/* STEP 1: INPUT */}
        {step === 'input' && (
          <div className="relative z-10 mt-6 space-y-5">
            {/* iOS Segmented Control: Prism Direct vs On-Chain */}
            <div className="p-1 rounded-2xl bg-slate-900/80 border border-white/10 flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setTransferMode('prismDirect');
                  setValidationError('');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isPrismDirect
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Prism to Prism (0 Fee)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferMode('onChain');
                  setValidationError('');
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !isPrismDirect
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-300" />
                <span>On-Chain Blockchain</span>
              </button>
            </div>

            {/* Prism Direct Verification & Sign-up Gate */}
            {isPrismDirect && !isRegisteredUser && (
              <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/25 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <Lock className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white">
                      Sign Up Required for Prism-to-Prism Transfers
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Prism Direct transfers require a unique Prism Username (@tag) tied to a registered account. Each username is unique to one user and cannot be claimed by anyone else.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5 active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account & Claim Tag</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="py-2 px-3.5 rounded-xl glass-ios-button text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Prism Direct Active Status Banner */}
            {isPrismDirect && isRegisteredUser && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      Sending from <span className="text-indigo-300 font-mono">{myPrismHandle}</span>
                    </span>
                    <span className="text-[11px] text-slate-300">Off-chain instant settlement with zero gas fee.</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  $0.00 FEE
                </span>
              </div>
            )}

            {validationError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* 1. Asset Selection */}
            <div className="relative">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Asset to Send</label>
              <button
                type="button"
                onClick={() => setAssetDropdownOpen(!assetDropdownOpen)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-left hover:border-white/25 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-md"
                    style={{ backgroundColor: currentAsset.color }}
                  >
                    {currentAsset.icon}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-white">{currentAsset.name}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">({currentAsset.symbol})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">
                      {currentAsset.balance.toFixed(4)} {currentAsset.symbol}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {formatCurrency(currentAsset.usdValue)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              {assetDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-30 glass-ios rounded-2xl p-1.5 max-h-56 overflow-y-auto">
                  {assets.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setSelectedSymbol(asset.symbol);
                        setSelectedNetwork(asset.network);
                        setAssetDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                        asset.symbol === selectedSymbol ? 'bg-indigo-600/30 text-indigo-200' : 'hover:bg-white/5 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: asset.color }}
                        >
                          {asset.icon}
                        </span>
                        <div>
                          <span className="text-xs font-bold">{asset.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">{asset.symbol}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-300">{asset.balance.toFixed(4)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Recipient Input */}
            {isPrismDirect ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Recipient Prism Tag</label>
                  <span className="text-[11px] text-slate-400">
                    Your Tag: <span className="font-mono text-indigo-300 font-bold">{myPrismHandle}</span>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={recipientHandle.replace(/^@/, '')}
                    onChange={(e) => {
                      setRecipientHandle(`@${e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')}`);
                    }}
                    placeholder="recipient_username"
                    className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-8 pr-28 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isLookingUpRecipient ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : verifiedRecipient ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Verified User</span>
                      </div>
                    ) : recipientHandle.length > 2 ? (
                      <span className="text-[10px] text-rose-400 font-medium">User Not Found</span>
                    ) : null}
                  </div>
                </div>

                {/* Verified Recipient Card Preview */}
                {verifiedRecipient && (
                  <div className="mt-2.5 p-3 rounded-2xl glass-ios border border-emerald-500/20 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={verifiedRecipient.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${verifiedRecipient.username}`} 
                        alt={verifiedRecipient.displayName} 
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/40" 
                      />
                      <div>
                        <span className="text-xs font-bold text-white block">{verifiedRecipient.displayName}</span>
                        <span className="text-[10px] font-mono text-emerald-300 font-semibold">{verifiedRecipient.username}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                      Ready to Receive
                    </span>
                  </div>
                )}

                {/* Quick Prism Directory Contacts */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Frequent:</span>
                  {PRISM_DIRECTORY.map(u => (
                    <button
                      key={u.handle}
                      type="button"
                      onClick={() => setRecipientHandle(u.handle)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 ${
                        recipientHandle.toLowerCase() === u.handle.toLowerCase()
                          ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40' 
                          : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/5'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                      <span>{u.handle}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Recipient Blockchain Address</label>
                  {contacts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressBook(!showAddressBook)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Address Book</span>
                    </button>
                  )}
                </div>

                {showAddressBook && (
                  <div className="mb-2 p-2 rounded-2xl glass-ios space-y-1 max-h-40 overflow-y-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 block">Saved Contacts</span>
                    {contacts.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setRecipientAddress(c.address);
                          setShowAddressBook(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-left text-xs"
                      >
                        <span className="font-semibold text-slate-200">{c.name}</span>
                        <span className="font-mono text-slate-400 text-[11px] truncate max-w-[200px]">{c.address}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder={networkConfig.addressPlaceholder}
                    className="w-full bg-slate-900/70 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setRecipientAddress(text.trim());
                        showToast('info', 'Address Pasted');
                      } catch (e) {
                        showToast('error', 'Clipboard access required');
                      }
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl glass-ios-button text-xs font-semibold text-slate-200"
                  >
                    Paste
                  </button>
                </div>
              </div>
            )}

            {/* 3. Network Selection (Only when On-Chain is active) */}
            {!isPrismDirect && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Network</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_NETWORKS.map(net => {
                    const isSelected = selectedNetwork === net.name;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setSelectedNetwork(net.name)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected 
                            ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-400/50' 
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{net.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Fee: ~${net.baseFee.toFixed(2)} • {net.confirmationTime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Amount Input with Shortcuts */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount</label>
                <span className="text-xs text-slate-400">
                  Available: <span className="font-mono font-bold text-white">{currentAsset.balance.toFixed(4)} {currentAsset.symbol}</span>
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-slate-900/70 border border-white/10 rounded-2xl px-4 py-3 text-lg font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currentAsset.symbol}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-2">
                {[0.25, 0.50, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentage(pct)}
                    className="py-1.5 rounded-xl glass-ios-button text-xs font-semibold text-slate-300"
                  >
                    {pct === 1.0 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>≈ {formatCurrency(parsedAmount * currentAsset.price)}</span>
                <span className="font-semibold text-emerald-400">
                  {isPrismDirect ? 'Network Fee: $0.00 (Prism Zero-Fee)' : `Estimated Fee: ~${formatCurrency(estimatedFeeUSD)}`}
                </span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Optional Memo</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Split for lunch, freelance payout..."
                className="w-full bg-slate-900/70 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedToConfirm}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Review & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRMATION SCREEN */}
        {step === 'confirm' && (
          <div className="relative z-10 mt-6 space-y-5 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                You Are Sending
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {parsedAmount} {currentAsset.symbol}
              </div>
              <span className="text-sm font-semibold text-slate-400 mt-1 block">
                ≈ {formatCurrency(parsedAmount * currentAsset.price)}
              </span>
              {isPrismDirect && (
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                  <Zap className="w-3 h-3 text-amber-300" />
                  Prism Direct Zero-Fee Settlement
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Sender Tag</span>
                <span className="font-mono text-indigo-300 font-bold truncate max-w-[200px]">
                  {myPrismHandle}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Recipient</span>
                <span className="font-mono text-white font-bold truncate max-w-[200px]">
                  {isPrismDirect ? (verifiedRecipient?.username || recipientHandle) : recipientAddress}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Protocol / Network</span>
                <span className="font-semibold text-indigo-300">
                  {isPrismDirect ? 'Prism Direct (Off-Chain Internal)' : selectedNetwork}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Network Gas Fee</span>
                <span className="font-mono font-bold text-emerald-400">
                  {isPrismDirect ? '$0.00 (Zero Fee)' : formatCurrency(estimatedFeeUSD)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Recipient Receives</span>
                <span className="font-mono font-extrabold text-emerald-400">
                  {netRecipientAmount.toFixed(4)} {currentAsset.symbol}
                </span>
              </div>

              {note && (
                <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300">
                  <span className="font-semibold block mb-0.5">Memo:</span>
                  {note}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex-1 py-3 px-4 rounded-2xl glass-ios-button text-slate-200 font-semibold text-xs"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleExecuteSend}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Confirm Transfer</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING */}
        {step === 'processing' && (
          <div className="py-14 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto animate-spin">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isPrismDirect ? 'Executing Instant Prism Transfer...' : 'Broadcasting Transaction...'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isPrismDirect 
                  ? 'Cryptographically executing ledger balance update with zero gas fee...'
                  : `Broadcasting transaction payload to ${selectedNetwork}...`}
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {isPrismDirect ? '⚡ Prism Direct Delivered!' : 'Transfer Successful!'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Sent {parsedAmount} {currentAsset.symbol} to {isPrismDirect ? recipientHandle : `${recipientAddress.slice(0, 8)}...`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-left max-w-md mx-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Transaction Reference
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-200 truncate select-all">{txResultHash}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(txResultHash);
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white shrink-0"
                >
                  {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleResetFlow}
                className="flex-1 py-2.5 px-4 rounded-2xl glass-ios-button text-slate-200 text-xs font-semibold"
              >
                Send Another
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                View in Activity
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
