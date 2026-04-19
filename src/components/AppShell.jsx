import { useState } from 'react';
import Sidebar from './Sidebar';
import { TOOLS, T } from '../shared';

/**
 * AppShell — outermost layout.
 *   Desktop (≥900px): fixed sidebar + content area offset by sidebar width.
 *   Mobile (<900px):  sidebar becomes slide-in drawer; content has a thin
 *                     dark topbar with hamburger + active tool name.
 */
export default function AppShell({ active, onNavigate, children }) {
  const [open, setOpen] = useState(false);
  const activeTool = TOOLS.find(t => t.id === active);
  const currentLabel = active === 'home' ? 'Home' : activeTool?.title || 'Praxis';

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        open={open}
        onClose={() => setOpen(false)}
      />

      <div className="px-content">
        {/* Mobile-only top bar with hamburger */}
        <div className="px-mobile-topbar">
          <button className="px-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6, background: T.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>P</div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentLabel}
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
