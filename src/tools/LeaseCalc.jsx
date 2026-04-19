import { useState, useMemo } from 'react';
import ToolShell from '../components/ToolShell';
import { NavBtn } from '../components/Navbar';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import { Input, Select, Segment, Section } from '../components/FormControls';
import { T, fmt, fmt2 } from '../shared';

const DEFAULTS = { term: 60, payment: 5000, rate: 5, idc: 0, incentive: 0, rvg: 0, freq: 'monthly', timing: 'arrears' };

export default function LeaseCalc() {
  const [lease, setLease] = useState(DEFAULTS);
  const [view, setView] = useState('both');
  const up = (k, val) => setLease(p => ({ ...p, [k]: typeof val === 'string' && isNaN(val) ? val : +val }));
  const reset = () => setLease({ ...DEFAULTS });

  const results = useMemo(() => {
    const monthlyRate = lease.rate / 100 / 12;
    const n = lease.term;
    const pmt = lease.payment;
    let pvLiab = 0;
    for (let i = 1; i <= n; i++) pvLiab += pmt / Math.pow(1 + monthlyRate, lease.timing === 'advance' ? i - 1 : i);
    pvLiab += lease.idc - lease.incentive;
    const rouAsset = pvLiab + lease.idc;
    const monthlyDep = rouAsset / n;
    const totalPayments = pmt * n;
    const straightLine = totalPayments / n;

    const ifrsRows = [], ascRows = [];
    let iLiab = pvLiab, aLiab = pvLiab;
    for (let m = 1; m <= n; m++) {
      const iInt = iLiab * monthlyRate;
      const iClose = Math.max(0, iLiab + iInt - pmt);
      const iDep = monthlyDep;
      ifrsRows.push({ month: m, openLiab: iLiab, interest: iInt, closeLiab: iClose, dep: iDep, plCharge: iInt + iDep });
      iLiab = iClose;
      const aInt = aLiab * monthlyRate;
      const aClose = Math.max(0, aLiab + aInt - pmt);
      const aDep = straightLine - aInt;
      ascRows.push({ month: m, openLiab: aLiab, interest: aInt, closeLiab: aClose, dep: aDep, plCharge: straightLine });
      aLiab = aClose;
    }
    return { ifrs: ifrsRows, asc: ascRows, pvLiab, rouAsset, monthlyDep, totalPayments };
  }, [lease]);

  const showIFRS = view !== 'asc', showASC = view !== 'ifrs';

  return (
    <ToolShell
      title="Lease Accounting"
      subtitle="IFRS 16 and ASC 842 schedules"
      actions={<NavBtn label="Reset" onClick={reset} />}
    >
      <div className="px-grid-2col" style={{ marginBottom: 24 }}>
        <div className="px-card" style={cardStyle()}>
          <CardTitle title="Inputs" sub="Lease terms and adjustments." />
          <Section title="Lease terms">
            <div className="px-grid-2eq">
              <Input label="Term (months)" type="number" value={lease.term} onChange={e => up('term', e.target.value)} />
              <Input label="Payment ($)" type="number" value={lease.payment} onChange={e => up('payment', e.target.value)} />
              <Input label="Discount rate (%)" type="number" value={lease.rate} onChange={e => up('rate', e.target.value)} step="0.1" />
              <Select label="Frequency" value={lease.freq} onChange={e => up('freq', e.target.value)} options={[
                { value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }
              ]} />
              <Select label="Timing" value={lease.timing} onChange={e => up('timing', e.target.value)} options={[
                { value: 'arrears', label: 'In arrears' }, { value: 'advance', label: 'In advance' }
              ]} />
            </div>
          </Section>
          <Section title="Adjustments">
            <div className="px-grid-2eq">
              <Input label="Initial direct costs ($)" type="number" value={lease.idc} onChange={e => up('idc', e.target.value)} />
              <Input label="Lease incentive ($)" type="number" value={lease.incentive} onChange={e => up('incentive', e.target.value)} />
              <Input label="RVG ($)" type="number" value={lease.rvg} onChange={e => up('rvg', e.target.value)} />
            </div>
          </Section>
        </div>

        <div className="px-card" style={cardStyle()}>
          <CardTitle title="Key metrics" sub="Updates live as inputs change." />
          <div className="px-kpi-2x2">
            <KpiCard label="PV of liability" value={fmt2(results.pvLiab)} />
            <KpiCard label="ROU asset" value={fmt2(results.rouAsset)} />
            <KpiCard label="Monthly dep." value={fmt2(results.monthlyDep)} />
            <KpiCard label="Total payments" value={fmt(results.totalPayments)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: 0.5, color: T.text3,
        }}>Amortization schedule</div>
        <Segment value={view} onChange={setView} options={[
          { value: 'both', label: 'Both' },
          { value: 'ifrs', label: 'IFRS 16' },
          { value: 'asc', label: 'ASC 842' },
        ]} />
      </div>
      <DataTable
        headers={['Month', ...(showIFRS ? ['IFRS liab', 'IFRS int', 'IFRS P&L'] : []), ...(showASC ? ['ASC liab', 'ASC int', 'ASC P&L'] : [])]}
        rows={results.ifrs.slice(0, 24).map((ir, i) => {
          const ar = results.asc[i];
          return [`M${ir.month}`, ...(showIFRS ? [fmt2(ir.closeLiab), fmt2(ir.interest), fmt2(ir.plCharge)] : []), ...(showASC ? [fmt2(ar.closeLiab), fmt2(ar.interest), fmt2(ar.plCharge)] : [])];
        })}
      />
      {results.ifrs.length > 24 && (
        <div style={{ fontSize: 12, color: T.text4, marginTop: 10, textAlign: 'center' }}>
          Showing first 24 of {results.ifrs.length} months
        </div>
      )}
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
