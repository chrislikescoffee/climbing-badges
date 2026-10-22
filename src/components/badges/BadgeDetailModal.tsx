import React, { useState } from 'react';
import { X, Check, Plus, Camera, Award, Image as ImageIcon, Trash2, FileText, Lock } from 'lucide-react';
import type { Badge, UserBadgeProgress, UserProfile } from '../../types';
import { sounds } from '../../services/audio';

interface BadgeDetailModalProps {
  badge: Badge | null;
  progress?: UserBadgeProgress;
  currentUser: UserProfile | null;
  onClose: () => Promise<void> | void;
  onNominate?: (badge: Badge) => void;
  onLogEvidence: (
    badgeId: string, 
    requirementId: string, 
    countDelta: number, 
    text?: string, 
    mandatoryPhoto?: File,
    optionalPhotos?: File[]
  ) => void;
  onSignIn?: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({
  badge,
  progress,
  currentUser,
  onClose,
  onNominate,
  onLogEvidence,
  onSignIn
}) => {
  if (!badge) return null;

  const safeRequirements = Array.isArray(badge.requirements) ? badge.requirements : [];
  const [activeReqId, setActiveReqId] = useState<string>(safeRequirements[0]?.id || '');
  const [countDelta, setCountDelta] = useState<number>(1);
  const [noteText, setNoteText] = useState<string>('');
  
  // Mandatory photo state (if required by badge definition)
  const [mandatoryPhoto, setMandatoryPhoto] = useState<File | null>(null);
  const [mandatoryPhotoPreview, setMandatoryPhotoPreview] = useState<string | null>(null);

  // Optional supplementary photos (can accompany ANY evidence type!)
  const [optionalPhotos, setOptionalPhotos] = useState<File[]>([]);
  const [optionalPreviews, setOptionalPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedReq = safeRequirements.find(r => r.id === activeReqId);
  const currentReqProgress = progress?.progress?.[activeReqId];
  const isReqComplete = (currentReqProgress?.currentCount || 0) >= (selectedReq?.targetCount || 1);

  const isPhotoMandatory = selectedReq?.evidenceType === 'photo_mandatory' || selectedReq?.evidenceType === 'photo_and_text';
  const isTextMandatory = selectedReq?.evidenceType === 'text' || selectedReq?.evidenceType === 'photo_and_text';

  const handleMandatoryPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMandatoryPhoto(file);
      setMandatoryPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleOptionalPhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setOptionalPhotos(prev => [...prev, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setOptionalPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeOptionalPhoto = (index: number) => {
    setOptionalPhotos(prev => prev.filter((_, i) => i !== index));
    setOptionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to log badge progress!');
      return;
    }

    if (isPhotoMandatory && !mandatoryPhoto) {
      alert('A mandatory proof photograph is required for this specific criterion.');
      return;
    }

    if (isTextMandatory && !noteText.trim()) {
      alert('Field notes are mandatory for this criterion.');
      return;
    }

    sounds.playCarabinerClick();
    setIsSubmitting(true);
    try {
      await onLogEvidence(
        badge.id, 
        activeReqId, 
        countDelta, 
        noteText.trim() || undefined, 
        mandatoryPhoto || undefined,
        optionalPhotos
      );
      
      // reset form
      setNoteText('');
      setMandatoryPhoto(null);
      setMandatoryPhotoPreview(null);
      setOptionalPhotos([]);
      setOptionalPreviews([]);
      setCountDelta(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
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
          maxWidth: 720,
          maxHeight: '92vh',
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

        {/* Header */}
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
                Assessment: {badge.approvalMode === 'committee_vote' ? 'Majority Vote' : badge.approvalMode === 'single_reviewer' ? 'Approve (One Member)' : 'Self Assess'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>{badge.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{badge.description}</p>
          </div>
        </div>

        {/* Requirements Selector */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
            Criteria & Requirements
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {safeRequirements.map(req => {
              const reqProg = progress?.progress?.[req.id];
              const count = reqProg?.currentCount || 0;
              const isDone = count >= req.targetCount;
              const isSelected = activeReqId === req.id;
              const isReqPhotoMandatory = req.evidenceType === 'photo_mandatory' || req.evidenceType === 'photo_and_text';

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
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                        {req.title}
                        {isReqPhotoMandatory && (
                          <span style={{ marginLeft: 8, fontSize: '0.72rem', color: 'var(--amber-campfire)', fontWeight: 700 }}>
                            (Photo Mandatory)
                          </span>
                        )}
                      </div>
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

        {/* Require sign in to log progress */}
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
              Sign In to Log Progress
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', maxWidth: 440, margin: '0 auto 18px auto', lineHeight: 1.5 }}>
              You must be signed in with your club account to log requirement progress, record climbs, and upload photo evidence.
            </p>
            {onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
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
        ) : badge.isNominationOnly ? (
          <div style={{
            background: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 24,
            textAlign: 'center',
            marginTop: 10
          }}>
            <Award size={36} color="var(--amber-campfire)" style={{ marginBottom: 10 }} />
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 6 }}>
              Nominated Only Badge
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto 18px auto', lineHeight: 1.5 }}>
              This badge is a special club honor that can <strong>only be awarded through peer nomination</strong> by friends and climbing mates.
              Members cannot self-log or self-nominate for this badge.
            </p>
            {onNominate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNominate(badge);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--amber-campfire)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.35)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <Award size={16} />
                <span>Nominate a Friend for this Badge</span>
              </button>
            )}
          </div>
        ) : selectedReq && (
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
                This requirement is already reached ({currentReqProgress?.currentCount} of {selectedReq.targetCount}). Additional entries still welcomed!
              </div>
            ) : null}

            {/* Target Increment */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                Count to Log in this Session (e.g. +1 clean, +2 anchors)
              </label>
              <input 
                type="number"
                min={1}
                max={selectedReq.targetCount}
                value={countDelta}
                onChange={e => setCountDelta(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: 140 }}
              />
            </div>

            {/* Mandatory Photo Section (if required) */}
            {isPhotoMandatory && (
              <div style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 152, 0, 0.08)',
                border: '1px solid rgba(255, 152, 0, 0.25)'
              }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber-campfire)', marginBottom: 6 }}>
                  Mandatory Photo Proof *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px dashed var(--amber-campfire)',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    color: '#fff',
                    fontWeight: 600
                  }}>
                    <Camera size={16} color="var(--amber-campfire)" />
                    <span>{mandatoryPhoto ? mandatoryPhoto.name.slice(0, 20) + '...' : 'Take or Select Mandatory Photo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleMandatoryPhotoSelect} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {mandatoryPhotoPreview && (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={mandatoryPhotoPreview} 
                        alt="Mandatory proof" 
                        style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--amber-campfire)' }} 
                      />
                      <button
                        type="button"
                        onClick={() => { setMandatoryPhoto(null); setMandatoryPhotoPreview(null); }}
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
                </div>
              </div>
            )}

            {/* Optional Supplementary Photographs (Always Allowed for ANY criterion!) */}
            <div style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={15} color="var(--emerald-moss)" />
                  Optional Supplementary Photographs
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                  Attach extra crag views, selfies, or partner shots
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px dashed var(--border-highlight)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)'
                }}>
                  <Camera size={15} />
                  <span>Add Optional Photo(s)</span>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    onChange={handleOptionalPhotosSelect} 
                    style={{ display: 'none' }} 
                  />
                </label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {optionalPhotos.length} optional photo{optionalPhotos.length === 1 ? '' : 's'} added
                </span>
              </div>

              {/* Gallery of Optional Previews */}
              {optionalPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {optionalPreviews.map((preview, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img 
                        src={preview} 
                        alt={`Optional preview ${idx + 1}`} 
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-highlight)' }} 
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionalPhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          background: 'rgba(0,0,0,0.8)',
                          color: '#ff6b6b',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes / Story - Mandatory or Optional */}
            <div style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 'var(--radius-sm)',
              background: isTextMandatory ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: isTextMandatory ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: isTextMandatory ? '#38bdf8' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <FileText size={15} color={isTextMandatory ? '#38bdf8' : 'var(--emerald-moss)'} />
                  <span>{isTextMandatory ? 'Mandatory Field Notes *' : 'Optional Notes & Story'}</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: isTextMandatory ? '#38bdf8' : 'var(--text-faint)' }}>
                  {isTextMandatory ? 'Mandatory detail required for this criterion' : 'Always welcomed: conditions, route, or beta'}
                </span>
              </div>
              <textarea
                rows={2}
                placeholder={isTextMandatory ? "Document mandatory details for this criterion..." : "Add optional field notes, crag conditions, partners, or story..."}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
                required={isTextMandatory}
              />
            </div>

            {/* Past Logged Evidence History */}
            {currentReqProgress && currentReqProgress.evidenceLogs && currentReqProgress.evidenceLogs.length > 0 && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Logged Evidence History ({currentReqProgress.evidenceLogs.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                  {currentReqProgress.evidenceLogs.map((log, lIdx) => (
                    <div key={log.id || lIdx} style={{ fontSize: '0.8rem', padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 2 }}>
                        <span>+{log.countDelta} logged by {log.recordedBy}</span>
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      {log.text && <div style={{ color: '#fff', fontStyle: 'italic' }}>"{log.text}"</div>}
                      {log.photoUrls && log.photoUrls.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          {log.photoUrls.map((p, pIdx) => (
                            <img key={pIdx} src={p} alt="Proof" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 'var(--radius-sm)',
                background: isSubmitting ? 'var(--bg-surface-elevated)' : 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.75 : 1,
                boxShadow: '0 4px 14px rgba(255, 152, 0, 0.3)'
              }}
            >
              <Check size={18} />
              <span>{isSubmitting ? 'Compressing & Uploading Evidence...' : 'Submit Evidence Log'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
