import React, { useState } from 'react';
import { X, Check, Plus, Camera, Award } from 'lucide-react';
import type { Badge, UserBadgeProgress, UserProfile } from '../../types';
import { sounds } from '../../services/audio';

interface BadgeDetailModalProps {
  badge: Badge | null;
  progress?: UserBadgeProgress;
  currentUser: UserProfile | null;
  onClose: () => void;
  onLogEvidence: (
    badgeId: string, 
    requirementId: string, 
    countDelta: number, 
    text?: string, 
    photoFile?: File
  ) => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  progress,
  currentUser,
  onClose,
  onLogEvidence
}) => {
  if (!badge) return null;

  const [activeReqId, setActiveReqId] = useState<string>(badge.requirements[0]?.id || '');
  const [countDelta, setCountDelta] = useState<number>(1);
  const [noteText, setNoteText] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const selectedReq = badge.requirements.find(r => r.id === activeReqId);
  const currentReqProgress = progress?.progress?.[activeReqId];
  const isReqComplete = (currentReqProgress?.currentCount || 0) >= (selectedReq?.targetCount || 1);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to log badge progress!');
      return;
    }
    sounds.playCarabinerClick();
    onLogEvidence(badge.id, activeReqId, countDelta, noteText, selectedPhoto || undefined);
    
    setNoteText('');
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setCountDelta(1);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          padding: 28,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-highlight)',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: 'var(--text-muted)',
            padding: 6,
            borderRadius: '50%',
            background: 'var(--bg-surface-elevated)'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(255, 87, 34, 0.2))',
            border: '2px solid var(--amber-campfire)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Award size={40} color="var(--amber-campfire)" />
          </div>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 152, 0, 0.15)',
                color: 'var(--amber-campfire)'
              }}>
                {badge.category}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Approval: {badge.approvalMode === 'committee_vote' ? 'Committee Vote' : badge.approvalMode === 'single_reviewer' ? 'Single Reviewer' : 'Self Awarded'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>{badge.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{badge.description}</p>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
            Criteria & Requirements
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {badge.requirements.map(req => {
              const reqProg = progress?.progress?.[req.id];
              const count = reqProg?.currentCount || 0;
              const isDone = count >= req.targetCount;
              const isSelected = activeReqId === req.id;

              return (
                <div
                  key={req.id}
                  onClick={() => setActiveReqId(req.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--bg-surface-elevated)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid var(--amber-campfire)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: isDone ? 'var(--emerald-pine)' : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {isDone ? <Check size={16} /> : count}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>{req.title}</div>
                      {req.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.description}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDone ? 'var(--emerald-moss)' : 'var(--text-muted)' }}>
                    {count} / {req.targetCount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedReq && (
          <form onSubmit={handleSubmit} style={{
            background: 'var(--bg-surface-elevated)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-highlight)'
          }}>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} color="var(--amber-campfire)" />
              Log Partial Evidence: {selectedReq.title}
            </h4>

            {isReqComplete ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(46, 125, 50, 0.15)',
                color: 'var(--emerald-moss)',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: 14
              }}>
                <Check size={18} />
                This requirement has been reached ({currentReqProgress?.currentCount} of {selectedReq.targetCount}). You can still log more if you want!
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Count to Add (e.g. +1 clean, +2 anchors)
                </label>
                <input 
                  type="number"
                  min={1}
                  max={selectedReq.targetCount}
                  value={countDelta}
                  onChange={e => setCountDelta(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%' }}
                />
              </div>

              {(selectedReq.evidenceType === 'photo' || selectedReq.evidenceType === 'photo_and_text') && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Photo Proof (Optional)
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px dashed var(--border-highlight)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}>
                    <Camera size={16} />
                    <span>{selectedPhoto ? selectedPhoto.name.slice(0, 16) + '...' : 'Take or Pick Photo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoSelect} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              )}
            </div>

            {photoPreview && (
              <div style={{ marginBottom: 14, position: 'relative', display: 'inline-block' }}>
                <img 
                  src={photoPreview} 
                  alt="Evidence preview" 
                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                />
                <button
                  type="button"
                  onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); }}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: 'red',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  X
                </button>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                Field Notes & Crag Conditions
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Cleaned anchor on pitch 3 in gusty wind at Arapiles."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

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
                gap: 8,
                boxShadow: '0 4px 14px rgba(255, 152, 0, 0.3)'
              }}
            >
              <Check size={18} />
              Submit Evidence Log
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
