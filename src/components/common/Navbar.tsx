import React from 'react';
import { Tent, Award, CheckSquare, Shield, User, Wifi, WifiOff } from 'lucide-react';
import type { UserProfile } from '../../types';

interface NavbarProps {
  activeTab: 'badges' | 'reviews' | 'jacket' | 'profile';
  setActiveTab: (tab: 'badges' | 'reviews' | 'jacket' | 'profile') => void;
  currentUser: UserProfile | null;
  onLoginClick: () => void;
  isOnline: boolean;
  pendingOfflineCount: number;
  pendingReviewsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLoginClick,
  isOnline,
  pendingOfflineCount,
  pendingReviewsCount
}) => {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 12,
      zIndex: 100,
      margin: '0 auto 24px auto',
      maxWidth: 1200,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }}>
      <div 
        onClick={() => setActiveTab('badges')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
          padding: 8,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
        }}>
          <Tent size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', lineHeight: 1.1, color: '#fff' }}>Crag & Camp</h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--amber-campfire)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Badges & Milestones
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => setActiveTab('badges')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: activeTab === 'badges' ? '#fff' : 'var(--text-muted)',
            background: activeTab === 'badges' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeTab === 'badges' ? '1px solid var(--border-highlight)' : '1px solid transparent'
          }}
        >
          <Award size={16} />
          <span>Badges</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            position: 'relative',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: activeTab === 'reviews' ? '#fff' : 'var(--text-muted)',
            background: activeTab === 'reviews' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeTab === 'reviews' ? '1px solid var(--border-highlight)' : '1px solid transparent'
          }}
        >
          <CheckSquare size={16} />
          <span>Reviews & Votes</span>
          {pendingReviewsCount > 0 && (
            <span style={{
              background: 'var(--accent-rope)',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)'
            }}>
              {pendingReviewsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('jacket')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: activeTab === 'jacket' ? 'var(--amber-campfire)' : 'var(--text-muted)',
            background: activeTab === 'jacket' ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
            border: activeTab === 'jacket' ? '1px solid rgba(255, 152, 0, 0.3)' : '1px solid transparent'
          }}
        >
          <Shield size={16} />
          <span>Patch Jacket</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: activeTab === 'profile' ? '#fff' : 'var(--text-muted)',
            background: activeTab === 'profile' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeTab === 'profile' ? '1px solid var(--border-highlight)' : '1px solid transparent'
          }}
        >
          <User size={16} />
          <span>Profile</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div 
          title={isOnline ? 'Online - Live Sync Active' : `Offline at the Crag! ${pendingOfflineCount} items queued`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            background: isOnline ? 'rgba(46, 125, 50, 0.15)' : 'rgba(255, 152, 0, 0.2)',
            border: isOnline ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255, 152, 0, 0.5)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isOnline ? 'var(--emerald-moss)' : 'var(--amber-campfire)'
          }}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'Online' : `Crag Queue (${pendingOfflineCount})`}</span>
        </div>

        {currentUser ? (
          <div 
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.displayName}
              style={{ width: 28, height: 28, borderRadius: '50%', background: '#334155' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
              {currentUser.displayName}
            </span>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              boxShadow: '0 4px 14px rgba(255, 152, 0, 0.3)'
            }}
          >
            Sign In with Google
          </button>
        )}
      </div>
    </header>
  );
};
