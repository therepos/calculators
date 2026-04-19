import { T, TOOLS, HomeIcon } from '../shared';

export default function Sidebar({ active, onNavigate, open, onClose }) {
  const handleNav = id => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`px-sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`px-sidebar${open ? ' open' : ''}`}>
        {/* Brand */}
        <div style={{
          padding: '22px 20px 20px',
          borderBottom: `1px solid ${T.sidebarBorder}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: -0.5,
          }}>P</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: -0.2, lineHeight: 1.1 }}>Praxis</div>
            <div style={{ fontSize: 11, color: T.sidebarTextMuted, marginTop: 2 }}>Quick tools</div>
          </div>
        </div>

        {/* Home */}
        <div style={{ padding: '14px 12px 6px' }}>
          <NavItem
            icon={HomeIcon}
            label="Home"
            active={active === 'home'}
            onClick={() => handleNav('home')}
          />
        </div>

        {/* Tools section */}
        <div style={{
          padding: '10px 20px 6px', fontSize: 10, fontWeight: 600,
          color: T.sidebarTextMuted, textTransform: 'uppercase', letterSpacing: 0.6,
        }}>Tools</div>
        <nav style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {TOOLS.map(t => (
            <NavItem
              key={t.id}
              icon={t.icon}
              label={t.title}
              active={active === t.id}
              onClick={() => handleNav(t.id)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '14px 20px', borderTop: `1px solid ${T.sidebarBorder}`,
          fontSize: 11, color: T.sidebarTextMuted, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>v1.0</span>
          <span style={{ fontFamily: T.mono }}>MIT</span>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div onClick={onClick}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.sidebarHover; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: T.radiusSm, cursor: 'pointer',
        background: active ? T.sidebarHover : 'transparent',
        color: active ? T.sidebarTextActive : T.sidebarText,
        fontSize: 13, fontWeight: active ? 500 : 400,
        transition: T.transition, whiteSpace: 'nowrap',
        borderLeft: active ? `2px solid ${T.accent}` : '2px solid transparent',
        paddingLeft: 10,
      }}>
      <Icon size={17} color={active ? '#fff' : T.sidebarText} />
      <span>{label}</span>
    </div>
  );
}
