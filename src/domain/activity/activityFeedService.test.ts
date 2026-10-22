import { describe, it, expect } from 'vitest';
import {
  describeBadgeChanges,
  generateHistoricalActivities,
  formatTimeAgo,
  mergeAndDeduplicateActivities
} from './activityFeedService';
import type { Badge, ClubActivity, UserBadgeProgress, UserProfile } from '../../types';

describe('activityFeedService', () => {
  it('describes changes when a badge is modified', () => {
    const original: Badge = {
      id: 'b1',
      title: 'Anchor Master',
      tagline: 'Clean safely',
      description: 'Desc',
      category: 'climbing',
      awardType: 'single',
      iconName: 'Mountain',
      isNominatable: true,
      approvalMode: 'self',
      createdBy: 'u1',
      createdAt: 100,
      isActive: true,
      requirements: [{ id: 'r1', title: 'Task 1', targetCount: 1, evidenceType: 'checkbox' }]
    };

    const updated: Badge = {
      ...original,
      title: 'Anchor Master Pro',
      requirements: [
        { id: 'r1', title: 'Task 1', targetCount: 1, evidenceType: 'checkbox' },
        { id: 'r2', title: 'Task 2', targetCount: 2, evidenceType: 'checkbox' }
      ],
      awardType: 'upgradable'
    };

    const description = describeBadgeChanges(original, updated);
    expect(description).toContain('Renamed from "Anchor Master"');
    expect(description).toContain('Updated requirements (2 total)');
    expect(description).toContain('Award type changed to upgradable');
  });

  it('generates historical activities from existing records', () => {
    const badges: Badge[] = [{
      id: 'b1',
      title: 'Belay Hero',
      tagline: '',
      description: '',
      category: 'climbing',
      awardType: 'single',
      iconName: 'ShieldCheck',
      isNominatable: true,
      approvalMode: 'self',
      createdBy: 'admin',
      createdAt: 1000,
      isActive: true,
      requirements: []
    }];

    const users: UserProfile[] = [{
      uid: 'u1',
      email: 'alex@example.com',
      displayName: 'Alex',
      avatarUrl: '',
      role: 'member',
      status: 'active',
      createdAt: 2000
    }];

    const progress: Record<string, UserBadgeProgress> = {
      b1: {
        id: 'u1_b1',
        userId: 'u1',
        badgeId: 'b1',
        status: 'awarded',
        awardedAt: 3000,
        awardedCount: 1,
        progress: {}
      }
    };

    const activities = generateHistoricalActivities(badges, users, progress);
    expect(activities).toHaveLength(3);
    const types = activities.map(a => a.type);
    expect(types).toContain('user_joined');
    expect(types).toContain('badge_created');
    expect(types).toContain('badge_awarded');
    // Verifies newest first sorting
    expect(activities[0].timestamp).toBeGreaterThanOrEqual(activities[1].timestamp);
  });

  it('formats human friendly relative time', () => {
    const now = Date.now();
    expect(formatTimeAgo(now - 10000)).toBe('Just now');
    expect(formatTimeAgo(now - 120000)).toBe('2m ago');
    expect(formatTimeAgo(now - 7200000)).toBe('2h ago');
    expect(formatTimeAgo(now - 86400000)).toBe('Yesterday');
  });

  it('merges and deduplicates activities while preserving newest-first order', () => {
    const existing: ClubActivity[] = [
      { id: 'act_1', type: 'user_joined', timestamp: 1000, actorDisplayName: 'Sam' },
      { id: 'act_2', type: 'badge_created', timestamp: 2000, targetBadgeTitle: 'Old' }
    ];
    const incoming: ClubActivity[] = [
      { id: 'act_2', type: 'badge_created', timestamp: 2000, targetBadgeTitle: 'Updated' },
      { id: 'act_3', type: 'badge_awarded', timestamp: 3000, targetBadgeTitle: 'New' }
    ];

    const merged = mergeAndDeduplicateActivities(existing, incoming);
    expect(merged).toHaveLength(3);
    expect(merged[0].id).toBe('act_3');
    expect(merged[1].id).toBe('act_2');
    expect(merged[1].targetBadgeTitle).toBe('Updated');
    expect(merged[2].id).toBe('act_1');
  });

  it('safely handles missing or malformed badge and user records without crashing', () => {
    // Badges without requirements or title
    const malformedBadges: any[] = [
      { id: 'b_incomplete' },
      null,
      undefined
    ];
    const malformedUsers: any[] = [
      { uid: 'u_no_name' },
      null
    ];
    const malformedProgress: any = {
      p1: { status: 'awarded', badgeId: 'b_incomplete' },
      p2: null
    };

    const activities = generateHistoricalActivities(malformedBadges, malformedUsers, malformedProgress);
    expect(activities.length).toBeGreaterThan(0);

    // merge with undefined/null collections
    const safeMerged = mergeAndDeduplicateActivities(undefined as any, null as any);
    expect(safeMerged).toEqual([]);
  });
});
