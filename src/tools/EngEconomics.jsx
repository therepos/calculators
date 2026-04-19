import { useState, useMemo, useEffect } from 'react';
import ToolShell from '../components/ToolShell';
import { T, mono, fmt, fmtN } from '../shared';

/* ═══════════════════════════════════════════════════════════════
   Engagement Economics Calculator
   Restored original structure from engeconomics.html:
   - Engagement bar (name + save)
   - Two-column card grid:
     LEFT:  Resources & Hours (rank rows with BGT / ETC / Total / Actual)
            + Set Budget / Run ETC / Clear tabs
            + Performance KPIs
     RIGHT: Budget, Cost & Billing
            - Budget section (neutral)
            - Project Cost section (blue)
            - Unbilled Inventory section (green)
   - History table
   - Glossary (collapsible)
   ═══════════════════════════════════════════════════════════════ */

const RANKS = [
  { abbr: 'P',  name: 'Partner/Principal',  nsr: 621, cost: 993 },
  { abbr: 'SM', name: 'Senior Manager',     nsr: 384, cost: 320 },
  { abbr: 'M',  name: 'Manager',            nsr: 223, cost: 128 },
  { abbr: 'S1', name: 'Senior Associate',   nsr: 138, cost: 79 },
  { abbr: 'AA', name: 'Associate / Staff',  nsr: 93,  cost: 64 },
];

const RANK_OPTIONS = RANKS.map(r => ({ value: r.abbr, label: `${r.abbr} — ${r.name}` }));

