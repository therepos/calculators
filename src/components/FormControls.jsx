import { T, mono } from '../shared';

export function Input({ label, hint, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 12, fontWeight: 500, color: T.text3, marginBottom: 6,
        display: 'block', letterSpacing: -0.1,
      }}>{label}</label>
      <input {...props} style={{
        width: '100%', height: 40, borderRadius: T.radiusSm,
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
    <div style={{ marginBottom: 16 }}>
      <label style={{
        fontSize: 12, fontWeight: 500, color: T.text3, marginBottom: 6, display: 'block',
      }}>{label}</label>
      <select {...props} style={{
        width: '100%', height: 40, borderRadius: T.radiusSm,
        border: `1px solid ${T.border}`,
        padding: '0 10px', fontSize: 14, color: T.text, fontFamily: 'inherit',
        outline: 'none', background: T.white, cursor: 'pointer',
        transition: T.transition,
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Segment({ options, value, onChange, style: s }) {
  return (
    <div style={{
      display: 'flex', background: T.surface2, borderRadius: T.radiusSm,
      padding: 3, border: `1px solid ${T.border}`, ...(s || {}),
    }}>
      {options.map(o => (
        <div key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, padding: '7px 0', textAlign: 'center', fontSize: 12,
          fontWeight: 500, borderRadius: T.radiusSm - 1,
          cursor: 'pointer', letterSpacing: -0.1, transition: T.transition,
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
    <div style={{ marginBottom: 22, ...(s || {}) }}>
      {title && (
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: 0.8, color: T.text4, marginBottom: 14,
          paddingBottom: 8, borderBottom: `1px solid ${T.border}`,
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', style: s }) {
  const styles = {
    primary: { background: T.accent, color: '#fff', border: 'none', boxShadow: '0 1px 3px rgba(59,91,219,0.3)' },
    secondary: { background: T.white, color: T.text2, border: `1px solid ${T.border}`, boxShadow: T.shadowSm },
    danger: { background: 'transparent', color: T.red, border: `1px solid rgba(224,49,49,0.25)` },
  };
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', borderRadius: T.radiusSm, fontSize: 13,
      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      letterSpacing: -0.1, transition: T.transition,
      ...styles[variant], ...(s || {}),
    }}>{children}</button>
  );
}

export function InfoBox({ children }) {
  return (
    <div style={{
      background: T.accentSoft, borderRadius: T.radius, padding: '14px 16px',
      border: `1px solid rgba(59,91,219,0.12)`, fontSize: 13, color: T.text2,
      lineHeight: 1.6, marginBottom: 16,
    }}>{children}</div>
  );
}
