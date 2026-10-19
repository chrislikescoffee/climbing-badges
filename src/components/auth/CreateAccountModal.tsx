import React, { useState, useRef } from 'react';
import { X, UserPlus, Camera, Sparkles, Shield, Mail, User } from 'lucide-react';
import type { UserProfile, UserRole } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { sounds } from '../../services/audio';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (newUser: UserProfile, switchToUser: boolean) => void;
  allowRoleSelection?: boolean;
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

function generateUserUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return 'user-' + crypto.randomUUID();
  }
  return 'user-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onCreateUser,
  allowRoleSelection = false
}) => {
  if (!isOpen) return null;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0]);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 256, 256, 0.85);
        setAvatarUrl(compressed);
      } catch (err) {
        console.error('Avatar upload failed:', err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert('Display Name / Callsign is required.');
      return;
    }

    const cleanEmail = email.trim() || `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}@safeclimbing.club`;

    const newUser: UserProfile = {
      uid: generateUserUUID(),
      displayName: displayName.trim(),
      email: cleanEmail,
      avatarUrl,
      role: allowRoleSelection ? role : 'member',
      status: 'active',
      createdAt: Date.now()
    };

    sounds.playCarabinerClick();
    onCreateUser(newUser, autoSwitch);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div className="glass-panel" style={{
        maxWidth: 520,
        width: '100%',
        padding: 28,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserPlus size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
              {allowRoleSelection ? 'Add New Club Member' : 'Join Safe Climbing Club'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Create a persistent club member account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Avatar Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
              <img
                src={avatarUrl}
                alt="Avatar preview"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--amber-campfire)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  background: '#334155'
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--amber-campfire)',
                  color: '#fff',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Camera size={13} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Pick an adventure avatar or upload your photo:
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Preset ${idx + 1}`}
                    onClick={() => setAvatarUrl(preset)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      objectFit: 'cover',
                      border: avatarUrl === preset ? '2px solid var(--amber-campfire)' : '2px solid transparent',
                      transform: avatarUrl === preset ? 'scale(1.15)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Callsign / Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
              Club Callsign / Display Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="text"
                placeholder='e.g. Sam "Dyno" J.'
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
                required
                maxLength={40}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
              This name will be displayed on badge awards, nominations, and reviews.
            </span>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
              Email Address (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="email"
                placeholder='sam@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
              />
            </div>
          </div>

          {/* Role Selection (Admin mode only) */}
          {allowRoleSelection && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                Initial Club Role
              </label>
              <div style={{ position: 'relative' }}>
                <Shield size={16} color="var(--amber-campfire)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  style={{ width: '100%', paddingLeft: 38 }}
                >
                  <option value="member">Member (Can earn badges & nominate friends)</option>
                  <option value="committee">Committee (Vote on awards & manage badges)</option>
                  <option value="admin">Admin (Full club & user administration)</option>
                </select>
              </div>
            </div>
          )}

          {/* Switch To New User Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoSwitch}
              onChange={e => setAutoSwitch(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span>Log in and switch active profile to this new account immediately</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            style={{
              padding: '11px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 152, 0, 0.4)'
            }}
          >
            <Sparkles size={16} />
            <span>Create Account & Save to Database</span>
          </button>
        </form>
      </div>
    </div>
  );
};
