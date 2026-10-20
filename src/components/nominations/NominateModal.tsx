import React, { useState } from 'react';
import { X, UserPlus, Camera, Send, Lock } from 'lucide-react';
import type { Badge, UserProfile } from '../../types';
import { sounds } from '../../services/audio';

interface NominateModalProps {
  badge: Badge | null;
  currentUser: UserProfile | null;
  users: UserProfile[];
  onClose: () => void;
  onSubmitNomination: (badgeId: string, nomineeUserId: string, reason: string, photoFile?: File) => void;
  onSignIn?: () => void;
}

export const NominateModal: React.FC<NominateModalProps> = ({
  badge,
  currentUser,
  users,
  onClose,
  onSubmitNomination,
  onSignIn
}) => {
  if (!badge) return null;

  const [nomineeId, setNomineeId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const eligibleUsers = users.filter(u => u.uid !== currentUser?.uid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to nominate a peer!');
      return;
    }
    if (!nomineeId || !reason.trim()) {
      alert('Please select a friend and explain why they deserve this badge.');
      return;
    }
    sounds.playCarabinerClick();
    onSubmitNomination(badge.id, nomineeId, reason, photo || undefined);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 210,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div className="glass-panel" style={{
        maxWidth: 540,
        width: '100%',
        padding: 26,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 18, right: 18, color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={20} color="var(--amber-campfire)" />
          Nominate a Friend for "{badge.title}"
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: 20 }}>
          Submit their heroic or hilarious achievement to the Committee for review and vote.
        </p>

        {!currentUser ? (
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 24,
            textAlign: 'center',
            marginTop: 10
          }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: 'rgba(255, 152, 0, 0.15)',
              color: 'var(--amber-campfire)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <Lock size={22} />
            </div>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: 6 }}>
              Sign In to Nominate
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 18px auto', lineHeight: 1.5 }}>
              You must be signed in with your club account to submit peer nominations for review.
            </p>
            {onSignIn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignIn();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#fff',
                  color: '#1f2937',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Select Climbing/Camping Partner
            </label>
            <select
              value={nomineeId}
              onChange={e => setNomineeId(e.target.value)}
              style={{ width: '100%' }}
              required
            >
              <option value="">Select a friend...</option>
              {eligibleUsers.map(u => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              The Story / Evidence (Make it entertaining!)
            </label>
            <textarea
              rows={4}
              placeholder="Tell the committee what happened at the crag or campsite..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{ width: '100%', resize: 'none' }}
              required
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Attach Photo Proof (Optional)
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px dashed var(--border-highlight)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.88rem'
            }}>
              <Camera size={18} />
              <span>{photo ? photo.name : 'Upload Photo Proof'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setPhoto(f);
                    setPhotoPreview(URL.createObjectURL(f));
                  }
                }} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          {photoPreview && (
            <div style={{ marginBottom: 18 }}>
              <img 
                src={photoPreview} 
                alt="Preview" 
                style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Send size={16} />
            Submit Nomination to Committee
          </button>
        </form>
        )}
      </div>
    </div>
  );
};
