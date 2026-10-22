import type { Badge, ClubActivity, UserBadgeProgress, UserProfile } from '../../types';

/**
 * Compares an existing badge with an updated version to generate an informative change summary.
 */
export function describeBadgeChanges(previous: Badge, current: Badge): string {
  const changes: string[] = [];

  if (previous.title !== current.title) {
    changes.push(`Renamed from "${previous.title}"`);
  }
  const prevReqCount = Array.isArray(previous.requirements) ? previous.requirements.length : 0;
  const currReqCount = Array.isArray(current.requirements) ? current.requirements.length : 0;
  if (prevReqCount !== currReqCount) {
    changes.push(`Updated requirements (${currReqCount} total)`);
  }
  if (previous.awardType !== current.awardType) {
    changes.push(`Award type changed to ${current.awardType}`);
  }
  if (previous.imageUrl !== current.imageUrl || previous.iconName !== current.iconName) {
    changes.push('Artwork refreshed');
  }
  if (previous.category !== current.category) {
    changes.push(`Category moved to ${current.category}`);
  }
  if (previous.approvalMode !== current.approvalMode) {
    changes.push(`Approval mode changed to ${current.approvalMode}`);
  }

  if (changes.length === 0) {
    return 'Badge details and description updated';
  }

  return changes.join(' • ');
}

/**
 * Synthesizes historical activities from existing records when an activity feed is initially empty.
 */
export function generateHistoricalActivities(
  badges: Badge[] = [],
  users: UserProfile[] = [],
  progressMap: Record<string, UserBadgeProgress> = {}
): ClubActivity[] {
  const activities: ClubActivity[] = [];

  // 1. User joined events
  (users || []).forEach((u, idx) => {
    if (!u) return;
    activities.push({
      id: `hist_user_${u.uid || idx}`,
      type: 'user_joined',
      timestamp: u.createdAt || (Date.now() - 86400000 * 7),
      actorUserId: u.uid,
      actorDisplayName: u.displayName || 'Club Member',
      actorAvatarUrl: u.avatarUrl,
      details: {
        summary: 'Joined Safe Climbing Club'
      }
    });
  });

  // 2. Badge created events
  (badges || []).forEach((b, idx) => {
    if (!b) return;
    const reqCount = Array.isArray(b.requirements) ? b.requirements.length : 0;
    activities.push({
      id: `hist_badge_${b.id || idx}`,
      type: 'badge_created',
      timestamp: b.createdAt || (Date.now() - 86400000 * 5),
      targetBadgeId: b.id,
      targetBadgeTitle: b.title || 'Climbing Badge',
      targetBadgeIcon: b.iconName,
      targetBadgeImageUrl: b.imageUrl,
      details: {
        category: b.category,
        summary: `Created new badge with ${reqCount} requirement(s)`
      }
    });
  });

  // 3. Awarded badges
  if (progressMap && typeof progressMap === 'object') {
    Object.values(progressMap).forEach((p, idx) => {
      if (p && p.status === 'awarded') {
        const targetBadge = (badges || []).find(b => b && b.id === p.badgeId);
        const user = (users || []).find(u => u && u.uid === p.userId);
        activities.push({
          id: `hist_award_${p.id || p.badgeId || idx}`,
          type: 'badge_awarded',
          timestamp: p.awardedAt || (Date.now() - 86400000 * 2),
          actorUserId: p.userId,
          actorDisplayName: user?.displayName || 'Club Member',
          actorAvatarUrl: user?.avatarUrl,
          targetBadgeId: p.badgeId,
          targetBadgeTitle: targetBadge?.title || 'Climbing Badge',
          targetBadgeIcon: targetBadge?.iconName || 'Award',
          targetBadgeImageUrl: targetBadge?.imageUrl,
          details: {
            awardCount: p.awardedCount,
            upgradeTier: p.upgradeTier,
            category: targetBadge?.category,
            summary: p.upgradeTier && p.upgradeTier > 1 
              ? `Achieved Tier ${p.upgradeTier} border!` 
              : p.awardedCount && p.awardedCount > 1 
                ? `Earned x${p.awardedCount} multiplier!` 
                : 'Earned and unlocked badge!'
          }
        });
      }
    });
  }

  // Return sorted newest first
  return activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

/**
 * Human-friendly relative time string.
 */
export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Merges two lists of activities, deduplicating by unique ID and sorting newest first.
 */
export function mergeAndDeduplicateActivities(
  existing: ClubActivity[] = [],
  incoming: ClubActivity[] = []
): ClubActivity[] {
  const map = new Map<string, ClubActivity>();
  const safeExisting = Array.isArray(existing) ? existing : [];
  const safeIncoming = Array.isArray(incoming) ? incoming : [];

  for (const act of safeExisting) {
    if (act && act.id) map.set(act.id, act);
  }
  for (const act of safeIncoming) {
    if (act && act.id) map.set(act.id, act);
  }
  return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}
