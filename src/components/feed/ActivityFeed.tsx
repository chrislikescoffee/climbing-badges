import React, { useState } from 'react';
import { 
  Award, Sparkles, UserPlus, FileEdit, PlusCircle, 
  Mountain, Compass, Sunrise, ShieldCheck, Coffee, CornerUpLeft, 
  Flame, Zap, Heart, Repeat, Layers, Clock, Filter 
} from 'lucide-react';
import type { ClubActivity, Badge, UpgradeTier } from '../../types';
import { formatTimeAgo } from '../../domain/activity/activityFeedService';

interface ActivityFeedProps {
  activities: ClubActivity[];
  badges: Badge[];
  upgradeTiers?: UpgradeTier[];
  onSelectBadge: (badge: Badge) => void;
}

type FeedFilter = 'all' | 'awards' | 'badges' | 'members';

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  badges,
  upgradeTiers = [],
  onSelectBadge
}) => {
  const [filter, setFilter] = useState<FeedFilter>('all');

  const filteredActivities = activities.filter(act => {
    if (filter === 'awards') return act.type === 'badge_awarded';
    if (filter === 'badges') return act.type === 'badge_created' || act.type === 'badge_updated';
    if (filter === 'members') return act.type === 'user_joined';
    return true;
  });

  const awardsCount = activities.filter(a => a.type === 'badge_awarded').length;
  const badgeEventsCount = activities.filter(a => a.type === 'badge_created' || a.type === 'badge_updated').length;
  const membersCount = activities.filter(a => a.type === 'user_joined').length;

  const renderBadgeIcon = (iconName?: string, imageUrl?: string, size = 20) => {
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt="Badge preview" 
          style={{ width: size, height: size, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} 
        />
      );
    }
    switch (iconName) {
      case 'Sunrise': return <Sunrise size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Coffee': return <Coffee size={size} />;
      case 'CornerUpLeft': return <CornerUpLeft size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Mountain': return <Mountain size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Compass': return <Compass size={size} />;
      default: return <Award size={size} />;
    }
  };

  const getTierColor = (tierLevel?: number) => {
    if (!tierLevel || tierLevel <= 1) return undefined;
    const tier = upgradeTiers.find(t => t.level === tierLevel);
    return tier?.color || '#38bdf8';
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', paddingBottom: 60 }}>
      {/* Top Banner / Summary */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08), rgba(46, 125, 50, 0.12))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 152, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--amber-campfire)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: 0 }}>
              Club News & Activity Feed
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Real-time pulses from Safe Climbing Club: member awards, new criteria, and new faces at the crag.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginTop: 20,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-campfire)' }}>{activities.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Events</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-moss)' }}>{awardsCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Badges Earned</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{badgeEventsCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Badge Releases</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e879f9' }}>{membersCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Members</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Filter size={14} />
          <span>Filter:</span>
        </div>

        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '7px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 600,
            background: filter === 'all' ? 'var(--amber-campfire)' : 'var(--bg-surface-elevated)',
            color: filter === 'all' ? '#fff' : 'var(--text-muted)',
            border: filter === 'all' ? '1px solid var(--amber-glow)' : '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          All Activity ({activities.length})
        </button>

        <button
          onClick={() => setFilter('awards')}
          style={{
            padding: '7px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 600,
            background: filter === 'awards' ? 'var(--emerald-moss)' : 'var(--bg-surface-elevated)',
            color: filter === 'awards' ? '#fff' : 'var(--text-muted)',
            border: filter === 'awards' ? '1px solid var(--emerald-pine)' : '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          Awards & Celebrations ({awardsCount})
        </button>

        <button
          onClick={() => setFilter('badges')}
          style={{
            padding: '7px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 600,
            background: filter === 'badges' ? '#0284c7' : 'var(--bg-surface-elevated)',
            color: filter === 'badges' ? '#fff' : 'var(--text-muted)',
            border: filter === 'badges' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          Badges Created & Updated ({badgeEventsCount})
        </button>

        <button
          onClick={() => setFilter('members')}
          style={{
            padding: '7px 14px',
            borderRadius: 20,
            fontSize: '0.82rem',
            fontWeight: 600,
            background: filter === 'members' ? '#a21caf' : 'var(--bg-surface-elevated)',
            color: filter === 'members' ? '#fff' : 'var(--text-muted)',
            border: filter === 'members' ? '1px solid #e879f9' : '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          New Members ({membersCount})
        </button>
      </div>

      {/* Feed Stream */}
      {filteredActivities.length === 0 ? (
        <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
          <Sparkles size={36} style={{ color: 'var(--amber-campfire)', margin: '0 auto 12px' }} />
          <h4 style={{ color: '#fff', marginBottom: 6 }}>No activity records found</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Events will appear here as members earn badges, create criteria, or join the club.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredActivities.map(act => {
            const targetBadge = act.targetBadgeId ? badges.find(b => b.id === act.targetBadgeId) : undefined;
            const tierColor = getTierColor(act.details?.upgradeTier);

            return (
              <div 
                key={act.id}
                className="glass-panel"
                onClick={() => {
                  if (targetBadge) {
                    onSelectBadge(targetBadge);
                  }
                }}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  cursor: targetBadge ? 'pointer' : 'default',
                  transition: 'transform 0.18s ease, border-color 0.18s ease',
                  border: targetBadge ? '1px solid var(--border-subtle)' : '1px solid rgba(255, 255, 255, 0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  if (targetBadge) {
                    e.currentTarget.style.borderColor = 'var(--amber-campfire)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (targetBadge) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {/* Left Event Icon Indicator */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: act.type === 'badge_awarded' 
                    ? 'rgba(46, 125, 50, 0.2)' 
                    : act.type === 'badge_created' 
                      ? 'rgba(6, 182, 212, 0.2)' 
                      : act.type === 'badge_updated' 
                        ? 'rgba(255, 152, 0, 0.2)' 
                        : 'rgba(217, 70, 239, 0.2)',
                  color: act.type === 'badge_awarded' 
                    ? 'var(--emerald-moss)' 
                    : act.type === 'badge_created' 
                      ? '#38bdf8' 
                      : act.type === 'badge_updated' 
                        ? 'var(--amber-campfire)' 
                        : '#e879f9',
                  border: tierColor ? `2px solid ${tierColor}` : undefined
                }}>
                  {act.type === 'badge_awarded' && <Award size={22} />}
                  {act.type === 'badge_created' && <PlusCircle size={22} />}
                  {act.type === 'badge_updated' && <FileEdit size={22} />}
                  {act.type === 'user_joined' && <UserPlus size={22} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {/* Avatar preview if user action */}
                      {act.actorAvatarUrl && (
                        <img 
                          src={act.actorAvatarUrl} 
                          alt={act.actorDisplayName || 'User'} 
                          style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} 
                        />
                      )}
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                        {act.actorDisplayName || (act.type === 'user_joined' ? 'New Member' : 'Committee')}
                      </span>

                      {/* Event badge tag */}
                      {act.type === 'badge_awarded' && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: 'rgba(46, 125, 50, 0.2)',
                          color: 'var(--emerald-moss)',
                          fontWeight: 700
                        }}>
                          Earned Badge
                        </span>
                      )}
                      {act.type === 'badge_created' && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: 'rgba(6, 182, 212, 0.2)',
                          color: '#38bdf8',
                          fontWeight: 700
                        }}>
                          New Badge Released
                        </span>
                      )}
                      {act.type === 'badge_updated' && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: 'rgba(255, 152, 0, 0.18)',
                          color: 'var(--amber-campfire)',
                          fontWeight: 700
                        }}>
                          Badge Updated
                        </span>
                      )}
                      {act.type === 'user_joined' && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: 'rgba(217, 70, 239, 0.2)',
                          color: '#e879f9',
                          fontWeight: 700
                        }}>
                          Joined Club
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-faint)', fontSize: '0.75rem' }}>
                      <Clock size={12} />
                      <span>{formatTimeAgo(act.timestamp)}</span>
                    </div>
                  </div>

                  {/* Target Badge Info (if applicable) */}
                  {act.targetBadgeTitle && (
                    <div style={{
                      marginTop: 8,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ color: 'var(--amber-campfire)' }}>
                          {renderBadgeIcon(act.targetBadgeIcon, act.targetBadgeImageUrl, 24)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                            {act.targetBadgeTitle}
                          </div>
                          {act.details?.summary && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {act.details.summary}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Repeatable / Tier pill if awarded */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {act.details?.awardCount && act.details.awardCount > 1 && (
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: 'rgba(255, 215, 0, 0.2)',
                            color: 'var(--badge-gold)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Repeat size={11} /> x{act.details.awardCount}
                          </span>
                        )}

                        {act.details?.upgradeTier && act.details.upgradeTier > 1 && (
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: 'rgba(6, 182, 212, 0.2)',
                            color: tierColor || '#38bdf8',
                            border: tierColor ? `1px solid ${tierColor}` : undefined,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Layers size={11} /> Tier {act.details.upgradeTier}
                          </span>
                        )}

                        <span style={{ fontSize: '0.72rem', color: 'var(--amber-campfire)', fontWeight: 600 }}>
                          View Details &rarr;
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Summary for user joined */}
                  {act.type === 'user_joined' && act.details?.summary && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '6px 0 0 0' }}>
                      {act.details.summary}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
