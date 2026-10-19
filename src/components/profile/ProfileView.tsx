import { compressImage } from '../../utils/imageCompressor';
import React, { useState, useRef } from 'react';
import { Camera, Check, User, Shield, Sparkles } from 'lucide-react';
import type { UserProfile } from '../../types';
import { sounds } from '../../services/audio';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetDefaults?: () => void;
  isCommittee: boolean;
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
  onUpdateProfile,
  onResetDefaults,
  isCommittee,
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
              Manage your club display name and custom avatar
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
              Club Display Name
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
                This is how your name appears on Badge Award certificates.
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
