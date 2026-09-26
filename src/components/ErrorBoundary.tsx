import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean }

/**
 * Without this, any render-time exception unmounts the whole app and the user
 * is left staring at a blank white page with no way back.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#f1f5f9',
      }}>
        <div style={{
          maxWidth: 460, textAlign: 'center', background: '#fff', padding: '2.5rem',
          borderRadius: 14, border: '1px solid #e2e8f0',
        }}>
          <div style={{ fontSize: '2.5rem' }}>⚠️</div>
          <h1 style={{ color: '#163172', fontSize: '1.25rem', margin: '0.75rem 0' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
            The page hit an unexpected error. Reloading usually fixes it — if it keeps
            happening, please contact support.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.65rem 1.4rem', borderRadius: 8, border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Reload page
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{ padding: '0.65rem 1.4rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
