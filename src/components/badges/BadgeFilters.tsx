import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, RotateCcw, Check, LayoutGrid, LayoutList } from 'lucide-react';

interface BadgeFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  statusFilter: 'all' | 'earnt' | 'not_awarded';
  onSelectStatus: (status: 'all' | 'earnt' | 'not_awarded') => void;
  totalBadgesCount: number;
  earntBadgesCount: number;
  notAwardedBadgesCount: number;
  filteredCount: number;
  viewMode?: 'compact' | 'expanded';
  onToggleViewMode?: (mode: 'compact' | 'expanded') => void;
}

export const BadgeFilters: React.FC<BadgeFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onSelectStatus,
  totalBadgesCount,
  earntBadgesCount,
  notAwardedBadgesCount,
  filteredCount,
  viewMode = 'compact',
  onToggleViewMode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isFiltering = statusFilter !== 'all' || selectedCategory !== 'all';

  const handleResetFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectStatus('all');
    onSelectCategory('all');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'all': return 'All Categories';
      case 'climbing': return 'Climbing';
      case 'camping': return 'Camping';
      case 'life_skills': return 'Life Skills';
      case 'milestone': return 'Milestone';
      default: return cat;
    }
  };

  const getStatusLabel = (status: 'all' | 'earnt' | 'not_awarded') => {
    switch (status) {
      case 'all': return 'All Statuses';
      case 'earnt': return 'Earnt';
      case 'not_awarded': return 'Not yet awarded';
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        marginBottom: 20, 
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: isFiltering ? '1px solid rgba(255, 152, 0, 0.35)' : '1px solid var(--border-subtle)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Collapsed Header / Summary Bar */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: isFiltering ? 'var(--amber-campfire)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}>
            <Filter size={15} />
            <span>Filters</span>
          </div>

          {/* Active Filter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: statusFilter !== 'all' ? 'rgba(255, 152, 0, 0.18)' : 'rgba(255, 255, 255, 0.06)',
              color: statusFilter !== 'all' ? 'var(--amber-campfire)' : 'var(--text-muted)',
              border: statusFilter !== 'all' ? '1px solid rgba(255, 152, 0, 0.4)' : '1px solid var(--border-subtle)',
              fontWeight: 600
            }}>
              {getStatusLabel(statusFilter)}
            </span>

            <span style={{
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: selectedCategory !== 'all' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.06)',
              color: selectedCategory !== 'all' ? '#38bdf8' : 'var(--text-muted)',
              border: selectedCategory !== 'all' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
              fontWeight: 600
            }}>
              {getCategoryLabel(selectedCategory)}
            </span>

            {isFiltering && (
              <button
                onClick={handleResetFilters}
                title="Reset filters to default"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Right side: View Mode Toggle, Badge Count + Expand Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {onToggleViewMode && (
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: 2,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onToggleViewMode('compact')}
                title="Compact list view"
                aria-label="Compact list view"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 7px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'compact' ? 'rgba(255, 152, 0, 0.2)' : 'transparent',
                  color: viewMode === 'compact' ? 'var(--amber-campfire)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'compact' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutList size={14} />
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('expanded')}
                title="Expanded cards view"
                aria-label="Expanded cards view"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 7px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'expanded' ? 'rgba(255, 152, 0, 0.2)' : 'transparent',
                  color: viewMode === 'expanded' ? 'var(--amber-campfire)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'expanded' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          )}

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredCount}</strong> of {totalBadgesCount} badges
          </span>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--amber-campfire)'
          }}>
            <span>{isExpanded ? 'Hide' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expandable Filter Controls Drawer */}
      {isExpanded && (
        <div style={{
          padding: '16px 18px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'rgba(15, 20, 24, 0.5)'
        }}>
          {/* Row 1: Award Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              minWidth: 70
            }}>
              Status:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All', count: totalBadgesCount },
                { key: 'earnt', label: 'Earnt', count: earntBadgesCount },
                { key: 'not_awarded', label: 'Not yet awarded', count: notAwardedBadgesCount }
              ].map(item => {
                const isActive = statusFilter === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectStatus(item.key as any)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: isActive ? 'var(--amber-campfire)' : 'var(--bg-surface-elevated)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      border: isActive ? '1px solid var(--amber-glow)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: isActive ? '0 2px 8px rgba(255, 152, 0, 0.3)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isActive && <Check size={12} />}
                    <span>{item.label}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-full)',
                      background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
                      color: isActive ? '#fff' : 'var(--text-faint)'
                    }}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              minWidth: 70
            }}>
              Category:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {['all', 'climbing', 'camping', 'life_skills', 'milestone'].map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: isActive ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-surface-elevated)',
                      color: isActive ? '#38bdf8' : 'var(--text-muted)',
                      border: isActive ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isActive && <Check size={12} />}
                    <span>{getCategoryLabel(cat)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
