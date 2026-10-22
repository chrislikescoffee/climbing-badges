import React from 'react';
import { 
  Sunrise, ShieldCheck, Coffee, CornerUpLeft, Flame, Zap, 
  CheckCircle2, Clock, Sparkles, Mountain, Heart, Compass,
  ChevronRight
} from 'lucide-react';
import type { Badge, UserBadgeProgress, UpgradeTier } from '../../types';

interface BadgeRowCompactProps {
  badge: Badge;
  progress?: UserBadgeProgress;
  upgradeTiers: UpgradeTier[];
  onOpenDetails: (badge: Badge) => void;
}

export const BadgeRowCompact: React.FC<BadgeRowCompactProps> = ({
  badge,
  progress,
  upgradeTiers,
  onOpenDetails
}) => {
  const isAwarded = progress?.status === 'awarded';
  const isPending = progress?.status === 'pending_review';

  // Multiplier for repeatable badges (x2, x3, x4...)
  const count = progress?.awardedCount || (isAwarded ? 1 : 0);
  const showMultiplier = badge.awardType === 'repeatable' && count > 1;

  // Upgrade Tier styling
  const currentTierLevel = progress?.upgradeTier || (isAwarded ? 1 : 0);
  const currentTierObj = upgradeTiers.find(t => t.level === currentTierLevel);
  const tierColor = currentTierObj ? currentTierObj.color : '#ffd700';

  // Compute criteria progress
  let totalTarget = 0;
  let totalCurrent = 0;
  const safeRequirements = Array.isArray(badge.requirements) ? badge.requirements : [];
  safeRequirements.forEach(req => {
    totalTarget += req.targetCount || 1;
    totalCurrent += Math.min(req.targetCount || 1, progress?.progress?.[req.id]?.currentCount || 0);
  });
  const progressPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
  const isInProgress = !isAwarded && !isPending && totalCurrent > 0;

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

    const props = { size: 22, color: isAwarded ? (badge.awardType === 'upgradable' ? tierColor : 'var(--badge-gold)') : 'var(--chalk-white)' };
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

  // Border & left-accent styling
  const borderLeftAccent = isAwarded && badge.awardType === 'upgradable'
    ? `3px solid ${tierColor}`
    : isAwarded
    ? '3px solid var(--badge-gold)'
    : isPending
    ? '3px solid var(--amber-campfire)'
    : '3px solid transparent';

  const subtitleText = badge.tagline || badge.description;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(badge)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetails(badge);
        }
      }}
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 14px',
        gap: 12,
        cursor: 'pointer',
        borderLeft: borderLeftAccent,
        transition: 'all 0.18s ease',
        borderRadius: 'var(--radius-md)',
        minHeight: 58,
        outline: 'none',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      {/* Insignia / Thumbnail */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-sm)',
        background: isAwarded 
          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 152, 0, 0.25))'
          : 'var(--bg-surface-elevated)',
        border: isAwarded && badge.awardType === 'upgradable'
          ? `1.5px solid ${tierColor}`
          : isAwarded
          ? '1.5px solid var(--badge-gold)'
          : '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        {renderInsignia()}
      </div>

      {/* Main Info: Title, Multiplier, and Tagline (no category chip) */}
      <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            fontWeight: 700, 
            fontSize: '0.92rem', 
            color: '#fff',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {badge.title}
          </span>

          {showMultiplier && (
            <span style={{
              background: 'linear-gradient(135deg, #ffd700, #ff9800)',
              color: '#0f1418',
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 0 6px rgba(255, 215, 0, 0.4)',
              lineHeight: 1.2,
              flexShrink: 0
            }}>
              x{count}
            </span>
          )}
        </div>

        {subtitleText && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: 2,
            lineHeight: 1.3
          }}>
            {subtitleText}
          </div>
        )}
      </div>

      {/* Progress / Status Column */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        justifyContent: 'flex-end'
      }}>
        {isAwarded ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.72rem',
            fontWeight: 700,
            color: badge.awardType === 'upgradable' ? tierColor : 'var(--badge-gold)',
            background: badge.awardType === 'upgradable' ? `${tierColor}18` : 'rgba(255, 215, 0, 0.15)',
            border: badge.awardType === 'upgradable' ? `1px solid ${tierColor}40` : '1px solid rgba(255, 215, 0, 0.3)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            <CheckCircle2 size={12} />
            <span>{badge.awardType === 'upgradable' ? `Tier ${currentTierLevel} Earnt` : 'Earnt'}</span>
          </span>
        ) : isPending ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--amber-campfire)',
            background: 'rgba(255, 152, 0, 0.15)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            <Clock size={12} />
            <span>Under Review</span>
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 50,
              height: 5,
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: isInProgress ? 'var(--emerald-moss)' : 'transparent',
                borderRadius: 3,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{
              fontSize: '0.72rem',
              color: isInProgress ? 'var(--emerald-moss)' : 'var(--text-muted)',
              fontWeight: 600,
              textAlign: 'right',
              whiteSpace: 'nowrap'
            }}>
              {totalCurrent}/{totalTarget} reqs
            </span>
          </div>
        )}

        <ChevronRight size={15} color="var(--text-muted)" style={{ opacity: 0.5, flexShrink: 0 }} />
      </div>
    </div>
  );
};
