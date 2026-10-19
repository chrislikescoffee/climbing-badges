import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import { cloudSaveUser } from './firestoreSync';
import type { UserProfile } from '../types';

/**
 * Sign in with Google Popup
 * Checks if user exists in club database; if new, creates a profile and syncs to Firestore.
 */
export async function signInWithGoogle(
  existingUsers: UserProfile[],
  onSuccess: (user: UserProfile) => void,
  onError?: (err: Error) => void
): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) {
    alert('Firebase is not configured yet. Please check your credentials.');
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    // Check if user already exists by UID or Email
    let userProfile = existingUsers.find(u => u.uid === fbUser.uid || (u.email && u.email === fbUser.email));
    
    if (!userProfile) {
      // First-time Google user joining the club
      const isFirstUser = existingUsers.length === 0;
      userProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || ('Climber ' + fbUser.uid.slice(0, 4)),
        avatarUrl: fbUser.photoURL || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
        role: isFirstUser ? 'admin' : 'member',
        status: 'active',
        createdAt: Date.now()
      };
      
      console.log('[Auth] New member registered via Google:', userProfile.displayName);
      await cloudSaveUser(userProfile);
    } else {
      console.log('[Auth] Existing member signed in via Google:', userProfile.displayName);
    }

    onSuccess(userProfile);
    return userProfile;
  } catch (err: any) {
    console.error('[Auth] Google Sign-In Error:', err);
    if (err.code === 'auth/operation-not-allowed') {
      alert('Google Sign-In is not enabled yet in your Firebase Console. Go to Authentication -> Sign-in method -> Enable Google.');
    } else if (err.code !== 'auth/popup-closed-by-user') {
      alert(`Google Sign-In notice: ${err.message}`);
    }
    if (onError) onError(err);
    return null;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await firebaseSignOut(auth);
      console.log('[Auth] User signed out.');
    } catch (err) {
      console.error('[Auth] Sign-out error:', err);
    }
  }
}

/**
 * Listen for persistent Firebase Auth state changes
 */
export function subscribeToAuth(
  onUserChanged: (user: FirebaseUser | null) => void
) {
  if (!isFirebaseConfigured) return () => {};
  return onAuthStateChanged(auth, onUserChanged);
}
