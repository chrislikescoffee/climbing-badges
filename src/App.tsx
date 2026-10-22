import { Award, User } from 'lucide-react';
import { signInWithGoogle, signOutUser, subscribeToAuth } from './services/authService';
import { CreateAccountModal } from './components/auth/CreateAccountModal';
import { clubStore } from './services/store';
import { isFirebaseConfigured } from './services/firebase';
import { recordEvidence, awardFromNomination } from './domain/progression/progressionEngine';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/common/Navbar';
import type { TabKey } from './components/common/Navbar';
import { BadgeCard } from './components/badges/BadgeCard';
import { MyBadges } from './components/badges/MyBadges';
import { BadgeFilters } from './components/badges/BadgeFilters';
import { BadgeDetailModal } from './components/badges/BadgeDetailModal';
import { ShareCardModal } from './components/badges/ShareCardModal';
import { ReviewQueue } from './components/committee/ReviewQueue';
import { NominateModal } from './components/nominations/NominateModal';
import { BadgeManagement } from './components/management/BadgeManagement';
import { UserManagement } from './components/management/UserManagement';
import { UpgradeTierManagement } from './components/management/UpgradeTierManagement';
import { ProfileView } from './components/profile/ProfileView';
import { ActivityFeed } from './components/feed/ActivityFeed';
import { 
  describeBadgeChanges, 
  generateHistoricalActivities,
  mergeAndDeduplicateActivities 
} from './domain/activity/activityFeedService';

import { INITIAL_BADGES, MOCK_USERS, INITIAL_EVICTION_REQUESTS, INITIAL_UPGRADE_TIERS } from './services/mockData';
import type { Badge, UserBadgeProgress, UserProfile, Nomination, CommitteeEvictionRequest, UpgradeTier, ClubActivity } from './types';
import { sounds } from './services/audio';

// LocalStorage Persistence Keys
const STORAGE_KEYS = {
  BADGES: 'climbing_badges_list',
  USERS: 'climbing_users_list',
  CURRENT_USER_ID: 'climbing_current_user_id',
  PROGRESS: 'climbing_user_progress',
  NOMINATIONS: 'climbing_nominations',
  EVICTIONS: 'climbing_evictions',
  TIERS: 'climbing_upgrade_tiers',
  ACTIVITIES: 'climbing_activities_list'
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load storage for', key, e);
  }
  return fallback;
}


