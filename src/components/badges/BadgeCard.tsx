import React from 'react';
import { 
  Sunrise, ShieldCheck, Coffee, CornerUpLeft, Flame, Zap, 
  CheckCircle2, Clock, Lock, Users, Sparkles, UserPlus, Mountain, Heart, Compass 
} from 'lucide-react';
import type { Badge, UserBadgeProgress, UserProfile } from '../../types';

interface BadgeCardProps {
  badge: Badge;
  progress?: UserBadgeProgress;
  awardedUsers: UserProfile[];
  onOpenDetails: (badge: Badge) => void;
  onNominate: (badge: Badge) => void;
  onShare: (badge: Badge) => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  progress,
  awardedUsers,
  onOpenDetails,
  onNominate,
  onShare
}) => {
  const renderInsignia = () => {
    // If a custom uploaded image exists, render it!
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

  const isAwarded = progress?.status === 'awarded';
  const isPending = progress?.status === 'pending_review';

  let totalTarget = 0;
  let totalCurrent = 0;
  badge.requirements.forEach(req => {
    totalTarget += req.targetCount;
    totalCurrent += Math.min(req.targetCount, progress?.progress?.[req.id]?.currentCount || 0);
  });
  const progressPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  const categoryDisplay = badge.category === 'life_skills' ? 'Life Skills' : badge.category;

  return (
    <div 
      className="glass-panel"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        border: isAwarded 
          ? '1px solid rgba(255, 215, 0, 0.4)' 
          : isPending 
          ? '1px solid rgba(255, 152, 0, 0.4)'
          : '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '3px 8px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-surface-elevated)',
          color: badge.category === 'climbing' ? 'var(--emerald-moss)' : badge.category === 'camping' ? 'var(--amber-campfire)' : badge.category === 'life_skills' ? '#38bdf8' : 'var(--slate-rock)'
        }}>
          {categoryDisplay}
        </span>

        {isAwarded ? (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--badge-gold)',
            background: 'rgba(255, 215, 0, 0.15)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            <CheckCircle2 size={13} /> Unlocked
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
        ) : progressPercent > 0 ? (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--chalk-white)',
            background: 'var(--bg-surface-elevated)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {progressPercent}% Complete
          </span>
        ) : (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.75rem',
            color: 'var(--text-faint)'
          }}>
            <Lock size={12} /> Locked
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 58,
          height: 58,
          borderRadius: 'var(--radius-md)',
          background: isAwarded 
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 152, 0, 0.35))'
            : 'var(--bg-surface-elevated)',
          border: isAwarded ? '2px solid var(--badge-gold)' : '1px solid var(--border-subtle)',
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

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
          <span>{badge.requirements.length} requirement{badge.requirements.length > 1 ? 's' : ''}</span>
          <span>{totalCurrent} / {totalTarget} done</span>
        </div>
        <div style={{
          height: 6,
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: isAwarded 
              ? 'linear-gradient(90deg, var(--badge-gold), var(--amber-campfire))'
              : 'linear-gradient(90deg, var(--emerald-pine), var(--emerald-moss))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

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
          {isAwarded ? 'View Badge' : 'Track & Log Evidence'}
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
