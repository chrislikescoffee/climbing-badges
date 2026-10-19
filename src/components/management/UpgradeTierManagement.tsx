import React, { useState } from 'react';
import { Palette, Plus, Trash2, Award, Sparkles, Check, RotateCcw } from 'lucide-react';
import type { UpgradeTier } from '../../types';
import { sounds } from '../../services/audio';

interface UpgradeTierManagementProps {
  tiers: UpgradeTier[];
  onSaveTiers: (tiers: UpgradeTier[]) => void;
}

export const UpgradeTierManagement: React.FC<UpgradeTierManagementProps> = ({
  tiers,
  onSaveTiers
}) => {
  const [localTiers, setLocalTiers] = useState<UpgradeTier[]>(tiers.map(t => ({ ...t })));
  const [hasChanges, setHasChanges] = useState(false);

  const handleColorChange = (index: number, newColor: string) => {
    setLocalTiers(prev => prev.map((t, i) => i === index ? { ...t, color: newColor } : t));
    setHasChanges(true);
  };

  const handleNameChange = (index: number, newName: string) => {
    setLocalTiers(prev => prev.map((t, i) => i === index ? { ...t, name: newName } : t));
    setHasChanges(true);
  };

  const handleDescChange = (index: number, newDesc: string) => {
    setLocalTiers(prev => prev.map((t, i) => i === index ? { ...t, description: newDesc } : t));
    setHasChanges(true);
  };

  const handleAddTier = () => {
    const nextLevel = localTiers.length + 1;
    const defaultColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1'];
    const chosenColor = defaultColors[(nextLevel - 1) % defaultColors.length];

    setLocalTiers(prev => [
      ...prev,
      {
        level: nextLevel,
        name: `Tier ${nextLevel}`,
        color: chosenColor,
        description: `Level ${nextLevel} mastery`
      }
    ]);
    setHasChanges(true);
  };

  const handleRemoveTier = (index: number) => {
    if (localTiers.length <= 1) {
      alert('You must have at least one upgrade tier level!');
      return;
    }
    const filtered = localTiers.filter((_, i) => i !== index).map((t, idx) => ({
      ...t,
      level: idx + 1
    }));
    setLocalTiers(filtered);
    setHasChanges(true);
  };

  const handleSave = () => {
    sounds.playCarabinerClick();
    onSaveTiers(localTiers);
    setHasChanges(false);
    alert('Upgrade Color Scale successfully saved! All upgradable badges now use this border color scheme.');
  };

  const handleReset = () => {
    setLocalTiers(tiers.map(t => ({ ...t })));
    setHasChanges(false);
  };

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', paddingBottom: 60 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Palette size={24} color="var(--amber-campfire)" />
            <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>
              Upgrade Tier Color Scale
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Manage the global border color scale and tier titles applied to all upgradable badges as members level them up.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {hasChanges && (
            <button
              onClick={handleReset}
              style={{
                padding: '9px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleAddTier}
            style={{
              padding: '9px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-highlight)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Plus size={15} />
            <span>Add Tier Level</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              background: hasChanges ? 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))' : 'var(--bg-surface-elevated)',
              color: hasChanges ? '#fff' : 'var(--text-faint)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: hasChanges ? 'pointer' : 'default',
              boxShadow: hasChanges ? '0 4px 14px rgba(255, 152, 0, 0.3)' : 'none'
            }}
          >
            <Check size={16} />
            <span>Save Color Scale</span>
          </button>
        </div>
      </div>

      {/* Live Preview Strip */}
      <div className="glass-panel" style={{ padding: 20, marginBottom: 26 }}>
        <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--amber-campfire)" />
          Live Border Scale Preview (How upgradable badges look at each level)
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 16
        }}>
          {localTiers.map(tier => (
            <div
              key={tier.level}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                textAlign: 'center',
                border: `3px solid ${tier.color}`,
                boxShadow: `0 0 18px ${tier.color}40`,
                position: 'relative'
              }}
            >
              <div style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                background: tier.color,
                color: '#000',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase'
              }}>
                Tier {tier.level}
              </div>

              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--bg-surface-elevated)',
                margin: '10px auto 8px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${tier.color}`
              }}>
                <Award size={24} color={tier.color} />
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                {tier.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {tier.description || 'Badge Border'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers Editor Table */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 16 }}>
          Manage Tier Levels & Colors
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {localTiers.map((tier, idx) => (
            <div
              key={tier.level}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: tier.color,
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
                flexShrink: 0
              }}>
                {tier.level}
              </div>

              {/* Color Picker with Native Color Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={tier.color}
                  onChange={e => handleColorChange(idx, e.target.value)}
                  style={{
                    width: 36,
                    height: 36,
                    padding: 0,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'none'
                  }}
                  title="Pick Border Color"
                />
                <input
                  type="text"
                  value={tier.color}
                  onChange={e => handleColorChange(idx, e.target.value)}
                  style={{ width: 85, fontSize: '0.8rem', padding: '6px 8px', textTransform: 'uppercase' }}
                />
              </div>

              {/* Tier Name */}
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Tier Name (e.g. Bronze, Gold)"
                  value={tier.name}
                  onChange={e => handleNameChange(idx, e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.88rem' }}
                />
              </div>

              {/* Description */}
              <div style={{ flex: 1.5 }}>
                <input
                  type="text"
                  placeholder="Short description / prestige title"
                  value={tier.description || ''}
                  onChange={e => handleDescChange(idx, e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.88rem' }}
                />
              </div>

              {/* Delete Tier */}
              {localTiers.length > 1 && (
                <button
                  onClick={() => handleRemoveTier(idx)}
                  title="Delete Tier Level"
                  style={{ color: '#ff6b6b', padding: 6 }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
