import { useState, useMemo } from 'react';
import ToolShell from '../components/ToolShell';
import { NavBtn } from '../components/Navbar';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import { Input, Select, Section } from '../components/FormControls';
import { T, mono, fmt, fmt2 } from '../shared';

const DEFAULTS = {
  h: { revenue: 10000, cogs: 4000, sga: 1500, da: 700, tax: 21, capex: 800, wc: 200 },
  g: { g1: 12, g2: 10, g3: 8, g4: 6, g5: 4, cogsPct: 40, sgaPct: 15, daPct: 7, capexPct: 8, wcPct: 2 },
  d: { wacc: 10, tgr: 2.5, method: 'gordon', exitMult: 12 },
  v: { cash: 2000, debt: 3000, shares: 1000, market: 25 },
};

export default function DcfModeler() {
  const [h, setH] = useState(DEFAULTS.h);
  const [g, setG] = useState(DEFAULTS.g);
  const [d, setD] = useState(DEFAULTS.d);
  const [v, setV] = useState(DEFAULTS.v);

  const upH = (k, val) => setH(p => ({ ...p, [k]: +val }));
  const upG = (k, val) => setG(p => ({ ...p, [k]: +val }));
  const upD = (k, val) => setD(p => ({ ...p, [k]: typeof val === 'string' && isNaN(val) ? val : +val }));
  const upV = (k, val) => setV(p => ({ ...p, [k]: +val }));

  const reset = () => {
    setH({ ...DEFAULTS.h });
    setG({ ...DEFAULTS.g });
    setD({ ...DEFAULTS.d });
    setV({ ...DEFAULTS.v });
  };

  const results = useMemo(() => {
    const growths = [g.g1, g.g2, g.g3, g.g4, g.g5].map(x => x / 100);
    const revs = [], cogs = [], sga = [], da = [], ebit = [], ebitda = [], capex = [], wc = [];
    let rev = h.revenue;
    for (let i = 0; i < 5; i++) {
      rev = i === 0 ? rev * (1 + growths[0]) : revs[i - 1] * (1 + growths[i]);
      revs.push(rev);
      cogs.push(rev * g.cogsPct / 100);
      sga.push(rev * g.sgaPct / 100);
      da.push(rev * g.daPct / 100);
      const eb = rev - rev * g.cogsPct / 100 - rev * g.sgaPct / 100 - rev * g.daPct / 100;
      ebit.push(eb);
      ebitda.push(eb + rev * g.daPct / 100);
      capex.push(rev * g.capexPct / 100);
      wc.push(rev * g.wcPct / 100);
    }
    const wacc = d.wacc / 100, tgr = d.tgr / 100;
    const fcfs = ebit.map((eb, i) => eb * (1 - h.tax / 100) + da[i] - capex[i] - wc[i]);
    let tv = d.method === 'gordon' ? fcfs[4] * (1 + tgr) / (wacc - tgr) : ebitda[4] * d.exitMult;
    if (!isFinite(tv)) tv = 0;
    const df = Array.from({ length: 5 }, (_, i) => 1 / Math.pow(1 + wacc, i + 1));
    const pvFcf = fcfs.map((f, i) => f * df[i]);
    const pvTv = tv * df[4];
    const npv = pvFcf.reduce((a, b) => a + b, 0);
    const ev = npv + pvTv;
    const eqVal = ev + v.cash - v.debt;
    const fairVal = eqVal / v.shares;
    const upside = ((fairVal - v.market) / v.market * 100);
    return { revs, cogs, sga, da, ebit, ebitda, capex, wc, fcfs, tv, df, pvFcf, pvTv, npv, ev, eqVal, fairVal, upside };
  }, [h, g, d, v]);

  const sensTable = useMemo(() => {
    const waccRange = [-2, -1, 0, 1, 2].map(x => d.wacc + x);
    const tgrRange = [-1, -0.5, 0, 0.5, 1].map(x => d.tgr + x);
    return waccRange.map(w => tgrRange.map(t => {
      const wacc = w / 100, tgr = t / 100;
      if (wacc <= tgr) return null;
      let tv = d.method === 'gordon' ? results.fcfs[4] * (1 + tgr) / (wacc - tgr) : results.ebitda[4] * d.exitMult;
      let ev = 0;
      for (let i = 0; i < 5; i++) ev += results.fcfs[i] / Math.pow(1 + wacc, i + 1);
      ev += tv / Math.pow(1 + wacc, 5);
      return (ev + v.cash - v.debt) / v.shares;
    }));
  }, [results, d, v]);

  return (
    <ToolShell
      title="DCF Modeler"
      subtitle="Multi-scenario discounted cash flow"
      actions={<NavBtn label="Reset" onClick={reset} />}
    >
      {/* ─── Inputs (left) + Key metrics (right) ─── */}
      <div className="px-grid-2col" style={{ marginBottom: 24 }}>
        <div className="px-card" style={cardStyle()}>
          <CardTitle title="Inputs" sub="Adjust historicals, growth, discounting, and equity bridge." />

          <Section title="Historicals">
            <div className="px-grid-2eq">
              <Input label="Revenue ($)" type="number" value={h.revenue} onChange={e => upH('revenue', e.target.value)} />
              <Input label="Tax rate (%)" type="number" value={h.tax} onChange={e => upH('tax', e.target.value)} />
              <Input label="COGS ($)" type="number" value={h.cogs} onChange={e => upH('cogs', e.target.value)} />
              <Input label="SG&A ($)" type="number" value={h.sga} onChange={e => upH('sga', e.target.value)} />
              <Input label="D&A ($)" type="number" value={h.da} onChange={e => upH('da', e.target.value)} />
              <Input label="CapEx ($)" type="number" value={h.capex} onChange={e => upH('capex', e.target.value)} />
              <Input label="ΔWC ($)" type="number" value={h.wc} onChange={e => upH('wc', e.target.value)} />
            </div>
          </Section>

          <Section title="Growth — revenue (%)">
            <div className="px-grid-5eq">
              {[1, 2, 3, 4, 5].map(i => (
                <Input key={i} label={`Y${i}`} type="number" value={g[`g${i}`]} onChange={e => upG(`g${i}`, e.target.value)} />
              ))}
            </div>
          </Section>

          <Section title="Margin drivers (% of rev)">
            <div className="px-grid-2eq">
              <Input label="COGS" type="number" value={g.cogsPct} onChange={e => upG('cogsPct', e.target.value)} />
              <Input label="SG&A" type="number" value={g.sgaPct} onChange={e => upG('sgaPct', e.target.value)} />
              <Input label="D&A" type="number" value={g.daPct} onChange={e => upG('daPct', e.target.value)} />
              <Input label="CapEx" type="number" value={g.capexPct} onChange={e => upG('capexPct', e.target.value)} />
              <Input label="ΔWC" type="number" value={g.wcPct} onChange={e => upG('wcPct', e.target.value)} />
            </div>
          </Section>

          <Section title="Discounting">
            <div className="px-grid-2eq">
              <Input label="WACC (%)" type="number" value={d.wacc} onChange={e => upD('wacc', e.target.value)} />
              <Input label="Terminal growth (%)" type="number" value={d.tgr} onChange={e => upD('tgr', e.target.value)} />
              <Select label="TV method" value={d.method} onChange={e => upD('method', e.target.value)}
                options={[{ value: 'gordon', label: 'Gordon growth' }, { value: 'exit', label: 'Exit multiple' }]} />
              {d.method === 'exit' && <Input label="Exit EV/EBITDA" type="number" value={d.exitMult} onChange={e => upD('exitMult', e.target.value)} />}
            </div>
          </Section>

          <Section title="Bridge to equity">
            <div className="px-grid-2eq">
              <Input label="Cash ($)" type="number" value={v.cash} onChange={e => upV('cash', e.target.value)} />
              <Input label="Total debt ($)" type="number" value={v.debt} onChange={e => upV('debt', e.target.value)} />
              <Input label="Shares outstanding" type="number" value={v.shares} onChange={e => upV('shares', e.target.value)} />
              <Input label="Market price ($)" type="number" value={v.market} onChange={e => upV('market', e.target.value)} />
            </div>
          </Section>
        </div>

        <div className="px-card" style={cardStyle()}>
          <CardTitle title="Key metrics" sub="Valuation output updates live." />
          <div className="px-kpi-2x2">
            <KpiCard label="Enterprise value" value={fmt(results.ev)} />
            <KpiCard label="Equity value" value={fmt(results.eqVal)} />
            <KpiCard label="Fair value / share" value={fmt2(results.fairVal)} />
            <KpiCard
              label="Upside"
              value={`${results.upside >= 0 ? '+' : ''}${results.upside.toFixed(1)}%`}
              delta={results.upside >= 0 ? 'BUY' : 'SELL'}
              up={results.upside >= 0}
            />
          </div>
        </div>
      </div>

      {/* ─── Full-width results ─── */}
      <Section title="5-year forecast">
        <DataTable headers={['', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5']} rows={[
          ['Revenue', ...results.revs.map(fmt)],
          ['COGS', ...results.cogs.map(v => fmt(-v))],
          ['SG&A', ...results.sga.map(v => fmt(-v))],
          ['D&A', ...results.da.map(v => fmt(-v))],
          ['EBIT', ...results.ebit.map(fmt)],
        ]} />
      </Section>

      <Section title="FCF & DCF">
        <DataTable headers={['', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Terminal']} rows={[
          ['FCF', ...results.fcfs.map(fmt), ''],
          ['Discount factor', ...results.df.map(x => x.toFixed(4)), results.df[4].toFixed(4)],
          ['PV', ...results.pvFcf.map(fmt), fmt(results.pvTv)],
        ]} />
      </Section>

      <Section title="Sensitivity — fair value / share">
        <div className="px-table-scroll" style={{ border: `1px solid ${T.border}`, background: T.white, borderRadius: T.radius }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: mono, minWidth: 520 }}>
            <thead>
              <tr>
                <th style={sensTh()}>WACC\TGR</th>
                {[-1, -0.5, 0, 0.5, 1].map(x => (
                  <th key={x} style={sensTh()}>{(d.tgr + x).toFixed(1)}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensTable.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ ...sensTd(), fontWeight: 600, color: T.text3, background: T.surface2, textAlign: 'center' }}>
                    {(d.wacc - 2 + ri).toFixed(1)}%
                  </td>
                  {row.map((val, ci) => {
                    const isCenter = ri === 2 && ci === 2;
                    const bg = val == null ? 'transparent' : val > v.market ? T.greenSoft : T.redSoft;
                    const color = val == null ? T.text4 : val > v.market ? T.greenDk : T.red;
                    return (
                      <td key={ci} style={{
                        ...sensTd(),
                        background: isCenter ? T.accentSoft : bg,
                        color, fontWeight: isCenter ? 600 : 400,
                        textAlign: 'center',
                      }}>{val == null ? '—' : fmt2(val)}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </ToolShell>
  );
}

function CardTitle({ title, sub }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, background: T.accent, borderRadius: 2 }} />
        <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{title}</h2>
      </div>
      <p style={{ fontSize: 12, color: T.text3, marginBottom: 14, lineHeight: 1.5 }}>{sub}</p>
    </>
  );
}

function cardStyle() { return { background: T.white, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, padding: '20px 22px' }; }
function sensTh() { return { background: T.surface2, padding: '9px 10px', fontSize: 11, color: T.text3, textAlign: 'center', borderBottom: `1px solid ${T.border}`, fontWeight: 600 }; }
function sensTd() { return { padding: '9px 10px', borderBottom: `1px solid ${T.border}` }; }
