import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, getDocs 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { 
  Badge, UserProfile, UpgradeTier, UserBadgeProgress, 
  Nomination, CommitteeEvictionRequest 
} from '../types';

// Namespaced collections to coexist cleanly with other apps in the same Firebase project
const COLLECTIONS = {
  BADGES: 'cb_badges',
  USERS: 'cb_users',
  TIERS: 'cb_tiers',
  PROGRESS: 'cb_progress',
  NOMINATIONS: 'cb_nominations',
  EVICTIONS: 'cb_evictions'
};

/**
 * Real-time Badge listener & seeder
 */
export function subscribeToBadges(
  onData: (badges: Badge[]) => void,
  initialSeed: Badge[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.BADGES);
    
    // Check if we need to seed
    getDocs(colRef).then((snapshot) => {
      if (snapshot.empty && initialSeed.length > 0) {
        console.log('[Firestore] Seeding default badges into cb_badges...');
        initialSeed.forEach((badge) => {
          setDoc(doc(db, COLLECTIONS.BADGES, badge.id), badge).catch(console.error);
        });
      }
    }).catch(err => {
      console.warn('[Firestore] Note: Could not read badges, check security rules or offline status:', err.message);
      if (onError) onError(err);
    });

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: Badge[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Badge);
        });
        onData(list);
      }
    }, (error) => {
      console.warn('[Firestore] Badges listener warning:', error.message);
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (e: any) {
    console.warn('[Firestore] Failed to init badges subscription:', e.message);
    return () => {};
  }
}

export async function cloudSaveBadge(badge: Badge): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.BADGES, badge.id), badge);
  } catch (e) {
    console.error('[Firestore] Error saving badge:', e);
  }
}

export async function cloudDeleteBadge(badgeId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.BADGES, badgeId));
  } catch (e) {
    console.error('[Firestore] Error deleting badge:', e);
  }
}

/**
 * Real-time Upgrade Tiers listener & seeder
 */
export function subscribeToUpgradeTiers(
  onData: (tiers: UpgradeTier[]) => void,
  initialSeed: UpgradeTier[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.TIERS);

    getDocs(colRef).then((snapshot) => {
      if (snapshot.empty && initialSeed.length > 0) {
        console.log('[Firestore] Seeding default tiers into cb_tiers...');
        initialSeed.forEach((tier) => {
          setDoc(doc(db, COLLECTIONS.TIERS, 'tier_' + tier.level), tier).catch(console.error);
        });
      }
    }).catch(err => {
      if (onError) onError(err);
    });

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: UpgradeTier[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as UpgradeTier);
        });
        list.sort((a, b) => a.level - b.level);
        onData(list);
      }
    }, (error) => {
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (e: any) {
    return () => {};
  }
}

export async function cloudSaveUpgradeTier(tier: UpgradeTier): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.TIERS, 'tier_' + tier.level), tier);
  } catch (e) {
    console.error('[Firestore] Error saving tier:', e);
  }
}

export async function cloudDeleteUpgradeTier(tierId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TIERS, tierId));
  } catch (e) {
    console.error('[Firestore] Error deleting tier:', e);
  }
}

/**
 * Real-time Users listener & seeder
 */
export function subscribeToUsers(
  onData: (users: UserProfile[]) => void,
  initialSeed: UserProfile[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.USERS);

    getDocs(colRef).then((snapshot) => {
      if (snapshot.empty && initialSeed.length > 0) {
        console.log('[Firestore] Seeding initial users into cb_users...');
        initialSeed.forEach((user) => {
          setDoc(doc(db, COLLECTIONS.USERS, user.uid), user).catch(console.error);
        });
      }
    }).catch(err => {
      if (onError) onError(err);
    });

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: UserProfile[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as UserProfile);
        });
        onData(list);
      }
    }, (error) => {
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (e: any) {
    return () => {};
  }
}

export async function cloudSaveUser(user: UserProfile): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), user);
  } catch (e) {
    console.error('[Firestore] Error saving user:', e);
  }
}

/**
 * Real-time Nominations listener
 */
export function subscribeToNominations(
  onData: (nominations: Nomination[]) => void,
  initialSeed: Nomination[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.NOMINATIONS);

    getDocs(colRef).then((snapshot) => {
      if (snapshot.empty && initialSeed.length > 0) {
        initialSeed.forEach((nom) => {
          setDoc(doc(db, COLLECTIONS.NOMINATIONS, nom.id), nom).catch(console.error);
        });
      }
    }).catch(err => {
      if (onError) onError(err);
    });

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list: Nomination[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Nomination);
      });
      onData(list);
    }, (error) => {
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (e: any) {
    return () => {};
  }
}

export async function cloudSaveNomination(nomination: Nomination): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.NOMINATIONS, nomination.id), nomination);
  } catch (e) {
    console.error('[Firestore] Error saving nomination:', e);
  }
}

/**
 * Real-time Evictions listener
 */
export function subscribeToEvictions(
  onData: (requests: CommitteeEvictionRequest[]) => void,
  initialSeed: CommitteeEvictionRequest[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.EVICTIONS);

    getDocs(colRef).then((snapshot) => {
      if (snapshot.empty && initialSeed.length > 0) {
        initialSeed.forEach((req) => {
          setDoc(doc(db, COLLECTIONS.EVICTIONS, req.id), req).catch(console.error);
        });
      }
    }).catch(err => {
      if (onError) onError(err);
    });

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list: CommitteeEvictionRequest[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as CommitteeEvictionRequest);
      });
      onData(list);
    }, (error) => {
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (e: any) {
    return () => {};
  }
}

export async function cloudSaveEviction(request: CommitteeEvictionRequest): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.EVICTIONS, request.id), request);
  } catch (e) {
    console.error('[Firestore] Error saving eviction request:', e);
  }
}

export async function cloudDeleteEviction(requestId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EVICTIONS, requestId));
  } catch (e) {
    console.error('[Firestore] Error deleting eviction request:', e);
  }
}

/**
 * Real-time User Progress listener
 */
export function subscribeToUserProgress(
  onData: (progress: Record<string, UserBadgeProgress>) => void,
  initialSeed: Record<string, UserBadgeProgress>,
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.PROGRESS);

    getDocs(colRef).then((snapshot) => {
      if (snapshot.empty && Object.keys(initialSeed).length > 0) {
        Object.values(initialSeed).forEach((item) => {
          setDoc(doc(db, COLLECTIONS.PROGRESS, item.id || `${item.userId}_${item.badgeId}`), item).catch(console.error);
        });
      }
    }).catch(err => {
      if (onError) onError(err);
    });

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const map: Record<string, UserBadgeProgress> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as UserBadgeProgress;
        map[data.badgeId] = data;
      });
      if (Object.keys(map).length > 0) {
        onData(map);
      }
    }, (error) => {
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (e: any) {
    return () => {};
  }
}

export async function cloudSaveProgress(progress: UserBadgeProgress): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const docId = progress.id || `${progress.userId}_${progress.badgeId}`;
    await setDoc(doc(db, COLLECTIONS.PROGRESS, docId), progress);
  } catch (e) {
    console.error('[Firestore] Error saving progress:', e);
  }
}
