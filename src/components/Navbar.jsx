import { T } from '../shared';

/**
 * NavBtn — small outline button used in ToolShell `actions` slot.
 * Primary/secondary/danger variants.
 */
export function NavBtn({ label, onClick, variant = 'secondary' }) {
  const styles = {
    primary:   { background: T.accent,  color: '#fff',    border: `1px solid ${T.accent}`,  hover: T.accentHover },
    secondary: { background: T.white,   color: T.text2,   border: `1px solid ${T.border}`,  hover: T.surface2 },
    danger:    { background: T.white,   color: T.red,     border: `1px solid ${T.redBdr}`,  hover: T.redSoft },
  }[variant];

  return (
    <button onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = styles.hover}
      onMouseLeave={e => e.currentTarget.style.background = styles.background}
      style={{
        fontSize: 13, fontWeight: 500, padding: '8px 16px',
        borderRadius: T.radiusSm, cursor: 'pointer',
        fontFamily: 'inherit', transition: T.transition,
        background: styles.background, color: styles.color, border: styles.border,
      }}>
      {label}
    </button>
  );
}

// Legacy default export (not used but kept for import safety)
export default function Navbar() { return null; }
