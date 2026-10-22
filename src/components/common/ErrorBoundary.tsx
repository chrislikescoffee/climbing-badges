import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught unhandled React error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    try {
      localStorage.removeItem('climbing_activities_list');
      localStorage.removeItem('climbing_badges_list');
      localStorage.removeItem('climbing_user_progress');
      localStorage.removeItem('climbing_users_list');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--bg-canvas, #0f172a)',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: 500,
            width: '100%',
            background: 'rgba(30, 41, 59, 0.85)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 16,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#ef4444'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
              Unexpected Display Glitch
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 20px', lineHeight: 1.5 }}>
              The application encountered a client rendering exception. You can reload or reset the local cache to recover.
            </p>

            {this.state.error?.message && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                color: '#fca5a5',
                marginBottom: 24,
                textAlign: 'left',
                overflowX: 'auto',
                maxHeight: 120
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'var(--amber-campfire, #f59e0b)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={15} />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleResetCache}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={15} />
                <span>Reset Local Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
