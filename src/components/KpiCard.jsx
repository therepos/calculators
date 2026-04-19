import { T, mono } from '../shared';

export default function KpiCard({ label, value, delta, up, useMono = true }) {
  return (
    <div style={{
      background: T.white, borderRadius: T.radiusLg, padding: '20px 22px',
      border: `1px solid ${T.border}`, boxShadow: T.shadow,
      transition: T.transition,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.6, color: T.text4,
        marginBottom: 12, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: -0.8,
        marginBottom: delta ? 10 : 0,
        fontFamily: useMono ? mono : 'inherit',
      }}>{value}</div>
      {delta && (
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: up ? T.greenDk : T.red,
          padding: '4px 10px', borderRadius: 20,
          background: up ? T.greenSoft : T.redSoft,
          display: 'inline-block',
        }}>{delta}</span>
      )}
    </div>
  );
}
