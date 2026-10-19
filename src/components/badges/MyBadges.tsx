import React from 'react';
import { Shield, Award, Sparkles } from 'lucide-react';
import type { Badge, UserBadgeProgress, UserProfile, UpgradeTier } from '../../types';

interface MyBadgesProps {
  user: UserProfile;
  badges: Badge[];
  userProgress: Record<string, UserBadgeProgress>;
  upgradeTiers: UpgradeTier[];
  onSelectBadge: (badge: Badge) => void;
}

export const MyBadges: React.FC<MyBadgesProps> = ({
  user,
  badges,
  userProgress,
  upgradeTiers,
  onSelectBadge
}) => {
  const earnedBadges = badges.filter(b => userProgress[b.id]?.status === 'awarded');

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
      </div>

      {/* Badges Display Board */}
      <div style={{
        background: '#16202a',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        border: '3px solid #283747',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 28px',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 16px 40px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        <div style={{
          border: '2px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '30px 20px',
          minHeight: 380
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
    </div>
  );
};
