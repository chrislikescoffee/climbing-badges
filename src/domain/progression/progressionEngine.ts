import type {
  Badge,
  BadgeRequirement,
  EvidenceLog,
  RequirementProgress,
  UserBadgeProgress
} from '../../types';

export interface EvidenceSubmission {
  userId: string;
  userName: string;
  requirementId: string;
  countDelta: number;
  text?: string;
  mandatoryPhotoUrl?: string;
  optionalPhotoUrls?: string[];
  timestamp?: number;
}

export type ProgressionEvent = 'progressed' | 'pending_review' | 'awarded';

export interface ProgressionResult {
  updatedProgress: UserBadgeProgress;
  event: ProgressionEvent;
}

/**
 * Pure progression engine module.
 * Encapsulates requirement tracking, status state transitions, and award cycle advancement.
 */
export function recordEvidence(
  badge: Badge,
  currentProgress: UserBadgeProgress | undefined,
  submission: EvidenceSubmission,
  maxTiers: number = 5
): ProgressionResult {
  const now = submission.timestamp ?? Date.now();

  const existing: UserBadgeProgress = currentProgress ?? {
    id: `${submission.userId}_${badge.id}`,
    userId: submission.userId,
    badgeId: badge.id,
    status: 'in_progress',
    progress: {},
    awardedCount: 0,
    upgradeTier: 1,
    awardHistory: []
  };

  const reqProg: RequirementProgress = existing.progress[submission.requirementId] ?? {
    requirementId: submission.requirementId,
    currentCount: 0,
    completed: false,
    evidenceLogs: []
  };

  const newCount = reqProg.currentCount + submission.countDelta;
  const safeReqs = Array.isArray(badge.requirements) ? badge.requirements : [];
  const targetReq = safeReqs.find(r => r.id === submission.requirementId);
  const targetCount = targetReq?.targetCount ?? 1;
  const isReqDone = newCount >= targetCount;

  const allPhotos = [
    submission.mandatoryPhotoUrl,
    ...(submission.optionalPhotoUrls ?? [])
  ].filter(Boolean) as string[];

  const newLog: EvidenceLog = {
    id: 'log_' + now + '_' + Math.random().toString(36).slice(2, 6),
    timestamp: now,
    countDelta: submission.countDelta,
    text: submission.text?.trim() || '',
    mandatoryPhotoUrl: submission.mandatoryPhotoUrl || '',
    optionalPhotoUrls: submission.optionalPhotoUrls || [],
    photoUrls: allPhotos,
    recordedBy: submission.userName
  };

  const updatedReqProg: RequirementProgress = {
    ...reqProg,
    currentCount: newCount,
    completed: isReqDone,
    evidenceLogs: [...reqProg.evidenceLogs, newLog]
  };

  const updatedProgressMap: Record<string, RequirementProgress> = {
    ...existing.progress,
    [submission.requirementId]: updatedReqProg
  };

  const allCompleted = safeReqs.length > 0 && safeReqs.every(req => {
    const prog = updatedProgressMap[req.id];
    return prog && prog.currentCount >= req.targetCount;
  });

  let newStatus = existing.status;
  let newAwardedCount = existing.awardedCount || 0;
  let newUpgradeTier = existing.upgradeTier || 1;
  let event: ProgressionEvent = 'progressed';
  let nextCycleProgressMap = updatedProgressMap;
  const updatedAwardHistory = [...(existing.awardHistory || [])];

  if (allCompleted) {
    if (badge.approvalMode === 'self') {
      newStatus = 'awarded';
      event = 'awarded';

      if (badge.awardType === 'repeatable') {
        newAwardedCount = Math.max(1, newAwardedCount + 1);
        nextCycleProgressMap = resetRequirementsForNextCycle(badge.requirements, updatedProgressMap);
      } else if (badge.awardType === 'upgradable') {
        newUpgradeTier = Math.min(maxTiers, (existing.upgradeTier || 1) + 1);
        nextCycleProgressMap = resetRequirementsForNextCycle(badge.requirements, updatedProgressMap);
      } else {
        newAwardedCount = 1;
      }

      updatedAwardHistory.push({
        timestamp: now,
        count: newAwardedCount,
        tier: newUpgradeTier
      });
    } else {
      newStatus = 'pending_review';
      event = 'pending_review';
    }
  }

  const updatedProgress: UserBadgeProgress = {
    ...existing,
    status: newStatus,
    progress: nextCycleProgressMap,
    awardedCount: newAwardedCount,
    upgradeTier: newUpgradeTier,
    awardedAt: newStatus === 'awarded' ? now : existing.awardedAt,
    awardHistory: updatedAwardHistory
  };

  return { updatedProgress, event };
}

/**
 * Handles completing an award cycle following a nomination review approval.
 */
export function awardFromNomination(
  badge: Badge,
  currentProgress: UserBadgeProgress | undefined,
  nominationId: string,
  nomineeUserId: string,
  timestamp: number = Date.now(),
  maxTiers: number = 5
): ProgressionResult {
  const existing: UserBadgeProgress = currentProgress ?? {
    id: `${nomineeUserId}_${badge.id}`,
    userId: nomineeUserId,
    badgeId: badge.id,
    status: 'in_progress',
    progress: {},
    awardedCount: 0,
    upgradeTier: 1,
    awardHistory: []
  };

  const newCount = badge.awardType === 'repeatable' ? (existing.awardedCount || 1) + 1 : 1;
  const newTier = badge.awardType === 'upgradable' ? Math.min(maxTiers, (existing.upgradeTier || 1) + 1) : 1;

  const nextCycleProgressMap = (badge.awardType === 'repeatable' || badge.awardType === 'upgradable')
    ? resetRequirementsForNextCycle(badge.requirements, existing.progress)
    : existing.progress;

  const updatedAwardHistory = [
    ...(existing.awardHistory || []),
    {
      timestamp,
      count: newCount,
      tier: newTier
    }
  ];

  const updatedProgress: UserBadgeProgress = {
    ...existing,
    status: 'awarded',
    awardedCount: newCount,
    upgradeTier: newTier,
    progress: nextCycleProgressMap,
    awardedAt: timestamp,
    nominationId,
    awardHistory: updatedAwardHistory
  };

  return { updatedProgress, event: 'awarded' };
}

/**
 * Resets requirement counters to 0 for the next award cycle while preserving the complete audit history.
 */
function resetRequirementsForNextCycle(
  requirements: BadgeRequirement[],
  progressMap: Record<string, RequirementProgress>
): Record<string, RequirementProgress> {
  const result: Record<string, RequirementProgress> = {};

  for (const req of requirements) {
    const current = progressMap[req.id];
    result[req.id] = {
      requirementId: req.id,
      currentCount: 0,
      completed: false,
      evidenceLogs: current?.evidenceLogs || []
    };
  }

  return result;
}

/**
 * Calculates completion percentage across all requirements.
 */
export function calculateOverallProgressPercentage(
  badge: Badge,
  userProgress?: UserBadgeProgress
): number {
  if (!badge.requirements || badge.requirements.length === 0) return 100;
  if (!userProgress) return 0;
  if (userProgress.status === 'awarded') return 100;

  let totalTarget = 0;
  let totalCurrent = 0;

  for (const req of badge.requirements) {
    const p = userProgress.progress[req.id];
    const current = p ? Math.min(req.targetCount, p.currentCount) : 0;
    totalTarget += req.targetCount;
    totalCurrent += current;
  }

  if (totalTarget === 0) return 0;
  return Math.min(100, Math.round((totalCurrent / totalTarget) * 100));
}
