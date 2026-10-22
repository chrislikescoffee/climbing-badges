import type { UserProfile } from '../../types';

/**
 * Calculates the required number of committee votes to approve a badge award.
 *
 * Rule:
 * - If the candidate is NOT on the committee:
 *   Requires a strict majority (>50%) of active committee members: Math.floor(N / 2) + 1.
 *   (e.g., 10 committee members -> 6 votes needed).
 *
 * - If the candidate IS a committee member:
 *   The candidate is recused and excluded from the eligible voter count: N_eff = max(1, N - 1).
 *   The votes required are adjusted and rounded down: Math.floor(N_eff / 2).
 *   (e.g., 10 committee members -> 9 effective voters -> Math.floor(9 / 2) = 4 votes needed).
 */
export function calculateRequiredVotes(
  committeeCount: number,
  isNomineeCommitteeMember: boolean
): number {
  const total = Math.max(1, committeeCount);

  if (isNomineeCommitteeMember) {
    const effectiveVoters = Math.max(1, total - 1);
    return Math.max(1, Math.floor(effectiveVoters / 2));
  }

  return Math.floor(total / 2) + 1;
}

/**
 * Determines whether a user is permitted to cast a vote on a specific nomination.
 * Rule: User must be a committee/admin member AND cannot vote on their own award.
 */
export function canCastNominationVote(
  currentUser: UserProfile | null,
  nomineeUserId: string
): { canVote: boolean; reason?: 'not_committee' | 'self_recusal' | 'no_user' } {
  if (!currentUser) {
    return { canVote: false, reason: 'no_user' };
  }

  const isCommittee = currentUser.role === 'committee' || currentUser.role === 'admin';
  if (!isCommittee) {
    return { canVote: false, reason: 'not_committee' };
  }

  if (currentUser.uid === nomineeUserId) {
    return { canVote: false, reason: 'self_recusal' };
  }

  return { canVote: true };
}

/**
 * Evaluates the outcome of a nomination based on current votes and required votes.
 */
export function evaluateNominationOutcome(
  votes: Record<string, { vote: 'approve' | 'reject' }>,
  eligibleVotersCount: number,
  requiredApprovals: number
): 'pending' | 'approved' | 'rejected' {
  const voteList = Object.values(votes || {});
  const approveCount = voteList.filter(v => v.vote === 'approve').length;
  const rejectCount = voteList.filter(v => v.vote === 'reject').length;

  if (approveCount >= requiredApprovals) {
    return 'approved';
  }

  // If the remaining possible approvals cannot reach requiredApprovals, it's rejected
  const maxPossibleApprovals = eligibleVotersCount - rejectCount;
  if (maxPossibleApprovals < requiredApprovals) {
    return 'rejected';
  }

  return 'pending';
}
