import Navbar from './Navbar';
import { T } from '../shared';

export default function ToolShell({ title, onBack, sidebar, children, actions }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      <Navbar title={title} onBack={onBack} actions={actions} />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{
          borderRight: `1px solid ${T.border}`, padding: '20px 22px',
          background: T.white,
          overflowY: 'auto', maxHeight: 'calc(100vh - 56px)',
        }}>
          {sidebar}
        </div>
        <div style={{
          padding: '24px 32px', overflowY: 'auto',
          maxHeight: 'calc(100vh - 56px)',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
