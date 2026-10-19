import { compressImage } from '../../utils/imageCompressor';
import React, { useState, useRef } from 'react';
import { Camera, Check, RotateCcw, User, Shield, Sparkles } from 'lucide-react';
import type { UserProfile } from '../../types';
import { sounds } from '../../services/audio';

interface ProfileViewProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSwitchUser: (userId: string) => void;
  onResetDefaults?: () => void;
  isCommittee: boolean;
  onOpenCreateAccount?: () => void;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',   // Cliff Scout
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',   // Alpine Fox
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',    // Boulder Kid
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoey',    // Camp Chef
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',     // Mountain Ranger
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper',  // Trail Blazer
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',    // Night Stargazer
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver'   // Carabiner Ace
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  users,
  onUpdateProfile,
  onSwitchUser,
  onResetDefaults,
  isCommittee,
  onOpenCreateAccount,
  onGoogleSignIn,
  onSignOut
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if currentUser changes via switcher
  React.useEffect(() => {
    setDisplayName(currentUser.displayName);
    setAvatarUrl(currentUser.avatarUrl);
    setSaveSuccess(false);
  }, [currentUser.uid]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 256, 256, 0.85);
      setAvatarUrl(compressed);
      setSaveSuccess(false);
    } catch (err) {
      console.error('Avatar compression failed:', err);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Display Name cannot be empty.');
      return;
    }

    sounds.playCarabinerClick();
    onUpdateProfile({
      displayName: displayName.trim(),
      avatarUrl
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const hasChanges = displayName !== currentUser.displayName || avatarUrl !== currentUser.avatarUrl;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Profile Card Header & Edit Form */}
      <div className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={22} color="var(--amber-campfire)" />
              <span>User Profile</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Manage your club callsign and custom avatar
            </p>
            {currentUser.email && (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-faint)', display: 'block', marginTop: 2 }}>
                Signed in as: {currentUser.email}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: isCommittee ? 'var(--amber-campfire)' : 'var(--text-muted)',
              background: isCommittee ? 'rgba(255, 152, 0, 0.15)' : 'var(--bg-surface-elevated)',
              border: isCommittee ? '1px solid rgba(255, 152, 0, 0.4)' : '1px solid var(--border-subtle)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Shield size={13} />
              {currentUser.role}
            </span>

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out of your account"
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  color: '#ff8080',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Save Success Alert */}
        {saveSuccess && (
          <div style={{
            background: 'rgba(46, 125, 50, 0.2)',
            border: '1px solid var(--emerald-moss)',
            color: '#a7f3d0',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.88rem',
            fontWeight: 600
          }}>
            <Check size={18} color="var(--emerald-moss)" />
            <span>Profile changes saved & synced to club records!</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
              <img
                src={avatarUrl}
                alt={displayName}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--amber-campfire)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  background: 'var(--bg-surface-elevated)'
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Profile Picture"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--amber-campfire)',
                  color: '#fff',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                }}
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-highlight)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Camera size={14} />
                  <span>Upload Photo</span>
                </button>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  PNG, JPG, or WEBP up to 2MB
                </span>
              </div>

              {/* Avatar Presets */}
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Or pick a preset avatar:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      onClick={() => setAvatarUrl(preset)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        objectFit: 'cover',
                        border: avatarUrl === preset ? '2px solid var(--amber-campfire)' : '2px solid transparent',
                        transition: 'transform 0.15s',
                        transform: avatarUrl === preset ? 'scale(1.15)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Display Name Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
              Club Callsign / Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Taylor 'CampChef' W."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              maxLength={40}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                This is how your name appears on Badge Award certificates and the Patch Jacket.
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {displayName.length}/40
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
            {hasChanges && (
              <button
                type="button"
                onClick={() => {
                  setDisplayName(currentUser.displayName);
                  setAvatarUrl(currentUser.avatarUrl);
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)'
                }}
              >
                Revert Changes
              </button>
            )}

            <button
              type="submit"
              disabled={!hasChanges}
              style={{
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: hasChanges ? 'var(--amber-campfire)' : 'rgba(255, 152, 0, 0.2)',
                color: hasChanges ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: hasChanges ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: hasChanges ? '0 4px 14px rgba(255, 152, 0, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={16} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Switch Active User (Testing & Simulation) */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <RotateCcw size={16} color="var(--amber-campfire)" />
            <span>Switch Active User</span>
          </h3>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {onGoogleSignIn && (
              <button
                onClick={onGoogleSignIn}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: '#fff',
                  border: 'none',
                  color: '#1f2937',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>+ Join with Google</span>
              </button>
            )}

            {onOpenCreateAccount && (
              <button
                onClick={onOpenCreateAccount}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 152, 0, 0.15)',
                  border: '1px solid rgba(255, 152, 0, 0.35)',
                  color: 'var(--amber-campfire)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: 'pointer'
                }}
              >
                <span>+ Create Account</span>
              </button>
            )}
          </div>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Quickly switch accounts to test how permissions and badge progress behave as Committee vs. Regular Member.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {users.map(u => {
            const isActive = currentUser.uid === u.uid;
            return (
              <button
                key={u.uid}
                onClick={() => onSwitchUser(u.uid)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(255, 152, 0, 0.15)' : 'var(--bg-surface-elevated)',
                  border: isActive ? '1px solid var(--amber-campfire)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <img
                  src={u.avatarUrl}
                  alt={u.displayName}
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', background: '#334155' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--amber-campfire)' : '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {u.displayName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {u.role} • {u.status}
                  </div>
                </div>
                {isActive && (
                  <span style={{
                    background: 'var(--amber-campfire)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Reset to Defaults Button */}
      {isCommittee && onResetDefaults && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <button
            onClick={onResetDefaults}
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-faint)',
              textDecoration: 'underline',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Reset All Demo Data to Factory Defaults
          </button>
        </div>
      )}
    </div>
  );
};
