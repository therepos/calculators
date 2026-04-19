import { T } from '../shared';

/**
 * ToolShell — content wrapper sitting beside the global Sidebar.
 * Provides: top bar (title + subtitle + actions) + full-width content area.
 *
 * Props:
 *   title    — string
 *   subtitle — optional string (e.g. "v8.0 · Portfolio monitor")
 *   actions  — optional JSX (buttons, right-aligned)
 *   children — page content
 */
export default function ToolShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        background: T.white, borderBottom: `1px solid ${T.border}`,
        padding: '16px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16, minHeight: 68,
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: 20, fontWeight: 600, color: T.text,
            letterSpacing: -0.3, lineHeight: 1.2,
          }}>{title}</h1>
          {subtitle && (
            <div style={{
              fontSize: 12, color: T.text3, marginTop: 3,
              fontFamily: 'inherit',
            }}>{subtitle}</div>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>
        )}
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: '28px 32px 56px' }}>
        {children}
      </main>
    </div>
  );
}
