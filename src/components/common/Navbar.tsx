import React, { useState, useRef, useEffect } from 'react';
import { 
  Tent, Award, CheckSquare, Shield, Wifi, WifiOff, Cloud, CloudOff, LogOut, 
  ChevronDown, Settings, Users, Palette 
} from 'lucide-react';
import type { UserProfile } from '../../types';

export type TabKey = 'badges' | 'reviews' | 'jacket' | 'badge-mgmt' | 'user-mgmt' | 'upgrade-tiers' | 'profile';

interface NavbarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  currentUser: UserProfile | null;
  onLoginClick: () => void;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  isOnline: boolean;
  pendingOfflineCount: number;
  pendingReviewsCount: number;
  pendingEvictionsCount: number;
  isCloudConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLoginClick,
  onGoogleSignIn,
  onSignOut,
  isOnline,
  pendingOfflineCount,
  pendingReviewsCount,
  pendingEvictionsCount,
  isCloudConnected = false
}) => {
  const isCommittee = currentUser?.role === 'admin' || currentUser?.role === 'committee';
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isAdminTabActive = activeTab === 'badge-mgmt' || activeTab === 'user-mgmt' || activeTab === 'upgrade-tiers';

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 12,
      zIndex: 100,
      margin: '0 auto 24px auto',
      maxWidth: 1280,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap'
    }}>
      {/* Brand */}
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
          <h1 style={{ fontSize: '1.2rem', lineHeight: 1.1, color: '#fff' }}>Safe Climbing Club</h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--amber-campfire)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Badge tracker
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('badges')}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.86rem',
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
            fontSize: '0.86rem',
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
            fontSize: '0.86rem',
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
          <span>My Badges</span>
        </button>

        {/* Clean Admin Dropdown */}
        {isCommittee && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setAdminMenuOpen(prev => !prev)}
              style={{
                position: 'relative',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: isAdminTabActive ? '#fff' : 'var(--amber-campfire)',
                background: isAdminTabActive ? 'var(--amber-campfire)' : 'rgba(255, 152, 0, 0.12)',
                border: isAdminTabActive ? '1px solid var(--amber-glow)' : '1px solid rgba(255, 152, 0, 0.3)'
              }}
            >
              <Settings size={15} />
              <span>Admin Tools</span>
              <ChevronDown size={14} style={{ transform: adminMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              
              {pendingEvictionsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'red',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 5px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {pendingEvictionsCount}
                </span>
              )}
            </button>

            {adminMenuOpen && (
              <div 
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '115%',
                  left: 0,
                  width: 230,
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  border: '1px solid var(--border-highlight)',
                  padding: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  zIndex: 110
                }}
              >
                <button
                  onClick={() => {
                    setActiveTab('badge-mgmt');
                    setAdminMenuOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    color: activeTab === 'badge-mgmt' ? '#fff' : 'var(--text-main)',
                    background: activeTab === 'badge-mgmt' ? 'var(--bg-surface-elevated)' : 'transparent'
                  }}
                >
                  <Settings size={16} color="var(--emerald-moss)" />
                  <div>
                    <div>Badge Management</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Create & edit badges</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('user-mgmt');
                    setAdminMenuOpen(false);
                  }}
                  style={{
                    position: 'relative',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    color: activeTab === 'user-mgmt' ? '#fff' : 'var(--text-main)',
                    background: activeTab === 'user-mgmt' ? 'var(--bg-surface-elevated)' : 'transparent'
                  }}
                >
                  <Users size={16} color="var(--amber-campfire)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>User Management</span>
                      {pendingEvictionsCount > 0 && (
                        <span style={{ background: 'red', color: '#fff', fontSize: '0.62rem', padding: '1px 5px', borderRadius: 10 }}>
                          {pendingEvictionsCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Roles, eviction & voting</div>
                  </div>
                </button>

                {/* New Admin Tool: Upgrade Color Tiers */}
                <button
                  onClick={() => {
                    setActiveTab('upgrade-tiers');
                    setAdminMenuOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    color: activeTab === 'upgrade-tiers' ? '#fff' : 'var(--text-main)',
                    background: activeTab === 'upgrade-tiers' ? 'var(--bg-surface-elevated)' : 'transparent'
                  }}
                >
                  <Palette size={16} color="#38bdf8" />
                  <div>
                    <div>Upgrade Color Tiers</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Global badge border scale</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Right Side: Connectivity & Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          title={isCloudConnected ? 'Cloud Synced - Connected to Firebase Firestore' : 'Local Mode - Running in Local Storage'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isCloudConnected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.12)',
            border: isCloudConnected ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(148, 163, 184, 0.25)',
            color: isCloudConnected ? '#38bdf8' : 'var(--text-muted)'
          }}
        >
          {isCloudConnected ? <Cloud size={15} /> : <CloudOff size={15} />}
        </div>

        <div 
          title={isOnline ? 'Online - Live Sync Active' : `Offline at the Crag! ${pendingOfflineCount} items queued`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isOnline ? 'rgba(46, 125, 50, 0.15)' : 'rgba(255, 152, 0, 0.2)',
            border: isOnline ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255, 152, 0, 0.5)',
            color: isOnline ? 'var(--emerald-moss)' : 'var(--amber-campfire)'
          }}
        >
          {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                border: activeTab === 'profile' ? '2px solid var(--amber-campfire)' : isCommittee ? '1px solid rgba(255, 152, 0, 0.4)' : '1px solid var(--border-subtle)', 
                boxShadow: activeTab === 'profile' ? '0 0 12px rgba(255, 152, 0, 0.4)' : 'none'
              }}
            >
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.displayName}
                style={{ width: 28, height: 28, borderRadius: '50%', background: '#334155' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>
                  {currentUser.displayName}
                </span>
                <span style={{ fontSize: '0.66rem', color: isCommittee ? 'var(--amber-campfire)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign out of your account"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  transition: 'all 0.15s'
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn || onLoginClick}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: '#fff',
              border: 'none',
              color: '#1f2937',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        )}
      </div>
    </header>
  );
};
