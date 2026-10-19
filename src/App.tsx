import { CreateAccountModal } from './components/auth/CreateAccountModal';
import {
  subscribeToBadges, cloudSaveBadge, cloudDeleteBadge, cloudForceSyncAllBadges,
  subscribeToUpgradeTiers, cloudSaveUpgradeTier,
  subscribeToUsers, cloudSaveUser,
  subscribeToNominations, cloudSaveNomination,
  subscribeToEvictions, cloudSaveEviction,
  subscribeToUserProgress, cloudSaveProgress
} from './services/firestoreSync';
import { isFirebaseConfigured } from './services/firebase';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/common/Navbar';
import type { TabKey } from './components/common/Navbar';
import { BadgeCard } from './components/badges/BadgeCard';
import { BadgeDetailModal } from './components/badges/BadgeDetailModal';
import { PatchJacket } from './components/badges/PatchJacket';
import { ShareCardModal } from './components/badges/ShareCardModal';
import { ReviewQueue } from './components/committee/ReviewQueue';
import { NominateModal } from './components/nominations/NominateModal';
import { BadgeManagement } from './components/management/BadgeManagement';
import { UserManagement } from './components/management/UserManagement';
import { UpgradeTierManagement } from './components/management/UpgradeTierManagement';
import { ProfileView } from './components/profile/ProfileView';

import { INITIAL_BADGES, MOCK_USERS, INITIAL_EVICTION_REQUESTS, INITIAL_UPGRADE_TIERS } from './services/mockData';
import type { Badge, UserBadgeProgress, UserProfile, Nomination, CommitteeEvictionRequest, UpgradeTier } from './types';
import { addQueueItem, getQueueItems } from './services/offlineQueue';
import { sounds } from './services/audio';

