import { useState, useRef, useEffect } from 'react';
import { T, mono } from '../../shared';

/* ═══════════════════════════════════════════════════════════════
   Portfolio Monitor — port of the PM view from engeconomics.html.
   Imports firm monitoring XLSX (SheetJS from CDN), triages
   engagements, recommends strategies, and supports scenario modelling.
   ═══════════════════════════════════════════════════════════════ */

// Load SheetJS from CDN lazily
function loadXLSX() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error('Failed to load SheetJS'));
    document.head.appendChild(s);
  });
}

const pmF = v => v == null || isNaN(v) ? '—'
  : Math.abs(v) >= 1000
    ? `${v < 0 ? '-' : ''}$${Math.abs(Math.round(v / 1000))}K`
    : `$${Math.round(v).toLocaleString()}`;
const pmFull = v => v == null || isNaN(v) ? '—' : `$${Math.round(v).toLocaleString()}`;
const pmPct = v => v == null || isNaN(v) ? '—' : `${Math.round(v * 100)}%`;

const STRATEGIES = [
  { n: 1, t: 'Fee uplift',        d: 'Negotiate scope-change billing to cover actual effort beyond original TER.',       w: 'Scope genuinely expanded, high margin, client allows renegotiation.',   accent: T.green   },
  { n: 2, t: 'Mix downgrade',     d: 'Replace senior hours with junior staff on remaining work. Reduces cost rate.',    w: 'Remaining work is execution-heavy. Rate gap between ranks is significant.', accent: T.accent  },
  { n: 3, t: 'Cross-eng realloc', d: 'Shift staff hours from overrun to engagement with budget headroom.',              w: 'Same-partner engagements have backlog. Small overruns that absorb quietly.', accent: '#8B5CF6' },
  { n: 4, t: 'Accelerate billing', d: 'Invoice completed work not yet billed. Converts NUI into AR.',                    w: 'Large NUI balance with completed work. Billing lag, not cost problem.',     accent: '#E49B0F' },
  { n: 5, t: 'Hours cap',          d: 'Set hard ceiling on remaining hours. Forces efficiency, prevents bleed.',         w: 'Near-overrun (90–100%). Work close to completion. Small discipline change.', accent: T.text    },
  { n: 6, t: 'Reduce scope',       d: 'Drop low-value workstreams. Client pays same, delivery cost drops.',              w: 'Fee uplift not possible but client flexible on deliverables.',              accent: '#EC4899' },
  { n: 7, t: 'Write-off',          d: 'Formally write off unrecoverable NUI. Last resort — stop bleeding hours.',        w: "Client won't pay more, no scope justification, legacy overrun.",            accent: T.red     },
];

function recommend(status, margin, nui, backlog, terPct, terBud, terAct) {
  const s = [];
  if (status === 'overrun') {
    const excess = (terAct || 0) - (terBud || 0);
    if (margin != null && margin > 0.4) s.push({ id: 1, label: 'Fee Uplift', tone: 'green' });
    if (excess > 0 && excess < 5000) s.push({ id: 3, label: 'Cross-Eng', tone: 'purple' });
    if (nui != null && nui > 20000) s.push({ id: 4, label: 'Bill NUI', tone: 'amber' });
    if (excess > 50000 || (terBud && terAct && terAct / terBud > 3)) s.push({ id: 7, label: 'Write-Off', tone: 'red' });
    if (margin != null && margin > 0.25 && margin < 0.6 && s.length < 2) s.push({ id: 2, label: 'Mix Downgrade', tone: 'blue' });
    if (backlog == null || backlog <= 0 || isNaN(backlog)) s.push({ id: 8, label: 'Close', tone: 'gray' });
    if (!s.length) s.push({ id: 1, label: 'Fee Uplift', tone: 'green' });
  } else if (status === 'near') {
    if (nui != null && nui > 20000) s.push({ id: 4, label: 'Bill NUI', tone: 'amber' });
    s.push({ id: 5, label: 'Hours Cap', tone: 'dark' });
    if (margin != null && margin < 0.35 && margin > 0.15) s.push({ id: 2, label: 'Mix Downgrade', tone: 'blue' });
  }
  return s;
}

const pillTones = {
  red:    { bg: '#FECDD3', color: '#9F1239' },
  amber:  { bg: '#FEF3C7', color: '#92400E' },
  green:  { bg: '#D1FAE5', color: '#065F46' },
  blue:   { bg: '#DBEAFE', color: '#1E40AF' },
  gray:   { bg: '#E5E7EB', color: '#374151' },
  purple: { bg: '#EDE9FE', color: '#5B21B6' },
  dark:   { bg: T.text,    color: '#fff'   },
};

