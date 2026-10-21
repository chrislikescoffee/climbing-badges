import { describe, it, expect } from 'vitest';
import {
  recordEvidence,
  awardFromNomination,
  calculateOverallProgressPercentage
} from './progressionEngine';
import type { Badge } from '../../types';

const baseBadge: Badge = {
  id: 'badge-climb-basics',
  title: 'Climbing Basics',
  tagline: 'Master the fundamentals',
  description: 'Log 3 top-rope climbs and 1 belay check.',
  category: 'climbing',
  awardType: 'single',
  iconName: 'Mountain',
  isNominatable: true,
  approvalMode: 'self',
  createdBy: 'admin',
  createdAt: 1000,
  isActive: true,
  requirements: [
    {
      id: 'req-climbs',
      title: 'Top-rope Climbs',
      targetCount: 3,
      evidenceType: 'checkbox'
    },
    {
      id: 'req-belay',
      title: 'Belay Check',
      targetCount: 1,
      evidenceType: 'photo_mandatory'
    }
  ]
};

describe('progressionEngine', () => {
  it('records incremental evidence and keeps status in_progress when incomplete', () => {
    const { updatedProgress, event } = recordEvidence(baseBadge, undefined, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-climbs',
      countDelta: 1,
      text: 'Climbed route 5A',
      timestamp: 2000
    });

    expect(event).toBe('progressed');
    expect(updatedProgress.status).toBe('in_progress');
    expect(updatedProgress.progress['req-climbs'].currentCount).toBe(1);
    expect(updatedProgress.progress['req-climbs'].completed).toBe(false);
    expect(updatedProgress.progress['req-climbs'].evidenceLogs).toHaveLength(1);
    expect(updatedProgress.progress['req-climbs'].evidenceLogs[0].recordedBy).toBe('Alice');
  });

  it('awards a self-approval single badge once all criteria are met', () => {
    // Step 1: Complete req-climbs (target 3)
    const step1 = recordEvidence(baseBadge, undefined, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-climbs',
      countDelta: 3
    });
    expect(step1.event).toBe('progressed');
    expect(step1.updatedProgress.progress['req-climbs'].completed).toBe(true);

    // Step 2: Complete req-belay (target 1)
    const step2 = recordEvidence(baseBadge, step1.updatedProgress, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-belay',
      countDelta: 1,
      mandatoryPhotoUrl: 'https://example.com/belay.webp',
      timestamp: 3000
    });

    expect(step2.event).toBe('awarded');
    expect(step2.updatedProgress.status).toBe('awarded');
    expect(step2.updatedProgress.awardedCount).toBe(1);
    expect(step2.updatedProgress.awardedAt).toBe(3000);
    expect(step2.updatedProgress.awardHistory).toHaveLength(1);
  });

  it('marks committee_vote badge as pending_review when requirements are met', () => {
    const committeeBadge: Badge = {
      ...baseBadge,
      approvalMode: 'committee_vote'
    };

    const step1 = recordEvidence(committeeBadge, undefined, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-climbs',
      countDelta: 3
    });

    const step2 = recordEvidence(committeeBadge, step1.updatedProgress, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-belay',
      countDelta: 1
    });

    expect(step2.event).toBe('pending_review');
    expect(step2.updatedProgress.status).toBe('pending_review');
  });

  it('increments awardedCount and resets requirement counts for repeatable badges', () => {
    const repeatableBadge: Badge = {
      ...baseBadge,
      awardType: 'repeatable'
    };

    // Cycle 1: complete requirements
    const step1 = recordEvidence(repeatableBadge, undefined, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-climbs',
      countDelta: 3
    });
    const step2 = recordEvidence(repeatableBadge, step1.updatedProgress, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-belay',
      countDelta: 1
    });

    expect(step2.event).toBe('awarded');
    expect(step2.updatedProgress.awardedCount).toBe(1);
    // Requirements must reset for the next cycle
    expect(step2.updatedProgress.progress['req-climbs'].currentCount).toBe(0);
    expect(step2.updatedProgress.progress['req-climbs'].completed).toBe(false);
    // Evidence logs preserved
    expect(step2.updatedProgress.progress['req-climbs'].evidenceLogs).toHaveLength(1);

    // Cycle 2: complete again
    const step3 = recordEvidence(repeatableBadge, step2.updatedProgress, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-climbs',
      countDelta: 3
    });
    const step4 = recordEvidence(repeatableBadge, step3.updatedProgress, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-belay',
      countDelta: 1
    });

    expect(step4.event).toBe('awarded');
    expect(step4.updatedProgress.awardedCount).toBe(2);
    expect(step4.updatedProgress.awardHistory).toHaveLength(2);
  });

  it('advances upgradeTier and resets requirement counts for upgradable badges', () => {
    const upgradableBadge: Badge = {
      ...baseBadge,
      awardType: 'upgradable'
    };

    const step1 = recordEvidence(upgradableBadge, undefined, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-climbs',
      countDelta: 3
    });
    const step2 = recordEvidence(upgradableBadge, step1.updatedProgress, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-belay',
      countDelta: 1
    });

    expect(step2.event).toBe('awarded');
    // Advanced from tier 1 (Bronze) to tier 2 (Silver)
    expect(step2.updatedProgress.upgradeTier).toBe(2);
    expect(step2.updatedProgress.progress['req-climbs'].currentCount).toBe(0);
    expect(step2.updatedProgress.progress['req-climbs'].evidenceLogs).toHaveLength(1);
  });

  it('awards progress from committee nomination resolution', () => {
    const result = awardFromNomination(
      baseBadge,
      undefined,
      'nom-123',
      'user-bob',
      5000
    );

    expect(result.event).toBe('awarded');
    expect(result.updatedProgress.status).toBe('awarded');
    expect(result.updatedProgress.userId).toBe('user-bob');
    expect(result.updatedProgress.nominationId).toBe('nom-123');
    expect(result.updatedProgress.awardedAt).toBe(5000);
  });

  it('calculates accurate overall progress percentage', () => {
    expect(calculateOverallProgressPercentage(baseBadge, undefined)).toBe(0);

    const partial = recordEvidence(baseBadge, undefined, {
      userId: 'user-1',
      userName: 'Alice',
      requirementId: 'req-climbs',
      countDelta: 2 // 2 of 4 total targets = 50%
    });

    expect(calculateOverallProgressPercentage(baseBadge, partial.updatedProgress)).toBe(50);
  });
});
