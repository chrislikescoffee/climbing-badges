import { describe, it, expect } from 'vitest';
import {
  calculateRequiredVotes,
  canCastNominationVote,
  evaluateNominationOutcome
} from './votingEngine';
import type { UserProfile } from '../../types';

describe('votingEngine', () => {
  describe('calculateRequiredVotes', () => {
    it('calculates majority (>50%) for non-committee nominee (10 members -> 6 votes)', () => {
      expect(calculateRequiredVotes(10, false)).toBe(6);
    });

    it('adjusts quorum and rounds down for committee member nominee (10 members -> 9 effective -> 4 votes)', () => {
      expect(calculateRequiredVotes(10, true)).toBe(4);
    });

    it('handles smaller committee counts properly', () => {
      // 5 members, non-committee candidate: 3 votes
      expect(calculateRequiredVotes(5, false)).toBe(3);
      // 5 members, committee candidate: effective 4 -> 2 votes
      expect(calculateRequiredVotes(5, true)).toBe(2);

      // 3 members, non-committee candidate: 2 votes
      expect(calculateRequiredVotes(3, false)).toBe(2);
      // 3 members, committee candidate: effective 2 -> 1 vote
      expect(calculateRequiredVotes(3, true)).toBe(1);

      // Edge case: 1 member committee
      expect(calculateRequiredVotes(1, false)).toBe(1);
      expect(calculateRequiredVotes(1, true)).toBe(1);
    });
  });

  describe('canCastNominationVote', () => {
    const committeeUser: UserProfile = {
      uid: 'c1',
      displayName: 'Alice Committee',
      email: 'alice@club.org',
      avatarUrl: '',
      role: 'committee',
      status: 'active',
      createdAt: 1000
    };

    const regularUser: UserProfile = {
      uid: 'u2',
      displayName: 'Bob Member',
      email: 'bob@club.org',
      avatarUrl: '',
      role: 'member',
      status: 'active',
      createdAt: 1000
    };

    it('allows a committee member to vote on another user nomination', () => {
      const res = canCastNominationVote(committeeUser, 'u2');
      expect(res.canVote).toBe(true);
    });

    it('recuses and forbids a committee member from voting on their own nomination', () => {
      const res = canCastNominationVote(committeeUser, 'c1');
      expect(res.canVote).toBe(false);
      expect(res.reason).toBe('self_recusal');
    });

    it('forbids a regular non-committee member from voting', () => {
      const res = canCastNominationVote(regularUser, 'u3');
      expect(res.canVote).toBe(false);
      expect(res.reason).toBe('not_committee');
    });

    it('forbids unauthenticated users from voting', () => {
      const res = canCastNominationVote(null, 'u3');
      expect(res.canVote).toBe(false);
      expect(res.reason).toBe('no_user');
    });
  });

  describe('evaluateNominationOutcome', () => {
    it('returns approved when approval threshold is met', () => {
      const votes = {
        c1: { vote: 'approve' as const },
        c2: { vote: 'approve' as const },
        c3: { vote: 'approve' as const },
        c4: { vote: 'approve' as const }
      };
      // 9 voters, 4 required
      expect(evaluateNominationOutcome(votes, 9, 4)).toBe('approved');
    });

    it('returns pending when still undecided', () => {
      const votes = {
        c1: { vote: 'approve' as const },
        c2: { vote: 'reject' as const }
      };
      // 9 voters, 4 required -> 7 possible approvals left, need 3 more
      expect(evaluateNominationOutcome(votes, 9, 4)).toBe('pending');
    });

    it('returns rejected when remaining possible approvals cannot reach threshold', () => {
      // 9 voters, 4 required. If 6 vote reject, max possible approves is 3 < 4
      const votes = {
        c1: { vote: 'reject' as const },
        c2: { vote: 'reject' as const },
        c3: { vote: 'reject' as const },
        c4: { vote: 'reject' as const },
        c5: { vote: 'reject' as const },
        c6: { vote: 'reject' as const }
      };
      expect(evaluateNominationOutcome(votes, 9, 4)).toBe('rejected');
    });
  });
});