function Pill({ tone, children }) {
  const t = pillTones[tone] || pillTones.gray;
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 10, whiteSpace: 'nowrap',
      textTransform: 'uppercase', letterSpacing: 0.4,
      background: t.bg, color: t.color, marginRight: 4,
    }}>{children}</span>
  );
}

export default function PortfolioMonitor({ onOpenEngagement }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    loadXLSX().catch(e => setError(e.message));
  }, []);

  const handleFile = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setLoading(true); setError('');
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const XLSX = await loadXLSX();
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
        const parsed = [];
        rows.forEach(r => {
          const name = r['Engagement Name (ID) Currency'];
          if (!name || !r['Engagement Count']) return;
          const client = (r['Client Name (ID)'] || '').split('(')[0].trim();
          const clientIdMatch = (r['Client Name (ID)'] || '').match(/\((\d+)\)/);
          const clientId = clientIdMatch ? clientIdMatch[1] : '';
          const terPct  = r['TER % Completion*'];
          const nui     = r['NUI ETD'];
          const margin  = r['Margin % Act'];
          const terBud  = r['TER Bud*'];
          const terAct  = r['TER Act'];
          const backlog = r['Backlog ETG'];
          const hours   = r['Total Hours Act'];
          const labCost = r['Labor Cost Act'];
          const ansr    = r['ANSR Act'];
          const billing = r['Total Billing excl Tax Act'];
          const expense = r['Expense Act'];
          const ar      = r['AR ETD'];
          let status = 'ok';
          if (terPct != null && terPct > 1) status = 'overrun';
          else if (terPct != null && terPct > 0.9) status = 'near';
          const strats = recommend(status, margin, nui, backlog, terPct, terBud, terAct);
          parsed.push({
            name: name.split('(')[0].trim(), engId: name,
            client, clientId, status, terPct, nui, margin,
            terBud, terAct, backlog, hours, labCost, ansr,
            billing, expense, ar, strats,
          });
        });
        parsed.sort((a, b) => {
          const o = { overrun: 0, near: 1, ok: 2 };
          if (o[a.status] !== o[b.status]) return o[a.status] - o[b.status];
          return (b.terPct || 0) - (a.terPct || 0);
        });
        setData(parsed);
      } catch (err) {
        setError(err.message || 'Failed to parse file');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(f);
    e.target.value = '';
  };

  // KPIs
  const total = data.length;
  const ov = data.filter(d => d.status === 'overrun').length;
  const nr = data.filter(d => d.status === 'near').length;
  const totalNui = data.reduce((s, d) => s + (d.nui != null && !isNaN(d.nui) ? d.nui : 0), 0);
  let totalMarginW = 0, totalTer = 0;
  data.forEach(d => { if (d.margin != null && d.terAct != null) { totalMarginW += d.margin * d.terAct; totalTer += d.terAct; } });
  const avgM = totalTer > 0 ? totalMarginW / totalTer : 0;

  return (
    <div>
      {/* Import bar */}
      <div style={{
        background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius,
        padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center',
        flexWrap: 'wrap', marginBottom: 18,
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>Portfolio monitor</div>
          <div style={{ fontSize: 12, color: T.text3 }}>Import the firm's monitoring XLSX to auto-triage engagements.</div>
        </div>
        <button onClick={() => fileRef.current?.click()} style={{
          padding: '9px 18px', borderRadius: T.radiusSm, border: `1px solid ${T.accent}`,
          background: T.accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>{loading ? 'Loading…' : 'Import XLSX'}</button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: 'none' }} />
      </div>

      {error && (
        <div style={{
          background: T.redSoft, border: `1px solid ${T.redBdr}`,
          borderRadius: T.radius, padding: '10px 14px', fontSize: 13,
          color: T.red, marginBottom: 14,
        }}>{error}</div>
      )}

      {data.length === 0 && !loading && !error && (
        <div style={{
          background: T.white, border: `1px dashed ${T.border}`, borderRadius: T.radius,
          padding: 48, textAlign: 'center', color: T.text3, fontSize: 13,
        }}>
          Upload a monitoring XLSX to see triage, reallocation, and strategy suggestions across your portfolio.
        </div>
      )}

      {data.length > 0 && (
        <>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 18 }}>
            <KpiBig label="Engagements" value={total} sub="Active ETD" />
            <KpiBig label="Overrun" value={ov} sub="TER > 100%" color={T.red} />
            <KpiBig label="Near overrun" value={nr} sub="TER 90–100%" color="#E49B0F" />
            <KpiBig label="Total NUI" value={pmF(totalNui)} sub="Net unbilled" color={T.red} />
            <KpiBig label="Avg margin" value={pmPct(avgM)} sub="Weighted" />
          </div>

          {/* Playbook toggle */}
          <div style={{ marginBottom: 18 }}>
            <div onClick={() => setShowPlaybook(!showPlaybook)} style={{
              fontSize: 15, fontWeight: 600, color: T.text, cursor: 'pointer',
              padding: '10px 0', userSelect: 'none',
            }}>Strategy playbook {showPlaybook ? '▾' : '▸'}</div>
            {showPlaybook && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12, marginTop: 8,
              }}>
                {STRATEGIES.map(s => (
                  <div key={s.n} style={{
                    background: T.white, border: `1px solid ${T.border}`,
                    borderLeft: `4px solid ${s.accent}`,
                    borderRadius: T.radius, padding: '16px 18px', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: 12, right: 14,
                      fontSize: 22, fontWeight: 700, color: T.border2, fontFamily: mono,
                    }}>{s.n}</div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, paddingRight: 26 }}>{s.t}</h4>
                    <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginBottom: 8 }}>{s.d}</p>
                    <div style={{
                      fontSize: 11, padding: '7px 10px', background: T.surface2,
                      borderRadius: 4, color: T.text2, lineHeight: 1.4,
                    }}><strong>Use when:</strong> {s.w}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Triage table */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 12 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, background: T.accent, borderRadius: 2, marginRight: 8, verticalAlign: 'middle' }} />
              Auto-triage — recommended actions
            </div>
            <div style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius,
              overflow: 'hidden', overflowX: 'auto',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Status', 'Engagement', 'Client', 'TER Bud', 'TER Act', 'TER %', 'NUI', 'Margin', 'Backlog', 'Strategy', 'Action'].map((h, i) => (
                      <th key={i} style={{
                        background: T.text, color: '#fff',
                        padding: '11px 12px', textAlign: i >= 3 && i <= 8 ? 'right' : 'left',
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4,
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => {
                    const rowBg = d.status === 'overrun' ? '#FFF0F2' : d.status === 'near' ? '#FFFBE6' : '#F0FFF5';
                    const terCol = d.status === 'overrun' ? T.red : d.status === 'near' ? '#E49B0F' : T.green;
                    const nuiCol = (d.nui != null && d.nui > 0) ? T.red : T.green;
                    const mCol = (d.margin != null && d.margin < 0.15) ? T.red : T.text;
                    return (
                      <tr key={i} style={{ background: rowBg, borderBottom: `1px solid ${T.border}` }}>
                        <td style={ctd()}>
                          <Pill tone={d.status === 'overrun' ? 'red' : d.status === 'near' ? 'amber' : 'green'}>
                            {d.status === 'overrun' ? 'Overrun' : d.status === 'near' ? 'Near' : 'OK'}
                          </Pill>
                        </td>
                        <td style={{ ...ctd(), fontWeight: 600, maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          onClick={() => onOpenEngagement?.(d)}
                          onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.cursor = 'pointer'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.textDecoration = 'none'; }}
                          title="Open in calculator">{d.name}</td>
                        <td style={{ ...ctd(), maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.client}</td>
                        <td style={ctd('right', true)}>{pmFull(d.terBud)}</td>
                        <td style={ctd('right', true)}>{pmFull(d.terAct)}</td>
                        <td style={{ ...ctd('right', true), color: terCol, fontWeight: d.status === 'overrun' ? 700 : 500 }}>{pmPct(d.terPct)}</td>
                        <td style={{ ...ctd('right', true), color: nuiCol }}>{pmF(d.nui)}</td>
                        <td style={{ ...ctd('right', true), color: mCol }}>{pmPct(d.margin)}</td>
                        <td style={ctd('right', true)}>{pmF(d.backlog)}</td>
                        <td style={ctd()}>
                          {d.strats.map((s, k) => <Pill key={k} tone={s.tone}>{s.id} {s.label}</Pill>)}
                        </td>
                        <td style={ctd()}>
                          <button onClick={() => setSelected(i)} style={{
                            padding: '6px 12px', borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
                            background: T.white, color: T.text2, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                          }}>Scenario</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: T.text3, marginTop: 8, fontStyle: 'italic' }}>
              Click engagement name to open in calculator. Click "Scenario" to model management actions.
            </p>
          </div>

          {/* Scenario */}
          {selected != null && data[selected] && (
            <Scenario d={data[selected]} onOpen={() => onOpenEngagement?.(data[selected])} />
          )}
        </>
      )}
    </div>
  );
}

