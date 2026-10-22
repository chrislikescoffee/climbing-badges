
/**
 * Recursively removes undefined fields so Firestore setDoc never rejects with
 * "Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy, limit 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import type { 
  Badge, UserProfile, UpgradeTier, UserBadgeProgress, 
  Nomination, CommitteeEvictionRequest, ClubActivity 
} from '../types';

const COLLECTIONS = {
  BADGES: 'cb_badges',
  USERS: 'cb_users',
  TIERS: 'cb_tiers',
  PROGRESS: 'cb_progress',
  NOMINATIONS: 'cb_nominations',
  EVICTIONS: 'cb_evictions',
  ACTIVITIES: 'cb_activities'
};

/**
 * Upload badge image to Firebase Storage
 * Returns public HTTPS download URL, or falls back to data URL if storage rules restrict it.
 */
export async function uploadBadgeImageToStorage(badgeId: string, dataUrl: string): Promise<string> {
  if (!isFirebaseConfigured || !dataUrl || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }
  try {
    const storageRef = ref(storage, `cb_badge_images/${badgeId}_${Date.now()}.webp`);
    await uploadString(storageRef, dataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`[Storage] Uploaded badge image to Firebase Cloud Storage: ${downloadUrl}`);
    return downloadUrl;
  } catch (err: any) {
    console.warn('[Storage] Note: Could not upload to Firebase Storage bucket (falling back to compressed data URL):', err.message);
    return dataUrl;
  }
}

/**
 * Real-time Badge listener & persistent cache loader
 * Draws directly from Firestore database / persistent cache on app startup.
 */
export function subscribeToBadges(
  onData: (badges: Badge[]) => void,
  fallbackBadges: Badge[],
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.BADGES);

    // Live Snapshot: triggers immediately from persistent local cache, then streams updates from cloud
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const list: Badge[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Badge;
          list.push({
            ...data,
            requirements: Array.isArray(data.requirements) ? data.requirements : []
          });
        });
        console.log(`[Firestore] Loaded ${list.length} badges from online database/cache.`);
        onData(list);
      } else {
        console.log('[Firestore] Badges collection empty. Seeding initial badges to database...');
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
 * Save badge directly to Firestore DB and local persistent cache
 */
export async function cloudSaveBadge(badge: Badge): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    const sanitizedBadge = sanitizeForFirestore(badge);
    await setDoc(doc(db, COLLECTIONS.BADGES, badge.id), sanitizedBadge, { merge: true });
    console.log(`[Firestore] Saved badge "${badge.title}" to database and cache!`);
    return true;
  } catch (e) {
    console.error('[Firestore] Error saving badge to database:', e);
    return false;
  }
}

/**
 * Delete badge from Firestore DB and remove its image from Firebase Storage if present
 */
export async function cloudDeleteBadge(badgeId: string, imageUrl?: string): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    // 1. Delete document from Firestore database
    await deleteDoc(doc(db, COLLECTIONS.BADGES, badgeId));
    console.log(`[Firestore] Deleted badge document "${badgeId}" from online database.`);

    // 2. If image was in Firebase Storage bucket, delete it from storage
    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log('[Storage] Deleted badge image from Firebase Storage bucket.');
      } catch (storageErr) {
        console.warn('[Storage] Notice: Could not remove image object from bucket:', storageErr);
      }
    }
    return true;
  } catch (e) {
    console.error('[Firestore] Error deleting badge:', e);
    return false;
  }
}

/**
 * Force-sync all badges, users, tiers, and progress to Firestore DB
 */
export async function cloudForceSyncAllBadges(
  badges: Badge[],
  users?: UserProfile[],
  progress?: Record<string, UserBadgeProgress>
): Promise<number> {
  if (!isFirebaseConfigured) return 0;
  let count = 0;
  for (const b of badges) {
    try {
      await setDoc(doc(db, COLLECTIONS.BADGES, b.id), sanitizeForFirestore(b), { merge: true });
      count++;
    } catch (e) {
      console.error('[Firestore] Error syncing badge:', b.id, e);
    }
  }

  if (users && users.length > 0) {
    for (const u of users) {
      try {
        await setDoc(doc(db, COLLECTIONS.USERS, u.uid), u, { merge: true });
      } catch (e) {
        console.error('[Firestore] Error syncing user:', u.uid, e);
      }
    }
  }

  if (progress && Object.keys(progress).length > 0) {
    for (const p of Object.values(progress)) {
      try {
        const docId = p.id || `${p.userId}_${p.badgeId}`;
        await setDoc(doc(db, COLLECTIONS.PROGRESS, docId), p, { merge: true });
      } catch (e) {
        console.error('[Firestore] Error syncing progress:', p.badgeId, e);
      }
    }
  }

  console.log(`[Firestore] Completed full online sync of ${count} badges, ${users?.length || 0} users, and progress items.`);
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
 * Pulls user accounts from online database on startup.
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
        const TEMP_IDS = ['user-chris', 'user-sam', 'user-alex', 'user-taylor', 'user-jordan'];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as UserProfile;
          const isTemp = TEMP_IDS.includes(docSnap.id) ||
                         data.email?.endsWith('@example.com') ||
                         data.email?.endsWith('@safeclimbing.club');
          if (isTemp) {
            // Attempt to purge temp record from Firestore
            deleteDoc(doc(db, COLLECTIONS.USERS, docSnap.id)).catch(() => {});
          } else {
            list.push(data);
          }
        });
        console.log(`[Firestore] Loaded ${list.length} user accounts from online database.`);
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