// LocalStorage Persistence Keys
const STORAGE_KEYS = {
  BADGES: 'climbing_badges_list',
  USERS: 'climbing_users_list',
  CURRENT_USER_ID: 'climbing_current_user_id',
  PROGRESS: 'climbing_user_progress',
  NOMINATIONS: 'climbing_nominations',
  EVICTIONS: 'climbing_evictions',
  TIERS: 'climbing_upgrade_tiers'
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

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('badges');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // 1. Persistent Users & Active Account
  const [users, setUsers] = useState<UserProfile[]>(() => 
    loadFromStorage<UserProfile[]>(STORAGE_KEYS.USERS, MOCK_USERS)
  );
  
  const [currentUserId, setCurrentUserId] = useState<string>(() => 
    loadFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-chris')
  );

  const currentUser = users.find(u => u.uid === currentUserId) || users[0] || null;

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
    loadFromStorage<Record<string, UserBadgeProgress>>(STORAGE_KEYS.PROGRESS, {
      'a1b2c3d4-0001-4000-8000-000000000001': {
        id: 'user-chris_early-riser',
        userId: 'user-chris',
        badgeId: 'a1b2c3d4-0001-4000-8000-000000000001',
        status: 'awarded',
        awardedCount: 3,
        progress: {
          'out-of-bed-first': { requirementId: 'out-of-bed-first', currentCount: 1, completed: true, evidenceLogs: [] }
        },
        awardedAt: Date.now() - 500000
      },
      'a1b2c3d4-0002-4000-8000-000000000002': {
        id: 'user-chris_proficient-cleaner',
        userId: 'user-chris',
        badgeId: 'a1b2c3d4-0002-4000-8000-000000000002',
        status: 'awarded',
        upgradeTier: 2,
        progress: {
          'clean-method-a': { requirementId: 'clean-method-a', currentCount: 5, completed: true, evidenceLogs: [] },
          'clean-method-b': { requirementId: 'clean-method-b', currentCount: 3, completed: true, evidenceLogs: [] },
          'clean-adverse': { requirementId: 'clean-adverse', currentCount: 1, completed: true, evidenceLogs: [] }
        },
        awardedAt: Date.now() - 200000
      }
    })
  );

  // 5. Persistent Nominations
  const [nominations, setNominations] = useState<Nomination[]>(() => 
    loadFromStorage<Nomination[]>(STORAGE_KEYS.NOMINATIONS, [
      {
        id: 'nom-1',
        badgeId: 'a1b2c3d4-0004-4000-8000-000000000004',
        nomineeUserId: 'user-taylor',
        nominatorUserId: 'user-sam',
        nomineeDisplayName: 'Taylor "CampChef" W.',
        nominatorDisplayName: 'Sam "BelaySlave" P.',
        reason: 'Bailed off pitch 4 of the directissima when dark clouds rolled in. Made hot coco instead. Excellent call!',
        status: 'pending',
        createdAt: Date.now() - 3600000,
        votes: {
          'user-sam': { vote: 'approve', timestamp: Date.now() - 3000000 }
        },
        requiredVotes: 2
      }
    ])
  );

  // 6. Persistent Eviction Requests
  const [evictionRequests, setEvictionRequests] = useState<CommitteeEvictionRequest[]>(() => 
    loadFromStorage<CommitteeEvictionRequest[]>(STORAGE_KEYS.EVICTIONS, INITIAL_EVICTION_REQUESTS)
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

  // Modals state
  const [inspectingBadge, setInspectingBadge] = useState<Badge | null>(null);
  const [nominatingBadge, setNominatingBadge] = useState<Badge | null>(null);
  const [sharingBadge, setSharingBadge] = useState<Badge | null>(null);
  const [showCallsignModal, setShowCallsignModal] = useState<boolean>(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState<boolean>(false);
  const [createUserRoleAllowed, setCreateUserRoleAllowed] = useState<boolean>(false);
  const [customCallsign, setCustomCallsign] = useState<string>('');

  const isCommittee = currentUser?.role === 'admin' || currentUser?.role === 'committee';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getQueueItems().then(items => setPendingOfflineCount(items.length));

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
    cloudSaveUser(updatedUser);
  };


  const handleForceSyncBadges = async () => {
    const count = await cloudForceSyncAllBadges(badges, users, userProgress);
    alert(`Successfully synced ${count} badges, ${users.length} user accounts, and all progress to Firebase Database!`);
  };

  
  const handleCreateUser = async (newUser: UserProfile, switchToUser: boolean) => {
    // 1. Add to local React state
    setUsers(prev => [newUser, ...prev]);

    // 2. Upload and persist in Firestore cb_users
    await cloudSaveUser(newUser);

    // 3. Switch active user if requested
    if (switchToUser) {
      setCurrentUserId(newUser.uid);
      sounds.playFanfare();
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
    }
    alert(`Welcome to Safe Climbing Club, ${newUser.displayName}! Account saved to database.`);
  };

  const handleSaveBadge = async (badge: Badge) => {
    // 1. Update React state immediately by matching UUID
    setBadges(prev => {
      const exists = prev.some(b => b.id === badge.id);
      if (exists) {
        return prev.map(b => b.id === badge.id ? badge : b);
      }
      return [badge, ...prev];
    });

    // 2. Persist update in Firestore database & persistent cache by UUID
    const success = await cloudSaveBadge(badge);
    if (success) {
      console.log(`[App] Badge update persisted to Firestore DB: ${badge.title} (${badge.id})`);
    }
  };

  const handleDeleteBadge = (badgeId: string) => {
    const targetBadge = badges.find(b => b.id === badgeId);
    setBadges(prev => prev.filter(b => b.id !== badgeId));
    cloudDeleteBadge(badgeId, targetBadge?.imageUrl);
  };

  const handleToggleActiveBadge = (badgeId: string) => {
    setBadges(prev => prev.map(b => {
      if (b.id === badgeId) {
        const updated = { ...b, isActive: !b.isActive };
        cloudSaveBadge(updated);
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
        cloudSaveUser(updated);
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
    cloudSaveEviction(newReq);
    alert('Eviction request created. A second Committee member must approve to complete the removal.');
  };

  const handleApproveEvictionFromCommittee = (requestId: string) => {
    if (!currentUser) return;
    const req = evictionRequests.find(r => r.id === requestId);
    if (!req) return;

    setUsers(prev => prev.map(u => {
      if (u.uid === req.targetUserId) {
        const updated = { ...u, role: 'member' as const };
        cloudSaveUser(updated);
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
    cloudSaveEviction(resolvedReq);

    sounds.playFanfare();
    alert(`Confirmed: ${req.targetDisplayName} has been removed from Committee (2nd approval verified).`);
  };

  const handleRejectEvictionFromCommittee = (requestId: string) => {
    setEvictionRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const updated = { ...r, status: 'rejected' as const, resolvedAt: Date.now() };
        cloudSaveEviction(updated);
        return updated;
      }
      return r;
    }));
  };

  const handleEvictFromClub = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === userId) {
        const updated = { ...u, status: 'evicted' as const };
        cloudSaveUser(updated);
        return updated;
      }
      return u;
    }));
  };

  const handleReinstateToClub = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === userId) {
        const updated = { ...u, status: 'active' as const };
        cloudSaveUser(updated);
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
    if (!currentUser) return;

    const photoNames = [
      mandatoryPhoto ? mandatoryPhoto.name : null,
      ...(optionalPhotos ? optionalPhotos.map(p => p.name) : [])
    ].filter(Boolean);

    if (!isOnline) {
      await addQueueItem({
        type: 'log_evidence',
        payload: { badgeId, requirementId, countDelta, text, photoNames }
      });
      const q = await getQueueItems();
      setPendingOfflineCount(q.length);
      alert('Saved to Crag Offline Queue! Will auto-sync when you regain reception.');
    }

    setUserProgress(prev => {
      const existing = prev[badgeId] || {
        id: `${currentUser.uid}_${badgeId}`,
        userId: currentUser.uid,
        badgeId,
        status: 'in_progress',
        progress: {},
        awardedCount: 0,
        upgradeTier: 1
      };

      const reqProg = existing.progress[requirementId] || {
        requirementId,
        currentCount: 0,
        completed: false,
        evidenceLogs: []
      };

      const newCount = reqProg.currentCount + countDelta;
      const targetBadge = badges.find(b => b.id === badgeId);
      const reqDef = targetBadge?.requirements.find(r => r.id === requirementId);
      const isReqDone = targetBadge ? newCount >= (reqDef?.targetCount || 1) : false;

      const mockMandatoryUrl = mandatoryPhoto ? URL.createObjectURL(mandatoryPhoto) : undefined;
      const mockOptionalUrls = optionalPhotos ? optionalPhotos.map(f => URL.createObjectURL(f)) : [];

      const updatedReqProg = {
        ...reqProg,
        currentCount: newCount,
        completed: isReqDone,
        evidenceLogs: [
          ...reqProg.evidenceLogs,
          {
            id: 'log_' + Date.now(),
            timestamp: Date.now(),
            countDelta,
            text,
            mandatoryPhotoUrl: mockMandatoryUrl,
            optionalPhotoUrls: mockOptionalUrls,
            photoUrls: [mockMandatoryUrl, ...mockOptionalUrls].filter(Boolean) as string[],
            recordedBy: currentUser.displayName
          }
        ]
      };

      const updatedProgressMap = {
        ...existing.progress,
        [requirementId]: updatedReqProg
      };

      let allCompleted = false;
      if (targetBadge) {
        allCompleted = targetBadge.requirements.every(req => {
          const p = updatedProgressMap[req.id];
          return p && p.currentCount >= req.targetCount;
        });
      }

      let newStatus = existing.status;
      let newAwardedCount = existing.awardedCount || 0;
      let newUpgradeTier = existing.upgradeTier || 1;

      if (allCompleted) {
        if (targetBadge?.approvalMode === 'self') {
          newStatus = 'awarded';
          sounds.playFanfare();
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

          if (targetBadge.awardType === 'repeatable') {
            newAwardedCount = Math.max(1, newAwardedCount) + 1;
          } else if (targetBadge.awardType === 'upgradable') {
            newUpgradeTier = Math.min(upgradeTiers.length, (existing.upgradeTier || 1) + 1);
          } else {
            newAwardedCount = 1;
          }
        } else {
          newStatus = 'pending_review';
        }
      }

      const updatedBadgeProg: UserBadgeProgress = {
        ...existing,
        status: newStatus,
        progress: updatedProgressMap,
        awardedCount: newAwardedCount,
        upgradeTier: newUpgradeTier,
        awardedAt: newStatus === 'awarded' ? Date.now() : existing.awardedAt
      };
      cloudSaveProgress(updatedBadgeProg);
      return {
        ...prev,
        [badgeId]: updatedBadgeProg
      };
    });

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
    cloudSaveNomination(newNom);
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
        const existingNomineeProg = userProgress[nom.badgeId];
        const newCount = targetBadge?.awardType === 'repeatable' ? (existingNomineeProg?.awardedCount || 1) + 1 : 1;
        const newTier = targetBadge?.awardType === 'upgradable' ? Math.min(upgradeTiers.length, (existingNomineeProg?.upgradeTier || 1) + 1) : 1;

        const updatedNomineeProg: UserBadgeProgress = {
          id: `${nom.nomineeUserId}_${nom.badgeId}`,
          userId: nom.nomineeUserId,
          badgeId: nom.badgeId,
          status: 'awarded',
          awardedCount: newCount,
          upgradeTier: newTier,
          progress: {},
          awardedAt: Date.now(),
          nominationId: nom.id
        };
        cloudSaveProgress(updatedNomineeProg);
        setUserProgress(curr => ({
          ...curr,
          [nom.badgeId]: updatedNomineeProg
        }));
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
      .filter(([_, p]) => p.status === 'awarded')
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

    const unsubBadges = subscribeToBadges(
      (cloudBadges) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setBadges(cloudBadges);
      },
      INITIAL_BADGES,
      () => setIsCloudConnected(false)
    );

    const unsubTiers = subscribeToUpgradeTiers(
      (cloudTiers) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setUpgradeTiers(cloudTiers);
      },
      INITIAL_UPGRADE_TIERS,
      () => setIsCloudConnected(false)
    );

    const unsubUsers = subscribeToUsers(
      (cloudUsers) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setUsers(cloudUsers);
      },
      MOCK_USERS,
      () => setIsCloudConnected(false)
    );

    const unsubNoms = subscribeToNominations(
      (cloudNoms) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setNominations(cloudNoms);
      },
      [],
      () => setIsCloudConnected(false)
    );

    const unsubEvict = subscribeToEvictions(
      (cloudEvicts) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setEvictionRequests(cloudEvicts);
      },
      INITIAL_EVICTION_REQUESTS,
      () => setIsCloudConnected(false)
    );

    const unsubProg = subscribeToUserProgress(
      currentUserId,
      (cloudProg) => {
        if (!activeSubscriptions) return;
        setIsCloudConnected(true);
        setUserProgress(prev => ({ ...prev, ...cloudProg }));
      },
      userProgress,
      () => setIsCloudConnected(false)
    );

    return () => {
      activeSubscriptions = false;
      unsubBadges();
      unsubTiers();
      unsubUsers();
      unsubNoms();
      unsubEvict();
      unsubProg();
    };
  }, []);

  const committeeMembers = users.filter(u => u.role === 'committee' || u.role === 'admin');
  const pendingEvictions = evictionRequests.filter(r => r.status === 'pending');

  return (
    <div style={{ minHeight: '100vh', padding: '16px' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLoginClick={() => setShowCallsignModal(true)}
        isOnline={isOnline}
        pendingOfflineCount={pendingOfflineCount}
        pendingReviewsCount={nominations.filter(n => n.status === 'pending').length}
        pendingEvictionsCount={pendingEvictions.length}
        isCloudConnected={isCloudConnected}
      />

      <main style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Tab 1: Badges Explore */}
        {activeTab === 'badges' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {/* Status Filters: All / Earnt / Not yet awarded */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status:
                </span>
                {[
                  { key: 'all', label: 'All', count: totalBadgesCount },
                  { key: 'earnt', label: 'Earnt', count: earntBadgesCount },
                  { key: 'not_awarded', label: 'Not yet awarded', count: notAwardedBadgesCount }
                ].map(item => {
                  const isActive = statusFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setStatusFilter(item.key as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        background: isActive ? 'var(--amber-campfire)' : 'var(--bg-surface-elevated)',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        border: isActive ? '1px solid var(--amber-glow)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: isActive ? '0 2px 10px rgba(255, 152, 0, 0.3)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
                        color: isActive ? '#fff' : 'var(--text-faint)'
                      }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Category Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category:
                </span>
                {['all', 'climbing', 'camping', 'life_skills', 'milestone'].map(cat => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat === 'all' ? 'All Categories' : cat === 'life_skills' ? 'Life Skills' : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20
            }}>
              {filteredBadges.map(badge => {
                const prog = userProgress[badge.id];
                const awarded = users.filter(u => u.uid === (currentUser?.uid || 'user-chris'));

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

        {/* Tab 3: Patch Jacket / Sash */}
        {activeTab === 'jacket' && currentUser && (
          <PatchJacket
            user={currentUser}
            badges={badges}
            userProgress={userProgress}
            upgradeTiers={upgradeTiers}
            onSelectBadge={b => setInspectingBadge(b)}
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
                newTiers.forEach(t => cloudSaveUpgradeTier(t));
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
        {activeTab === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            users={users}
            onUpdateProfile={handleUpdateProfile}
            onSwitchUser={(uid) => setCurrentUserId(uid)}
            onResetDefaults={handleResetToDefaults}
            isCommittee={isCommittee}
            onOpenCreateAccount={() => {
              setCreateUserRoleAllowed(false);
              setShowCreateUserModal(true);
            }}
          />
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
      />

      <NominateModal
        badge={nominatingBadge}
        currentUser={currentUser}
        users={users}
        onClose={() => setNominatingBadge(null)}
        onSubmitNomination={handleSubmitNomination}
      />

      <ShareCardModal
        badge={sharingBadge}
        user={currentUser || MOCK_USERS[0]}
        onClose={() => setSharingBadge(null)}
      />

      {showCallsignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="glass-panel" style={{ maxWidth: 440, width: '100%', padding: 26 }}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: 8 }}>Pick Your Crag Callsign</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 18 }}>
              Your email will never be displayed to friends. Choose a nickname or alias for badges and nominations.
            </p>
            <input 
              type="text" 
              placeholder="e.g. Chris Granite"
              value={customCallsign}
              onChange={e => setCustomCallsign(e.target.value)}
              style={{ width: '100%', marginBottom: 16 }}
            />
            <button
              onClick={() => {
                if (customCallsign.trim() && currentUser) {
                  setUsers(prev => prev.map(u => u.uid === currentUser.uid ? { ...u, displayName: customCallsign } : u));
                }
                setShowCallsignModal(false);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--amber-campfire)',
                color: '#fff',
                fontWeight: 700
              }}
            >
              Set Callsign & Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
