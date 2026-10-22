import React, { useState } from 'react';
import { X, Users, ThumbsUp, ThumbsDown, Award, Clock, Shield } from 'lucide-react';
import type { Nomination, UserProfile, Badge } from '../../types';
import { sounds } from '../../services/audio';
import { calculateRequiredVotes, canCastNominationVote } from '../../domain/committee/votingEngine';

interface ReviewQueueProps {
  nominations: Nomination[];
  badges: Badge[];
  committeeMembers: UserProfile[];
  currentUser: UserProfile | null;
  onCastVote: (nominationId: string, vote: 'approve' | 'reject', comment?: string) => void;
  onAddCommitteeMember: (user: UserProfile) => void;
  onRemoveCommitteeMember: (userId: string) => void;
  allUsers: UserProfile[];
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  nominations,
  badges,
  committeeMembers,
  currentUser,
  onCastVote,
  onAddCommitteeMember,
  onRemoveCommitteeMember,
  allUsers
}) => {
  const isCommitteeMember = currentUser?.role === 'committee' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const [voteComments, setVoteComments] = useState<Record<string, string>>({});
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');

  const pendingNominations = nominations.filter(n => n.status === 'pending');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      <div className="glass-panel" style={{
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>
            Committee Review & Voting
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {committeeMembers.length} active Committee members. Badges requiring a vote need a majority (&gt;50%) approval.
          </p>
        </div>

        <div style={{
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          background: isCommitteeMember ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: isCommitteeMember ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.82rem',
          fontWeight: 600,
          color: isCommitteeMember ? 'var(--emerald-moss)' : 'var(--text-muted)'
        }}>
          <Shield size={16} />
          <span>{isAdmin ? 'Admin' : isCommitteeMember ? 'Committee Member' : 'Spectator (Non-Committee)'}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="glass-panel" style={{
          padding: 20,
          marginBottom: 28,
          border: '1px solid rgba(255, 152, 0, 0.3)'
        }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--amber-campfire)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} />
            Administrator: Manage Committee Roster
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {committeeMembers.map(member => (
              <div key={member.uid} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-highlight)'
              }}>
                <img src={member.avatarUrl} alt={member.displayName} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>{member.displayName}</span>
                {member.role !== 'admin' && (
                  <button 
                    onClick={() => onRemoveCommitteeMember(member.uid)}
                    title="Remove from Committee"
                    style={{ color: 'var(--text-faint)', marginLeft: 4 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={selectedUserToAdd}
              onChange={e => setSelectedUserToAdd(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Select a friend to add to Committee...</option>
              {allUsers.filter(u => u.role === 'member').map(u => (
                <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>
              ))}
            </select>
            <button
              onClick={() => {
                const user = allUsers.find(u => u.uid === selectedUserToAdd);
                if (user) {
                  onAddCommitteeMember(user);
                  setSelectedUserToAdd('');
                }
              }}
              disabled={!selectedUserToAdd}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--amber-campfire)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.88rem',
                opacity: selectedUserToAdd ? 1 : 0.5
              }}
            >
              Add to Committee
            </button>
          </div>
        </div>
      )}

      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={20} color="var(--amber-campfire)" />
        Pending Submissions & Nominations ({pendingNominations.length})
      </h3>

      {pendingNominations.length === 0 ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Award size={40} color="var(--border-highlight)" style={{ marginBottom: 10 }} />
          <h4 style={{ color: '#fff', marginBottom: 4 }}>Review Queue is Clear!</h4>
          <p style={{ fontSize: '0.88rem' }}>No pending nominations or vote requests right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingNominations.map(nom => {
            const badge = badges.find(b => b.id === nom.badgeId);
            const votes = Object.values(nom.votes || {});
            const approveCount = votes.filter(v => v.vote === 'approve').length;
            const rejectCount = votes.filter(v => v.vote === 'reject').length;
            
            const isNomineeInCommittee = committeeMembers.some(m => m.uid === nom.nomineeUserId);
            const effectiveCommitteeCount = isNomineeInCommittee ? Math.max(1, committeeMembers.length - 1) : committeeMembers.length;
            const requiredVotes = calculateRequiredVotes(committeeMembers.length, isNomineeInCommittee);
            
            const { reason: recusalReason } = canCastNominationVote(currentUser, nom.nomineeUserId);
            const userAlreadyVoted = currentUser ? Boolean(nom.votes?.[currentUser.uid]) : false;

            return (
              <div key={nom.id} className="glass-panel" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--amber-campfire)',
                      background: 'rgba(255, 152, 0, 0.15)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-block',
                      marginBottom: 6
                    }}>
                      Nomination for {badge?.title || 'Badge'}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{nom.nomineeDisplayName}</span>
                      {isNomineeInCommittee && (
                        <span style={{
                          fontSize: '0.68rem',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          padding: '2px 7px',
                          borderRadius: 10,
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          fontWeight: 600
                        }}>
                          Committee Member (Recused)
                        </span>
                      )}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Nominated by {nom.nominatorDisplayName}
                    </p>
                  </div>

                  <div style={{
                    textAlign: 'right',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--badge-gold)' }}>
                      {approveCount} / {requiredVotes}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {isNomineeInCommittee 
                        ? `Approvals needed (${effectiveCommitteeCount} voters)` 
                        : `Approvals needed (${committeeMembers.length} voters)`}
                    </div>
                    {rejectCount > 0 && (
                      <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: 2 }}>
                        {rejectCount} reject{rejectCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  borderLeft: '3px solid var(--amber-campfire)',
                  marginBottom: 16
                }}>
                  "{nom.reason}"
                </div>

                {nom.photoUrls && nom.photoUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    {nom.photoUrls.map((url, i) => (
                      <img 
                        key={i} 
                        src={url} 
                        alt="Nomination evidence" 
                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                      />
                    ))}
                  </div>
                )}

                {isCommitteeMember ? (
                  <div style={{
                    padding: 14,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {recusalReason === 'self_recusal' ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255, 152, 0, 0.12)',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                        color: 'var(--amber-campfire)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        <Shield size={18} style={{ flexShrink: 0 }} />
                        <span>
                          You are the candidate for this badge award. Per club policy, committee members cannot vote on their own awards (quorum adjusted to {effectiveCommitteeCount} members).
                        </span>
                      </div>
                    ) : userAlreadyVoted ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--emerald-moss)', fontWeight: 600 }}>
                        ✓ You have cast your vote on this submission.
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                          Cast your vote as a Committee Member:
                        </div>
                        <input
                          type="text"
                          placeholder="Optional review note / encouraging comment..."
                          value={voteComments[nom.id] || ''}
                          onChange={e => setVoteComments(prev => ({ ...prev, [nom.id]: e.target.value }))}
                          style={{
                            width: '100%',
                            marginBottom: 10,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: '#fff',
                            fontSize: '0.82rem'
                          }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={() => {
                              sounds.playCarabinerClick();
                              onCastVote(nom.id, 'approve', voteComments[nom.id]);
                            }}
                            style={{
                              flex: 1,
                              padding: '9px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--emerald-pine)',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6
                            }}
                          >
                            <ThumbsUp size={16} />
                            Approve Award
                          </button>

                          <button
                            onClick={() => {
                              sounds.playCarabinerClick();
                              onCastVote(nom.id, 'reject', voteComments[nom.id]);
                            }}
                            style={{
                              flex: 1,
                              padding: '9px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-muted)',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6
                            }}
                          >
                            <ThumbsDown size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                    Voting restricted to Committee members.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
