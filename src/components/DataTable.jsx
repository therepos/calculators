import { T, mono } from '../shared';

export default function DataTable({ headers, rows, style: s }) {
  return (
    <div style={{
      borderRadius: T.radius, overflow: 'hidden',
      border: `1px solid ${T.border}`, background: T.white,
      boxShadow: T.shadow, ...(s || {}),
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
                  background: T.surface2, color: T.text3, fontSize: 11,
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                  padding: '11px 16px',
                  textAlign: i > 0 ? 'right' : 'left',
                  borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}
                onMouseEnter={e => e.currentTarget.style.background = T.surface2}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ transition: T.transition }}
              >
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 16px', borderBottom: `1px solid ${T.border}`,
                    textAlign: ci > 0 ? 'right' : 'left',
                    fontFamily: ci > 0 ? mono : 'inherit',
                    fontSize: ci > 0 ? 13 : 13,
                    fontWeight: ci === 0 ? 500 : 400,
                    color: typeof cell === 'string' && cell.startsWith('-') ? T.red
                         : typeof cell === 'string' && cell.startsWith('$-') ? T.red
                         : T.text,
                    whiteSpace: 'nowrap',
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