/**
 * Permanently delete a user from Firestore
 */
export async function cloudDeleteUser(userId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    console.log('[Firestore] Deleted user from database:', userId);
  } catch (e) {
    console.error('[Firestore] Error deleting user:', userId, e);
  }
}

export async function cloudSaveUser(user: UserProfile): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), sanitizeForFirestore(user), { merge: true });
    console.log(`[Firestore] Saved user account "${user.displayName}" to database.`);
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
    await setDoc(doc(db, COLLECTIONS.NOMINATIONS, nomination.id), sanitizeForFirestore(nomination), { merge: true });
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
    await setDoc(doc(db, COLLECTIONS.EVICTIONS, request.id), sanitizeForFirestore(request), { merge: true });
  } catch (e) {
    console.error('[Firestore] Error saving eviction request:', e);
  }
}

/**
 * User Progress listener
 * Pulls badge progress for the specified user from online database.
 */
export function subscribeToUserProgress(
  userId: string,
  onData: (progress: Record<string, UserBadgeProgress>) => void,
  _fallbackProgress: Record<string, UserBadgeProgress>,
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured || !userId) return () => {};

  try {
    const q = query(
      collection(db, COLLECTIONS.PROGRESS),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const map: Record<string, UserBadgeProgress> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as UserBadgeProgress;
        map[data.badgeId] = data;
      });
      console.log(`[Firestore] Progress Sync: Found ${Object.keys(map).length} records in cloud for user "${userId}"`);
      onData(map);
    }, (error) => {
      console.warn('[Firestore] query subscribeToUserProgress error, attempting collection fallback:', error);
      try {
        const colRef = collection(db, COLLECTIONS.PROGRESS);
        return onSnapshot(colRef, (snapshot) => {
          const map: Record<string, UserBadgeProgress> = {};
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as UserBadgeProgress;
            if (data.userId === userId) {
              map[data.badgeId] = data;
            }
          });
          onData(map);
        }, (err) => {
          if (onError) onError(err);
        });
      } catch (fallbackErr) {
        if (onError) onError(error);
      }
    });

    return unsubscribe;
  } catch (e: any) {
    console.error('[Firestore] subscribeToUserProgress exception:', e);
    return () => {};
  }
}

/**
 * Save user badge progress to database
 */
export async function cloudSaveProgress(progress: UserBadgeProgress): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const docId = progress.id || `${progress.userId}_${progress.badgeId}`;
    const cleanProgress = sanitizeForFirestore(progress);
    await setDoc(doc(db, COLLECTIONS.PROGRESS, docId), cleanProgress, { merge: true });
    console.log(`[Firestore] Successfully saved badge progress for user "${progress.userId}", badge "${progress.badgeId}" to cloud DB!`);
  } catch (e) {
    console.error('[Firestore] Error saving progress:', e);
  }
}

/**
 * Real-time Activities listener
 */
export function subscribeToActivities(
  onData: (activities: ClubActivity[]) => void,
  onError?: (err: Error) => void
) {
  if (!isFirebaseConfigured) return () => {};

  try {
    const colRef = collection(db, COLLECTIONS.ACTIVITIES);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));

    let active = true;
    let unsub: (() => void) | null = null;

    unsub = onSnapshot(q, (snapshot) => {
      if (!active) return;
      const list: ClubActivity[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ClubActivity);
      });
      onData(list);
    }, (error) => {
      // Unsubscribe failing query immediately to avoid stream reconnect churn
      if (unsub) {
        unsub();
        unsub = null;
      }
      if (!active) return;

      const isIndexError = error.message && error.message.toLowerCase().includes('index');
      if (isIndexError) {
        // Try simple unordered query only if orderBy was the issue
        try {
          unsub = onSnapshot(colRef, (snapshot) => {
            if (!active) return;
            const list: ClubActivity[] = [];
            snapshot.forEach(docSnap => {
              list.push(docSnap.data() as ClubActivity);
            });
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            onData(list);
          }, (err) => {
            if (onError) onError(err);
          });
        } catch (fallbackErr: any) {
          if (onError) onError(fallbackErr);
        }
      } else {
        console.warn('[Firestore] Note: cb_activities query restricted by security rules:', error.message);
        if (onError) onError(error);
      }
    });

    return () => {
      active = false;
      if (unsub) {
        unsub();
        unsub = null;
      }
    };
  } catch (e: any) {
    return () => {};
  }
}

/**
 * Save an activity event to Firestore cb_activities
 */
export async function cloudSaveActivity(
  activity: Omit<ClubActivity, 'id'> & { id?: string }
): Promise<boolean> {
  if (!isFirebaseConfigured) return false;
  try {
    const id = activity.id || ('act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
    const fullActivity: ClubActivity = {
      ...activity,
      id
    };
    await setDoc(doc(db, COLLECTIONS.ACTIVITIES, id), sanitizeForFirestore(fullActivity), { merge: true });
    console.log(`[Firestore] Recorded activity: ${fullActivity.type} (${id})`);
    return true;
  } catch (e: any) {
    console.warn('[Firestore] Note: Could not persist activity to cloud database (check Firestore rules for cb_activities):', e.message);
    return false;
  }
}
