import React, { useState } from 'react';
import { UserX, UserCheck, AlertTriangle, Check, ShieldAlert, ArrowUpCircle, Trash2 } from 'lucide-react';
import type { UserProfile, CommitteeEvictionRequest } from '../../types';
import { sounds } from '../../services/audio';

interface UserManagementProps {
  users: UserProfile[];
  currentUser: UserProfile;
  evictionRequests: CommitteeEvictionRequest[];
  onPromoteToCommittee: (userId: string) => void;
  onRequestEvictFromCommittee: (targetUser: UserProfile, reason: string) => void;
  onApproveEvictionFromCommittee: (requestId: string) => void;
  onRejectEvictionFromCommittee: (requestId: string) => void;
  onEvictFromClub: (userId: string) => void;
  onReinstateToClub: (userId: string) => void;
  onOpenCreateUserModal?: () => void;
  onDeleteUser?: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  evictionRequests,
  onPromoteToCommittee,
  onRequestEvictFromCommittee,
  onApproveEvictionFromCommittee,
  onRejectEvictionFromCommittee,
  onEvictFromClub,
  onReinstateToClub,
  onOpenCreateUserModal,
  onDeleteUser
}) => {
  const [evictTargetUser, setEvictTargetUser] = useState<UserProfile | null>(null);
  const [evictReason, setEvictReason] = useState('');

  const pendingRequests = evictionRequests.filter(r => r.status === 'pending');

  const handleInitiateEviction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evictTargetUser || !evictReason.trim()) return;
    sounds.playCarabinerClick();
    onRequestEvictFromCommittee(evictTargetUser, evictReason.trim());
    setEvictTargetUser(null);
    setEvictReason('');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div className="glass-panel" style={{
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>
            Club User Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Members create their own accounts by signing in with Google. Use this dashboard to promote members to Committee or manage club roles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {onOpenCreateUserModal && (
            <button
              onClick={onOpenCreateUserModal}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--emerald-pine), var(--emerald-moss))',
                color: '#fff',
                fontSize: '0.86rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.35)'
              }}
            >
              <UserCheck size={16} />
              <span>+ Add New Member</span>
            </button>
          )}

          <div style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 152, 0, 0.15)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            color: 'var(--amber-campfire)',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            {users.length} Total Registered Users
          </div>
        </div>
      </div>

      {/* Pending Committee Eviction Requests Banner (Requires 2nd Committee Member!) */}
      {pendingRequests.length > 0 && (
        <div className="glass-panel" style={{
          padding: 20,
          marginBottom: 24,
          border: '1px solid #ef4444',
          background: 'rgba(239, 68, 68, 0.08)'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} />
            Pending Committee Eviction Approvals ({pendingRequests.length})
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Per club rules, removing a member from the Committee requires approval from two separate Committee members.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingRequests.map(req => {
              const isRequester = req.requestedByUserId === currentUser.uid;

              return (
                <div 
                  key={req.id} 
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-highlight)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                      Evict {req.targetDisplayName} from Committee
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Requested by <strong>{req.requestedByDisplayName}</strong> • Reason: "{req.reason}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isRequester ? (
                      <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-faint)' }}>
                        Waiting for 2nd Committee Member to confirm
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            sounds.playCarabinerClick();
                            onApproveEvictionFromCommittee(req.id);
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-sm)',
                            background: '#ef4444',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Check size={14} />
                          Approve Eviction
                        </button>
                        <button
                          onClick={() => onRejectEvictionFromCommittee(req.id)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-muted)',
                            fontSize: '0.82rem'
                          }}
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member / Display Name</th>
              <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email (Internal)</th>
              <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isCommitteeMember = u.role === 'admin' || u.role === 'committee';
              const isSelf = u.uid === currentUser.uid;
              const isEvicted = u.status === 'evicted';

              return (
                <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: isEvicted ? 0.5 : 1 }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={u.avatarUrl} alt={u.displayName} style={{ width: 34, height: 34, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>{u.displayName}</div>
                        {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--amber-campfire)' }}>(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: isCommitteeMember ? 'rgba(255, 152, 0, 0.15)' : 'var(--bg-surface-elevated)',
                      color: isCommitteeMember ? 'var(--amber-campfire)' : 'var(--text-muted)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {isEvicted ? (
                      <span style={{ color: '#ff6b6b', fontSize: '0.8rem', fontWeight: 600 }}>Evicted from Club</span>
                    ) : (
                      <span style={{ color: 'var(--emerald-moss)', fontSize: '0.8rem', fontWeight: 600 }}>Active</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {/* Promote to Committee */}
                      {!isCommitteeMember && !isEvicted && (
                        <button
                          onClick={() => {
                            sounds.playCarabinerClick();
                            onPromoteToCommittee(u.uid);
                          }}
                          title="Promote to Committee"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(76, 175, 80, 0.15)',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            color: 'var(--emerald-moss)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <ArrowUpCircle size={14} />
                          <span>Promote to Committee</span>
                        </button>
                      )}

                      {/* Evict from Committee (Requires 2nd confirmation) */}
                      {isCommitteeMember && !isSelf && !isEvicted && (
                        <button
                          onClick={() => setEvictTargetUser(u)}
                          title="Evict from Committee (Requires 2nd Committee approval)"
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 152, 0, 0.12)',
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            color: 'var(--amber-campfire)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <ShieldAlert size={14} />
                          <span>Evict from Committee</span>
                        </button>
                      )}

                      {/* Permanently Delete User */}
                      {!isSelf && onDeleteUser && (
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete account for "${u.displayName}"?`)) {
                              onDeleteUser(u.uid);
                            }
                          }}
                          title="Permanently Delete Account"
                          style={{
                            padding: '6px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                      {/* Evict / Reinstate from Club */}
                      {!isSelf && (
                        isEvicted ? (
                          <button
                            onClick={() => onReinstateToClub(u.uid)}
                            title="Reinstate to Club"
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-main)',
                              fontSize: '0.78rem'
                            }}
                          >
                            <UserCheck size={14} /> Reinstate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to evict ${u.displayName} from the club entirely?`)) {
                                onEvictFromClub(u.uid);
                              }
                            }}
                            title="Evict from Club"
                            style={{
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#ef4444',
                              fontSize: '0.78rem'
                            }}
                          >
                            <UserX size={14} /> Evict Club
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Evict from Committee Confirmation Modal */}
      {evictTargetUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="glass-panel" style={{
            maxWidth: 480,
            width: '100%',
            padding: 26,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert color="var(--amber-campfire)" />
              Evict from Committee
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: 16 }}>
              You are requesting to remove <strong>{evictTargetUser.displayName}</strong> from the Committee. This requires a <strong>second Committee member</strong> to approve before taking effect.
            </p>

            <form onSubmit={handleInitiateEviction}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Reason for Committee Removal
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain reason to the other committee members..."
                  value={evictReason}
                  onChange={e => setEvictReason(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEvictTargetUser(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--amber-campfire)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.88rem'
                  }}
                >
                  Submit Eviction Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
