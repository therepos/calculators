/**
 * ToolShell — content wrapper sitting beside the global Sidebar.
 * Provides: top bar (title + subtitle + actions) + full-width content area.
 * Responsive behavior is handled via .px-topbar and .px-main CSS classes.
 */
export default function ToolShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="px-topbar">
        <div className="px-topbar-titles">
          <h1 className="px-topbar-title">{title}</h1>
          {subtitle && <div className="px-topbar-sub">{subtitle}</div>}
        </div>
        {actions && <div className="px-topbar-actions">{actions}</div>}
      </header>
      <main className="px-main">{children}</main>
    </div>
  );
}
