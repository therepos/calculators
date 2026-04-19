import { T, ChevronLeft } from '../shared';

export default function Navbar({ title, onBack, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '0 28px', height: 56,
      borderBottom: `1px solid ${T.border}`,
      background: T.white,
      position: 'sticky', top: 0, zIndex: 100, gap: 12,
    }}>
      <div onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, color: T.accent,
        fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: -0.1,
        padding: '6px 10px', borderRadius: T.radiusSm,
        transition: T.transition,
      }}
        onMouseEnter={e => e.currentTarget.style.background = T.accentSoft}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <ChevronLeft color={T.accent} />
        <span>Praxis</span>
      </div>
      <span style={{ color: T.border2, fontSize: 16, fontWeight: 300 }}>/</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: T.text, letterSpacing: -0.3 }}>{title}</span>
      <div style={{ flex: 1 }} />
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

export function NavBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 13, fontWeight: 500, color: T.text2, padding: '7px 14px',
      borderRadius: T.radiusSm, background: T.white,
      border: `1px solid ${T.border}`, cursor: 'pointer', fontFamily: 'inherit',
      transition: T.transition,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = T.surface2; e.currentTarget.style.borderColor = T.border2; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.border; }}
    >{label}</button>
  );
}
