import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  CryptoAsset, 
  Transaction, 
  Contact, 
  UserSettings, 
  NavigationTab, 
  AssetSymbol,
  SupportedCurrency,
  PrismUserLookup
} from '../types/wallet';
import { 
  INITIAL_ASSETS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_CONTACTS,
  CURRENCY_CONVERSION 
} from '../lib/constants';
import { 
  auth, 
  signInWithGoogle as fbSignInWithGoogle, 
  signInWithEmail as fbSignInWithEmail, 
  signUpWithEmail as fbSignUpWithEmail, 
  signOutUser,
  saveTransactionToFirestore,
  fetchUserTransactionsFromFirestore,
  testFirestoreConnection,
  lookupRegisteredUsername,
  claimUniqueUsername,
  normalizeUsername,
  checkUsernameAvailable,
  db
} from '../lib/firebase';
import { 
  signUpWithSupabaseEmail, 
  signInWithSupabaseEmail, 
  sendSupabasePasswordResetEmail,
  signOutSupabase,
  isSupabaseConfigured
} from '../lib/supabase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

// Verified Prism Direct users directory for instant lookup & suggestions
export const PRISM_DIRECTORY: PrismUserLookup[] = [
  { handle: '@sarah_crypto', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', verified: true },
  { handle: '@satoshi_core', name: 'Satoshi Protocol', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80', verified: true },
  { handle: '@elena_defi', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', verified: true },
  { handle: '@marcus_btc', name: 'Marcus Sterling', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', verified: true },
  { handle: '@david_sol', name: 'David Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', verified: true },
];

const ONE_HOUR_SECONDS = 3600;

interface WalletContextType {
  // View mode & landing page
  viewMode: 'landing' | 'app';
  setViewMode: (mode: 'landing' | 'app') => void;
  guestRemainingSeconds: number;
  startGuestSession: () => void;

  // Auth & Identity
  user: FirebaseUser | null;
  supabaseUser: any | null;
  demoUser: { uid: string; email: string; displayName: string; photoURL?: string; prismHandle: string } | null;
  isAuthenticated: boolean;
  isRegisteredUser: boolean;
  hasClaimedUsername: boolean;
  isAuthLoading: boolean;
  authMode: 'firebase' | 'supabase' | 'demo';
  myPrismHandle: string;
  claimedHandle: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, username: string, displayName?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  claimUsername: (username: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchToDemo: () => void;

  // Wallet Data
  assets: CryptoAsset[];
  totalPortfolioBalance: number;
  portfolio24hChangeAmount: number;
  portfolio24hChangePercent: number;
  availableCashBalance: number;
  
  // Navigation & Flows
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedAssetForAction: CryptoAsset | null;
  setSelectedAssetForAction: (asset: CryptoAsset | null) => void;
  openSendWithAsset: (symbol: AssetSymbol, prismDirect?: boolean) => void;
  openReceiveWithAsset: (symbol: AssetSymbol) => void;
  openSwapWithAssets: (from: AssetSymbol, to?: AssetSymbol) => void;

  // Transactions
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (tx: Transaction | null) => void;
  sendCrypto: (params: {
    assetSymbol: AssetSymbol;
    recipientAddress: string;
    amount: number;
    network: string;
    fee: number;
    note?: string;
    isPrismDirect?: boolean;
    recipientHandle?: string;
  }) => Promise<{ success: boolean; txHash: string; error?: string }>;
  swapCrypto: (params: {
    fromSymbol: AssetSymbol;
    toSymbol: AssetSymbol;
    fromAmount: number;
    toAmount: number;
    network: string;
    fee: number;
  }) => Promise<{ success: boolean; txHash: string; error?: string }>;
  depositSimulatedFunds: (symbol: AssetSymbol, amount: number) => void;

  // Address Book & Settings
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  toggleHideBalance: () => void;
  formatCurrency: (amountInUSD: number) => string;

  // Modals & Notifications
  toasts: Toast[];
  showToast: (type: Toast['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  receiveModalOpen: boolean;
  setReceiveModalOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalInitialMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  claimUsernameModalOpen: boolean;
  setClaimUsernameModalOpen: (open: boolean) => void;
  resetToDefault: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  theme: 'dark',
  hideBalance: false,
  autoLockMinutes: 15,
  twoFactorEnabled: true,
  prismHandle: '@alex_vanguard',
  notifications: {
    priceAlerts: true,
    txConfirmations: true,
    securityAlerts: true
  }
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // View mode: default to 'landing' for new visitors
  const [viewMode, setViewModeState] = useState<'landing' | 'app'>(() => {
    return (localStorage.getItem('prism_view_mode') as 'landing' | 'app') || 'landing';
  });

  const setViewMode = (mode: 'landing' | 'app') => {
    setViewModeState(mode);
    localStorage.setItem('prism_view_mode', mode);
  };

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('prism_supabase_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [demoUser, setDemoUser] = useState<{ 
    uid: string; 
    email: string; 
    displayName: string; 
    photoURL?: string; 
    prismHandle: string;
  } | null>({
    uid: 'demo-prism-user',
    email: 'alex.vanguard@prismwallet.app',
    displayName: 'Alex Vanguard',
    prismHandle: '@alex_vanguard',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const [authMode, setAuthMode] = useState<'firebase' | 'supabase' | 'demo'>('demo');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [claimedHandle, setClaimedHandle] = useState<string | null>(() => {
    return localStorage.getItem('prism_active_handle') || null;
  });

  // 1-Hour Guest Session Timer
  const [guestRemainingSeconds, setGuestRemainingSeconds] = useState<number>(() => {
    const start = localStorage.getItem('prism_guest_session_start');
    if (!start) return ONE_HOUR_SECONDS;
    const elapsed = Math.floor((Date.now() - parseInt(start, 10)) / 1000);
    return Math.max(0, ONE_HOUR_SECONDS - elapsed);
  });

  // Modal controls
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');
  const [claimUsernameModalOpen, setClaimUsernameModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);

  // Core Data
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    const saved = localStorage.getItem('prism_assets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_ASSETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('prism_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'tx-p2p-01',
        userId: 'demo-user',
        txHash: '0xp2p_9a4b2c1d3e8f7a6b5c4d3e2f1a0b9c8d',
        type: 'send',
        asset: 'USDC',
        amount: 250,
        usdValue: 250.00,
        fromAddress: '@alex_vanguard',
        toAddress: '@sarah_crypto',
        network: 'Prism Direct (Instant)',
        fee: 0,
        status: 'completed',
        timestamp: Date.now() - 1000 * 60 * 18,
        isPrismDirect: true,
        recipientHandle: '@sarah_crypto',
        senderHandle: '@alex_vanguard',
        note: 'Dinner & coffee split'
      },
      ...INITIAL_TRANSACTIONS
    ];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('prism_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'c-prism-1',
        name: 'Sarah Jenkins',
        address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
        network: 'Prism Direct',
        symbol: 'USDC',
        prismHandle: '@sarah_crypto',
        notes: 'Designer & Defi Lead'
      },
      ...INITIAL_CONTACTS
    ];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('prism_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedAssetForAction, setSelectedAssetForAction] = useState<CryptoAsset | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: Toast['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const isRegisteredUser = Boolean(
    (authMode === 'firebase' && firebaseUser) || 
    (authMode === 'supabase' && supabaseUser)
  );

  const hasClaimedUsername = useMemo(() => {
    if (isRegisteredUser) {
      return !!claimedHandle;
    }
    return false;
  }, [isRegisteredUser, claimedHandle]);

  const myPrismHandle = useMemo(() => {
    if (isRegisteredUser && claimedHandle) {
      return claimedHandle;
    }
    if (firebaseUser) {
      const emailPrefix = firebaseUser.email?.split('@')[0] || 'user';
      return `@${emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
    }
    if (supabaseUser) {
      const emailPrefix = supabaseUser.email?.split('@')[0] || 'user';
      return `@${emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
    }
    return settings.prismHandle || '@alex_vanguard';
  }, [isRegisteredUser, claimedHandle, firebaseUser, supabaseUser, settings.prismHandle]);

  // Start guest session
  const startGuestSession = () => {
    let start = localStorage.getItem('prism_guest_session_start');
    if (!start) {
      start = String(Date.now());
      localStorage.setItem('prism_guest_session_start', start);
    }
    const elapsed = Math.floor((Date.now() - parseInt(start, 10)) / 1000);
    setGuestRemainingSeconds(Math.max(0, ONE_HOUR_SECONDS - elapsed));
  };

  // 1-HOUR TIMEOUT EFFECT: Auto return to landing page if no account signed within 1 hour
  useEffect(() => {
    // If user has signed in, clear guest countdown
    if (isRegisteredUser) {
      localStorage.removeItem('prism_guest_session_start');
      setGuestRemainingSeconds(ONE_HOUR_SECONDS);
      return;
    }

    const interval = setInterval(() => {
      const start = localStorage.getItem('prism_guest_session_start');
      if (start) {
        const startTime = parseInt(start, 10);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, ONE_HOUR_SECONDS - elapsed);
        setGuestRemainingSeconds(remaining);

        // If 1 hour (3600s) has elapsed and no account has been signed
        if (remaining <= 0) {
          localStorage.removeItem('prism_guest_session_start');
          setViewMode('landing');
          showToast(
            'warning', 
            'Guest Trial Expired (1 Hour)', 
            'Returned to landing page. Please sign up or sign in to continue using Prism Wallet.'
          );
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRegisteredUser]);

  // Auth initialization
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setAuthMode('firebase');
        localStorage.removeItem('prism_guest_session_start');

        // Check if user has claimed a unique username in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists() && snap.data()?.username) {
            const handle = snap.data().username;
            setClaimedHandle(handle);
            localStorage.setItem('prism_active_handle', handle);
          } else {
            const cached = localStorage.getItem(`user_handle_${user.uid}`);
            if (cached) {
              setClaimedHandle(cached);
              localStorage.setItem('prism_active_handle', cached);
            } else {
              setClaimedHandle(null);
            }
          }
        } catch (e) {
          console.warn('Error reading user profile from Firestore:', e);
        }

        try {
          const userTx = await fetchUserTransactionsFromFirestore(user.uid);
          if (userTx && userTx.length > 0) {
            setTransactions(userTx);
          }
        } catch (e) {
          console.warn('Could not sync Firestore transactions:', e);
        }
      } else {
        setFirebaseUser(null);
        if (supabaseUser) {
          setAuthMode('supabase');
        } else {
          setAuthMode('demo');
          setClaimedHandle(null);
          localStorage.removeItem('prism_active_handle');
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [supabaseUser]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('prism_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('prism_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('prism_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('prism_settings', JSON.stringify(settings));
  }, [settings]);

  // Calculations
  const totalPortfolioBalance = useMemo(() => {
    return assets.reduce((acc, curr) => acc + (curr.balance * curr.price), 0);
  }, [assets]);

  const portfolio24hChangeAmount = useMemo(() => {
    return assets.reduce((acc, curr) => {
      const pastPrice = curr.price / (1 + (curr.change24h / 100));
      const pastValue = curr.balance * pastPrice;
      const currentValue = curr.balance * curr.price;
      return acc + (currentValue - pastValue);
    }, 0);
  }, [assets]);

  const portfolio24hChangePercent = useMemo(() => {
    const pastTotal = totalPortfolioBalance - portfolio24hChangeAmount;
    if (pastTotal <= 0) return 0;
    return (portfolio24hChangeAmount / pastTotal) * 100;
  }, [totalPortfolioBalance, portfolio24hChangeAmount]);

  const availableCashBalance = useMemo(() => {
    const usdt = assets.find(a => a.symbol === 'USDT')?.usdValue || 0;
    const usdc = assets.find(a => a.symbol === 'USDC')?.usdValue || 0;
    return usdt + usdc;
  }, [assets]);

  const formatCurrency = (amountInUSD: number): string => {
    const config = CURRENCY_CONVERSION[settings.currency] || CURRENCY_CONVERSION.USD;
    const converted = amountInUSD * config.rate;
    const formattedNum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted);

    if (config.prefix) {
      return `${config.symbol}${formattedNum}`;
    }
    return `${formattedNum} ${config.symbol}`;
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      const user = await fbSignInWithGoogle();
      setFirebaseUser(user);
      setAuthMode('firebase');
      localStorage.removeItem('prism_guest_session_start');
      setViewMode('app');

      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists() && snap.data()?.username) {
        const handle = snap.data().username;
        setClaimedHandle(handle);
        localStorage.setItem('prism_active_handle', handle);
        showToast('success', 'Signed In with Google', `Welcome back, ${handle}!`);
      } else {
        setClaimUsernameModalOpen(true);
        showToast('info', 'Choose Your Unique Tag', 'Pick a unique Prism Username to complete setup.');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Sign In Failed', err.message || 'Could not authenticate with Google.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Email Sign In via Supabase Email Service Provider & Firebase
  const handleEmailSignIn = async (email: string, pass: string) => {
    try {
      setIsAuthLoading(true);

      // Authenticate via Supabase Email Service Provider
      const sbResult = await signInWithSupabaseEmail(email, pass);
      if (sbResult.success && sbResult.user) {
        setSupabaseUser(sbResult.user);
        setAuthMode('supabase');
        localStorage.setItem('prism_supabase_current_user', JSON.stringify(sbResult.user));
        localStorage.removeItem('prism_guest_session_start');
        setViewMode('app');

        const tag = sbResult.user.user_metadata?.username;
        if (tag) {
          setClaimedHandle(tag);
          localStorage.setItem('prism_active_handle', tag);
          showToast('success', 'Signed in via Supabase Email', `Welcome back, ${tag}!`);
          return;
        }
      }

      // Also support Firebase Email Login
      const user = await fbSignInWithEmail(email, pass);
      setFirebaseUser(user);
      setAuthMode('firebase');
      localStorage.removeItem('prism_guest_session_start');
      setViewMode('app');

      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists() && snap.data()?.username) {
        const handle = snap.data().username;
        setClaimedHandle(handle);
        localStorage.setItem('prism_active_handle', handle);
        showToast('success', 'Logged in', `Signed in as ${handle}`);
      } else {
        showToast('success', 'Logged in', `Signed in as ${user.email}`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Authentication Failed', err.message || 'Invalid email or password.');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign up with Email + Unique Username Registration via Supabase Email Service Provider
  const handleEmailSignUp = async (email: string, pass: string, rawUsername: string, displayName?: string) => {
    try {
      setIsAuthLoading(true);
      const clean = normalizeUsername(rawUsername);

      // 1. Verify username availability before creating account
      const check = await checkUsernameAvailable(clean);
      if (!check.available) {
        throw new Error(check.reason || `@${clean} is already claimed by another user.`);
      }

      const formatted = `@${clean}`;

      // 2. Register via Supabase Email Service Provider
      const sbResult = await signUpWithSupabaseEmail(email, pass, {
        username: formatted,
        displayName: displayName || clean
      });

      if (!sbResult.success) {
        throw new Error(sbResult.error || 'Supabase email service signup error.');
      }

      // Also register Firebase user if available
      try {
        const fbUser = await fbSignUpWithEmail(email, pass);
        setFirebaseUser(fbUser);
        await claimUniqueUsername(fbUser.uid, clean, displayName || clean, email);
      } catch (fbErr) {
        console.warn('Firebase sync warning:', fbErr);
      }

      // Claim unique username in registry
      if (sbResult.user) {
        setSupabaseUser(sbResult.user);
        setAuthMode('supabase');
        localStorage.setItem('prism_supabase_current_user', JSON.stringify(sbResult.user));
        await claimUniqueUsername(sbResult.user.id, clean, displayName || clean, email);
      }

      localStorage.removeItem('prism_guest_session_start');
      setClaimedHandle(formatted);
      localStorage.setItem('prism_active_handle', formatted);
      setSettings(prev => ({ ...prev, prismHandle: formatted }));
      setViewMode('app');

      if (sbResult.isConfirmationSent) {
        showToast(
          'success', 
          'Supabase Account Created!', 
          `Registered ${formatted}. A confirmation email was sent by Supabase to ${email}.`
        );
      } else {
        showToast('success', 'Account Created & Tag Claimed!', `Welcome to Prism Wallet, ${formatted}!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Sign Up Failed', err.message || 'Could not create account.');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Supabase Password Reset Email
  const handleSendPasswordReset = async (email: string) => {
    const res = await sendSupabasePasswordResetEmail(email);
    if (res.success) {
      showToast('success', 'Reset Email Sent', `Password reset instructions sent by Supabase to ${email}.`);
    } else {
      showToast('error', 'Reset Failed', res.error || 'Could not send reset email.');
      throw new Error(res.error);
    }
  };

  // Claim username for active user
  const handleClaimUsername = async (rawUsername: string, displayName?: string) => {
    const clean = normalizeUsername(rawUsername);
    const uid = firebaseUser?.uid || supabaseUser?.id || demoUser?.uid || 'active-user';
    const email = firebaseUser?.email || supabaseUser?.email || demoUser?.email || '';

    const res = await claimUniqueUsername(uid, clean, displayName || clean, email);
    if (res.success) {
      const formatted = `@${clean}`;
      setClaimedHandle(formatted);
      localStorage.setItem('prism_active_handle', formatted);
      setSettings(prev => ({ ...prev, prismHandle: formatted }));
      return { success: true };
    }
    return res;
  };

  const handleLogout = async () => {
    try {
      if (authMode === 'firebase') {
        await signOutUser();
      }
      await signOutSupabase();
      setFirebaseUser(null);
      setSupabaseUser(null);
      setAuthMode('demo');
      setClaimedHandle(null);
      localStorage.removeItem('prism_active_handle');
      localStorage.removeItem('prism_supabase_current_user');
      setViewMode('landing');
      showToast('info', 'Logged Out', 'Returned to landing page.');
    } catch (err: any) {
      showToast('error', 'Logout Error', err.message);
    }
  };

  const switchToDemo = () => {
    setAuthMode('demo');
    startGuestSession();
    setViewMode('app');
    showToast('info', 'Guest Session (1 Hour)', '1-hour protected trial session active.');
  };

  // Flow helper triggers
  const openSendWithAsset = (symbol: AssetSymbol, prismDirect: boolean = false) => {
    const asset = assets.find(a => a.symbol === symbol) || assets[0];
    setSelectedAssetForAction(asset);
    setActiveTab('send');
  };

  const openReceiveWithAsset = (symbol: AssetSymbol) => {
    const asset = assets.find(a => a.symbol === symbol) || assets[0];
    setSelectedAssetForAction(asset);
    setReceiveModalOpen(true);
  };

  const openSwapWithAssets = (from: AssetSymbol, to?: AssetSymbol) => {
    const fromAsset = assets.find(a => a.symbol === from) || assets[0];
    setSelectedAssetForAction(fromAsset);
    setActiveTab('swap');
  };

  // SEND FUNCTIONALITY (Supports On-Chain & Prism-to-Prism Zero Fee Send)
  const sendCrypto = async ({
    assetSymbol,
    recipientAddress,
    amount,
    network,
    fee,
    note,
    isPrismDirect = false,
    recipientHandle
  }: {
    assetSymbol: AssetSymbol;
    recipientAddress: string;
    amount: number;
    network: string;
    fee: number;
    note?: string;
    isPrismDirect?: boolean;
    recipientHandle?: string;
  }) => {
    const asset = assets.find(a => a.symbol === assetSymbol);
    if (!asset) {
      return { success: false, txHash: '', error: 'Cryptocurrency asset not found.' };
    }

    if (amount <= 0) {
      return { success: false, txHash: '', error: 'Amount must be greater than 0.' };
    }

    if (asset.balance < amount) {
      return { success: false, txHash: '', error: `Insufficient ${assetSymbol} balance. Available: ${asset.balance.toFixed(4)}` };
    }

    // Prism Direct validation: Must verify registered recipient username
    if (isPrismDirect) {
      const targetHandle = recipientHandle || recipientAddress;
      const cleanTarget = normalizeUsername(targetHandle);
      const cleanSelf = normalizeUsername(myPrismHandle);

      if (cleanTarget === cleanSelf) {
        return { success: false, txHash: '', error: 'You cannot send funds to your own Prism handle.' };
      }

      // Check if recipient is a registered Prism user
      const verifiedRecipient = await lookupRegisteredUsername(cleanTarget);
      if (!verifiedRecipient) {
        return { 
          success: false, 
          txHash: '', 
          error: `Prism user @${cleanTarget} not found. Only registered users with a unique Prism tag can receive Prism Direct transfers.` 
        };
      }
    }

    // Generate realistic transaction hash
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const txHash = isPrismDirect
      ? `0xp2p_${randomHex.slice(0, 32)}`
      : network.toLowerCase().includes('sol') 
        ? Array.from({ length: 88 }, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join('')
        : `0x${randomHex}`;

    const usdVal = amount * asset.price;
    const currentUserId = firebaseUser?.uid || supabaseUser?.id || demoUser?.uid || 'demo-user';

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUserId,
      txHash,
      type: 'send',
      asset: assetSymbol,
      amount,
      usdValue: usdVal,
      fromAddress: isPrismDirect ? myPrismHandle : asset.address,
      toAddress: recipientAddress,
      network: isPrismDirect ? 'Prism Direct (0 Fee)' : network,
      fee: isPrismDirect ? 0 : fee,
      status: 'completed',
      timestamp: Date.now(),
      note: note || (isPrismDirect ? `Prism Direct transfer to ${recipientHandle || recipientAddress}` : `Transfer of ${amount} ${assetSymbol}`),
      isPrismDirect,
      recipientHandle: recipientHandle || (isPrismDirect ? recipientAddress : undefined),
      senderHandle: myPrismHandle
    };

    // Deduct balance
    setAssets(prev => prev.map(a => {
      if (a.symbol === assetSymbol) {
        const newBalance = Math.max(0, a.balance - amount);
        return {
          ...a,
          balance: newBalance,
          usdValue: newBalance * a.price
        };
      }
      return a;
    }));

    // Add to history
    setTransactions(prev => [newTx, ...prev]);

    // Save to Firestore if authenticated
    if (firebaseUser) {
      try {
        await saveTransactionToFirestore(firebaseUser.uid, newTx);
      } catch (err) {
        console.warn('Could not persist tx to Firestore:', err);
      }
    }

    const recipientLabel = recipientHandle || (recipientAddress.length > 20 ? `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}` : recipientAddress);
    showToast(
      'success', 
      isPrismDirect ? '⚡ Prism Direct Sent!' : 'Transfer Broadcasted', 
      `Sent ${amount} ${assetSymbol} to ${recipientLabel} (${isPrismDirect ? '0 Fee Instant' : network})`
    );
    return { success: true, txHash };
  };

  // SWAP FUNCTIONALITY
  const swapCrypto = async ({
    fromSymbol,
    toSymbol,
    fromAmount,
    toAmount,
    network,
    fee
  }: {
    fromSymbol: AssetSymbol;
    toSymbol: AssetSymbol;
    fromAmount: number;
    toAmount: number;
    network: string;
    fee: number;
  }) => {
    const fromAsset = assets.find(a => a.symbol === fromSymbol);
    const toAsset = assets.find(a => a.symbol === toSymbol);

    if (!fromAsset || !toAsset) {
      return { success: false, txHash: '', error: 'Invalid assets selected for swap.' };
    }

    if (fromAsset.balance < fromAmount) {
      return { success: false, txHash: '', error: `Insufficient ${fromSymbol} balance.` };
    }

    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const txHash = `0x${randomHex}`;
    const currentUserId = firebaseUser?.uid || supabaseUser?.id || demoUser?.uid || 'demo-user';

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUserId,
      txHash,
      type: 'swap',
      asset: fromSymbol,
      amount: fromAmount,
      usdValue: fromAmount * fromAsset.price,
      fromAddress: fromAsset.address,
      toAddress: toAsset.address,
      network,
      fee,
      status: 'completed',
      timestamp: Date.now(),
      swapToAsset: toSymbol,
      swapToAmount: toAmount,
      note: `Swapped ${fromAmount} ${fromSymbol} for ${toAmount.toFixed(4)} ${toSymbol}`
    };

    // Update balances
    setAssets(prev => prev.map(a => {
      if (a.symbol === fromSymbol) {
        const newBal = Math.max(0, a.balance - fromAmount);
        return { ...a, balance: newBal, usdValue: newBal * a.price };
      }
      if (a.symbol === toSymbol) {
        const newBal = a.balance + toAmount;
        return { ...a, balance: newBal, usdValue: newBal * a.price };
      }
      return a;
    }));

    setTransactions(prev => [newTx, ...prev]);

    if (firebaseUser) {
      try {
        await saveTransactionToFirestore(firebaseUser.uid, newTx);
      } catch (err) {
        console.warn('Firestore swap save error:', err);
      }
    }

    showToast('success', 'Swap Completed', `Exchanged ${fromAmount} ${fromSymbol} for ${toAmount.toFixed(4)} ${toSymbol}`);
    return { success: true, txHash };
  };

  const depositSimulatedFunds = (symbol: AssetSymbol, amount: number) => {
    const asset = assets.find(a => a.symbol === symbol);
    if (!asset) return;

    setAssets(prev => prev.map(a => {
      if (a.symbol === symbol) {
        const newBal = a.balance + amount;
        return { ...a, balance: newBal, usdValue: newBal * a.price };
      }
      return a;
    }));

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: firebaseUser?.uid || supabaseUser?.id || 'demo-user',
      txHash,
      type: 'deposit',
      asset: symbol,
      amount,
      usdValue: amount * asset.price,
      fromAddress: 'External Liquidity / Faucet',
      toAddress: asset.address,
      network: asset.network,
      fee: 0,
      status: 'completed',
      timestamp: Date.now(),
      note: `Faucet deposit of ${amount} ${symbol}`
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast('success', 'Funds Deposited', `Received ${amount} ${symbol} into your wallet!`);
  };

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: `c-${Date.now()}`
    };
    setContacts(prev => [newContact, ...prev]);
    showToast('success', 'Contact Saved', `${contact.name} added to address book.`);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    showToast('info', 'Settings Updated', 'Preferences have been saved.');
  };

  const toggleHideBalance = () => {
    setSettings(prev => ({
      ...prev,
      hideBalance: !prev.hideBalance
    }));
  };

  const resetToDefault = () => {
    setAssets(INITIAL_ASSETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setContacts(INITIAL_CONTACTS);
    setSettings(DEFAULT_SETTINGS);
    setClaimedHandle(null);
    localStorage.removeItem('prism_assets');
    localStorage.removeItem('prism_transactions');
    localStorage.removeItem('prism_contacts');
    localStorage.removeItem('prism_settings');
    localStorage.removeItem('prism_active_handle');
    localStorage.removeItem('prism_guest_session_start');
    showToast('info', 'Reset Complete', 'Demo wallet restored to initial factory state.');
  };

  const value = {
    viewMode,
    setViewMode,
    guestRemainingSeconds,
    startGuestSession,
    user: firebaseUser,
    supabaseUser,
    demoUser,
    isAuthenticated: isRegisteredUser || authMode === 'demo',
    isRegisteredUser,
    hasClaimedUsername,
    isAuthLoading,
    authMode,
    myPrismHandle,
    claimedHandle,
    signInWithGoogle: handleGoogleSignIn,
    signInWithEmail: handleEmailSignIn,
    signUpWithEmail: handleEmailSignUp,
    sendPasswordReset: handleSendPasswordReset,
    claimUsername: handleClaimUsername,
    logout: handleLogout,
    switchToDemo,
    assets,
    totalPortfolioBalance,
    portfolio24hChangeAmount,
    portfolio24hChangePercent,
    availableCashBalance,
    activeTab,
    setActiveTab,
    selectedAssetForAction,
    setSelectedAssetForAction,
    openSendWithAsset,
    openReceiveWithAsset,
    openSwapWithAssets,
    transactions,
    selectedTransaction,
    setSelectedTransaction,
    sendCrypto,
    swapCrypto,
    depositSimulatedFunds,
    contacts,
    addContact,
    settings,
    updateSettings,
    toggleHideBalance,
    formatCurrency,
    toasts,
    showToast,
    removeToast,
    receiveModalOpen,
    setReceiveModalOpen,
    authModalOpen,
    setAuthModalOpen,
    authModalInitialMode,
    openAuthModal,
    claimUsernameModalOpen,
    setClaimUsernameModalOpen,
    resetToDefault
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
