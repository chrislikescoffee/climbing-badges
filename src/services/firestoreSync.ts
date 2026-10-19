import { 
  collection, doc, setDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { 
  Badge, UserProfile, UpgradeTier, UserBadgeProgress, 
  Nomination, CommitteeEvictionRequest 
} from '../types';

const COLLECTIONS = {
  BADGES: 'cb_badges',
  USERS: 'cb_users',
  TIERS: 'cb_tiers',
  PROGRESS: 'cb_progress',
  NOMINATIONS: 'cb_nominations',
  EVICTIONS: 'cb_evictions'
};

/**
 * Real-time Badge listener & persistent cache loader
 * Draws directly from Firestore persistent cache + live cloud database.
 */
export function subscribeToBadges(
  onData: (badges: Badge[]) => void,
  fallbackBadges: Badge[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.BADGES);

    // Live Snapshot: triggers immediately from persistent local cache, then updates from cloud
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: Badge[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Badge);
        });
        console.log(`[Firestore] Loaded ${list.length} badges from database/cache.`);
        onData(list);
      } else {
        // If Firestore collection is completely empty, seed fallback badges once
        console.log('[Firestore] Database collection is empty. Seeding badges...');
        fallbackBadges.forEach((badge) => {
          setDoc(doc(db, COLLECTIONS.BADGES, badge.id), badge, { merge: true }).catch(console.error);
        });
        onData(fallbackBadges);
      }
    }, (error) => {
      console.warn('[Firestore] Badges subscription notice:', error.message);
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (e: any) {
    console.warn('[Firestore] Failed to init badges subscription:', e.message);
    return () => {};
  }
}

/**
 * Force write a badge directly to Firestore DB and local persistent cache
 */
export async function cloudSaveBadge(badge: Badge): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    await setDoc(doc(db, COLLECTIONS.BADGES, badge.id), badge, { merge: true });
    console.log(`[Firestore] Successfully saved badge "${badge.title}" to database and cache!`);
    return true;
  } catch (e) {
    console.error('[Firestore] Error saving badge:', e);
    return false;
  }
}

export async function cloudDeleteBadge(badgeId: string): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.BADGES, badgeId));
    console.log(`[Firestore] Deleted badge "${badgeId}" from database.`);
    return true;
  } catch (e) {
    console.error('[Firestore] Error deleting badge:', e);
    return false;
  }
}

/**
 * Force-sync all badges to Firestore DB (handy if local edits exist)
 */
export async function cloudForceSyncAllBadges(badges: Badge[]): Promise<number> {
  if (!isFirebaseConfigured) return 0;
  let count = 0;
  for (const b of badges) {
    try {
      await setDoc(doc(db, COLLECTIONS.BADGES, b.id), b, { merge: true });
      count++;
    } catch (e) {
      console.error('[Firestore] Error syncing badge:', b.id, e);
    }
  }
  console.log(`[Firestore] Force-synced ${count} of ${badges.length} badges to cloud DB.`);
  return count;
}

/**
 * Upgrade Tiers listener & seeder
 */
export function subscribeToUpgradeTiers(
  onData: (tiers: UpgradeTier[]) => void,
  fallbackTiers: UpgradeTier[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.TIERS);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: UpgradeTier[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as UpgradeTier);
        });
        list.sort((a, b) => a.level - b.level);
        onData(list);
      } else {
        fallbackTiers.forEach((tier) => {
          setDoc(doc(db, COLLECTIONS.TIERS, 'tier_' + tier.level), tier, { merge: true }).catch(console.error);
        });
        onData(fallbackTiers);
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
    await setDoc(doc(db, COLLECTIONS.TIERS, 'tier_' + tier.level), tier, { merge: true });
  } catch (e) {
    console.error('[Firestore] Error saving tier:', e);
  }
}

/**
 * Users listener & seeder
 */
export function subscribeToUsers(
  onData: (users: UserProfile[]) => void,
  fallbackUsers: UserProfile[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.USERS);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: UserProfile[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as UserProfile);
        });
        onData(list);
      } else {
        fallbackUsers.forEach((user) => {
          setDoc(doc(db, COLLECTIONS.USERS, user.uid), user, { merge: true }).catch(console.error);
        });
        onData(fallbackUsers);
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
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), user, { merge: true });
  } catch (e) {
    console.error('[Firestore] Error saving user:', e);
  }
}

/**
 * Nominations listener
 */
export function subscribeToNominations(
  onData: (nominations: Nomination[]) => void,
  _fallbackNominations: Nomination[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.NOMINATIONS);

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
    await setDoc(doc(db, COLLECTIONS.NOMINATIONS, nomination.id), nomination, { merge: true });
  } catch (e) {
    console.error('[Firestore] Error saving nomination:', e);
  }
}

/**
 * Evictions listener
 */
export function subscribeToEvictions(
  onData: (requests: CommitteeEvictionRequest[]) => void,
  _fallbackRequests: CommitteeEvictionRequest[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.EVICTIONS);

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
    await setDoc(doc(db, COLLECTIONS.EVICTIONS, request.id), request, { merge: true });
  } catch (e) {
    console.error('[Firestore] Error saving eviction request:', e);
  }
}

/**
 * User Progress listener
 */
export function subscribeToUserProgress(
  onData: (progress: Record<string, UserBadgeProgress>) => void,
  _fallbackProgress: Record<string, UserBadgeProgress>,
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.PROGRESS);

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
    await setDoc(doc(db, COLLECTIONS.PROGRESS, docId), progress, { merge: true });
  } catch (e) {
    console.error('[Firestore] Error saving progress:', e);
  }
}
