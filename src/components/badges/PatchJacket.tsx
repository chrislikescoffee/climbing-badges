import React from 'react';
import { Shield, Award } from 'lucide-react';
import type { Badge, UserBadgeProgress, UserProfile } from '../../types';

interface PatchJacketProps {
  user: UserProfile;
  badges: Badge[];
  userProgress: Record<string, UserBadgeProgress>;
  onSelectBadge: (badge: Badge) => void;
}

export const PatchJacket: React.FC<PatchJacketProps> = ({
  user,
  badges,
  userProgress,
  onSelectBadge
}) => {
  const earnedBadges = badges.filter(b => userProgress[b.id]?.status === 'awarded');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      <div className="glass-panel" style={{
        padding: 24,
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img 
            src={user.avatarUrl} 
            alt={user.displayName}
            style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--amber-campfire)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>
              {user.displayName}'s Patch Jacket
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Outdoor vest & sash showing earned cloth badges sewn on over time.
            </p>
          </div>
        </div>

        <div style={{
          textAlign: 'right',
          background: 'rgba(255, 215, 0, 0.12)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--badge-gold)' }}>
            {earnedBadges.length}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Patches Sewn
          </div>
        </div>
      </div>

      <div style={{
        background: '#16202a',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        border: '4px solid #283747',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 28px',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 16px 40px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        <div style={{
          border: '2px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '30px 20px',
          minHeight: 400
        }}>
          {earnedBadges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Shield size={48} color="var(--border-highlight)" style={{ marginBottom: 12 }} />
              <h3 style={{ color: '#fff', marginBottom: 6 }}>No Patches Sewn Yet!</h3>
              <p style={{ maxWidth: 420, margin: '0 auto', fontSize: '0.9rem' }}>
                Complete badge requirements out in the wild, or get nominated by friends to start stitching patches onto your climbing jacket.
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
              {earnedBadges.map((badge, idx) => (
                <div
                  key={badge.id}
                  onClick={() => onSelectBadge(badge)}
                  className="patch-badge"
                  style={{
                    width: 120,
                    height: 120,
                    cursor: 'pointer',
                    transform: `rotate(${(idx % 2 === 0 ? 1 : -1) * ((idx * 3) % 7)}deg)`
                  }}
                  title={badge.title + ': ' + badge.tagline}
                >
                  {badge.imageUrl ? (
    <img src={badge.imageUrl} alt={badge.title} style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: '50%', marginBottom: 4, border: '2px solid var(--badge-gold)' }} />
  ) : (
    <Award size={36} color="var(--badge-gold)" style={{ marginBottom: 6 }} />
  )}
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    textTransform: 'uppercase'
                  }}>
                    {badge.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
