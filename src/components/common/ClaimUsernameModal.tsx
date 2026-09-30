import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { X, Check, AlertCircle, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { checkUsernameAvailable, normalizeUsername } from '../../lib/firebase';

interface ClaimUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue?: string;
  onClaimed?: (handle: string) => void;
}

export const ClaimUsernameModal: React.FC<ClaimUsernameModalProps> = ({
  isOpen,
  onClose,
  initialValue = '',
  onClaimed
}) => {
  const { user, claimUsername, showToast } = useWallet();
  const [usernameInput, setUsernameInput] = useState(initialValue);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; reason?: string } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValue) {
      setUsernameInput(initialValue.replace(/^@/, ''));
    }
  }, [initialValue]);

  // Debounced availability check
  useEffect(() => {
    const clean = normalizeUsername(usernameInput);
    if (!clean) {
      setAvailability(null);
      setError('');
      return;
    }

    if (clean.length < 3) {
      setAvailability({ available: false, reason: 'Username must be at least 3 characters.' });
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailable(clean, user?.uid);
        setAvailability(res);
        if (!res.available) {
          setError(res.reason || `@${clean} is already claimed.`);
        } else {
          setError('');
        }
      } catch (err) {
        setAvailability({ available: true });
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [usernameInput, user?.uid]);

  if (!isOpen) return null;

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeUsername(usernameInput);
    if (!clean || clean.length < 3) {
      setError('Username must be 3-20 characters.');
      return;
    }

    if (availability && !availability.available) {
      setError(availability.reason || 'This username is taken.');
      return;
    }

    setClaiming(true);
    setError('');

    try {
      const res = await claimUsername(clean, user?.displayName || clean);
      if (res.success) {
        showToast('success', 'Prism Handle Claimed!', `@${clean} is now reserved exclusively for you.`);
        if (onClaimed) onClaimed(`@${clean}`);
        onClose();
      } else {
        setError(res.error || 'Failed to claim username.');
      }
    } catch (err: any) {
      setError(err.message || 'Error claiming username.');
    } finally {
      setClaiming(false);
    }
  };

  const cleanHandle = normalizeUsername(usernameInput);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl glass-ios-card p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Claim Unique Prism Tag
              </h3>
              <p className="text-xs text-slate-400">Exclusive 1-of-1 handle for Prism Transfers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl glass-ios-button text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleClaim} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Choose Your Handle
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                @
              </span>
              <input
                type="text"
                autoFocus
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="username"
                maxLength={20}
                className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-8 pr-10 py-3 text-white font-mono text-sm font-bold focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {checking ? (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : availability?.available ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : availability && !availability.available ? (
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <X className="w-3.5 h-3.5" />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Live Availability Status */}
            {checking && (
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                Checking network availability...
              </p>
            )}

            {!checking && availability?.available && cleanHandle.length >= 3 && (
              <p className="text-[11px] text-emerald-300 mt-1.5 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong className="font-mono">@{cleanHandle}</strong> is available and will be exclusively yours!</span>
              </p>
            )}

            {error && (
              <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1.5 text-slate-300">
            <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Strict 1-User-Per-Username Policy</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Once claimed, no other Prism user can ever register this handle. Friends can send you crypto directly with 0 gas fees using your tag.
            </p>
          </div>

          <button
            type="submit"
            disabled={claiming || checking || !availability?.available || cleanHandle.length < 3}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Claiming Exclusively...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Claim @{cleanHandle || 'username'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
