import { describe, it, expect } from 'vitest';
import {
  createEmptyBadgeDraft,
  createDraftFromBadge,
  validateAndFinalizeBadge,
  generateBadgeUUID
} from './badgeDraft';
import type { Badge } from '../../types';

describe('badgeDrafting module', () => {
  it('generates unique badge UUIDs', () => {
    const id1 = generateBadgeUUID();
    const id2 = generateBadgeUUID();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('creates an empty draft with a default requirement', () => {
    const draft = createEmptyBadgeDraft();
    expect(draft.id).toBeTruthy();
    expect(draft.category).toBe('climbing');
    expect(draft.awardType).toBe('single');
    expect(draft.requirements).toHaveLength(1);
    expect(draft.requirements[0].targetCount).toBe(1);
  });

  it('populates a draft from an existing badge', () => {
    const existing: Badge = {
      id: 'badge-123',
      title: 'Knot Master',
      tagline: 'Tie figure 8 and clove hitch',
      description: 'Demonstrate speed and accuracy.',
      category: 'climbing',
      awardType: 'upgradable',
      iconName: 'Compass',
      imageUrl: 'https://example.com/knot.png',
      isNominatable: true,
      approvalMode: 'committee_vote',
      createdBy: 'admin',
      createdAt: 1000,
      isActive: true,
      requirements: [
        { id: 'r1', title: 'Figure 8', targetCount: 5, evidenceType: 'checkbox' }
      ]
    };

    const draft = createDraftFromBadge(existing);
    expect(draft.id).toBe('badge-123');
    expect(draft.title).toBe('Knot Master');
    expect(draft.awardType).toBe('upgradable');
    expect(draft.imageUrl).toBe('https://example.com/knot.png');
    expect(draft.requirements).toHaveLength(1);
  });

  it('rejects validation when title is empty', () => {
    const draft = createEmptyBadgeDraft();
    draft.title = '   ';
    const { error } = validateAndFinalizeBadge(draft);
    expect(error).toContain('Please provide a badge title');
  });

  it('rejects validation when requirements are empty', () => {
    const draft = createEmptyBadgeDraft();
    draft.title = 'Boulder Star';
    draft.requirements = [];
    const { error } = validateAndFinalizeBadge(draft);
    expect(error).toContain('must contain at least one requirement');
  });

  it('normalizes requirement counts and titles upon finalization', () => {
    const draft = createEmptyBadgeDraft();
    draft.title = 'Lead Climber';
    draft.requirements = [
      { id: '', title: '', targetCount: 0, evidenceType: 'checkbox' }
    ];

    const { badge, error } = validateAndFinalizeBadge(draft);
    expect(error).toBeUndefined();
    expect(badge).toBeDefined();
    expect(badge?.requirements[0].id).toBe('req_1');
    expect(badge?.requirements[0].title).toBe('Requirement 1');
    // targetCount normalized to at least 1
    expect(badge?.requirements[0].targetCount).toBe(1);
  });
});
