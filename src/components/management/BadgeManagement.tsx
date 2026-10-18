import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Sunrise, ShieldCheck, Coffee, CornerUpLeft, 
  Flame, Zap, Mountain, Heart, Compass, Check, X, Award 
} from 'lucide-react';
import type { Badge, BadgeCategory, ApprovalMode, EvidenceType, BadgeRequirement } from '../../types';
import { sounds } from '../../services/audio';

interface BadgeManagementProps {
  badges: Badge[];
  onSaveBadge: (badge: Badge) => void;
  onDeleteBadge: (badgeId: string) => void;
  onToggleActive: (badgeId: string) => void;
}

const AVAILABLE_ICONS = [
  'Sunrise', 'ShieldCheck', 'Coffee', 'CornerUpLeft', 'Flame', 'Zap', 'Mountain', 'Heart', 'Compass', 'Award'
];

export const BadgeManagement: React.FC<BadgeManagementProps> = ({
  badges,
  onSaveBadge,
  onDeleteBadge,
  onToggleActive
}) => {
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form State
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BadgeCategory>('climbing');
  const [iconName, setIconName] = useState('Mountain');
  const [imageUrl, setImageUrl] = useState('');
  const [isNominatable, setIsNominatable] = useState(true);
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
    setId('badge_' + Date.now());
    setTitle('');
    setTagline('');
    setDescription('');
    setCategory('climbing');
    setIconName('Mountain');
    setImageUrl('');
    setIsNominatable(true);
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
    setIconName(badge.iconName);
    setImageUrl(badge.imageUrl || '');
    setIsNominatable(badge.isNominatable);
    setApprovalMode(badge.approvalMode);
    setRequirements(badge.requirements.map(r => ({ ...r })));
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingBadge(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || requirements.length === 0) {
      alert('Please provide a title and at least one requirement!');
      return;
    }

    const badgeData: Badge = {
      id: id || ('badge_' + Date.now()),
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      iconName,
      imageUrl: imageUrl.trim() || undefined,
      isNominatable,
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

  const renderIconPreview = (name: string, size = 20) => {
    switch (name) {
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
            Committee & Admin control panel: configure badges, mandatory evidence, and optional supplementary photo rules.
          </p>
        </div>

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
                color: 'var(--amber-campfire)'
              }}>
                {renderIconPreview(b.iconName, 26)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{b.title}</h3>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-muted)'
                  }}>
                    {b.category}
                  </span>
                  {!b.isActive && (
                    <span style={{ fontSize: '0.68rem', background: 'rgba(255, 0, 0, 0.2)', color: '#ff6b6b', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                      Inactive
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Assessment: <strong style={{ color: 'var(--amber-campfire)' }}>
                    {b.approvalMode === 'committee_vote' ? 'Majority Committee Vote' : b.approvalMode === 'single_reviewer' ? 'Approve (One Member)' : 'Self Assess'}
                  </strong> • {b.requirements.length} requirement{b.requirements.length > 1 ? 's' : ''} • {b.isNominatable ? 'Nominatable' : 'Self-log only'}
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
              Configure badge details, approval rules, and evidence criteria. All criteria support optional photographs!
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
                    <option value="banter">Banter / Fun</option>
                    <option value="milestone">Milestone</option>
                  </select>
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
                    Peer Nominations
                  </label>
                  <select
                    value={isNominatable ? 'yes' : 'no'}
                    onChange={e => setIsNominatable(e.target.value === 'yes')}
                    style={{ width: '100%' }}
                  >
                    <option value="yes">Allow Friends to Nominate</option>
                    <option value="no">Self-Logged Only</option>
                  </select>
                </div>
              </div>

              {/* Icon / Image selector */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Select Badge Icon
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AVAILABLE_ICONS.map(name => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setIconName(name)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: iconName === name ? 'var(--amber-campfire)' : 'var(--bg-surface-elevated)',
                        color: iconName === name ? '#fff' : 'var(--text-muted)',
                        border: iconName === name ? '1px solid var(--amber-glow)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {renderIconPreview(name, 18)}
                      <span style={{ fontSize: '0.78rem' }}>{name}</span>
                    </button>
                  ))}
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
                            <option value="checkbox">Completed Button / Checkbox (Photos optional)</option>
                            <option value="text">Field Note Required (Photos optional)</option>
                            <option value="photo_mandatory">Mandatory Photo Required (+ optional additional photos)</option>
                            <option value="photo_and_text">Mandatory Photo + Field Note (+ optional additional photos)</option>
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
