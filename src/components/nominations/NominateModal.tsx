import React, { useState } from 'react';
import { X, UserPlus, Camera, Send } from 'lucide-react';
import type { Badge, UserProfile } from '../../types';
import { sounds } from '../../services/audio';

interface NominateModalProps {
  badge: Badge | null;
  currentUser: UserProfile | null;
  users: UserProfile[];
  onClose: () => void;
  onSubmitNomination: (badgeId: string, nomineeUserId: string, reason: string, photoFile?: File) => void;
}

export const NominateModal: React.FC<NominateModalProps> = ({
  badge,
  currentUser,
  users,
  onClose,
  onSubmitNomination
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
      </div>
    </div>
  );
};
