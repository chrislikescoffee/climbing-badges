import React from 'react';
import { Shield, Award, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import type { Badge, UserBadgeProgress, UserProfile, UpgradeTier, Nomination } from '../../types';

interface MyBadgesProps {
  user: UserProfile;
  badges: Badge[];
  userProgress: Record<string, UserBadgeProgress>;
  upgradeTiers: UpgradeTier[];
  nominations?: Nomination[];
  onSelectBadge: (badge: Badge) => void;
}

export const MyBadges: React.FC<MyBadgesProps> = ({
  user,
  badges,
  userProgress,
  upgradeTiers,
  nominations = [],
  onSelectBadge
}) => {
  const earnedBadges = badges.filter(b => userProgress[b.id]?.status === 'awarded');
  const pendingBadges = badges.filter(b => userProgress[b.id]?.status === 'pending_review');

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', paddingBottom: 60, position: 'relative' }}>
      {/* User Header Summary */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src={user.avatarUrl} 
            alt={user.displayName}
            style={{ width: 44, height: 44, borderRadius: '50%', background: '#334155', border: '2px solid var(--amber-campfire)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{user.displayName}&apos;s Badges</span>
              <Sparkles size={18} color="var(--amber-campfire)" />
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Official Safe Climbing Club verified badge collection
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffd700, #ff9800)',
            color: '#0f1418',
            fontSize: '0.84rem',
            fontWeight: 900,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Award size={16} color="#0f1418" />
            <span>Badges Earnt: {earnedBadges.length}</span>
          </div>

          {pendingBadges.length > 0 && (
            <div style={{
              background: 'rgba(255, 152, 0, 0.15)',
              color: 'var(--amber-campfire)',
              border: '1px solid rgba(255, 152, 0, 0.4)',
              fontSize: '0.84rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Clock size={15} />
              <span>Pending Review: {pendingBadges.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Badges Display Board (Earned) */}
      <div style={{
        background: '#16202a',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        border: '3px solid #283747',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 28px',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 16px 40px rgba(0,0,0,0.6)',
        position: 'relative',
        marginBottom: 32
      }}>
        <div style={{
          border: '2px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '30px 20px',
          minHeight: 320
        }}>
          {earnedBadges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Shield size={48} color="var(--border-highlight)" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#fff', marginBottom: 6 }}>No Badges Earnt Yet!</h3>
              <p style={{ maxWidth: 420, margin: '0 auto', fontSize: '0.9rem' }}>
                Complete badge requirements out on the rock and around camp, or get nominated by friends to start building your collection.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 28,
              alignItems: 'center',
              justifyItems: 'center'
            }}>
              {earnedBadges.map((badge, idx) => {
                const prog = userProgress[badge.id];
                const count = prog?.awardedCount || 1;
                const isRepeatable = badge.awardType === 'repeatable' && count > 1;

                const tierLevel = prog?.upgradeTier || 1;
                const tierObj = upgradeTiers.find(t => t.level === tierLevel);
                const tierBorderColor = badge.awardType === 'upgradable' && tierObj ? tierObj.color : 'rgba(255, 215, 0, 0.6)';

                return (
                  <div
                    key={badge.id}
                    onClick={() => onSelectBadge(badge)}
                    className="patch-badge"
                    style={{
                      width: 124,
                      height: 124,
                      cursor: 'pointer',
                      borderColor: tierBorderColor,
                      boxShadow: badge.awardType === 'upgradable' && tierObj ? `0 0 18px ${tierObj.color}45` : undefined,
                      transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * ((idx * 3) % 7)}deg)`,
                      position: 'relative'
                    }}
                    title={badge.title + ': ' + badge.tagline}
                  >
                    {/* Multiplier Pin for repeatable awards (x2, x3...) */}
                    {isRepeatable && (
                      <span style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        background: '#ffd700',
                        color: '#0f1418',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        border: '2px solid #0f1418',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        zIndex: 2
                      }}>
                        x{count}
                      </span>
                    )}

                    {/* Tier Tag for upgradable badges */}
                    {badge.awardType === 'upgradable' && tierObj && (
                      <span style={{
                        position: 'absolute',
                        bottom: -6,
                        background: tierObj.color,
                        color: '#000',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        zIndex: 2
                      }}>
                        Tier {tierLevel}
                      </span>
                    )}

                    {badge.imageUrl ? (
                      <img 
                        src={badge.imageUrl} 
                        alt={badge.title} 
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%', marginBottom: 4, border: `2px solid ${tierBorderColor}` }} 
                      />
                    ) : (
                      <Award size={36} color={badge.awardType === 'upgradable' && tierObj ? tierObj.color : 'var(--badge-gold)'} style={{ marginBottom: 6 }} />
                    )}

                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#fff',
                      textAlign: 'center',
                      lineHeight: 1.1,
                      textTransform: 'uppercase'
                    }}>
                      {badge.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Pending Approval Badges */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 152, 0, 0.35)',
        background: 'linear-gradient(180deg, rgba(255, 152, 0, 0.06), rgba(15, 23, 42, 0.6))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255, 152, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber-campfire)'
            }}>
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                Pending Approval ({pendingBadges.length})
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                Badges where all criteria are completed and currently undergoing Committee verification
              </p>
            </div>
          </div>
        </div>

        {pendingBadges.length === 0 ? (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-faint)',
            fontSize: '0.86rem'
          }}>
            No badges currently pending review. Complete all criteria for any badge to escalate it for Committee vote.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingBadges.map(badge => {
              const nom = nominations.find(n => n.badgeId === badge.id && n.nomineeUserId === user.uid && n.status === 'pending');
              const votes = Object.values(nom?.votes || {});
              const approveCount = votes.filter(v => v.vote === 'approve').length;
              const requiredCount = nom?.requiredVotes;

              return (
                <div
                  key={badge.id}
                  onClick={() => onSelectBadge(badge)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                    gap: 16
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--amber-campfire)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 152, 0, 0.3)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 152, 0, 0.1)',
                      border: '1px solid rgba(255, 152, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {badge.imageUrl ? (
                        <img src={badge.imageUrl} alt={badge.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Award size={22} color="var(--amber-campfire)" />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ color: '#fff', fontSize: '0.98rem', margin: 0, fontWeight: 700 }}>
                          {badge.title}
                        </h4>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: 8,
                          background: 'rgba(255, 152, 0, 0.2)',
                          color: 'var(--amber-campfire)',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          Pending Approval
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '3px 0 0' }}>
                        All {badge.requirements?.length || 0} requirements met • Click to inspect evidence logs
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 152, 0, 0.08)',
                    border: '1px solid rgba(255, 152, 0, 0.25)',
                    color: 'var(--amber-campfire)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    <CheckCircle2 size={16} />
                    <span>
                      {requiredCount ? `${approveCount} / ${requiredCount} Approvals` : 'Awaiting Review Queue'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
