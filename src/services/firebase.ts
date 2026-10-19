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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCDWSfeRPG2CQfadEwCWi4uDBYlakGSvrI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'topo-editor-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'topo-editor-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'topo-editor-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '231786136394',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:231786136394:web:06032daae7ea93327237b3'
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.apiKey !== 'demo-api-key' && firebaseConfig.projectId
);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

export const FIRESTORE_DATABASE_ID = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'climbing-badges';

// Connect specifically to the named database: 'climbing-badges'
// with multi-tab persistent IndexedDB cache.
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, FIRESTORE_DATABASE_ID);
  console.log(`[Firebase] Successfully connected to named database "${FIRESTORE_DATABASE_ID}" with persistent cache!`);
} catch (e) {
  console.warn(`[Firebase] Fallback to getFirestore instance for "${FIRESTORE_DATABASE_ID}":`, e);
  firestoreDb = getFirestore(app, FIRESTORE_DATABASE_ID);
}

export const db = firestoreDb;
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const INITIAL_ADMIN_EMAIL = import.meta.env.VITE_INITIAL_ADMIN_EMAIL || 'admin@example.com';
