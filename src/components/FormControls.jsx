import { T, mono } from '../shared';

export function Input({ label, hint, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          fontSize: 12, fontWeight: 500, color: T.text2, marginBottom: 6,
          display: 'block',
        }}>{label}</label>
      )}
      <input {...props} style={{
        width: '100%', height: 38, borderRadius: T.radiusSm,
        border: `1px solid ${T.border}`,
        padding: '0 12px', fontSize: 14, color: T.text,
        fontFamily: props.type === 'number' ? mono : 'inherit',
        outline: 'none', boxSizing: 'border-box', background: T.white,
        transition: T.transition,
        ...(props.style || {}),
      }}
        onFocus={e => {
          e.target.style.borderColor = T.accent;
          e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`;
        }}
        onBlur={e => {
          e.target.style.borderColor = T.border;
          e.target.style.boxShadow = 'none';
        }}
      />
      {hint && <div style={{ fontSize: 11, color: T.text4, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

export function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          fontSize: 12, fontWeight: 500, color: T.text2, marginBottom: 6, display: 'block',
        }}>{label}</label>
      )}
      <select {...props} style={{
        width: '100%', height: 38, borderRadius: T.radiusSm,
        border: `1px solid ${T.border}`,
        padding: '0 10px', fontSize: 14, color: T.text, fontFamily: 'inherit',
        outline: 'none', background: T.white, cursor: 'pointer',
        transition: T.transition,
        ...(props.style || {}),
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Segment({ options, value, onChange, style: s }) {
  return (
    <div style={{
      display: 'inline-flex', background: T.surface2, borderRadius: T.radiusSm,
      padding: 3, border: `1px solid ${T.border}`, ...(s || {}),
    }}>
      {options.map(o => (
        <div key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, padding: '6px 14px', textAlign: 'center', fontSize: 12,
          fontWeight: 500, borderRadius: T.radiusSm - 1,
          cursor: 'pointer', transition: T.transition,
          background: value === o.value ? T.white : 'transparent',
          color: value === o.value ? T.text : T.text3,
          boxShadow: value === o.value ? T.shadowSm : 'none',
        }}>{o.label}</div>
      ))}
    </div>
  );
}

export function Section({ title, children, style: s }) {
  return (
    <div style={{ marginBottom: 20, ...(s || {}) }}>
      {title && (
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: 0.5, color: T.text3, marginBottom: 12,
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', style: s, disabled }) {
  const styles = {
    primary:   { background: T.accent,  color: '#fff',    border: `1px solid ${T.accent}`,  hover: T.accentHover },
    secondary: { background: T.white,   color: T.text2,   border: `1px solid ${T.border}`,  hover: T.surface2 },
    danger:    { background: T.white,   color: T.red,     border: `1px solid ${T.redBdr}`,  hover: T.redSoft },
    ghost:     { background: 'transparent', color: T.text2, border: `1px solid transparent`, hover: T.surface2 },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = styles.hover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = styles.background; }}
      style={{
        padding: '9px 18px', borderRadius: T.radiusSm, fontSize: 13,
        fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', transition: T.transition,
        opacity: disabled ? 0.5 : 1,
        background: styles.background, color: styles.color, border: styles.border,
        ...(s || {}),
      }}>{children}</button>
  );
}

export function InfoBox({ children, variant = 'info' }) {
  const styles = {
    info:    { bg: T.accentSoft, color: T.blueSecText,    border: T.accentSoft2 },
    success: { bg: T.greenSoft,  color: T.greenDk,        border: T.greenBdr },
    warn:    { bg: T.amberSoft,  color: T.amberVal,       border: T.amberBdr },
    danger:  { bg: T.redSoft,    color: T.red,            border: T.redBdr },
  }[variant];
  return (
    <div style={{
      background: styles.bg, borderRadius: T.radius, padding: '12px 14px',
      border: `1px solid ${styles.border}`, fontSize: 13, color: styles.color,
      lineHeight: 1.55, marginBottom: 16,
    }}>{children}</div>
  );
}
