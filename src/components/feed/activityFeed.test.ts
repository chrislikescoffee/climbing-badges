import { describe, it, expect } from 'vitest';
import type { ClubActivity } from '../../types';

describe('Activity Feed filtering logic', () => {
  const sampleActivities: ClubActivity[] = [
    {
      id: 'a1',
      type: 'user_joined',
      timestamp: 1000,
      actorDisplayName: 'Dave',
      details: { summary: 'Joined Safe Climbing Club' }
    },
    {
      id: 'a2',
      type: 'badge_created',
      timestamp: 2000,
      targetBadgeTitle: 'Trad Master',
      details: { summary: 'Released with 3 requirements' }
    },
    {
      id: 'a3',
      type: 'badge_updated',
      timestamp: 3000,
      targetBadgeTitle: 'Trad Master',
      details: { summary: 'Criteria updated' }
    },
    {
      id: 'a4',
      type: 'badge_awarded',
      timestamp: 4000,
      actorDisplayName: 'Sarah',
      targetBadgeTitle: 'Trad Master',
      details: { awardCount: 1, summary: 'Earned and unlocked badge!' }
    }
  ];

  it('filters awards and celebrations correctly', () => {
    const awards = sampleActivities.filter(a => a.type === 'badge_awarded');
    expect(awards).toHaveLength(1);
    expect(awards[0].actorDisplayName).toBe('Sarah');
  });

  it('filters badge releases and modifications correctly', () => {
    const badgeEvents = sampleActivities.filter(a => a.type === 'badge_created' || a.type === 'badge_updated');
    expect(badgeEvents).toHaveLength(2);
    expect(badgeEvents.map(e => e.type)).toEqual(['badge_created', 'badge_updated']);
  });

  it('filters member joined events correctly', () => {
    const memberEvents = sampleActivities.filter(a => a.type === 'user_joined');
    expect(memberEvents).toHaveLength(1);
    expect(memberEvents[0].actorDisplayName).toBe('Dave');
  });
});
