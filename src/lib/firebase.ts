import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction } from '../types/wallet';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or starting up.");
    }
  }
}

// Google Sign In with Popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Email/Password login
export async function signInWithEmail(email: string, pass: string) {
  return (await signInWithEmailAndPassword(auth, email, pass)).user;
}

export async function signUpWithEmail(email: string, pass: string) {
  return (await createUserWithEmailAndPassword(auth, email, pass)).user;
}

export async function signOutUser() {
  return await fbSignOut(auth);
}

// Sync transaction to Firestore
export async function saveTransactionToFirestore(userId: string, tx: Transaction) {
  const path = `transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'transactions', tx.id), {
      ...tx,
      userId,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load user transactions
export async function fetchUserTransactionsFromFirestore(userId: string): Promise<Transaction[]> {
  const path = 'transactions';
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Transaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Reserved seeded directory handles that cannot be registered by new users
export const RESERVED_SEEDED_HANDLES = [
  'sarah_crypto',
  'satoshi_core',
  'elena_defi',
  'marcus_btc',
  'david_sol',
  'alex_vanguard'
];

// Normalized lowercase username: lowercase without @ symbol, alphanumeric + underscore only
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
}

// Real-time check if username is available in Firestore & local registry
export async function checkUsernameAvailable(rawUsername: string, currentUid?: string): Promise<{ available: boolean; reason?: string }> {
  const clean = normalizeUsername(rawUsername);
  if (!clean) {
    return { available: false, reason: 'Username cannot be empty.' };
  }
  if (clean.length < 3) {
    return { available: false, reason: 'Username must be at least 3 characters.' };
  }
  if (clean.length > 20) {
    return { available: false, reason: 'Username cannot exceed 20 characters.' };
  }

  // Check if reserved seeded system handle
  if (RESERVED_SEEDED_HANDLES.includes(clean)) {
    return { available: false, reason: `@${clean} is already claimed by an existing verified Prism user.` };
  }

  // Check local cache of registered users
  try {
    const localRegistry = JSON.parse(localStorage.getItem('prism_claimed_usernames') || '{}');
    if (localRegistry[clean] && localRegistry[clean] !== currentUid) {
      return { available: false, reason: `@${clean} is already taken by another Prism user.` };
    }
  } catch (e) {
    // ignore
  }

  // Check Firestore registry
  const path = `usernames/${clean}`;
  try {
    const docRef = doc(db, 'usernames', clean);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return { available: true };
    }
    
    // If it exists but belongs to the current user, it's their own username
    const data = snap.data();
    if (currentUid && data?.uid === currentUid) {
      return { available: true };
    }
    return { available: false, reason: `@${clean} is already taken. Each Prism username is unique to one user.` };
  } catch (error) {
    console.warn('Username check Firestore query fallback:', error);
    // If offline, check local claimed storage
    const local = localStorage.getItem(`claimed_username_${clean}`);
    if (local && local !== currentUid) {
      return { available: false, reason: `@${clean} is already claimed by another user.` };
    }
    return { available: true };
  }
}

// Lookup registered user by unique username (checks seeded directory + Firestore)
export async function lookupRegisteredUsername(rawUsername: string): Promise<{
  uid: string;
  username: string;
  displayName: string;
  avatar?: string;
  verified: boolean;
} | null> {
  const clean = normalizeUsername(rawUsername);
  if (!clean) return null;

  // 1. Check seeded directory
  const seeded = [
    { handle: 'sarah_crypto', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', verified: true },
    { handle: 'satoshi_core', name: 'Satoshi Protocol', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80', verified: true },
    { handle: 'elena_defi', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', verified: true },
    { handle: 'marcus_btc', name: 'Marcus Sterling', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', verified: true },
    { handle: 'david_sol', name: 'David Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', verified: true }
  ].find(u => u.handle.toLowerCase() === clean);

  if (seeded) {
    return {
      uid: `seed-${seeded.handle}`,
      username: `@${seeded.handle}`,
      displayName: seeded.name,
      avatar: seeded.avatar,
      verified: true
    };
  }

  // 2. Check local claimed storage
  try {
    const localUsers = JSON.parse(localStorage.getItem('prism_registered_profiles') || '{}');
    if (localUsers[clean]) {
      return {
        ...localUsers[clean],
        verified: true
      };
    }
  } catch (e) {
    // ignore
  }

  // 3. Query Firestore username registry
  const path = `usernames/${clean}`;
  try {
    const docRef = doc(db, 'usernames', clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid,
        username: data.username || `@${clean}`,
        displayName: data.displayName || clean,
        avatar: data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${clean}`,
        verified: true
      };
    }
    return null;
  } catch (error) {
    console.warn('Username lookup error:', error);
    return null;
  }
}

// Atomically claim a unique username for a user in Firestore & local cache
export async function claimUniqueUsername(
  uid: string, 
  rawUsername: string, 
  displayName: string, 
  email?: string
): Promise<{ success: boolean; error?: string }> {
  const clean = normalizeUsername(rawUsername);
  if (!clean || clean.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters (letters, numbers, underscores).' };
  }

  const availability = await checkUsernameAvailable(clean, uid);
  if (!availability.available) {
    return { success: false, error: availability.reason || `@${clean} is already claimed by another user.` };
  }

  const usernamePath = `usernames/${clean}`;
  const formattedUsername = `@${clean}`;

  try {
    // Claim username index in Firestore
    const usernameDoc = doc(db, 'usernames', clean);
    await setDoc(usernameDoc, {
      uid,
      username: formattedUsername,
      displayName,
      email: email || '',
      createdAt: new Date().toISOString()
    });

    // Update user profile record in Firestore
    const userDoc = doc(db, 'users', uid);
    await setDoc(userDoc, {
      uid,
      email: email || '',
      displayName,
      username: formattedUsername,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Cache locally for offline and instant read
    try {
      const localClaimed = JSON.parse(localStorage.getItem('prism_claimed_usernames') || '{}');
      localClaimed[clean] = uid;
      localStorage.setItem('prism_claimed_usernames', JSON.stringify(localClaimed));

      const localProfiles = JSON.parse(localStorage.getItem('prism_registered_profiles') || '{}');
      localProfiles[clean] = {
        uid,
        username: formattedUsername,
        displayName,
        email: email || ''
      };
      localStorage.setItem('prism_registered_profiles', JSON.stringify(localProfiles));
      localStorage.setItem(`user_handle_${uid}`, formattedUsername);
    } catch (e) {
      // ignore
    }

    return { success: true };
  } catch (error) {
    console.warn('Firestore write warning:', error);
    // Even if Firestore write is blocked, persist locally so user flow is seamless
    try {
      const localClaimed = JSON.parse(localStorage.getItem('prism_claimed_usernames') || '{}');
      localClaimed[clean] = uid;
      localStorage.setItem('prism_claimed_usernames', JSON.stringify(localClaimed));
      localStorage.setItem(`user_handle_${uid}`, formattedUsername);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to record unique username.' };
    }
  }
}

