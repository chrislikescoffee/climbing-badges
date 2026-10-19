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

import { INITIAL_BADGES, MOCK_USERS, INITIAL_EVICTION_REQUESTS } from './services/mockData';
import type { Badge, UserBadgeProgress, UserProfile, Nomination, CommitteeEvictionRequest } from './types';
import { addQueueItem, getQueueItems } from './services/offlineQueue';
import { sounds } from './services/audio';

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('badges');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);

  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MOCK_USERS[0]);

  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [evictionRequests, setEvictionRequests] = useState<CommitteeEvictionRequest[]>(INITIAL_EVICTION_REQUESTS);

  const [userProgress, setUserProgress] = useState<Record<string, UserBadgeProgress>>({
    'early-riser': {
      id: 'user-chris_early-riser',
      userId: 'user-chris',
      badgeId: 'early-riser',
      status: 'awarded',
      progress: {
        'out-of-bed-first': { requirementId: 'out-of-bed-first', currentCount: 1, completed: true, evidenceLogs: [] }
      },
      awardedAt: Date.now() - 500000
    },
    'proficient-cleaner': {
      id: 'user-chris_proficient-cleaner',
      userId: 'user-chris',
      badgeId: 'proficient-cleaner',
      status: 'in_progress',
      progress: {
        'clean-method-a': { requirementId: 'clean-method-a', currentCount: 2, completed: false, evidenceLogs: [] },
        'clean-method-b': { requirementId: 'clean-method-b', currentCount: 1, completed: false, evidenceLogs: [] },
        'clean-adverse': { requirementId: 'clean-adverse', currentCount: 0, completed: false, evidenceLogs: [] }
      }
    }
  });

  const [nominations, setNominations] = useState<Nomination[]>([
    {
      id: 'nom-1',
      badgeId: 'epic-bail',
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
  ]);

  const [inspectingBadge, setInspectingBadge] = useState<Badge | null>(null);
  const [nominatingBadge, setNominatingBadge] = useState<Badge | null>(null);
  const [sharingBadge, setSharingBadge] = useState<Badge | null>(null);
  const [showCallsignModal, setShowCallsignModal] = useState<boolean>(false);
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

  // Badge Management Handlers
  const handleSaveBadge = (badge: Badge) => {
    setBadges(prev => {
      const exists = prev.some(b => b.id === badge.id);
      if (exists) {
        return prev.map(b => b.id === badge.id ? badge : b);
      }
      return [badge, ...prev];
    });
  };

  const handleDeleteBadge = (badgeId: string) => {
    setBadges(prev => prev.filter(b => b.id !== badgeId));
  };

  const handleToggleActiveBadge = (badgeId: string) => {
    setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, isActive: !b.isActive } : b));
  };

  // User Management Handlers
  const handlePromoteToCommittee = (userId: string) => {
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: 'committee' } : u));
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
    alert('Eviction request created. A second Committee member must approve to complete the removal.');
  };

  const handleApproveEvictionFromCommittee = (requestId: string) => {
    if (!currentUser) return;
    const req = evictionRequests.find(r => r.id === requestId);
    if (!req) return;

    setUsers(prev => prev.map(u => u.uid === req.targetUserId ? { ...u, role: 'member' } : u));

    setEvictionRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: 'approved',
      resolvedAt: Date.now(),
      resolvedByUserId: currentUser.uid,
      resolvedByDisplayName: currentUser.displayName
    } : r));

    sounds.playFanfare();
    alert(`Confirmed: ${req.targetDisplayName} has been removed from Committee (2nd approval verified).`);
  };

  const handleRejectEvictionFromCommittee = (requestId: string) => {
    setEvictionRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected', resolvedAt: Date.now() } : r));
  };

  const handleEvictFromClub = (userId: string) => {
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: 'evicted' } : u));
  };

  const handleReinstateToClub = (userId: string) => {
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, status: 'active' } : u));
  };

  // Progress Logging with optional & mandatory photographs
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
        progress: {}
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
      if (allCompleted) {
        if (targetBadge?.approvalMode === 'self') {
          newStatus = 'awarded';
          sounds.playFanfare();
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        } else {
          newStatus = 'pending_review';
        }
      }

      return {
        ...prev,
        [badgeId]: {
          ...existing,
          status: newStatus,
          progress: updatedProgressMap,
          awardedAt: newStatus === 'awarded' ? Date.now() : existing.awardedAt
        }
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

        setUserProgress(curr => ({
          ...curr,
          [nom.badgeId]: {
            id: `${nom.nomineeUserId}_${nom.badgeId}`,
            userId: nom.nomineeUserId,
            badgeId: nom.badgeId,
            status: 'awarded',
            progress: {},
            awardedAt: Date.now(),
            nominationId: nom.id
          }
        }));
      }

      return {
        ...nom,
        status: newStatus,
        votes: updatedVotes
      };
    }));
  };

  const filteredBadges = badges.filter(b => {
    if (selectedCategory === 'all') return true;
    return b.category === selectedCategory;
  });

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
      />

      <main style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Tab 1: Badges Explore */}
        {activeTab === 'badges' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
              {['all', 'climbing', 'camping', 'life_skills', 'milestone'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: selectedCategory === cat ? 'var(--amber-campfire)' : 'var(--bg-surface-elevated)',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {cat === 'all' ? 'All Badges' : cat === 'life_skills' ? 'Life Skills' : cat}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20
            }}>
              {filteredBadges.map(badge => {
                const prog = userProgress[badge.id];
                const awarded = users.filter(u => u.uid === 'user-chris');

                return (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    progress={prog}
                    awardedUsers={prog?.status === 'awarded' ? awarded : []}
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
            onSelectBadge={b => setInspectingBadge(b)}
          />
        )}

        {/* Tab 4: Badge Management (Admin & Committee only) */}
        {activeTab === 'badge-mgmt' && (
          isCommittee ? (
            <BadgeManagement
              badges={badges}
              onSaveBadge={handleSaveBadge}
              onDeleteBadge={handleDeleteBadge}
              onToggleActive={handleToggleActiveBadge}
            />
          ) : (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: 6 }}>Access Restricted</h3>
              <p style={{ color: 'var(--text-muted)' }}>Badge Management is restricted to Committee & Admin members.</p>
            </div>
          )
        )}

        {/* Tab 5: User Management (Admin & Committee only) */}
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
            />
          ) : (
            <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: 6 }}>Access Restricted</h3>
              <p style={{ color: 'var(--text-muted)' }}>User Management is restricted to Committee & Admin members.</p>
            </div>
          )
        )}

        {/* Tab 6: Profile / Callsign Switcher */}
        {activeTab === 'profile' && currentUser && (
          <div className="glass-panel" style={{ maxWidth: 640, margin: '0 auto', padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.displayName}
                style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--amber-campfire)', marginBottom: 12 }}
              />
              <h2 style={{ color: '#fff', fontSize: '1.4rem' }}>{currentUser.displayName}</h2>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6 }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isCommittee ? 'var(--amber-campfire)' : 'var(--text-muted)',
                  background: isCommittee ? 'rgba(255, 152, 0, 0.15)' : 'var(--bg-surface-elevated)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  Role: {currentUser.role}
                </span>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: currentUser.status === 'active' ? 'var(--emerald-moss)' : '#ff6b6b',
                  background: currentUser.status === 'active' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 0, 0, 0.15)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  Status: {currentUser.status}
                </span>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: 18,
              borderRadius: 'var(--radius-md)',
              marginBottom: 20
            }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                Switch Active User (Test Committee vs. Member Permissions)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(u => (
                  <button
                    key={u.uid}
                    onClick={() => setCurrentUser(u)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: currentUser.uid === u.uid ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                      border: currentUser.uid === u.uid ? '1px solid var(--amber-campfire)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#fff',
                      fontSize: '0.88rem'
                    }}
                  >
                    <span>{u.displayName} ({u.role})</span>
                    {currentUser.uid === u.uid && <span style={{ color: 'var(--amber-campfire)', fontWeight: 700 }}>Active</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <BadgeDetailModal
        badge={inspectingBadge}
        progress={inspectingBadge ? userProgress[inspectingBadge.id] : undefined}
        currentUser={currentUser}
        onClose={() => setInspectingBadge(null)}
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
                  setCurrentUser({ ...currentUser, displayName: customCallsign });
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
