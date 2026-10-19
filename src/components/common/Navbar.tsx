import React, { useState, useRef, useEffect } from 'react';
import { 
  Tent, Award, CheckSquare, Shield, Wifi, WifiOff, Cloud, CloudOff, LogOut, 
  ChevronDown, Settings, Users, Palette, Menu, X, User 
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close desktop dropdown on outside click
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

  const handleTabSelect = (tab: TabKey) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
  };

  return (
    <header 
      ref={headerRef}
      className="glass-panel" 
      style={{
        position: 'sticky',
        top: 12,
        zIndex: 100,
        margin: '0 auto 20px auto',
        maxWidth: 1280,
        padding: '10px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: mobileMenuOpen ? 14 : 0,
        transition: 'all 0.25s ease'
      }}
    >
      {/* Top Main Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12
      }}>
        {/* Brand */}
        <div 
          onClick={() => handleTabSelect('badges')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
            padding: 7,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.25)'
          }}>
            <Tent size={20} color="#fff" />
          </div>
          <div>
            <span style={{
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #fff, #ffcc80)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
              lineHeight: 1.15
            }}>
              Crag & Camp
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Safe Climbing Club
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <nav className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => handleTabSelect('badges')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeTab === 'badges' ? '#fff' : 'var(--text-muted)',
              background: activeTab === 'badges' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'badges' ? '1px solid var(--border-highlight)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            Badges
          </button>

          <button
            onClick={() => handleTabSelect('reviews')}
            style={{
              position: 'relative',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: activeTab === 'reviews' ? '#fff' : 'var(--text-muted)',
              background: activeTab === 'reviews' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'reviews' ? '1px solid var(--border-highlight)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <CheckSquare size={15} />
            <span>Reviews</span>
            {pendingReviewsCount > 0 && (
              <span style={{
                background: 'var(--amber-campfire)',
                color: '#fff',
                fontSize: '0.66rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)'
              }}>
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabSelect('jacket')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: activeTab === 'jacket' ? '#fff' : 'var(--text-muted)',
              background: activeTab === 'jacket' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'jacket' ? '1px solid var(--border-highlight)' : '1px solid transparent',
              cursor: 'pointer'
            }}
          >
            <Award size={15} />
            <span>My Jacket</span>
          </button>

          {/* Committee Dropdown (Desktop) */}
          {isCommittee && (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setAdminMenuOpen(prev => !prev)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: isAdminTabActive ? 'var(--amber-campfire)' : 'var(--text-muted)',
                  background: isAdminTabActive || adminMenuOpen ? 'rgba(255, 152, 0, 0.12)' : 'transparent',
                  border: isAdminTabActive ? '1px solid var(--amber-glow)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Shield size={14} color={isAdminTabActive ? 'var(--amber-campfire)' : 'currentColor'} />
                <span>Committee</span>
                {(pendingEvictionsCount > 0) && (
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#ff4444'
                  }} />
                )}
                <ChevronDown size={14} style={{ transform: adminMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {adminMenuOpen && (
                <div 
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: 230,
                    padding: 6,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    zIndex: 110,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <button
                    onClick={() => handleTabSelect('badge-mgmt')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.83rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'left',
                      color: activeTab === 'badge-mgmt' ? '#fff' : 'var(--text-main)',
                      background: activeTab === 'badge-mgmt' ? 'var(--bg-surface-elevated)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Settings size={15} color="var(--amber-campfire)" />
                    <div>
                      <div>Badge Management</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Create & configure</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTabSelect('user-mgmt')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.83rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'left',
                      color: activeTab === 'user-mgmt' ? '#fff' : 'var(--text-main)',
                      background: activeTab === 'user-mgmt' ? 'var(--bg-surface-elevated)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Users size={15} color="var(--amber-campfire)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>User Management</span>
                        {pendingEvictionsCount > 0 && (
                          <span style={{ background: 'red', color: '#fff', fontSize: '0.62rem', padding: '1px 5px', borderRadius: 10 }}>
                            {pendingEvictionsCount}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roles & members</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTabSelect('upgrade-tiers')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.83rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'left',
                      color: activeTab === 'upgrade-tiers' ? '#fff' : 'var(--text-main)',
                      background: activeTab === 'upgrade-tiers' ? 'var(--bg-surface-elevated)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Palette size={15} color="#38bdf8" />
                    <div>
                      <div>Upgrade Color Tiers</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Badge border scale</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Side: Connectivity Icons & Auth Controls (Desktop) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Cloud Indicator */}
          <div
            title={isCloudConnected ? 'Cloud Synced - Connected to Firebase Firestore' : 'Local Mode - Running in Local Storage'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: isCloudConnected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.12)',
              border: isCloudConnected ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(148, 163, 184, 0.25)',
              color: isCloudConnected ? '#38bdf8' : 'var(--text-muted)'
            }}
          >
            {isCloudConnected ? <Cloud size={14} /> : <CloudOff size={14} />}
          </div>

          {/* Wifi Indicator */}
          <div 
            title={isOnline ? 'Online - Live Sync Active' : `Offline at the Crag! ${pendingOfflineCount} items queued`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: isOnline ? 'rgba(46, 125, 50, 0.15)' : 'rgba(255, 152, 0, 0.2)',
              border: isOnline ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255, 152, 0, 0.5)',
              color: isOnline ? 'var(--emerald-moss)' : 'var(--amber-campfire)'
            }}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          </div>

          {/* Desktop User Section (Hidden on Mobile) */}
          <div className="desktop-auth-controls" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div 
                  onClick={() => handleTabSelect('profile')}
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
                    style={{ width: 26, height: 26, borderRadius: '50%', background: '#334155' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>
                      {currentUser.displayName}
                    </span>
                    <span style={{ fontSize: '0.64rem', color: isCommittee ? 'var(--amber-campfire)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
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
                  fontSize: '0.8rem',
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              padding: '7px 9px',
              borderRadius: 'var(--radius-sm)',
              background: mobileMenuOpen ? 'var(--bg-surface-elevated)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              color: mobileMenuOpen ? 'var(--amber-campfire)' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Stacked Mobile Menu Drawer (Visible when hamburger is toggled) */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-drawer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Mobile User Card / Google Login */}
          {currentUser ? (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}>
              <div 
                onClick={() => handleTabSelect('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1, minWidth: 0 }}
              >
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.displayName}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: '#334155' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.displayName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isCommittee ? 'var(--amber-campfire)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {currentUser.role} • {currentUser.email || 'Google User'}
                  </div>
                </div>
              </div>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onGoogleSignIn) onGoogleSignIn();
                else onLoginClick();
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: '#fff',
                border: 'none',
                color: '#1f2937',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}

          {/* Stacked Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => handleTabSelect('badges')}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: activeTab === 'badges' ? 'var(--amber-campfire)' : '#fff',
                background: activeTab === 'badges' ? 'rgba(255, 152, 0, 0.12)' : 'var(--bg-surface-elevated)',
                border: activeTab === 'badges' ? '1px solid rgba(255, 152, 0, 0.35)' : '1px solid transparent',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <Award size={18} color="var(--amber-campfire)" />
              <span>Badges Catalogue</span>
            </button>

            <button
              onClick={() => handleTabSelect('reviews')}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: activeTab === 'reviews' ? 'var(--amber-campfire)' : '#fff',
                background: activeTab === 'reviews' ? 'rgba(255, 152, 0, 0.12)' : 'var(--bg-surface-elevated)',
                border: activeTab === 'reviews' ? '1px solid rgba(255, 152, 0, 0.35)' : '1px solid transparent',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckSquare size={18} color="var(--emerald-moss)" />
                <span>Peer Reviews</span>
              </div>
              {pendingReviewsCount > 0 && (
                <span style={{
                  background: 'var(--amber-campfire)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {pendingReviewsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabSelect('jacket')}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: activeTab === 'jacket' ? 'var(--amber-campfire)' : '#fff',
                background: activeTab === 'jacket' ? 'rgba(255, 152, 0, 0.12)' : 'var(--bg-surface-elevated)',
                border: activeTab === 'jacket' ? '1px solid rgba(255, 152, 0, 0.35)' : '1px solid transparent',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <Tent size={18} color="var(--accent-rope)" />
              <span>My Adventure Jacket</span>
            </button>

            <button
              onClick={() => handleTabSelect('profile')}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: activeTab === 'profile' ? 'var(--amber-campfire)' : '#fff',
                background: activeTab === 'profile' ? 'rgba(255, 152, 0, 0.12)' : 'var(--bg-surface-elevated)',
                border: activeTab === 'profile' ? '1px solid rgba(255, 152, 0, 0.35)' : '1px solid transparent',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <User size={18} color="#38bdf8" />
              <span>My Profile & Callsign</span>
            </button>
          </div>

          {/* Committee Section in Mobile Menu */}
          {isCommittee && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              paddingTop: 8,
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--amber-campfire)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: 4 }}>
                Committee Management
              </div>

              <button
                onClick={() => handleTabSelect('badge-mgmt')}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: activeTab === 'badge-mgmt' ? 'var(--amber-campfire)' : 'var(--text-main)',
                  background: activeTab === 'badge-mgmt' ? 'rgba(255, 152, 0, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Settings size={16} color="var(--amber-campfire)" />
                <span>Badge Management</span>
              </button>

              <button
                onClick={() => handleTabSelect('user-mgmt')}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: activeTab === 'user-mgmt' ? 'var(--amber-campfire)' : 'var(--text-main)',
                  background: activeTab === 'user-mgmt' ? 'rgba(255, 152, 0, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Users size={16} color="var(--amber-campfire)" />
                  <span>User Management</span>
                </div>
                {pendingEvictionsCount > 0 && (
                  <span style={{ background: 'red', color: '#fff', fontSize: '0.62rem', padding: '1px 5px', borderRadius: 10 }}>
                    {pendingEvictionsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabSelect('upgrade-tiers')}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: activeTab === 'upgrade-tiers' ? '#38bdf8' : 'var(--text-main)',
                  background: activeTab === 'upgrade-tiers' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Palette size={16} color="#38bdf8" />
                <span>Upgrade Color Tiers</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
