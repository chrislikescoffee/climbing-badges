import { describe, it, expect } from 'vitest';
import type { Badge, UserBadgeProgress, UpgradeTier } from '../../types';

describe('BadgeRowCompact logic and progression calculations', () => {
  const sampleBadge: Badge = {
    id: 'badge-climb-1',
    title: '5.12 Redpoint Specialist',
    tagline: 'Climb 5.12 cleanly',
    description: 'Clean redpoint of any recognized 5.12 route.',
    category: 'climbing',
    awardType: 'upgradable',
    approvalMode: 'committee_vote',
    iconName: 'Mountain',
    isNominatable: true,
    createdBy: 'system',
    createdAt: 1000,
    isActive: true,
    requirements: [
      { id: 'req-1', title: 'Route 1', targetCount: 1, evidenceType: 'checkbox' },
      { id: 'req-2', title: 'Route 2', targetCount: 2, evidenceType: 'checkbox' }
    ]
  };

  const sampleTiers: UpgradeTier[] = [
    { level: 1, name: 'Bronze', color: '#cd7f32' },
    { level: 2, name: 'Silver', color: '#c0c0c0' },
    { level: 3, name: 'Gold', color: '#ffd700' }
  ];

  it('calculates criteria progress percentage accurately for in-progress badge', () => {
    const progress: UserBadgeProgress = {
      id: 'prog-1',
      userId: 'u1',
      badgeId: 'badge-climb-1',
      status: 'in_progress',
      progress: {
        'req-1': { requirementId: 'req-1', currentCount: 1, completed: true, evidenceLogs: [] },
        'req-2': { requirementId: 'req-2', currentCount: 1, completed: false, evidenceLogs: [] }
      }
    };

    let totalTarget = 0;
    let totalCurrent = 0;
    sampleBadge.requirements.forEach(req => {
      totalTarget += req.targetCount || 1;
      totalCurrent += Math.min(req.targetCount || 1, progress.progress?.[req.id]?.currentCount || 0);
    });

    const percent = Math.round((totalCurrent / totalTarget) * 100);
    expect(totalTarget).toBe(3);
    expect(totalCurrent).toBe(2);
    expect(percent).toBe(67);
  });

  it('identifies awarded upgradable badge tier color accurately', () => {
    const progress: UserBadgeProgress = {
      id: 'prog-2',
      userId: 'u1',
      badgeId: 'badge-climb-1',
      status: 'awarded',
      progress: {},
      upgradeTier: 2
    };

    const currentTierLevel = progress.upgradeTier || 1;
    const currentTierObj = sampleTiers.find(t => t.level === currentTierLevel);

    expect(currentTierObj?.name).toBe('Silver');
    expect(currentTierObj?.color).toBe('#c0c0c0');
  });

  it('computes repeatable badge count multiplier', () => {
    const repeatableBadge: Badge = {
      ...sampleBadge,
      id: 'badge-repeat-1',
      awardType: 'repeatable'
    };

    const progress: UserBadgeProgress = {
      id: 'prog-3',
      userId: 'u1',
      badgeId: 'badge-repeat-1',
      status: 'awarded',
      progress: {},
      awardedCount: 4
    };

    const count = progress.awardedCount || 1;
    const showMultiplier = repeatableBadge.awardType === 'repeatable' && count > 1;

    expect(showMultiplier).toBe(true);
    expect(count).toBe(4);
  });

  it('selects tagline or falls back to description for subtitle text', () => {
    const subtitle1 = sampleBadge.tagline || sampleBadge.description;
    expect(subtitle1).toBe('Climb 5.12 cleanly');

    const badgeWithoutTagline: Badge = { ...sampleBadge, tagline: '' };
    const subtitle2 = badgeWithoutTagline.tagline || badgeWithoutTagline.description;
    expect(subtitle2).toBe('Clean redpoint of any recognized 5.12 route.');
  });
});