// Stage states: 'plan' (set budget), 'track' (post-budget: ETC + actuals editable)
export default function EngEconomics() {
  const [engName, setEngName] = useState('');
  const [rows, setRows] = useState(
    RANKS.slice(0, 5).map(r => ({ rank: r.abbr, bgt: 0, etc: 0, actual: 0 }))
  );
  const [fee, setFee] = useState('');
  const [tgtMargin, setTgtMargin] = useState(35);
  const [techFee, setTechFee] = useState(0.5);
  const [billableExp, setBillableExp] = useState('');
  const [chargedExp, setChargedExp] = useState('');
  const [billedFees, setBilledFees] = useState('');
  const [billedExp, setBilledExp] = useState('');
  const [stage, setStage] = useState('plan'); // 'plan' | 'track'
  const [history, setHistory] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('praxis_eng_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('praxis_eng_history', JSON.stringify(history)); } catch {}
  }, [history]);

  const feeN = parseFloat(fee) || 0;
  const bxpN = parseFloat(billableExp) || 0;
  const cxpN = parseFloat(chargedExp) || 0;
  const bfN  = parseFloat(billedFees) || 0;
  const bbxN = parseFloat(billedExp) || 0;

  // Derived calcs
  const calc = useMemo(() => {
    const totalBgt    = rows.reduce((s, r) => s + (+r.bgt    || 0), 0);
    const totalEtc    = rows.reduce((s, r) => s + (+r.etc    || 0), 0);
    const totalActual = rows.reduce((s, r) => s + (+r.actual || 0), 0);
    const totalTotal  = rows.reduce((s, r) => s + ((+r.actual || 0) + (+r.etc || 0)), 0);

    // NSR and Labour Cost (based on total = actual + etc)
    let nsr = 0, labourCost = 0;
    rows.forEach(r => {
      const rk = RANKS.find(x => x.abbr === r.rank);
      if (!rk) return;
      const hrs = (+r.actual || 0) + (+r.etc || 0);
      nsr        += hrs * rk.nsr;
      labourCost += hrs * rk.cost;
    });

    // Budget-only NSR/cost (for budgeted margin)
    let bgtNsr = 0, bgtCost = 0;
    rows.forEach(r => {
      const rk = RANKS.find(x => x.abbr === r.rank);
      if (!rk) return;
      bgtNsr  += (+r.bgt || 0) * rk.nsr;
      bgtCost += (+r.bgt || 0) * rk.cost;
    });

    const costAllowance = feeN > 0 ? feeN * (1 - tgtMargin / 100) : null;
    const budgetedCost = bgtCost > 0 ? bgtCost : null;
    const budgetedMargin = feeN > 0 && budgetedCost != null ? feeN - budgetedCost : null;
    const budgetedMarginPct = feeN > 0 && budgetedMargin != null ? (budgetedMargin / feeN) * 100 : null;

    const techFeeAmt = feeN > 0 ? feeN * (techFee / 100) : 0;
    const projectedCost = labourCost + techFeeAmt + bxpN;
    const projectedMargin = feeN > 0 ? feeN - projectedCost : null;
    const projectedMarginPct = feeN > 0 && projectedMargin != null ? (projectedMargin / feeN) * 100 : null;

    // EAF, ANSR
    const eaf = bgtNsr > 0 && feeN > 0 ? (feeN / bgtNsr - 1) : 0;
    const ansr = nsr * (1 + eaf);
    const ter = ansr + bxpN;

    const actualMargin = ansr > 0 ? ((ansr - labourCost - techFeeAmt - bxpN) / ansr) * 100 : null;
    const marginChange = actualMargin != null && budgetedMarginPct != null
      ? actualMargin - budgetedMarginPct : null;

    const nui = (ansr + cxpN) - (bfN + bbxN);

    return {
      totalBgt, totalEtc, totalActual, totalTotal,
      nsr, labourCost, bgtNsr, bgtCost,
      costAllowance, budgetedCost, budgetedMargin, budgetedMarginPct,
      techFeeAmt, projectedCost, projectedMargin, projectedMarginPct,
      eaf, ansr, ter, actualMargin, marginChange, nui,
    };
  }, [rows, feeN, tgtMargin, techFee, bxpN, cxpN, bfN, bbxN]);

  // ─── Row ops ───
  const updateRow = (i, key, val) => setRows(p => {
    const n = [...p];
    n[i] = { ...n[i], [key]: key === 'rank' ? val : (+val || 0) };
    return n;
  });
  const addRow = () => setRows(p => [...p, { rank: 'AA', bgt: 0, etc: 0, actual: 0 }]);
  const delRow = i => setRows(p => p.filter((_, idx) => idx !== i));

  const autoAllocate = () => {
    // Auto-distribute cost allowance across ranks proportional to a default mix
    if (!calc.costAllowance) return;
    const mix = [0.1, 0.15, 0.2, 0.3, 0.25]; // P, SM, M, S1, AA share of cost
    const newRows = RANKS.map((r, i) => {
      const costShare = calc.costAllowance * (mix[i] || 0);
      const hrs = Math.round(costShare / r.cost);
      return { rank: r.abbr, bgt: hrs, etc: 0, actual: 0 };
    });
    setRows(newRows);
  };

  const setBudget = () => { setStage('track'); };
  const runEtc = () => { /* placeholder — enable ETC stage */ };
  const clearAll = () => {
    setRows(RANKS.slice(0, 5).map(r => ({ rank: r.abbr, bgt: 0, etc: 0, actual: 0 })));
    setFee(''); setTgtMargin(35); setTechFee(0.5);
    setBillableExp(''); setChargedExp(''); setBilledFees(''); setBilledExp('');
    setStage('plan');
  };

  const saveToHistory = () => {
    if (!engName.trim()) return;
    const entry = {
      id: Date.now(), ts: new Date().toISOString(),
      name: engName,
      fee: feeN, tgt: tgtMargin,
      ansr: calc.ansr, margin: calc.actualMargin, nui: calc.nui,
    };
    setHistory(p => [entry, ...p].slice(0, 50));
  };
  const clearHistory = () => setHistory([]);
  const exportCsv = () => {
    if (!history.length) return;
    const hdr = 'Timestamp,Engagement,Fee,Target Margin %,ANSR,Actual Margin %,NUI\n';
    const body = history.map(h =>
      [h.ts, h.name, h.fee, h.tgt, h.ansr, h.margin, h.nui].join(',')
    ).join('\n');
    const blob = new Blob([hdr + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'engagement_history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Helpers ───
  const dash = '—';
  const fmtOr = v => (v == null || isNaN(v) ? dash : fmt(v));
  const pctOr = v => (v == null || isNaN(v) ? dash : `${v.toFixed(1)}%`);

  return (
    <ToolShell
      title="Engagement Economics"
      subtitle="v8.0 · Portfolio monitor"
      actions={
        <>
          <button onClick={clearAll} style={btnGhost()}>Clear all</button>
          <button onClick={saveToHistory} style={btnPrimary(!engName.trim())} disabled={!engName.trim()}>
            Save to history
          </button>
        </>
      }
    >
      {/* ── Engagement name bar ── */}
      <div style={{
        background: T.white, border: `1px solid ${T.border}`,
        borderRadius: T.radius, padding: '12px 14px',
        display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20,
      }}>
        <input
          type="text" value={engName} onChange={e => setEngName(e.target.value)}
          placeholder="Engagement name (e.g. IMDA SGNIC — E-69733072)"
          style={{
            flex: 1, height: 38, borderRadius: T.radiusSm,
            border: `1px solid ${T.border}`, padding: '0 14px',
            fontSize: 14, color: T.text, outline: 'none',
            fontFamily: 'inherit', background: T.white,
          }}
          onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
        />
        <span style={{
          fontSize: 10, fontWeight: 600, color: T.accent, letterSpacing: 0.5,
          background: T.accentSoft, padding: '4px 10px', borderRadius: 12,
          textTransform: 'uppercase',
        }}>{stage === 'plan' ? 'Budget' : 'Track'}</span>
      </div>

      {/* ── Two-column grid ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
        gap: 20, marginBottom: 24,
      }}>
        {/* ═════════ LEFT CARD — Resources & Hours ═════════ */}
        <div style={cardStyle()}>
          <CardTitle title="Resources & hours" sub="Plan budget hours, set budget, then track with ETC and actual hours." />

          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px repeat(4, 1fr) 22px',
            gap: 6, padding: '0 0 8px', marginBottom: 6,
            borderBottom: `1px solid ${T.border}`,
          }}>
            <ColHdr>Rank</ColHdr>
            <ColHdr align="right">Bgt</ColHdr>
            <ColHdr align="right">ETC (+)</ColHdr>
            <ColHdr align="right">Total</ColHdr>
            <ColHdr align="right">Actual</ColHdr>
            <span />
          </div>

          {/* Data rows */}
          {rows.map((r, i) => {
            const total = (+r.actual || 0) + (+r.etc || 0);
            const bgtLocked = stage === 'track';
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '90px repeat(4, 1fr) 22px',
                gap: 6, alignItems: 'center', marginBottom: 6,
              }}>
                <select
                  value={r.rank}
                  onChange={e => updateRow(i, 'rank', e.target.value)}
                  style={rowSelect()}
                >
                  {RANK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
                <NumCell value={r.bgt}    locked={bgtLocked}        onChange={v => updateRow(i, 'bgt', v)} variant="plain" />
                <NumCell value={r.etc}    locked={stage === 'plan'} onChange={v => updateRow(i, 'etc', v)} variant="amber" />
                <NumCell value={total}    locked                                                              variant="blueReadonly" />
                <NumCell value={r.actual} locked={stage === 'plan'} onChange={v => updateRow(i, 'actual', v)} variant="green" />
                <button onClick={() => delRow(i)} aria-label="remove row" style={xBtn()}>×</button>
              </div>
            );
          })}

          {/* Total row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px repeat(4, 1fr) 22px',
            gap: 6, alignItems: 'center', paddingTop: 10, marginTop: 4,
            borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: T.text2 }}>Total <span style={{ color: T.text4, fontWeight: 400 }}>(hrs)</span></div>
            <TotCell value={calc.totalBgt} />
            <TotCell value={calc.totalEtc} />
            <TotCell value={calc.totalTotal} />
            <TotCell value={calc.totalActual} />
            <span />
          </div>

          {/* Add / auto-allocate */}
          <div style={{ marginTop: 14 }}>
            <button onClick={addRow} style={dashedBtn()}>+ Add resource</button>
            <button onClick={autoAllocate} style={{
              ...dashedBtn(), marginTop: 6,
              borderStyle: 'solid', borderColor: T.accent, color: T.accent,
            }}>Auto-allocate from cost allowance</button>
          </div>

          {/* Action tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.6fr', gap: 6, marginTop: 14 }}>
            <button onClick={setBudget} style={tabStyle(stage === 'plan' ? 'active' : 'off')}>
              Set budget
            </button>
            <button onClick={runEtc} style={tabStyle(stage === 'track' ? 'active-blue' : 'off')}>
              Run ETC
            </button>
            <button onClick={clearAll} style={tabStyle('ghost-red')}>
              Clear
            </button>
          </div>

          {/* Performance section (shown post-budget) */}
          {stage === 'track' && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: T.text3,
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
              }}>Performance</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <MetricCard label="Actual margin" value={pctOr(calc.actualMargin)} />
                <MetricCard label="Margin change" value={calc.marginChange != null ? `${calc.marginChange >= 0 ? '+' : ''}${calc.marginChange.toFixed(1)}pp` : dash} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                <SmallKpi label="NSR"  value={fmtOr(calc.nsr)} />
                <SmallKpi label="ANSR" value={fmtOr(calc.ansr)} />
                <SmallKpi label="TER"  value={fmtOr(calc.ter)} />
                <SmallKpi label="EAF"  value={isNaN(calc.eaf) ? dash : `${(calc.eaf * 100).toFixed(1)}%`} />
              </div>
            </div>
          )}
        </div>

        {/* ═════════ RIGHT CARD — Budget, Cost & Billing ═════════ */}
        <div style={cardStyle()}>
          <CardTitle title="Budget, cost & billing" sub="Set fee and target margin, then track cost and billing." />

          {/* Budget section (neutral) */}
          <SectionLabel>Budget</SectionLabel>
          <StatRow label="Agreed fees"
            input={<MoneyInput value={fee} onChange={setFee} />}
          />
          <StatRow label={
            <>Target margin <PctInputBadge value={tgtMargin} onChange={setTgtMargin} /></>
          } value={fmtOr(calc.costAllowance ? feeN - calc.costAllowance : null)} />
          <StatRow label="Cost allowance" value={fmtOr(calc.costAllowance)} />
          <StatRow label={<strong>Budgeted cost</strong>} value={fmtOr(calc.budgetedCost)} emphasis />
          <StatRow
            label={<>
              <strong>Budgeted margin</strong>{' '}
              <InlinePctBadge value={calc.budgetedMarginPct} />
            </>}
            value={fmtOr(calc.budgetedMargin)}
            emphasis
          />

          <Divider />

          {/* Project Cost section (blue) */}
          <SectionLabel color={T.blueSec}>Project cost</SectionLabel>
          <StatRow tone="blue" label="Labour cost"   value={fmtOr(calc.labourCost)} />
          <StatRow tone="blue" label={
            <>Tech fee <PctInputBadge value={techFee} onChange={setTechFee} tone="blue" /></>
          } value={fmtOr(calc.techFeeAmt)} />
          <StatRow tone="blue" label="Billable expenses"
            input={<MoneyInput value={billableExp} onChange={setBillableExp} tone="blue" />}
          />
          <StatRow tone="blue" label={<strong>Projected cost</strong>} value={fmtOr(calc.projectedCost)} emphasis />
          <StatRow tone="blue"
            label={<>
              <strong>Projected margin</strong>{' '}
              <InlinePctBadge value={calc.projectedMarginPct} tone="blue" />
            </>}
            value={fmtOr(calc.projectedMargin)}
            emphasis
          />

          <Divider />

          {/* Unbilled Inventory (green) */}
          <SectionLabel color={T.green}>Unbilled inventory</SectionLabel>
          <StatRow tone="green" label="ANSR" value={fmtOr(calc.ansr)} />
          <StatRow tone="green" label="Charged expenses"
            input={<MoneyInput value={chargedExp} onChange={setChargedExp} tone="green" />}
          />
          <StatRow tone="green" label="Billed fees"
            input={<MoneyInput value={billedFees} onChange={setBilledFees} tone="green" />}
          />
          <StatRow tone="green" label="Billed expenses"
            input={<MoneyInput value={billedExp} onChange={setBilledExp} tone="green" />}
          />
          <StatRow tone="green" label={<strong>NUI</strong>} value={fmtOr(calc.nui)} emphasis />
        </div>
      </div>

      {/* ── History ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text }}>History</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={exportCsv} style={btnSecondary()}>Export CSV</button>
            <button onClick={clearHistory} style={btnDanger()}>Clear all</button>
          </div>
        </div>
        {history.length === 0 ? (
          <div style={{
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: T.radius, padding: 24, textAlign: 'center',
            fontSize: 13, color: T.text3,
          }}>No saved entries yet.</div>
        ) : (
          <div style={{
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: T.radius, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Engagement', 'Fee', 'Tgt %', 'ANSR', 'Actual %', 'NUI', ''].map((h, i) => (
                    <th key={i} style={{
                      background: T.surface2, color: T.text3,
                      padding: '10px 12px', textAlign: i === 0 || i === 6 ? 'left' : 'right',
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: 0.5, borderBottom: `1px solid ${T.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td style={td()}>{h.name}</td>
                    <td style={td('right', true)}>{fmtOr(h.fee)}</td>
                    <td style={td('right', true)}>{h.tgt}%</td>
                    <td style={td('right', true)}>{fmtOr(h.ansr)}</td>
                    <td style={td('right', true)}>{pctOr(h.margin)}</td>
                    <td style={td('right', true)}>{fmtOr(h.nui)}</td>
                    <td style={td()}>
                      <button onClick={() => setHistory(p => p.filter(x => x.id !== h.id))}
                        style={{
                          background: 'none', border: 'none', color: T.text3,
                          cursor: 'pointer', fontSize: 14, padding: 2,
                        }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Glossary ── */}
      <details style={{ marginTop: 8 }}>
        <summary style={{
          fontSize: 14, fontWeight: 600, color: T.text,
          padding: '10px 0', display: 'flex', alignItems: 'center', gap: 6,
        }}>Glossary ▾</summary>
        <div style={{
          marginTop: 8, background: T.white, border: `1px solid ${T.border}`,
          borderRadius: T.radius, padding: '16px 18px', fontSize: 13,
          color: T.text2, lineHeight: 1.75,
        }}>
          <p><strong>NSR</strong> (Net Standard Revenue) = Σ (Hours × NSR Rate/hr). The standard value of resources deployed.</p>
          <p style={{ marginTop: 10 }}><strong>ANSR</strong> (Adjusted Net Standard Revenue) = NSR × (1 + EAF%). Revenue recognized from time charges.</p>
          <p style={{ marginTop: 10 }}><strong>EAF</strong> (Engagement Adjustment Factor) = (ANSR ÷ NSR) − 1. Premium or discount vs standard rates.</p>
          <p style={{ marginTop: 10 }}><strong>TER</strong> (Total Engagement Revenue) = ANSR + Billable Expenses.</p>
          <p style={{ marginTop: 10 }}><strong>Margin</strong> = ANSR − (Labour Cost + Tech Fee + Expenses).</p>
          <p style={{ marginTop: 10 }}><strong>NUI</strong> (Net Unbilled Inventory) = (Recognized ANSR + Charged Expenses) − (Billed Fees + Billed Expenses).</p>
          <ul style={{ marginTop: 6, paddingLeft: 22, color: T.text3 }}>
            <li>NUI &gt; 0 → work done but not yet billed</li>
            <li>NUI = 0 → billed exactly what has been recognized</li>
            <li>NUI &lt; 0 → billed ahead of work performed</li>
          </ul>
          <p style={{ marginTop: 10 }}><strong>Cost allowance</strong> = Fee × (1 − Target Margin%).</p>
        </div>
      </details>
    </ToolShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Subcomponents
   ═══════════════════════════════════════════════════════════════ */

