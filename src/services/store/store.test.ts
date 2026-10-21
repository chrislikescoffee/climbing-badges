import { describe, it, expect, vi } from 'vitest';
import { MemoryStoreAdapter } from './memoryStoreAdapter';
import type { Badge, UserBadgeProgress } from '../../types';

describe('ClubStore Seam with MemoryAdapter', () => {
  it('subscribes to badges, handles initial fallback, and broadcasts saved badges', async () => {
    const store = new MemoryStoreAdapter();
    const fallbackBadge: Badge = {
      id: 'b-1',
      title: 'Initial',
      tagline: 'Tag',
      description: 'Desc',
      category: 'climbing',
      awardType: 'single',
      iconName: 'Mountain',
      isNominatable: true,
      approvalMode: 'self',
      createdBy: 'u-1',
      createdAt: 100,
      isActive: true,
      requirements: []
    };

    const receivedBadges: Badge[][] = [];
    const unsub = store.subscribeBadges(badges => receivedBadges.push(badges), [fallbackBadge]);

    expect(receivedBadges[0]).toHaveLength(1);
    expect(receivedBadges[0][0].id).toBe('b-1');

    await store.saveBadge({
      ...fallbackBadge,
      id: 'b-2',
      title: 'Second Badge'
    });

    expect(receivedBadges).toHaveLength(2);
    expect(receivedBadges[1]).toHaveLength(2);

    unsub();
  });

  it('subscribes and updates progress per user', async () => {
    const store = new MemoryStoreAdapter();
    const mockProgress: UserBadgeProgress = {
      id: 'u-1_b-1',
      userId: 'u-1',
      badgeId: 'b-1',
      status: 'awarded',
      progress: {},
      awardedCount: 1,
      upgradeTier: 1
    };

    const listener = vi.fn();
    const unsub = store.subscribeUserProgress('u-1', listener);

    expect(listener).toHaveBeenCalledWith({});

    await store.saveProgress(mockProgress);

    expect(listener).toHaveBeenCalledWith({
      'b-1': mockProgress
    });

    unsub();
  });
});
