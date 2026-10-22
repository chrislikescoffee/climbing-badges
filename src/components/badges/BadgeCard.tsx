import React from 'react';
import { 
  Sunrise, ShieldCheck, Coffee, CornerUpLeft, Flame, Zap, 
  CheckCircle2, Clock, Users, Sparkles, UserPlus, Mountain, Heart, Compass 
} from 'lucide-react';
import type { Badge, UserBadgeProgress, UserProfile, UpgradeTier } from '../../types';

interface BadgeCardProps {
  badge: Badge;
  progress?: UserBadgeProgress;
  awardedUsers: UserProfile[];
  upgradeTiers: UpgradeTier[];
  onOpenDetails: (badge: Badge) => void;
  onNominate: (badge: Badge) => void;
  onShare: (badge: Badge) => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  progress,
  awardedUsers,
  upgradeTiers,
  onOpenDetails,
  onNominate,
  onShare
}) => {
  const isAwarded = progress?.status === 'awarded';
  const isPending = progress?.status === 'pending_review';

  // Multiplier for repeatable badges (x2, x3, x4...)
  const count = progress?.awardedCount || (isAwarded ? 1 : 0);
  const showMultiplier = badge.awardType === 'repeatable' && count > 1;

  // Upgrade Tier Border Color for upgradable badges
  const currentTierLevel = progress?.upgradeTier || (isAwarded ? 1 : 0);
  const currentTierObj = upgradeTiers.find(t => t.level === currentTierLevel);
  const tierColor = currentTierObj ? currentTierObj.color : '#ffd700';

  const renderInsignia = () => {
    if (badge.imageUrl) {
      return (
        <img 
          src={badge.imageUrl} 
          alt={badge.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
        />
      );
    }

    const props = { size: 30, color: 'var(--chalk-white)' };
    switch (badge.iconName) {
      case 'Sunrise': return <Sunrise {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Coffee': return <Coffee {...props} />;
      case 'CornerUpLeft': return <CornerUpLeft {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Mountain': return <Mountain {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'Compass': return <Compass {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  let totalTarget = 0;
  let totalCurrent = 0;
  const safeRequirements = Array.isArray(badge.requirements) ? badge.requirements : [];
  safeRequirements.forEach(req => {
    totalTarget += req.targetCount || 1;
    totalCurrent += Math.min(req.targetCount || 1, progress?.progress?.[req.id]?.currentCount || 0);
  });
  const progressPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  // Border and shadow dynamic styling
  const cardBorderStyle = isAwarded && badge.awardType === 'upgradable'
    ? `3px solid ${tierColor}`
    : isAwarded
    ? '1px solid rgba(255, 215, 0, 0.4)'
    : isPending
    ? '1px solid rgba(255, 152, 0, 0.4)'
    : '1px solid var(--border-subtle)';

  const cardGlowStyle = isAwarded && badge.awardType === 'upgradable'
    ? `0 0 20px ${tierColor}40`
    : 'none';

  return (
    <div 
      className="glass-panel"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        border: cardBorderStyle,
        boxShadow: cardGlowStyle,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Row: Multiplier and Status Pill (Earnt / Under Review; No Locked, No Tags) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, minHeight: 24 }}>
        <div>
          {showMultiplier && (
            <span style={{
              background: 'linear-gradient(135deg, #ffd700, #ff9800)',
              color: '#0f1418',
              fontSize: '0.78rem',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
              letterSpacing: '0.02em'
            }}>
              x{count}
            </span>
          )}
        </div>

        <div>
          {isAwarded ? (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: badge.awardType === 'upgradable' ? tierColor : 'var(--badge-gold)',
              background: badge.awardType === 'upgradable' ? `${tierColor}18` : 'rgba(255, 215, 0, 0.15)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              <CheckCircle2 size={13} /> {badge.awardType === 'upgradable' ? `Tier ${currentTierLevel} Earnt` : 'Earnt'}
            </span>
          ) : isPending ? (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--amber-campfire)',
              background: 'rgba(255, 152, 0, 0.15)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              <Clock size={13} /> Under Review
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Info */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 58,
          height: 58,
          borderRadius: 'var(--radius-md)',
          background: isAwarded 
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 152, 0, 0.35))'
            : 'var(--bg-surface-elevated)',
          border: isAwarded && badge.awardType === 'upgradable'
            ? `2px solid ${tierColor}`
            : isAwarded 
            ? '2px solid var(--badge-gold)' 
            : '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isAwarded ? '0 0 16px rgba(255, 215, 0, 0.2)' : 'none',
          overflow: 'hidden'
        }}>
          {renderInsignia()}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 4 }}>{badge.title}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.3 }}>
            "{badge.tagline}"
          </p>
        </div>
      </div>

      {/* Progress Bar & Percentage / Not Commenced */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Progress</span>
          <span style={{ 
            fontWeight: 700, 
            color: isAwarded ? 'var(--badge-gold)' : progressPercent > 0 ? '#38bdf8' : 'var(--text-faint)' 
          }}>
            {isAwarded ? '100%' : progressPercent > 0 ? `${progressPercent}%` : 'Not Commenced'}
          </span>
        </div>
        <div style={{
          height: 6,
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${isAwarded ? 100 : progressPercent}%`,
            background: isAwarded && badge.awardType === 'upgradable'
              ? `linear-gradient(90deg, ${tierColor}, var(--amber-campfire))`
              : isAwarded 
              ? 'linear-gradient(90deg, var(--badge-gold), var(--amber-campfire))'
              : 'linear-gradient(90deg, var(--emerald-pine), var(--emerald-moss))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Friends who earned this */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <Users size={14} />
          <span>Earned by {awardedUsers.length} friends:</span>
        </div>
        <div style={{ display: 'flex', marginLeft: 8 }}>
          {awardedUsers.length === 0 ? (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Be the first!</span>
          ) : (
            awardedUsers.slice(0, 4).map((u, i) => (
              <img
                key={u.uid}
                src={u.avatarUrl}
                alt={u.displayName}
                title={u.displayName}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '2px solid var(--bg-surface)',
                  marginLeft: i > 0 ? -6 : 0,
                  background: '#475569'
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Action Buttons: Review */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onOpenDetails(badge)}
          style={{
            flex: 1,
            padding: '9px 12px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-sm)',
            color: '#fff',
            fontSize: '0.84rem',
            fontWeight: 600
          }}
        >
          Review
        </button>

        {badge.isNominatable && (
          <button
            onClick={() => onNominate(badge)}
            title="Nominate a Mate"
            style={{
              padding: '9px 12px',
              background: 'rgba(255, 152, 0, 0.12)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--amber-campfire)',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <UserPlus size={15} />
            <span>Nominate</span>
          </button>
        )}

        {isAwarded && (
          <button
            onClick={() => onShare(badge)}
            title="Share Brag Card"
            style={{
              padding: '9px 12px',
              background: 'rgba(255, 215, 0, 0.12)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--badge-gold)',
              fontSize: '0.84rem',
              fontWeight: 600
            }}
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
};
