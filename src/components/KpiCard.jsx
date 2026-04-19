import { T, mono } from '../shared';

export default function KpiCard({ label, value, delta, up, useMono = true }) {
  return (
    <div style={{
      background: T.white, borderRadius: T.radiusLg, padding: '18px 20px',
      border: `1px solid ${T.border}`,
      transition: T.transition,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: T.text3,
        marginBottom: 10, textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontSize: 24, fontWeight: 600, color: T.text, letterSpacing: -0.5,
        marginBottom: delta ? 10 : 0,
        fontFamily: useMono ? mono : 'inherit',
      }}>{value}</div>
      {delta && (
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: up ? T.greenDk : T.red,
          padding: '3px 8px', borderRadius: 12,
          background: up ? T.greenSoft : T.redSoft,
          display: 'inline-block',
        }}>{delta}</span>
      )}
    </div>
  );
}
