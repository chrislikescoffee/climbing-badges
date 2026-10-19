
function generateBadgeUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'badge-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

import { compressImage } from '../../utils/imageCompressor';
import { uploadBadgeImageToStorage } from '../../services/firestoreSync';
import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Sunrise, ShieldCheck, Coffee, CornerUpLeft, 
  Flame, Zap, Mountain, Heart, Compass, Check, X, Award, Upload, Repeat, Layers 
} from 'lucide-react';
import type { Badge, BadgeCategory, ApprovalMode, EvidenceType, BadgeRequirement, BadgeAwardType } from '../../types';
import { sounds } from '../../services/audio';

interface BadgeManagementProps {
  badges: Badge[];
  onSaveBadge: (badge: Badge) => void;
  onDeleteBadge: (badgeId: string) => void;
  onToggleActive: (badgeId: string) => void;
  onForceSync?: () => void;
}

const AVAILABLE_ICONS = [
  'Sunrise', 'ShieldCheck', 'Coffee', 'CornerUpLeft', 'Flame', 'Zap', 'Mountain', 'Heart', 'Compass', 'Award'
];

export const BadgeManagement: React.FC<BadgeManagementProps> = ({
  badges,
  onSaveBadge,
  onDeleteBadge,
  onToggleActive,
  onForceSync
}) => {
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form State
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BadgeCategory>('climbing');
  const [awardType, setAwardType] = useState<BadgeAwardType>('single');
  const [iconName, setIconName] = useState('Mountain');
  const [imageUrl, setImageUrl] = useState('');
  const [isNominatable, setIsNominatable] = useState(true);
  const [isNominationOnly, setIsNominationOnly] = useState(false);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('committee_vote');
  const [requirements, setRequirements] = useState<BadgeRequirement[]>([
    {
      id: 'req_1',
      title: 'Initial Requirement',
      description: 'Detail what must be achieved...',
      targetCount: 1,
      evidenceType: 'checkbox'
    }
  ]);

  const openCreateModal = () => {
    setIsCreating(true);
    setEditingBadge(null);
    setId(generateBadgeUUID());
    setTitle('');
    setTagline('');
    setDescription('');
    setCategory('climbing');
    setAwardType('single');
    setIconName('Mountain');
    setImageUrl('');
    setIsNominatable(true);
    setIsNominationOnly(false);
    setApprovalMode('committee_vote');
    setRequirements([
      {
        id: 'req_' + Date.now(),
        title: '',
        description: '',
        targetCount: 1,
        evidenceType: 'checkbox'
      }
    ]);
  };

  const openEditModal = (badge: Badge) => {
    setIsCreating(false);
    setEditingBadge(badge);
    setId(badge.id);
    setTitle(badge.title);
    setTagline(badge.tagline);
    setDescription(badge.description);
    setCategory(badge.category);
    setAwardType(badge.awardType || 'single');
    setIconName(badge.iconName);
    setImageUrl(badge.imageUrl || '');
    setIsNominatable(badge.isNominatable);
    setIsNominationOnly(Boolean(badge.isNominationOnly));
    setApprovalMode(badge.approvalMode);
    setRequirements(badge.requirements.map(r => ({ ...r })));
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingBadge(null);
  };

  const handleCustomIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 256, 256, 0.85);
        setImageUrl(compressed);
      } catch (err) {
        console.error('Image compression failed, using direct reader:', err);
      }
    }
  };

  const handleAddRequirement = () => {
    setRequirements(prev => [
      ...prev,
      {
        id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        title: '',
        description: '',
        targetCount: 1,
        evidenceType: 'checkbox'
      }
    ]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const handleReqChange = (index: number, field: keyof BadgeRequirement, value: any) => {
    setRequirements(prev => prev.map((req, i) => i === index ? { ...req, [field]: value } : req));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || requirements.length === 0) {
      alert('Please provide a title and at least one requirement!');
      return;
    }

    const badgeId = id || generateBadgeUUID();
    let finalImageUrl = imageUrl.trim() || undefined;
    if (finalImageUrl && finalImageUrl.startsWith('data:')) {
      finalImageUrl = await uploadBadgeImageToStorage(badgeId, finalImageUrl);
    }

    const badgeData: Badge = {
      id: badgeId,
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      awardType,
      iconName,
      imageUrl: finalImageUrl,
      isNominatable,
      isNominationOnly,
      approvalMode,
      requirements: requirements.map((r, i) => ({
        ...r,
        id: r.id || (`req_${i + 1}`),
        title: r.title.trim() || `Requirement ${i + 1}`,
        targetCount: Math.max(1, Number(r.targetCount) || 1)
      })),
      createdBy: editingBadge ? editingBadge.createdBy : 'committee',
      createdAt: editingBadge ? editingBadge.createdAt : Date.now(),
      isActive: editingBadge ? editingBadge.isActive : true
    };

    sounds.playCarabinerClick();
    onSaveBadge(badgeData);
    closeModal();
  };

  const renderIconPreview = (b: Badge, size = 20) => {
    if (b.imageUrl) {
      return (
        <img 
          src={b.imageUrl} 
          alt={b.title} 
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 4 }} 
        />
      );
    }
    switch (b.iconName) {
      case 'Sunrise': return <Sunrise size={size} />;
      case 'ShieldCheck': return <ShieldCheck size={size} />;
      case 'Coffee': return <Coffee size={size} />;
      case 'CornerUpLeft': return <CornerUpLeft size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Mountain': return <Mountain size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Compass': return <Compass size={size} />;
      default: return <Award size={size} />;
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div className="glass-panel" style={{
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>
            Badge Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Committee & Admin control panel: create badges, set award type (single, repeatable x2/x3, or upgradable borders), and custom artwork.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div 
            title="All changes to badges, user accounts, and progress are automatically saved to Firebase Cloud in real time."
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8'
            }} />
            <span>Live Auto-Sync Active</span>
          </div>

          {onForceSync && (
            <button
              onClick={onForceSync}
              title="Force resync all records to Firebase"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Upload size={13} />
              <span>Force Resync</span>
            </button>
          )}

          <button
            onClick={openCreateModal}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--emerald-pine), var(--emerald-moss))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(46, 125, 50, 0.4)'
            }}
          >
            <Plus size={18} />
            <span>Create New Badge</span>
          </button>
        </div>
      </div>

      {/* Badges Table / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {badges.map(b => (
          <div 
            key={b.id} 
            className="glass-panel"
            style={{
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              opacity: b.isActive ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-highlight)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--amber-campfire)',
                overflow: 'hidden'
              }}>
                {renderIconPreview(b, 26)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{b.title}</h3>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    color: b.category === 'life_skills' ? '#38bdf8' : 'var(--text-muted)'
                  }}>
                    {b.category === 'life_skills' ? 'Life Skills' : b.category}
                  </span>

                  {/* Award Type Tag */}
                  {b.awardType === 'repeatable' ? (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(255, 215, 0, 0.2)', color: 'var(--badge-gold)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Repeat size={12} /> Repeatable (x2, x3...)
                    </span>
                  ) : b.awardType === 'upgradable' ? (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={12} /> Upgradable (Colored Borders)
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Single Award</span>
                  )}

                  {!b.isActive && (
                    <span style={{ fontSize: '0.68rem', background: 'rgba(255, 0, 0, 0.2)', color: '#ff6b6b', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Assessment: <strong style={{ color: 'var(--amber-campfire)' }}>
                    {b.approvalMode === 'committee_vote' ? 'Majority Committee Vote' : b.approvalMode === 'single_reviewer' ? 'Approve (One Member)' : 'Self Assess'}
                  </strong> • {b.requirements.length} requirement{b.requirements.length > 1 ? 's' : ''} • {b.isNominationOnly ? 'Nominated Only (No Self-Log)' : b.isNominatable ? 'Nominatable' : 'Self-log only'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => onToggleActive(b.id)}
                title={b.isActive ? 'Deactivate Badge' : 'Activate Badge'}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: b.isActive ? 'var(--text-muted)' : 'var(--emerald-moss)'
                }}
              >
                {b.isActive ? 'Deactivate' : 'Activate'}
              </button>

              <button
                onClick={() => openEditModal(b)}
                title="Edit Badge"
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: 'rgba(255, 152, 0, 0.15)',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  color: 'var(--amber-campfire)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete "${b.title}"? This cannot be undone.`)) {
                    onDeleteBadge(b.id);
                  }
                }}
                title="Delete Badge"
                style={{
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.2)',
                  color: '#ff6b6b'
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingBadge) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: 740,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: 28,
              position: 'relative'
            }}
          >
            <button 
              onClick={closeModal}
              style={{ position: 'absolute', top: 18, right: 18, color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: 6 }}>
              {isCreating ? 'Create New Badge' : `Edit "${editingBadge?.title}"`}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
              Configure badge details, award behavior (repeatable or upgradable borders), and evidence criteria.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Badge Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Rappeller"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as BadgeCategory)}
                    style={{ width: '100%' }}
                  >
                    <option value="climbing">Climbing</option>
                    <option value="camping">Camping</option>
                    <option value="life_skills">Life Skills</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              </div>

              {/* Award Behavior: Single, Repeatable, Upgradable */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                marginBottom: 14,
                border: '1px solid var(--border-highlight)'
              }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber-campfire)', marginBottom: 8 }}>
                  Award Behavior & Progression
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setAwardType('single')}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: awardType === 'single' ? 'rgba(255,255,255,0.15)' : 'var(--bg-surface)',
                      border: awardType === 'single' ? '1px solid #fff' : '1px solid var(--border-subtle)',
                      color: awardType === 'single' ? '#fff' : 'var(--text-muted)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Single Award</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unlocked once permanently</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAwardType('repeatable')}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: awardType === 'repeatable' ? 'rgba(255, 215, 0, 0.2)' : 'var(--bg-surface)',
                      border: awardType === 'repeatable' ? '1px solid var(--badge-gold)' : '1px solid var(--border-subtle)',
                      color: awardType === 'repeatable' ? '#fff' : 'var(--text-muted)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: awardType === 'repeatable' ? 'var(--badge-gold)' : undefined }}>
                      Repeatable (x2, x3...)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Earn multiple times with multiplier tag</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAwardType('upgradable')}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: awardType === 'upgradable' ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-surface)',
                      border: awardType === 'upgradable' ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                      color: awardType === 'upgradable' ? '#fff' : 'var(--text-muted)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: awardType === 'upgradable' ? '#38bdf8' : undefined }}>
                      Upgradable (Tiers)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Levels with colored borders</div>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Tagline / Teaser</label>
                <input
                  type="text"
                  placeholder="Short witty quote or teaser"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Full background and criteria summary..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              {/* Assessment Mode & Nomination Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Assessment / Approval Mode
                  </label>
                  <select
                    value={approvalMode}
                    onChange={e => setApprovalMode(e.target.value as ApprovalMode)}
                    style={{ width: '100%' }}
                  >
                    <option value="committee_vote">Vote (Majority Committee Vote)</option>
                    <option value="single_reviewer">Approve (One Committee Member)</option>
                    <option value="self">Self Assess (Instantly Awarded)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Nomination & Award Method
                  </label>
                  <select
                    value={isNominationOnly ? 'nomination_only' : isNominatable ? 'allowed' : 'none'}
                    onChange={e => {
                      if (e.target.value === 'nomination_only') {
                        setIsNominationOnly(true);
                        setIsNominatable(true);
                      } else if (e.target.value === 'allowed') {
                        setIsNominationOnly(false);
                        setIsNominatable(true);
                      } else {
                        setIsNominationOnly(false);
                        setIsNominatable(false);
                      }
                    }}
                    style={{ width: '100%' }}
                  >
                    <option value="allowed">Standard (Self-Log & Peer Nominate)</option>
                    <option value="nomination_only">Nominated Only (Peers only - No self-logging)</option>
                    <option value="none">Self-Log Only (No peer nominations)</option>
                  </select>
                </div>
              </div>

              {/* Custom Badge Icon Upload & Preset Icons */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                marginBottom: 18,
                border: '1px solid var(--border-subtle)'
              }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  Badge Insignia / Artwork
                </label>

                {/* Upload Custom Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 152, 0, 0.15)',
                    border: '1px dashed var(--amber-campfire)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'var(--amber-campfire)',
                    fontWeight: 600
                  }}>
                    <Upload size={16} />
                    <span>Upload Custom Badge Icon</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCustomIconUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {imageUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img 
                        src={imageUrl} 
                        alt="Custom badge icon preview" 
                        style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '2px solid var(--amber-campfire)' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        style={{ fontSize: '0.78rem', color: '#ff6b6b' }}
                      >
                        Remove Custom Image
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      No custom file uploaded (using standard icon below)
                    </span>
                  )}
                </div>

                {/* Preset Vector Icons Selector */}
                <div>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Or select from preset adventure icons:
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {AVAILABLE_ICONS.map(name => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => {
                          setIconName(name);
                          setImageUrl('');
                        }}
                        style={{
                          padding: '7px 11px',
                          borderRadius: 'var(--radius-sm)',
                          background: iconName === name && !imageUrl ? 'var(--amber-campfire)' : 'var(--bg-surface)',
                          color: iconName === name && !imageUrl ? '#fff' : 'var(--text-muted)',
                          border: iconName === name && !imageUrl ? '1px solid var(--amber-glow)' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span style={{ fontSize: '0.78rem' }}>{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirements Builder */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: 16,
                borderRadius: 'var(--radius-md)',
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', color: '#fff' }}>
                      Criteria & Evidence Requirements ({requirements.length})
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Users can always attach optional photos along with any requirement.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(76, 175, 80, 0.2)',
                      border: '1px solid rgba(76, 175, 80, 0.4)',
                      color: 'var(--emerald-moss)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Plus size={14} /> Add Task
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {requirements.map((req, idx) => (
                    <div 
                      key={req.id || idx}
                      style={{
                        padding: 12,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-campfire)' }}>
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Task title (e.g. Clean 5 anchors with Method A)"
                          value={req.title}
                          onChange={e => handleReqChange(idx, 'title', e.target.value)}
                          style={{ flex: 1, padding: '7px 10px' }}
                        />
                        {requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(idx)}
                            style={{ color: '#ff6b6b', padding: 4 }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: 2 }}>Target Count</label>
                          <input
                            type="number"
                            min={1}
                            value={req.targetCount}
                            onChange={e => handleReqChange(idx, 'targetCount', parseInt(e.target.value) || 1)}
                            style={{ width: '100%', padding: '6px 10px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-faint)', marginBottom: 2 }}>Mandatory Evidence Type</label>
                          <select
                            value={req.evidenceType}
                            onChange={e => handleReqChange(idx, 'evidenceType', e.target.value as EvidenceType)}
                            style={{ width: '100%', padding: '6px 10px' }}
                          >
                            <option value="checkbox">Completed Checkbox (Notes & Photos optional)</option>
                            <option value="text">Mandatory Field Note (Photos optional)</option>
                            <option value="photo_mandatory">Mandatory Photo Proof (Notes & extra photos optional)</option>
                            <option value="photo_and_text">Mandatory Photo + Mandatory Field Note (+ optional photos)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Check size={16} />
                  <span>{isCreating ? 'Create Badge' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
