import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { 
  X, 
  LogIn, 
  Mail, 
  Lock, 
  Sparkles, 
  UserPlus, 
  Check, 
  AlertCircle, 
  Loader2, 
  Zap, 
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { checkUsernameAvailable, normalizeUsername } from '../../lib/firebase';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'login' 
}) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset,
    switchToDemo,
    isAuthLoading
  } = useWallet();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Live username availability check during signup
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState<{ available: boolean; reason?: string } | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setInfoMessage('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (mode !== 'signup') {
      setUsernameAvailability(null);
      return;
    }

    const clean = normalizeUsername(username);
    if (!clean) {
      setUsernameAvailability(null);
      return;
    }

    if (clean.length < 3) {
      setUsernameAvailability({ available: false, reason: 'Must be at least 3 characters' });
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailable(clean);
        setUsernameAvailability(res);
      } catch (e) {
        setUsernameAvailability({ available: true });
      } finally {
        setCheckingUsername(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await sendPasswordReset(email);
        setInfoMessage('Password reset email dispatched via Supabase Email Provider. Please check your inbox.');
      } catch (err: any) {
        setError(err.message || 'Could not send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please provide your password.');
      return;
    }

    if (mode === 'signup') {
      const clean = normalizeUsername(username);
      if (!clean || clean.length < 3) {
        setError('Please choose a unique Prism Username of at least 3 characters.');
        return;
      }
      if (usernameAvailability && !usernameAvailability.available) {
        setError(usernameAvailability.reason || 'This username is already taken by another user.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, username, displayName || username);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const cleanHandle = normalizeUsername(username);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl glass-ios-card p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto shadow-2xl border border-white/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              {mode === 'login' 
                ? 'Sign In to Prism' 
                : mode === 'signup' 
                  ? 'Create Prism Account' 
                  : 'Reset Password'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'login' 
                ? 'Sign in via Supabase Email or Google' 
                : mode === 'signup' 
                  ? 'Claim your 1-of-1 unique @tag via Supabase email' 
                  : 'Receive a password reset link via Supabase'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl glass-ios-button text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Supabase Email Provider Badge */}
        <div className="mt-4 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Email Service Provider</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
            {isSupabaseConfigured ? 'Connected' : 'Active'}
          </span>
        </div>

        {/* Google One-Click Button (When not in forgot password) */}
        {mode !== 'forgot' && (
          <>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading || isAuthLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">or Supabase email</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>
          </>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {/* UNIQUE USERNAME INPUT (MANDATORY FOR SIGN UP) */}
          {mode === 'signup' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Unique Prism Username <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] font-mono text-amber-300 flex items-center gap-0.5 font-bold">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Prism Direct Tag
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="yourname"
                  maxLength={20}
                  className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-8 pr-10 py-2.5 text-white font-mono text-xs font-bold focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername ? (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  ) : usernameAvailability?.available && cleanHandle.length >= 3 ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : usernameAvailability && !usernameAvailability.available ? (
                    <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <X className="w-3 h-3" />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Status helper text */}
              {usernameAvailability?.available && cleanHandle.length >= 3 && (
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono font-semibold">
                  <Check className="w-3 h-3" />
                  @{cleanHandle} is available and unique to you!
                </p>
              )}
              {usernameAvailability && !usernameAvailability.available && (
                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3 h-3" />
                  {usernameAvailability.reason}
                </p>
              )}
              {!usernameAvailability && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Unique to you. No one else can use this tag. Used for 0-fee transfers.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-9 pr-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setInfoMessage('');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/70 border border-white/10 rounded-2xl pl-9 pr-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && (!usernameAvailability?.available || cleanHandle.length < 3))}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : mode === 'signup' ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>
              {mode === 'login' 
                ? 'Sign In with Supabase Email' 
                : mode === 'signup' 
                  ? `Create Account & Claim @${cleanHandle || 'tag'}`
                  : 'Send Password Reset Email'}
            </span>
          </button>
        </form>

        {mode === 'forgot' ? (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setInfoMessage('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setInfoMessage('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
            >
              {mode === 'login' ? "Don't have an account? Sign Up & Claim Tag" : "Already have an account? Sign In"}
            </button>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => {
              switchToDemo();
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch Guest Trial (1-Hour Session)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
