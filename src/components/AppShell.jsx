import Sidebar from './Sidebar';
import { T } from '../shared';

/**
 * AppShell — the outermost layout: persistent dark Sidebar on the left,
 * full-width content area on the right. Renders the active view.
 */
export default function AppShell({ active, onNavigate, children }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Sidebar active={active} onNavigate={onNavigate} />
      <div style={{
        marginLeft: T.sidebarWidth,
        minHeight: '100vh',
      }}>
        {children}
      </div>
    </div>
  );
}