function KpiBig({ label, value, sub, color }) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`,
      borderRadius: T.radius, padding: '18px 16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, fontFamily: mono, color: color || T.text }}>{value}</div>
      <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ctd(align = 'left', monoFam) {
  return {
    padding: '10px 12px', fontSize: 13,
    textAlign: align, fontFamily: monoFam ? mono : 'inherit',
    color: T.text,
  };
}

function Scenario({ d, onOpen }) {
  const excess = Math.max(0, (d.terAct || 0) - (d.terBud || 0));
  const fee = d.terAct || 0, nui = d.nui || 0, mgn = d.margin || 0;
  const scenarios = [
    { id: 1, t: 'Fee Uplift',         desc: `Bill ${pmF(excess)} variation`,                imp: nui > 0 ? `NUI → ${pmF(Math.max(0, nui - excess))}` : 'Already covered', col: T.green,  show: excess > 0 },
    { id: 2, t: 'Mix Downgrade',      desc: `Swap senior→junior, save ~${pmF(Math.round(fee * 0.05))}`, imp: `Margin → ${mgn > 0 ? pmPct(mgn + 0.03) : 'improved'}`, col: T.accent, show: true },
    { id: 3, t: 'Cross-Eng Realloc',  desc: 'Shift hours to headroom engagement',            imp: `Absorb ${pmF(Math.min(excess, 15000))} quietly`, col: '#8B5CF6', show: excess > 0 && excess < 50000 },
    { id: 4, t: 'Accelerate Billing', desc: `Invoice ${pmF(nui)} NUI now`,                   imp: nui > 0 ? 'NUI → $0 if billable' : 'No NUI',  col: '#E49B0F', show: nui > 5000 },
    { id: 5, t: 'Hours Cap',          desc: `Hard stop at current ${Math.round(d.hours || 0)} hrs`, imp: 'Prevents further bleed',               col: T.text,   show: true },
    { id: 6, t: 'Reduce Scope',       desc: 'Drop low-value workstream',                      imp: `Cost → -${pmF(Math.round(fee * 0.08))}`,      col: '#EC4899', show: d.status !== 'ok' },
    { id: 7, t: 'Write-Off',          desc: `Write off ${pmF(nui)} NUI`,                      imp: 'NUI → $0 (loss absorbed)',                   col: T.red,    show: nui > 0 },
  ].filter(s => s.show);

  const billedPct = d.billing && d.terAct ? Math.min(d.billing / d.terAct * 100, 100) : 50;
  const nuiPct = d.nui && d.terAct ? Math.max(d.nui / d.terAct * 100, 0) : 0;
  const overPct = d.terPct > 1 ? Math.min((d.terPct - 1) * 100, 60) : 0;
  const availPct = Math.max(0, 100 - billedPct - nuiPct);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 12 }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, background: T.accent, borderRadius: 2, marginRight: 8, verticalAlign: 'middle' }} />
        Scenario modelling — {d.name}
      </div>
      <div style={{
        background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
        padding: '18px 20px',
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
        <div style={{ fontSize: 13, color: T.text3, marginBottom: 10 }}>
          TER: {pmPct(d.terPct)} | Budget: {pmFull(d.terBud)} | Actual: {pmFull(d.terAct)} | NUI: {pmF(d.nui)} | Margin: {pmPct(d.margin)}
        </div>
        {d.terBud && d.terAct && (
          <div style={{
            display: 'flex', height: 28, borderRadius: T.radiusSm, overflow: 'hidden',
            fontSize: 11, fontWeight: 600, color: '#fff', marginTop: 10, marginBottom: 12,
          }}>
            {billedPct > 0 && <div style={{ width: `${billedPct}%`, background: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Billed</div>}
            {nuiPct > 2 && <div style={{ width: `${nuiPct}%`, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>NUI</div>}
            {overPct > 0 && <div style={{ width: `${Math.min(overPct, 30)}%`, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Over</div>}
            {availPct > 2 && <div style={{ width: `${availPct}%`, background: '#86EFAC', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Avail</div>}
          </div>
        )}
        <div style={{ fontSize: 13, color: T.text3, marginTop: 10, marginBottom: 10 }}>Select strategies to see projected impact:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {scenarios.map(s => (
            <div key={s.id} style={{
              background: T.surface2, borderLeft: `3px solid ${s.col}`,
              borderRadius: T.radiusSm, padding: '12px 14px',
              cursor: 'pointer', transition: T.transition,
            }}
              onClick={e => {
                const el = e.currentTarget;
                el.style.background = el.style.background === T.accentSoft ? T.surface2 : T.accentSoft;
              }}>
              <h5 style={{ fontSize: 13, fontWeight: 600, color: s.col, marginBottom: 4 }}>{s.id}. {s.t}</h5>
              <p style={{ fontSize: 12, color: T.text3, lineHeight: 1.5, marginBottom: 6 }}>{s.desc}</p>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.col }}>{s.imp}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onOpen} style={{
            padding: '10px 20px', borderRadius: T.radiusSm, border: `1px solid ${T.accent}`,
            background: T.accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Open in calculator →</button>
          <span style={{ fontSize: 12, color: T.text3 }}>Pre-fills budget, fee, and actual data</span>
        </div>
      </div>
    </div>
  );
}