function CardTitle({ title, sub }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6,
          background: T.accent, borderRadius: 2,
        }} />
        <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{title}</h2>
      </div>
      <p style={{ fontSize: 12, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>{sub}</p>
    </>
  );
}

function ColHdr({ children, align = 'left' }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color: T.text3,
      textTransform: 'uppercase', letterSpacing: 0.5,
      textAlign: align,
    }}>{children}</span>
  );
}

function NumCell({ value, locked, onChange, variant }) {
  const variants = {
    plain:         { bg: T.white,         color: T.text,       border: T.border },
    amber:         { bg: T.amberSoft,     color: T.amberVal,   border: T.amberBdr },
    green:         { bg: T.greenSoft,     color: T.greenDk,    border: T.greenBdr },
    blueReadonly:  { bg: T.blueSecSoft,   color: T.blueSec,    border: T.blueSecBdr },
  };
  const v = variants[variant] || variants.plain;
  return (
    <input
      type="number"
      value={value || 0}
      disabled={locked}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        width: '100%', height: 32, borderRadius: T.radiusSm,
        border: `1px solid ${locked && variant === 'plain' ? 'transparent' : v.border}`,
        padding: '0 8px', fontSize: 12, fontFamily: mono, textAlign: 'right',
        color: v.color, background: v.bg,
        outline: 'none', opacity: locked && variant === 'blueReadonly' ? 1 : (locked ? 0.55 : 1),
        cursor: locked ? 'not-allowed' : 'text',
      }}
      onFocus={e => { if (!locked) { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 2px ${T.accentSoft}`; } }}
      onBlur={e => { e.target.style.borderColor = v.border; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function TotCell({ value }) {
  return (
    <div style={{
      background: T.surface2, borderRadius: T.radiusSm,
      padding: '7px 8px', fontSize: 12, fontFamily: mono,
      textAlign: 'right', fontWeight: 600, color: T.text,
    }}>{fmtN(value)}</div>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600,
      color: color || T.text3,
      textTransform: 'uppercase', letterSpacing: 0.5,
      marginBottom: 6,
    }}>{children}</div>
  );
}

function StatRow({ label, value, input, tone, emphasis }) {
  const tones = {
    blue:  { bg: T.blueSecSoft, labelCol: T.blueSecText, valCol: T.blueSec },
    green: { bg: T.greenSoft,   labelCol: T.greenDk,     valCol: T.greenDk },
  };
  const t = tone ? tones[tone] : { bg: T.surface2, labelCol: T.text2, valCol: T.text };
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 12px', background: t.bg, borderRadius: T.radiusSm,
      fontSize: 13, marginBottom: 5,
    }}>
      <span style={{ color: t.labelCol, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
      </span>
      {input ? (
        input
      ) : (
        <span style={{
          fontFamily: mono, color: t.valCol,
          fontWeight: emphasis ? 600 : 500,
          fontSize: 13, minWidth: 100, textAlign: 'right',
        }}>{value}</span>
      )}
    </div>
  );
}

function MoneyInput({ value, onChange, tone }) {
  const tones = {
    blue:  { color: T.blueSec,  bg: 'rgba(255,255,255,0.65)' },
    green: { color: T.greenDk,  bg: 'rgba(255,255,255,0.65)' },
  };
  const t = tone ? tones[tone] : { color: T.text, bg: T.white };
  return (
    <input
      type="text" inputMode="decimal" placeholder="—"
      value={value} onChange={e => onChange(e.target.value.replace(/[^\d.-]/g, ''))}
      style={{
        width: 120, height: 30, borderRadius: T.radiusSm,
        border: `1px solid ${T.border}`,
        padding: '0 10px', fontSize: 13, fontFamily: mono,
        textAlign: 'right', color: t.color, background: t.bg,
        fontWeight: 600, outline: 'none',
      }}
    />
  );
}

function PctInputBadge({ value, onChange, tone }) {
  const color = tone === 'blue' ? T.blueSec : T.text;
  const border = tone === 'blue' ? T.blueSecBdr : T.border;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 6,
      padding: '1px 7px',
      background: tone === 'blue' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.03)',
      borderRadius: 4, border: `1px solid ${border}`,
    }}>
      <input
        type="number" value={value} step="0.1" min="0" max="100"
        onChange={e => onChange(+e.target.value)}
        style={{
          width: 36, border: 'none', outline: 'none', background: 'transparent',
          fontSize: 12, fontWeight: 600, color, textAlign: 'right',
          fontFamily: 'inherit', padding: 0,
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 600, color }}>%</span>
    </span>
  );
}

function InlinePctBadge({ value, tone }) {
  const color = tone === 'blue' ? T.blueSec : T.text2;
  const border = tone === 'blue' ? T.blueSecBdr : T.border;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 7px',
      background: tone === 'blue' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.03)',
      borderRadius: 4, border: `1px solid ${border}`,
      fontSize: 11, fontWeight: 600, color,
      marginLeft: 6, fontFamily: mono,
    }}>{value == null || isNaN(value) ? '—' : `${value.toFixed(1)}%`}</span>
  );
}

function Divider() {
  return <hr style={{
    border: 'none', borderTop: `1px solid ${T.border}`,
    margin: '14px 0 12px',
  }} />;
}

function MetricCard({ label, value }) {
  return (
    <div style={{
      padding: '11px 12px', background: T.surface2, borderRadius: T.radiusSm,
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 500, color: T.text3,
        textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4,
      }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: mono }}>{value}</div>
    </div>
  );
}

function SmallKpi({ label, value }) {
  return (
    <div style={{
      padding: '8px 10px', background: T.surface2, borderRadius: T.radiusSm,
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 10, color: T.text3, textTransform: 'uppercase',
        letterSpacing: 0.4, marginBottom: 2,
      }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: mono }}>{value}</div>
    </div>
  );
}

/* ─── Inline style helpers ─── */
function cardStyle() {
  return {
    background: T.white, borderRadius: T.radiusLg,
    border: `1px solid ${T.border}`, padding: '20px 22px',
  };
}
function rowSelect() {
  return {
    width: '100%', height: 32, borderRadius: T.radiusSm,
    border: `1px solid ${T.border}`, padding: '0 8px',
    fontSize: 12, color: T.text, fontFamily: 'inherit',
    outline: 'none', background: T.white, cursor: 'pointer',
  };
}
function xBtn() {
  return {
    background: 'none', border: 'none', cursor: 'pointer',
    color: T.text4, fontSize: 16, fontWeight: 400,
    padding: 0, lineHeight: 1, transition: T.transition,
  };
}
function dashedBtn() {
  return {
    width: '100%', padding: '9px 0', border: `1px dashed ${T.border}`,
    borderRadius: T.radiusSm, background: 'transparent', cursor: 'pointer',
    color: T.text3, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
    transition: T.transition,
  };
}
function tabStyle(variant) {
  const styles = {
    'active':      { bg: T.text,      color: '#fff',   border: T.text,      cursor: 'pointer' },
    'active-blue': { bg: T.accent,    color: '#fff',   border: T.accent,    cursor: 'pointer' },
    'off':         { bg: T.surface2,  color: T.text3,  border: T.border,    cursor: 'default', opacity: 0.7 },
    'ghost-red':   { bg: T.white,     color: T.red,    border: T.border,    cursor: 'pointer' },
  };
  const s = styles[variant] || styles.off;
  return {
    padding: '9px 12px', border: `1px solid ${s.border}`,
    borderRadius: T.radiusSm, background: s.bg, color: s.color,
    fontSize: 12, fontWeight: 600, cursor: s.cursor,
    fontFamily: 'inherit', transition: T.transition,
    opacity: s.opacity || 1,
  };
}
function btnPrimary(disabled) {
  return {
    padding: '8px 16px', borderRadius: T.radiusSm, border: `1px solid ${T.accent}`,
    background: T.accent, color: '#fff', fontSize: 13, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit', transition: T.transition,
  };
}
function btnSecondary() {
  return {
    padding: '7px 14px', borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
    background: T.white, color: T.text2, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: T.transition,
  };
}
function btnDanger() {
  return {
    padding: '7px 14px', borderRadius: T.radiusSm, border: `1px solid ${T.redBdr}`,
    background: T.white, color: T.red, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: T.transition,
  };
}
function btnGhost() {
  return {
    padding: '8px 14px', borderRadius: T.radiusSm, border: `1px solid ${T.border}`,
    background: T.white, color: T.text2, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: T.transition,
  };
}
function td(align = 'left', monoFam) {
  return {
    padding: '9px 12px', borderBottom: `1px solid ${T.border}`,
    textAlign: align, fontSize: 12, color: T.text,
    fontFamily: monoFam ? mono : 'inherit',
  };
}
