import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'climbing-badges.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'climbing-badges',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'climbing-badges.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

// Force persistent multi-tab IndexedDB cache: stores all documents locally on disk
// and automatically synchronizes with Firestore cloud in real-time.
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  console.log('[Firebase] Initialized Firestore with persistent multi-tab IndexedDB cache!');
} catch (e) {
  console.warn('[Firebase] Fallback to default getFirestore instance:', e);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const INITIAL_ADMIN_EMAIL = import.meta.env.VITE_INITIAL_ADMIN_EMAIL || 'admin@example.com';