const migrateAvatars = (userList: UserProfile[]): UserProfile[] => {
  const TEMP_IDS = ['user-chris', 'user-sam', 'user-alex', 'user-taylor', 'user-jordan'];
  userList = userList.filter(u => !TEMP_IDS.includes(u.uid) && !u.email?.endsWith('@example.com') && !u.email?.endsWith('@safeclimbing.club'));
  const avatarMap: Record<string, string> = {
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoey',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150': 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper'
  };
  return userList.map(u => {
    if (avatarMap[u.avatarUrl]) {
      return { ...u, avatarUrl: avatarMap[u.avatarUrl] };
    }
    if (u.avatarUrl && u.avatarUrl.includes('images.unsplash.com')) {
      return { ...u, avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(u.displayName) };
    }
    return u;
  });
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('badges');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // 1. Persistent Users & Active Account
  const [users, setUsers] = useState<UserProfile[]>(() => 
    migrateAvatars(loadFromStorage<UserProfile[]>(STORAGE_KEYS.USERS, MOCK_USERS))
  );
  
  const [currentUserId, setCurrentUserId] = useState<string>(() => 
    loadFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, '')
  );

  const currentUser = users.find(u => u.uid === currentUserId) || null;

  // 2. Persistent Badges
  const [badges, setBadges] = useState<Badge[]>(() => 
    loadFromStorage<Badge[]>(STORAGE_KEYS.BADGES, INITIAL_BADGES)
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'earnt' | 'not_awarded'>('all');

  // 3. Persistent Upgrade Tiers
  const [upgradeTiers, setUpgradeTiers] = useState<UpgradeTier[]>(() => 
    loadFromStorage<UpgradeTier[]>(STORAGE_KEYS.TIERS, INITIAL_UPGRADE_TIERS)
  );

  // 4. Persistent User Progress
  const [userProgress, setUserProgress] = useState<Record<string, UserBadgeProgress>>(() => 
loadFromStorage<Record<string, UserBadgeProgress>>(STORAGE_KEYS.PROGRESS, {})
  );

  // 5. Persistent Nominations
  const [nominations, setNominations] = useState<Nomination[]>(() => 
loadFromStorage<Nomination[]>(STORAGE_KEYS.NOMINATIONS, [])
  );

  // 6. Persistent Eviction Requests
  const [evictionRequests, setEvictionRequests] = useState<CommitteeEvictionRequest[]>(() => 
    loadFromStorage<CommitteeEvictionRequest[]>(STORAGE_KEYS.EVICTIONS, INITIAL_EVICTION_REQUESTS)
  );

  // 7. Persistent Club Activities / Feed
  const [activities, setActivities] = useState<ClubActivity[]>(() =>
    loadFromStorage<ClubActivity[]>(STORAGE_KEYS.ACTIVITIES, [])
  );

  // Save changes to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIERS, JSON.stringify(upgradeTiers));
  }, [upgradeTiers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOMINATIONS, JSON.stringify(nominations));
  }, [nominations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVICTIONS, JSON.stringify(evictionRequests));
  }, [evictionRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  // Modals state
  const [inspectingBadge, setInspectingBadge] = useState<Badge | null>(null);
  const [nominatingBadge, setNominatingBadge] = useState<Badge | null>(null);
  const [sharingBadge, setSharingBadge] = useState<Badge | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [createUserRoleAllowed, setCreateUserRoleAllowed] = useState<boolean>(false);

  
  // Listen for persistent Firebase Google Auth session
  useEffect(() => {
    const unsub = subscribeToAuth((fbUser) => {
      if (fbUser) {
        console.log('[Auth] Detected active Google session for:', fbUser.email);
        const matched = users.find(u => u.uid === fbUser.uid || u.email === fbUser.email);
        const activeUid = matched ? matched.uid : fbUser.uid;
        setCurrentUserId(activeUid);
      } else {
        console.log('[Auth] No active Google session.');
        setCurrentUserId('');
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      }
    });
    return () => unsub();
  }, [users]);

  const isCommittee = currentUser?.role === 'admin' || currentUser?.role === 'committee';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset to default starter data if needed
  const handleResetToDefaults = () => {
    if (confirm('Reset all badges, tiers, and data back to default starter settings? Your custom modifications will be cleared.')) {
      setBadges(INITIAL_BADGES);
      setUsers(MOCK_USERS);
      setUpgradeTiers(INITIAL_UPGRADE_TIERS);
      setEvictionRequests(INITIAL_EVICTION_REQUESTS);
      alert('Data reset to defaults!');
    }
  };

  // Badge Management Handlers
  
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      ...updated
    };
    setUsers(prev => prev.map(u => u.uid === currentUser.uid ? updatedUser : u));
    clubStore.saveUser(updatedUser);
  };


  const handleForceSyncBadges = async () => {
    const count = await clubStore.forceSyncAll(badges, users, userProgress);
    alert(`Successfully synced ${count} badges, ${users.length} user accounts, and all progress to Firebase Database!`);
  };

  const recordAndDispatchActivity = (rawActivity: Omit<ClubActivity, 'id'>) => {
    const id = 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const fullActivity: ClubActivity = {
      ...rawActivity,
      id
    };
    // 1. Optimistic UI update: display immediately and persist to local state/storage
    setActivities(prev => mergeAndDeduplicateActivities(prev, [fullActivity]));
    // 2. Persist to cloud database
    clubStore.recordActivity(fullActivity);
  };
  
  const handleGoogleSignIn = async () => {
    await signInWithGoogle(users, (newUser) => {
      let isNew = false;
      setUsers(prev => {
        const exists = prev.some(u => u.uid === newUser.uid);
        if (!exists) isNew = true;
        if (exists) return prev.map(u => u.uid === newUser.uid ? newUser : u);
        return [newUser, ...prev];
      });
      setCurrentUserId(newUser.uid);
      sounds.playFanfare();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      if (isNew) {
        recordAndDispatchActivity({
          type: 'user_joined',
          timestamp: Date.now(),
          actorUserId: newUser.uid,
          actorDisplayName: newUser.displayName,
          actorAvatarUrl: newUser.avatarUrl,
          details: { summary: 'Joined Safe Climbing Club via Google' }
        });
      }
    });
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUserId('');
    setUserProgress({});
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    setActiveTab('badges');
    alert('You have signed out.');
  };

  const handleCreateUser = async (newUser: UserProfile, switchToUser: boolean) => {
    // 1. Add to local React state
    setUsers(prev => [newUser, ...prev]);

    // 2. Upload and persist in Firestore cb_users
    await clubStore.saveUser(newUser);

    // 3. Emit user_joined activity optimistically and to cloud
    recordAndDispatchActivity({
      type: 'user_joined',
      timestamp: Date.now(),
      actorUserId: newUser.uid,
      actorDisplayName: newUser.displayName,
      actorAvatarUrl: newUser.avatarUrl,
      details: { summary: 'Joined Safe Climbing Club' }
    });

    // 4. Switch active user if requested
    if (switchToUser) {
      setCurrentUserId(newUser.uid);
      sounds.playFanfare();
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
    }
    alert(`Welcome to Safe Climbing Club, ${newUser.displayName}! Account saved to database.`);
  };

  const handleSaveBadge = async (badge: Badge) => {
    const existing = badges.find(b => b.id === badge.id);

    // 1. Update React state immediately by matching UUID
    setBadges(prev => {
      const exists = prev.some(b => b.id === badge.id);
      if (exists) {
        return prev.map(b => b.id === badge.id ? badge : b);
      }
      return [badge, ...prev];
    });

    // 2. Persist update in Firestore database & persistent cache by UUID
    const success = await clubStore.saveBadge(badge);
    if (success) {
      console.log(`[App] Badge update persisted to Firestore DB: ${badge.title} (${badge.id})`);
    }

    // 3. Emit activity event optimistically and to cloud
    if (existing) {
      const summary = describeBadgeChanges(existing, badge);
      recordAndDispatchActivity({
        type: 'badge_updated',
        timestamp: Date.now(),
        actorUserId: currentUser?.uid,
        actorDisplayName: currentUser?.displayName || 'Committee',
        targetBadgeId: badge.id,
        targetBadgeTitle: badge.title,
        targetBadgeIcon: badge.iconName,
        targetBadgeImageUrl: badge.imageUrl,
        details: { summary, category: badge.category }
      });
    } else {
      recordAndDispatchActivity({
        type: 'badge_created',
        timestamp: Date.now(),
        actorUserId: currentUser?.uid,
        actorDisplayName: currentUser?.displayName || 'Committee',
        targetBadgeId: badge.id,
        targetBadgeTitle: badge.title,
        targetBadgeIcon: badge.iconName,
        targetBadgeImageUrl: badge.imageUrl,
        details: { summary: `Released with ${badge.requirements.length} requirement(s)`, category: badge.category }
      });
    }
  };

  const handleDeleteBadge = (badgeId: string) => {
    const targetBadge = badges.find(b => b.id === badgeId);
    setBadges(prev => prev.filter(b => b.id !== badgeId));
    clubStore.deleteBadge(badgeId, targetBadge?.imageUrl);
  };

  const handleToggleActiveBadge = (badgeId: string) => {
    setBadges(prev => prev.map(b => {
      if (b.id === badgeId) {
        const updated = { ...b, isActive: !b.isActive };
        clubStore.saveBadge(updated);
        return updated;
      }
      return b;
    }));
  };

  // User Management Handlers
  const handlePromoteToCommittee = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === userId) {
        const updated = { ...u, role: 'committee' as const };
        clubStore.saveUser(updated);
        return updated;
      }
      return u;
    }));
    alert('User promoted to Committee!');
  };

  const handleRequestEvictFromCommittee = (targetUser: UserProfile, reason: string) => {
    if (!currentUser) return;
    const newReq: CommitteeEvictionRequest = {
      id: 'evict_' + Date.now(),
      targetUserId: targetUser.uid,
      targetDisplayName: targetUser.displayName,
      targetEmail: targetUser.email,
      requestedByUserId: currentUser.uid,
      requestedByDisplayName: currentUser.displayName,
      reason,
      status: 'pending',
      createdAt: Date.now()
    };
    setEvictionRequests(prev => [newReq, ...prev]);
    clubStore.saveEviction(newReq);
    alert('Eviction request created. A second Committee member must approve to complete the removal.');
  };

  const handleApproveEvictionFromCommittee = (requestId: string) => {
    if (!currentUser) return;
    const req = evictionRequests.find(r => r.id === requestId);
    if (!req) return;

    setUsers(prev => prev.map(u => {
      if (u.uid === req.targetUserId) {
        const updated = { ...u, role: 'member' as const };
        clubStore.saveUser(updated);
        return updated;
      }
      return u;
    }));

    const resolvedReq: CommitteeEvictionRequest = {
      ...req,
      status: 'approved',
      resolvedAt: Date.now(),
      resolvedByUserId: currentUser.uid,
      resolvedByDisplayName: currentUser.displayName
    };
    setEvictionRequests(prev => prev.map(r => r.id === requestId ? resolvedReq : r));
    clubStore.saveEviction(resolvedReq);

    sounds.playFanfare();
    alert(`Confirmed: ${req.targetDisplayName} has been removed from Committee (2nd approval verified).`);
  };

  const handleRejectEvictionFromCommittee = (requestId: string) => {
    setEvictionRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const updated = { ...r, status: 'rejected' as const, resolvedAt: Date.now() };
        clubStore.saveEviction(updated);
        return updated;
      }
      return r;
    }));
  };

  
  const handleDeleteUserPermanently = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.uid !== userId));
    await clubStore.deleteUser(userId);
  };

  const handleEvictFromClub = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === userId) {
        const updated = { ...u, status: 'evicted' as const };
        clubStore.saveUser(updated);
        return updated;
      }
      return u;
    }));
  };

  const handleReinstateToClub = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === userId) {
        const updated = { ...u, status: 'active' as const };
        clubStore.saveUser(updated);
        return updated;
      }
      return u;
    }));
  };

  // Progress Logging
  const handleLogEvidence = async (
    badgeId: string,
    requirementId: string,
    countDelta: number,
    text?: string,
    mandatoryPhoto?: File,
    optionalPhotos?: File[]
  ) => {
    if (!currentUser) {
      alert('Please sign in to log badge progress!');
      return;
    }

    // 1. Upload & compress proof photos to Cloud Storage
    let mandatoryPhotoUrl: string | undefined = undefined;
    if (mandatoryPhoto) {
      mandatoryPhotoUrl = await clubStore.uploadEvidenceImage(mandatoryPhoto, currentUser.uid, badgeId);
    }

    const optionalPhotoUrls: string[] = [];
    if (optionalPhotos && optionalPhotos.length > 0) {
      for (const p of optionalPhotos) {
        const u = await clubStore.uploadEvidenceImage(p, currentUser.uid, badgeId);
        optionalPhotoUrls.push(u);
      }
    }

    const targetBadge = badges.find(b => b.id === badgeId);
    if (!targetBadge) return;

    const { updatedProgress: updatedBadgeProg, event } = recordEvidence(
      targetBadge,
      userProgress[badgeId],
      {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        requirementId,
        countDelta,
        text,
        mandatoryPhotoUrl,
        optionalPhotoUrls
      },
      upgradeTiers.length
    );

    if (event === 'awarded') {
      sounds.playFanfare();
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

      // Emit badge_awarded activity optimistically and to cloud
      recordAndDispatchActivity({
        type: 'badge_awarded',
        timestamp: Date.now(),
        actorUserId: currentUser.uid,
        actorDisplayName: currentUser.displayName,
        actorAvatarUrl: currentUser.avatarUrl,
        targetBadgeId: targetBadge.id,
        targetBadgeTitle: targetBadge.title,
        targetBadgeIcon: targetBadge.iconName,
        targetBadgeImageUrl: targetBadge.imageUrl,
        details: {
          awardCount: updatedBadgeProg.awardedCount,
          upgradeTier: updatedBadgeProg.upgradeTier,
          category: targetBadge.category,
          summary: updatedBadgeProg.upgradeTier && updatedBadgeProg.upgradeTier > 1
            ? `Achieved Tier ${updatedBadgeProg.upgradeTier} border!`
            : updatedBadgeProg.awardedCount && updatedBadgeProg.awardedCount > 1
              ? `Earned x${updatedBadgeProg.awardedCount} multiplier!`
              : 'Earned and unlocked badge!'
        }
      });
    }

    // 2. Persist to Cloud Firestore in named database
    await clubStore.saveProgress(updatedBadgeProg);

    // 3. Update local state
    setUserProgress(prev => ({
      ...prev,
      [badgeId]: updatedBadgeProg
    }));

    setInspectingBadge(null);
  };

  const handleSubmitNomination = (badgeId: string, nomineeUserId: string, reason: string) => {
    if (!currentUser) return;
    const nominee = users.find(u => u.uid === nomineeUserId);
    const committeeCount = users.filter(u => u.role === 'committee' || u.role === 'admin').length;

    const newNom: Nomination = {
      id: 'nom_' + Date.now(),
      badgeId,
      nomineeUserId,
      nominatorUserId: currentUser.uid,
      nomineeDisplayName: nominee?.displayName || 'Friend',
      nominatorDisplayName: currentUser.displayName,
      reason,
      status: 'pending',
      createdAt: Date.now(),
      votes: {
        [currentUser.uid]: { vote: 'approve', timestamp: Date.now() }
      },
      requiredVotes: Math.ceil(committeeCount / 2)
    };

    setNominations(prev => [newNom, ...prev]);
    clubStore.saveNomination(newNom);
    alert('Nomination submitted! The Committee will review and vote.');
  };

  const handleCastVote = (nominationId: string, vote: 'approve' | 'reject', comment?: string) => {
    if (!currentUser) return;
    setNominations(prev => prev.map(nom => {
      if (nom.id !== nominationId) return nom;
      const updatedVotes = {
        ...nom.votes,
        [currentUser.uid]: { vote, comment, timestamp: Date.now() }
      };

      const approveCount = Object.values(updatedVotes).filter(v => v.vote === 'approve').length;
      let newStatus = nom.status;
      if (approveCount >= nom.requiredVotes) {
        newStatus = 'approved';
        sounds.playFanfare();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

        const targetBadge = badges.find(b => b.id === nom.badgeId);
        if (targetBadge) {
          const { updatedProgress: updatedNomineeProg } = awardFromNomination(
            targetBadge,
            userProgress[nom.badgeId],
            nom.id,
            nom.nomineeUserId,
            Date.now(),
            upgradeTiers.length
          );
          clubStore.saveProgress(updatedNomineeProg);
          setUserProgress(curr => ({
            ...curr,
            [nom.badgeId]: updatedNomineeProg
          }));

          const nominee = users.find(u => u.uid === nom.nomineeUserId);
          recordAndDispatchActivity({
            type: 'badge_awarded',
            timestamp: Date.now(),
            actorUserId: nom.nomineeUserId,
            actorDisplayName: nom.nomineeDisplayName,
            actorAvatarUrl: nominee?.avatarUrl,
            targetBadgeId: targetBadge.id,
            targetBadgeTitle: targetBadge.title,
            targetBadgeIcon: targetBadge.iconName,
            targetBadgeImageUrl: targetBadge.imageUrl,
            details: {
              awardCount: updatedNomineeProg.awardedCount,
              upgradeTier: updatedNomineeProg.upgradeTier,
              category: targetBadge.category,
              summary: 'Awarded by Committee vote from peer nomination!'
            }
          });
        }
      }

      return {
        ...nom,
        status: newStatus,
        votes: updatedVotes
      };
    }));
  };

  const earntBadgeIds = new Set(
    Object.entries(userProgress)
      .filter(([, p]) => p.status === 'awarded')
      .map(([bId]) => bId)
  );

  const totalBadgesCount = badges.length;
  const earntBadgesCount = badges.filter(b => earntBadgeIds.has(b.id)).length;
  const notAwardedBadgesCount = totalBadgesCount - earntBadgesCount;

  const filteredBadges = badges.filter(b => {
    const isAwarded = earntBadgeIds.has(b.id);
    if (statusFilter === 'earnt' && !isAwarded) return false;
    if (statusFilter === 'not_awarded' && isAwarded) return false;
    if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
    return true;
  });

  
  // Real-time Firestore Cloud Synchronization
  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.log('[Firestore] Firebase not configured, staying in local storage mode.');
      return;
    }

    console.log('[Firestore] Connecting real-time listeners for Climbing Badges...');
    let activeSubscriptions = true;

    const unsubBadges = clubStore.subscribeBadges(
      (cloudBadges) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setBadges(cloudBadges);
      },
      INITIAL_BADGES,
      () => setIsCloudConnected(false)
    );

    const unsubTiers = clubStore.subscribeUpgradeTiers(
      (cloudTiers) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setUpgradeTiers(cloudTiers);
      },
      INITIAL_UPGRADE_TIERS,
      () => setIsCloudConnected(false)
    );

    const unsubUsers = clubStore.subscribeUsers(
      (cloudUsers) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setUsers(migrateAvatars(cloudUsers));
      },
      MOCK_USERS,
      () => setIsCloudConnected(false)
    );

    const unsubNoms = clubStore.subscribeNominations(
      (cloudNoms) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setNominations(cloudNoms);
      }
    );

    const unsubEvict = clubStore.subscribeEvictions(
      (cloudEvicts) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setEvictionRequests(cloudEvicts);
      }
    );

    const unsubActs = clubStore.subscribeActivities(
      (cloudActs) => {
        if (!activeSubscriptions) return;
        setActivities(prev => {
          if (cloudActs.length === 0 && prev.length === 0) {
            const backfilled = generateHistoricalActivities(badges, users, userProgress);
            backfilled.slice(0, 15).forEach(a => clubStore.recordActivity(a));
            return backfilled;
          }
          return mergeAndDeduplicateActivities(prev, cloudActs);
        });
      },
      (err) => {
        console.warn('[Feed] Operating with local activity cache:', err.message);
        setActivities(prev => {
          if (prev.length === 0) {
            return generateHistoricalActivities(badges, users, userProgress);
          }
          return prev;
        });
      }
    );

    return () => {
      activeSubscriptions = false;
      unsubBadges();
      unsubTiers();
      unsubUsers();
      unsubNoms();
      unsubEvict();
      unsubActs();
    };
  }, []);

  // Ensure activities are seeded on first load if empty
  useEffect(() => {
    if (activities.length === 0 && (badges.length > 0 || users.length > 0)) {
      const historical = generateHistoricalActivities(badges, users, userProgress);
      if (historical.length > 0) {
        setActivities(historical);
        historical.slice(0, 15).forEach(a => clubStore.recordActivity(a));
      }
    }
  }, [badges.length, users.length]);


  // Real-time synchronization of active user's badge progress from Cloud Firestore
  useEffect(() => {
    if (!currentUserId) {
      // Do not wipe local progress on mount before auth resolves
      return;
    }

    console.log('[Sync] Subscribing to Cloud Firestore progress for user:', currentUserId);
    const unsub = clubStore.subscribeUserProgress(
      currentUserId,
      (cloudProg) => {
        console.log(`[Sync] Real-time cloud progress loaded for ${currentUserId}: ${Object.keys(cloudProg).length} items`);
        setUserProgress(prev => {
          const merged = { ...prev, ...cloudProg };
          localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(merged));
          return merged;
        });
      }
    );

    return () => unsub();
  }, [currentUserId]);

  const committeeMembers = users.filter(u => u.role === 'committee' || u.role === 'admin');
  const pendingEvictions = evictionRequests.filter(r => r.status === 'pending');

  return (
    <div style={{ minHeight: '100vh', padding: '16px' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLoginClick={handleGoogleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isOnline={isOnline}
        pendingReviewsCount={nominations.filter(n => n.status === 'pending').length}
        pendingEvictionsCount={pendingEvictions.length}
        isCloudConnected={isCloudConnected}
      />

      <main style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Tab 1: Badges Explore */}
        {activeTab === 'badges' && (
          <div>
            <BadgeFilters
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              statusFilter={statusFilter}
              onSelectStatus={setStatusFilter}
              totalBadgesCount={totalBadgesCount}
              earntBadgesCount={earntBadgesCount}
              notAwardedBadgesCount={notAwardedBadgesCount}
              filteredCount={filteredBadges.length}
            />

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20
            }}>
              {filteredBadges.map(badge => {
                const prog = userProgress[badge.id];
                const awarded = currentUser ? users.filter(u => u.uid === currentUser.uid) : [];

                return (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    progress={prog}
                    awardedUsers={prog?.status === 'awarded' ? awarded : []}
                    upgradeTiers={upgradeTiers}
                    onOpenDetails={b => setInspectingBadge(b)}
                    onNominate={b => setNominatingBadge(b)}
                    onShare={b => setSharingBadge(b)}
                  />
                );
              })}
            </div>
          </div>
        )}

        
        {/* Tab 2: My Badges */}
        {activeTab === 'my-badges' && (
          currentUser ? (
            <MyBadges
              user={currentUser}
              badges={badges}
              userProgress={userProgress}
              upgradeTiers={upgradeTiers}
              onSelectBadge={b => setInspectingBadge(b)}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 480, margin: '40px auto', borderRadius: 'var(--radius-lg)' }}>
              <Award size={48} color="var(--amber-campfire)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>My Badges</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
                Sign in with Google to view and showcase your verified club badges and earned achievements.
              </p>
              <button
                onClick={handleGoogleSignIn}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-full)',
                  background: '#fff',
                  border: 'none',
                  color: '#1f2937',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )
        )}

        {/* Tab 3: Activity & News Feed */}
        {activeTab === 'feed' && (
          <ActivityFeed
            activities={activities}
            badges={badges}
            upgradeTiers={upgradeTiers}
            onSelectBadge={b => setInspectingBadge(b)}
          />
        )}

        {/* Tab 2: Reviews & Votes */}
        {activeTab === 'reviews' && (
          <ReviewQueue
            nominations={nominations}
            badges={badges}
            committeeMembers={committeeMembers}
            currentUser={currentUser}
            onCastVote={handleCastVote}
            onAddCommitteeMember={u => handlePromoteToCommittee(u.uid)}
            onRemoveCommitteeMember={uid => {
              const u = users.find(usr => usr.uid === uid);
              if (u) handleRequestEvictFromCommittee(u, 'Removed from Committee via review screen');
            }}
            allUsers={users}
          />
        )}

        {/* Tab 4: Badge Management (Admin Tools) */}
        {activeTab === 'badge-mgmt' && (
          isCommittee ? (
            <BadgeManagement
              badges={badges}
              onSaveBadge={handleSaveBadge}
              onDeleteBadge={handleDeleteBadge}
              onToggleActive={handleToggleActiveBadge}
              onForceSync={handleForceSyncBadges}
            />
          ) : (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: 6 }}>Access Restricted</h3>
              <p style={{ color: 'var(--text-muted)' }}>Badge Management is restricted to Committee & Admin members.</p>
            </div>
          )
        )}

        {/* Tab 5: User Management (Admin Tools) */}
        {activeTab === 'user-mgmt' && currentUser && (
          isCommittee ? (
            <UserManagement
              users={users}
              currentUser={currentUser}
              evictionRequests={evictionRequests}
              onPromoteToCommittee={handlePromoteToCommittee}
              onRequestEvictFromCommittee={handleRequestEvictFromCommittee}
              onApproveEvictionFromCommittee={handleApproveEvictionFromCommittee}
              onRejectEvictionFromCommittee={handleRejectEvictionFromCommittee}
              onEvictFromClub={handleEvictFromClub}
            onDeleteUser={handleDeleteUserPermanently}
              onReinstateToClub={handleReinstateToClub}
              onOpenCreateUserModal={() => {
                setCreateUserRoleAllowed(true);
                setShowCreateUserModal(true);
              }}
            />
          ) : (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: 6 }}>Access Restricted</h3>
              <p style={{ color: 'var(--text-muted)' }}>User Management is restricted to Committee & Admin members.</p>
            </div>
          )
        )}

        {/* Tab 6: Upgrade Color Tiers Management */}
        {activeTab === 'upgrade-tiers' && (
          isCommittee ? (
            <UpgradeTierManagement
              tiers={upgradeTiers}
              onSaveTiers={(newTiers) => {
                setUpgradeTiers(newTiers);
                newTiers.forEach(t => clubStore.saveUpgradeTier(t));
              }}
            />
          ) : (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: 6 }}>Access Restricted</h3>
              <p style={{ color: 'var(--text-muted)' }}>Upgrade Tier Management is restricted to Committee & Admin members.</p>
            </div>
          )
        )}

        {/* Tab 7: Profile */}
        {activeTab === 'profile' && (
          currentUser ? (
            <ProfileView
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onResetDefaults={handleResetToDefaults}
              isCommittee={isCommittee}
              onSignOut={handleSignOut}
            />
          ) : (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 480, margin: '40px auto', borderRadius: 'var(--radius-lg)' }}>
              <User size={48} color="var(--amber-campfire)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 8 }}>Club Profile</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
                Sign in with Google to customize your display name, choose an avatar, and track your accomplishments.
              </p>
              <button
                onClick={handleGoogleSignIn}
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-full)',
                  background: '#fff',
                  border: 'none',
                  color: '#1f2937',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )
        )}
      </main>

      <CreateAccountModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onCreateUser={handleCreateUser}
        allowRoleSelection={createUserRoleAllowed}
      />

      <BadgeDetailModal
        badge={inspectingBadge}
        progress={inspectingBadge ? userProgress[inspectingBadge.id] : undefined}
        currentUser={currentUser}
        onClose={() => setInspectingBadge(null)}
        onNominate={b => setNominatingBadge(b)}
        onLogEvidence={handleLogEvidence}
        onSignIn={handleGoogleSignIn}
      />

      <NominateModal
        badge={nominatingBadge}
        currentUser={currentUser}
        users={users}
        onClose={() => setNominatingBadge(null)}
        onSubmitNomination={handleSubmitNomination}
        onSignIn={handleGoogleSignIn}
      />

      <ShareCardModal
        badge={sharingBadge}
        user={currentUser || MOCK_USERS[0]}
        onClose={() => setSharingBadge(null)}
      />

      
    </div>
  );
}
export default App;
