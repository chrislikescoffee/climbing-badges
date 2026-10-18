import React, { useRef, useState } from 'react';
import { X, Copy, Download, Check, Award } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { Badge, UserProfile } from '../../types';

interface ShareCardModalProps {
  badge: Badge | null;
  user: UserProfile;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  badge,
  user,
  onClose
}) => {
  if (!badge) return null;

  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Could not copy directly to clipboard. Try downloading the PNG instead!');
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `${user.displayName.replace(/\s+/g, '_')}_${badge.title.replace(/\s+/g, '_')}_Badge.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div className="glass-panel" style={{
        maxWidth: 440,
        width: '100%',
        padding: 24,
        position: 'relative',
        background: 'var(--bg-surface)'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 4 }}>
          Share Badge Card
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
          Copy or download to drop into your WhatsApp / Discord climbing group!
        </p>

        <div 
          ref={cardRef}
          style={{
            background: 'linear-gradient(135deg, #19232d, #0d1319)',
            border: '2px solid rgba(255, 215, 0, 0.5)',
            borderRadius: 16,
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffd700, #ff9800)',
            margin: '0 auto 14px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(255, 215, 0, 0.4)'
          }}>
            <Award size={44} color="#0f1418" />
          </div>

          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--amber-campfire)'
          }}>
            Badge Awarded!
          </span>

          <h2 style={{ fontSize: '1.45rem', color: '#fff', marginTop: 4, marginBottom: 6 }}>
            {badge.title}
          </h2>

          <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: 18 }}>
            "{badge.tagline}"
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}>
            <img 
              src={user.avatarUrl} 
              alt={user.displayName}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--badge-gold)' }}
            />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              {user.displayName}
            </span>
          </div>

          <div style={{
            marginTop: 14,
            fontSize: '0.68rem',
            color: 'var(--text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Crag & Camp Badges • Verified by Friends
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCopyImage}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-highlight)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            {copied ? <Check size={16} color="var(--emerald-moss)" /> : <Copy size={16} />}
            <span>{copied ? 'Copied Image!' : 'Copy Image'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--amber-campfire), var(--accent-rope))',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Download size={16} />
            <span>{downloading ? 'Exporting...' : 'Download PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
