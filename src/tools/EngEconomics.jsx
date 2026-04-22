import { useState, useMemo, useEffect, useRef } from 'react';
import ToolShell from '../components/ToolShell';
import PortfolioMonitor from './engeconomics/PortfolioMonitor';
import { T, mono, fmtN } from '../shared';

/* ═══════════════════════════════════════════════════════════════
   Engagement Economics Calculator — full port of engeconomics.html
   Stages: plan → budgetSet (lk) → etcOpen → etcTransferred (ed)
   Features: 9 ranks, booking estimate, rate import/export,
             live $ formatting, history with ETC-aware save,
             Portfolio Monitor view (toggled via header).
   ═══════════════════════════════════════════════════════════════ */

// ─── Default rate cards (by fiscal year) ───
// Internal keys are STABLE (saved history depends on them, don't rename).
// `name` is the display label; `abbr` the short code; `_divider: true`
// entries render as a separator in dropdowns.
const RATE_CARDS = {
  'FY2025-26': {
    'Partner 3':               { name: 'Partner 3',              nsr: 634,  cost: 1489, abbr: 'P3',  mix: 0  },
    'Partner 2':               { name: 'Partner 2',              nsr: 629,  cost: 1192, abbr: 'P2',  mix: 0  },
    'Partner/Principal':       { name: 'Partner 1',              nsr: 621,  cost: 993,  abbr: 'P',   mix: 2  },
    'Exec Director 1':         { name: 'Exec Director',          nsr: 454,  cost: 381,  abbr: 'ED',  mix: 0  },
    'Director':                { name: 'Director',               nsr: 785,  cost: 190,  abbr: 'D',   mix: 3  },
    'Asso Director':           { name: 'Asso Director',          nsr: 437,  cost: 122,  abbr: 'AD',  mix: 0  },
    'Asst Director':           { name: 'Asst Director',          nsr: 294,  cost: 86,   abbr: 'ASD', mix: 0  },
    'Senior Manager 2':        { name: 'Senior Manager 2',       nsr: 384,  cost: 320,  abbr: 'SM2', mix: 0  },
    'Senior Manager':          { name: 'Senior Manager 1',       nsr: 342,  cost: 213,  abbr: 'SM',  mix: 4  },
    'Manager':                 { name: 'Manager',                nsr: 223,  cost: 128,  abbr: 'M',   mix: 12 },
    'Senior Associate 3':      { name: 'Senior Associate 3',     nsr: 176,  cost: 92,   abbr: 'S3',  mix: 0  },
    'Senior Associate 2':      { name: 'Senior Associate 2',     nsr: 159,  cost: 84.96, abbr: 'S2',  mix: 0  },
    'Senior Associate 1':      { name: 'Senior Associate 1',     nsr: 138,  cost: 79,   abbr: 'S1',  mix: 21 },
    'Staff 2':                 { name: 'Staff 2',                nsr: 119,  cost: 64,   abbr: 'A2',  mix: 0  },
    'Associate / Staff':       { name: 'Staff 1',                nsr: 93,   cost: 64,   abbr: 'A1',  mix: 58 },
    '__divider__':             { _divider: true },
    'Supervising Associate':   { name: 'Supervising Associate',  nsr: 168,  cost: 62,   abbr: 'SA',  mix: 0  },
    'Senior Associate':        { name: 'Senior Associate',       nsr: 138,  cost: 50,   abbr: 'SRA', mix: 0  },
    'Associate':               { name: 'Associate',              nsr: 108,  cost: 37,   abbr: 'AS',  mix: 0  },
    'Intern (CS)':             { name: 'Intern (CS)',            nsr: 45,   cost: 9,    abbr: 'IN',  mix: 0  },
    'Intern (CBS)':            { name: 'Intern (CBS)',           nsr: 3,    cost: 6,    abbr: 'ICB', mix: 0  },
  },
  'FY2026-27': {
    'Partner/Principal':       { name: 'Partner 1',           nsr: 640, cost: 1038,   abbr: 'P',   mix: 2  },
    'Director':                { name: 'Director',            nsr: 468, cost: 398.1,  abbr: 'D',   mix: 3  },
    'Senior Manager':          { name: 'Senior Manager 1',    nsr: 396, cost: 334.4,  abbr: 'SM',  mix: 4  },
    'Manager':                 { name: 'Manager',             nsr: 230, cost: 133.8,  abbr: 'M',   mix: 12 },
    'Senior Associate 3':      { name: 'Senior Associate 3',  nsr: 181, cost: 96.14,  abbr: 'S3',  mix: 0  },
    'Senior Associate 2':      { name: 'Senior Associate 2',  nsr: 164, cost: 85.69,  abbr: 'S2',  mix: 0  },
    'Senior Associate 1':      { name: 'Senior Associate 1',  nsr: 142, cost: 82.56,  abbr: 'S1',  mix: 21 },
    'Associate / Staff':       { name: 'Staff 1',             nsr: 96,  cost: 66.88,  abbr: 'A1',  mix: 58 },
    'Intern (CS)':             { name: 'Intern (CS)',         nsr: 45,  cost: 9,      abbr: 'IN',  mix: 0  },
  },
};
const RATE_YEARS = Object.keys(RATE_CARDS);
const DEFAULT_YEAR = 'FY2025-26';
const DEFAULT_RATES = RATE_CARDS[DEFAULT_YEAR];

// Staff excluded from booking estimate (partners/managers don't appear as weekly bookings)
const STAFF_EXCLUDE = [
  'Partner 3', 'Partner 2', 'Partner/Principal',
  'Exec Director 1', 'Director', 'Asso Director', 'Asst Director',
  'Senior Manager 2', 'Senior Manager',
  'Manager',
];

// Rank colours for booking estimate blocks
const RANK_COLORS = [
  { bg: '#1D9E75', bgL: '#5DCAA5', fg: '#E1F5EE', fgL: '#04342C' },
  { bg: '#378ADD', bgL: '#85B7EB', fg: '#E6F1FB', fgL: '#042C53' },
  { bg: '#7F77DD', bgL: '#AFA9EC', fg: '#EEEDFE', fgL: '#26215C' },
  { bg: '#D85A30', bgL: '#F0997B', fg: '#FAECE7', fgL: '#4A1B0C' },
  { bg: '#D4537E', bgL: '#ED93B1', fg: '#FBEAF0', fgL: '#4B1528' },
];
const ETC_COLOR = { bg: '#A32D2D', bgL: '#E24B4A' };
const HPW = 40, COLS = 12;

// ─── Mix profiles for auto-allocate ───
// Managerial block (P + D + SM + M grades) = 20% of total hours by default.
// Seniors + Associates split the remaining 80% per the profile.
const MIX_PROFILES = {
  Standard:  { seniorShare: 0.55, assocShare: 0.45 },
  Associate: { seniorShare: 0.40, assocShare: 0.60 },
  Senior:    { seniorShare: 0.60, assocShare: 0.40 },
};
const MIX_TYPES = Object.keys(MIX_PROFILES);
const DEFAULT_MIX_TYPE = 'Standard';

// Rank groupings (based on rate-card keys — stable, not display names).
const PARTNER_RANKS = ['Partner 3', 'Partner 2', 'Partner/Principal'];
const DSM_RANKS = [
  'Exec Director 1', 'Director', 'Asso Director', 'Asst Director',
  'Senior Manager 2', 'Senior Manager',
  'Manager',
];
const SENIOR_RANKS = [
  'Senior Associate 3', 'Senior Associate 2', 'Senior Associate 1',
  'Supervising Associate', 'Senior Associate',
];
const ASSOC_RANKS = ['Staff 2', 'Associate / Staff', 'Associate'];
const PARTNER_TARGET_HRS = 2;  // try for 2 hrs of partner time if budget permits
const MANAGERIAL_SHARE = 0.2;  // P + DSM = 20% of total hours (default rule)

// ─── Formatters ───
const fa = v => v == null || isNaN(v) ? '—'
  : v < 0 ? `($${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
  : `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fa0 = v => v == null || isNaN(v) ? '—'
  : v < 0 ? `($${Math.abs(Math.round(v)).toLocaleString('en-US')})`
  : `$${Math.round(v).toLocaleString('en-US')}`;
const pc = v => v == null || isNaN(v) ? '—'
  : v < 0 ? `(${(Math.abs(v) * 100).toFixed(2)}%)`
  : `${(v * 100).toFixed(2)}%`;
const parseNum = s => Number(String(s ?? '').replace(/,/g, '')) || 0;

// ─── Live $ formatter (comma-separated as user types, cursor preserved) ───
function formatMoneyInput(el) {
  const raw = el.value.replace(/,/g, '');
  if (raw === '' || raw === '-') return;
  const num = parseFloat(raw);
  if (isNaN(num)) return;
  const cur = el.selectionStart;
  const oldLen = el.value.length;
  el.value = num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const newLen = el.value.length;
  el.selectionStart = el.selectionEnd = cur + (newLen - oldLen);
}

export default function EngEconomics() {
  const [view, setView] = useState('calc'); // 'calc' | 'pm'
  const [rateYear, setRateYear] = useState(DEFAULT_YEAR);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const rankOrder = Object.keys(rates);
  const rankNames = rankOrder.filter(k => !rates[k]?._divider);
  const [mixType, setMixType] = useState(DEFAULT_MIX_TYPE);

  // Resource rows: [{ rank: 'Partner/Principal', b, e, a }]
  const [rows, setRows] = useState([
    { rank: 'Partner/Principal',  b: 0, e: 0, a: 0 },
    { rank: 'Senior Manager',     b: 0, e: 0, a: 0 },
    { rank: 'Manager',            b: 0, e: 0, a: 0 },
    { rank: 'Senior Associate 1', b: 0, e: 0, a: 0 },
    { rank: 'Associate / Staff',  b: 0, e: 0, a: 0 },
  ]);

  // Money fields (stored as strings to preserve user input formatting)
  const [engName, setEngName] = useState('');
  const [fee, setFee] = useState('');
  const [tgt, setTgt] = useState(35);
  const [techP, setTechP] = useState(0.5);
  const [bxp, setBxp] = useState('');
  const [cxp, setCxp] = useState('');
  const [bf, setBf] = useState('');
  const [bbx, setBbx] = useState('');

  // Workflow state
  // lk = budget has been set (locked);
  // etcOpen = ETC cells are editable;
  // ed = ETC has been transferred (committed)
  const [lk, setLk] = useState(false);
  const [etcOpen, setEtcOpen] = useState(false);
  const [ed, setEd] = useState(false);

  // Snapshot at budget set (bN = NSR, bL = labour cost, bC = total cost, bM = margin, bMP = margin %)
  const [snap, setSnap] = useState({ bN: 0, bL: 0, bT: 0, bC: 0, bM: 0, bMP: 0 });
  const [etcLog, setEtcLog] = useState([]);

  // History
  const [history, setHistory] = useState([]);
  const [savedFlash, setSavedFlash] = useState(false);

  // Starting week (Monday). Defaults to the Monday of the current week or
  // next Monday if today is already past Monday. Stored as YYYY-MM-DD.
  const getNextMonday = () => {
    const d = new Date();
    const dow = d.getDay(); // 0=Sun..6=Sat
    const daysUntilMon = dow === 1 ? 0 : (8 - dow) % 7 || 7;
    // If today IS Monday, use today; otherwise advance to upcoming Monday
    const target = new Date(d);
    target.setDate(d.getDate() + (dow === 1 ? 0 : ((1 - dow + 7) % 7 || 7)));
    target.setHours(0, 0, 0, 0);
    return target.toISOString().slice(0, 10);
  };
  const snapToMonday = iso => {
    if (!iso) return iso;
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    const dow = d.getDay();
    const diff = (dow === 0 ? -6 : 1 - dow); // snap back to Monday of that week
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  };
  const [startWeek, setStartWeek] = useState(getNextMonday);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('praxis_eng_history_v2');
      if (raw) setHistory(JSON.parse(raw));
      const savedYear = localStorage.getItem('praxis_eng_rate_year');
      if (savedYear && RATE_CARDS[savedYear]) {
        setRateYear(savedYear);
        setRates(RATE_CARDS[savedYear]);
      } else {
        const rawRates = localStorage.getItem('praxis_eng_rates');
        if (rawRates) setRates(JSON.parse(rawRates));
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('praxis_eng_history_v2', JSON.stringify(history)); } catch {}
  }, [history]);
  useEffect(() => {
    try { localStorage.setItem('praxis_eng_rates', JSON.stringify(rates)); } catch {}
  }, [rates]);
  useEffect(() => {
    try { localStorage.setItem('praxis_eng_rate_year', rateYear); } catch {}
  }, [rateYear]);

  // Apply rate card when user changes year
  const changeRateYear = y => {
    if (!RATE_CARDS[y]) return;
    setRateYear(y);
    setRates(RATE_CARDS[y]);
  };

  // ─── Derived values (single source of truth: calc) ───
  const calc = useMemo(() => {
    const feeN = parseNum(fee);
    const bxpN = parseNum(bxp);
    const cxpN = parseNum(cxp);
    const bfN  = parseNum(bf);
    const bbxN = parseNum(bbx);
    const tgtP = (+tgt || 0) / 100;
    const tp   = (+techP || 0) / 100;

    // Committed total per row: if budget set, b+e (ETC included); else just b
    const commitH = r => lk ? (r.b + r.e) : r.b;
    const actH = r => r.a;

    const sumH = fn => rows.reduce((s, r) => {
      const rk = rates[r.rank]; if (!rk) return s;
      const h = fn(r);
      return { n: s.n + h * rk.nsr, c: s.c + h * rk.cost };
    }, { n: 0, c: 0 });

    const bgtSum    = sumH(r => r.b);
    const commitSum = sumH(commitH);
    const actSum    = sumH(actH);

    const bH = rows.reduce((s, r) => s + r.b, 0);
    const eH = rows.reduce((s, r) => s + r.e, 0);
    const tH = rows.reduce((s, r) => s + commitH(r), 0);
    const aH = rows.reduce((s, r) => s + r.a, 0);

    // Live projected values
    const nsr = commitSum.n;
    const lab = commitSum.c;
    const tech = lab * tp;
    const cost = lab + tech + bxpN;
    // Total Engagement Revenue = Fee + Billable Expenses.
    // At budget time ANSR == Fee (by EAF construction), so TER = Fee + bxp.
    // Using TER as the margin denominator matches Reporting Hub conventions.
    const ter = feeN + bxpN;
    const mgn = feeN - cost;
    const mp = ter > 0 ? mgn / ter : 0;
    const bca = ter > 0 ? ter * (1 - tgtP) : 0;

    // EAF for unbilled calc
    let nuiEaf = 0;
    if (lk && ed) {
      const pNsr = commitSum.n;
      nuiEaf = (pNsr > 0 && feeN > 0) ? (feeN / pNsr) - 1 : 0;
    } else if (lk) {
      nuiEaf = (snap.bN > 0 && feeN > 0) ? (feeN / snap.bN) - 1 : 0;
    }

    const aRec = actSum.n * (1 + nuiEaf);       // recognized ANSR from actual hours
    const nui = (aRec + cxpN) - (bfN + bbxN);
    const dispANSR = lk ? aRec : (nsr > 0 ? feeN : 0);
    const eaf = nsr > 0 ? (feeN / nsr) - 1 : 0;

    const active = rows.reduce((s, r) => s + r.b + r.e + r.a, 0) > 0 || feeN > 0;

    // Budget-pane values — prefer snap when locked
    const bC = lk ? snap.bL + snap.bT + bxpN : cost;
    const bM = lk ? feeN - bC : mgn;
    const bMP = lk && ter > 0 ? bM / ter : mp;

    // Actual margin
    const actLabCost = actSum.c, actTech = actLabCost * tp;
    const actCost = actLabCost + actTech + bxpN;
    const actMgn = feeN - actCost;
    const actMP = ter > 0 ? actMgn / ter : 0;
    const marginDelta = (lk && feeN > 0 && aH > 0) ? actMP - snap.bMP : null;

    // ─── Mercury pre-flight (projection-based) ───
    // Projected = Budget + ETC (matches the "Total" column in the UI).
    // Pre-lock: ETC=0, so projected == budget.
    // Post-lock with ETC transferred: projected reflects the current plan
    // including any estimate-to-complete additions.
    const projH = rows.reduce((s, r) => s + (r.b || 0) + (r.e || 0), 0);
    const projSum = rows.reduce((s, r) => {
      const rk = rates[r.rank]; if (!rk) return s;
      const h = (r.b || 0) + (r.e || 0);
      return { n: s.n + h * rk.nsr, c: s.c + h * rk.cost };
    }, { n: 0, c: 0 });

    // Estimated Budget NSR (from projected hours — still the number to
    // enter/update in Mercury as the projection).
    const bgtNsrEst = projSum.n;
    const bgtEafEst = (bgtNsrEst > 0 && feeN > 0) ? (feeN / bgtNsrEst) - 1 : 0;
    let eafHealth = 'none';
    if (feeN > 0 && bgtNsrEst > 0) {
      if (bgtEafEst < -0.60 || bgtEafEst > 0.60) eafHealth = 'amber';
      else eafHealth = 'green';
    }

    // Capacity planning — at the projected mix, how many hours fit the
    // target-margin cost allowance? Headroom = Max − Planned (projected).
    let maxHrsAtTarget = 0, hrsHeadroom = 0;
    if (projH > 0 && projSum.c > 0 && feeN > 0) {
      const costPerHr = projSum.c / projH;
      const labAllowance = Math.max(0, (bca - bxpN) / (1 + tp));
      maxHrsAtTarget = costPerHr > 0 ? labAllowance / costPerHr : 0;
      hrsHeadroom = maxHrsAtTarget - projH;
    }

    return {
      feeN, bxpN, cxpN, bfN, bbxN, tgtP, tp,
      bgtSum, commitSum, actSum,
      bH, eH, tH, aH,
      nsr, lab, tech, cost, mgn, mp, bca, ter,
      eaf, nuiEaf, aRec, nui, dispANSR,
      active, bC, bM, bMP,
      actMgn, actMP, marginDelta,
      // Mercury pre-flight (projected)
      projH, projSum,
      bgtNsrEst, bgtEafEst, eafHealth,
      maxHrsAtTarget, hrsHeadroom,
    };
  }, [rows, fee, bxp, cxp, bf, bbx, tgt, techP, lk, ed, snap, rates]);

  // ─── Row ops ───
  const updateRow = (i, patch) => setRows(p => {
    const n = [...p]; n[i] = { ...n[i], ...patch }; return n;
  });
  const addRow = () => !lk && setRows(p => [...p, { rank: rankNames[0], b: 0, e: 0, a: 0 }]);
  const delRow = i => !lk && rows.length > 1 && setRows(p => p.filter((_, idx) => idx !== i));

  // ─── Stage transitions ───
  const doSetBudget = () => {
    if (lk || calc.bH === 0) return;
    const b = calc.bgtSum;
    const tp = calc.tp;
    const bCost = b.c + b.c * tp + calc.bxpN;
    const bTer = calc.feeN + calc.bxpN;
    setSnap({
      bN: b.n,
      bL: b.c,
      bT: b.c * tp,
      bC: bCost,
      bM: calc.feeN - bCost,
      bMP: bTer > 0 ? (calc.feeN - bCost) / bTer : 0,
    });
    // Pre-fill actuals to budget (user then updates)
    setRows(p => p.map(r => ({ ...r, a: r.b, e: 0 })));
    setLk(true); setEd(false); setEtcOpen(false); setEtcLog([]);
  };

  const doRunEtc = () => {
    if (!lk) return;
    setEtcOpen(true);
  };

  const doTransferEtc = () => {
    if (!lk || !etcOpen) return;
    setEtcOpen(false); setEd(true);
    setEtcLog(p => [...p, new Date().toLocaleString()]);
  };

  const doClear = () => {
    setRows([
      { rank: 'Partner/Principal',  b: 0, e: 0, a: 0 },
      { rank: 'Senior Manager',     b: 0, e: 0, a: 0 },
      { rank: 'Manager',            b: 0, e: 0, a: 0 },
      { rank: 'Senior Associate 1', b: 0, e: 0, a: 0 },
      { rank: 'Associate / Staff',  b: 0, e: 0, a: 0 },
    ]);
    setEngName(''); setFee(''); setBxp(''); setCxp(''); setBf(''); setBbx('');
    setLk(false); setEtcOpen(false); setEd(false); setEtcLog([]);
    setSnap({ bN: 0, bL: 0, bT: 0, bC: 0, bM: 0, bMP: 0 });
  };

  // ─── Auto-allocate from cost allowance ───
  // Rules:
  //   - Any row with BGT > 0 is treated as user-locked (fixed). Auto-allocate
  //     fills only rows at 0. This lets the user pin specific grades (e.g.
  //     Partner = 2, Manager = 16) and have the app distribute the rest.
  //   - Partner (if fillable): target 2 hrs; fallback 1; else 0.
  //   - If NO managerial rank is user-locked: Managerial block (P + DSM) =
  //     20% of total hours, distributed pyramid-style by mix %.
  //   - If ANY managerial rank is user-locked: the 20% rule is skipped —
  //     fillable ranks just absorb the remaining labour allowance, with
  //     seniors/associates split per the selected profile.
  //   - Total sized so labour cost == labAllowance.
  const doAutoAlloc = () => {
    if (lk) return;
    if (calc.feeN <= 0) { alert('Enter Agreed Fees first.'); return; }
    if (rows.length === 0) { alert('Add at least one resource row first.'); return; }
    const bca = calc.ter * (1 - (+tgt || 0) / 100);
    const labAllowance = Math.max(0, (bca - calc.bxpN) / (1 + calc.tp));
    const profile = MIX_PROFILES[mixType] || MIX_PROFILES[DEFAULT_MIX_TYPE];

    // Which rows are user-locked (any BGT > 0). Locked rows keep their value.
    const lockedRanks = rows.filter(r => (r.b || 0) > 0).map(r => r.rank);
    const lockedSet = new Set(lockedRanks);
    const lockedLabCost = rows.reduce(
      (s, r) => s + (lockedSet.has(r.rank) ? (r.b || 0) * (rates[r.rank]?.cost || 0) : 0), 0);
    const remainingLab = Math.max(0, labAllowance - lockedLabCost);

    // Filter present ranks by group AND whether they're fillable (not locked).
    const fillable = rows.filter(r => !lockedSet.has(r.rank)).map(r => r.rank);
    const fillableSet = new Set(fillable);
    const filter = list => list.filter(n => fillableSet.has(n));

    const partnerFill = filter(rows.map(r => r.rank).filter(n => PARTNER_RANKS.includes(n)));
    const dsmFill     = filter(rows.map(r => r.rank).filter(n => DSM_RANKS.includes(n)));
    const seniorFill  = filter(rows.map(r => r.rank).filter(n => SENIOR_RANKS.includes(n)));
    const assocFill   = filter(rows.map(r => r.rank).filter(n => ASSOC_RANKS.includes(n)));

    // Did the user lock ANY managerial (P or DSM) rank?
    const anyManagerialLocked = rows.some(
      r => lockedSet.has(r.rank) &&
        (PARTNER_RANKS.includes(r.rank) || DSM_RANKS.includes(r.rank))
    );

    // Blended cost per hour across a group.
    const blendedCost = ranks => {
      if (!ranks.length) return 0;
      const w = ranks.map(n => rates[n]?.mix || 0);
      const anyPos = w.some(x => x > 0);
      const wSum = anyPos ? w.reduce((s, x) => s + x, 0) : ranks.length;
      if (wSum === 0) return 0;
      return ranks.reduce((s, n, i) => {
        const share = anyPos ? (w[i] / wSum) : (1 / ranks.length);
        return s + share * (rates[n]?.cost || 0);
      }, 0);
    };
    // Distribute a pool of hours across a group by mix weight.
    const distribute = (ranks, poolHrs) => {
      if (!ranks.length || poolHrs <= 0) return [];
      const w = ranks.map(n => rates[n]?.mix || 0);
      const anyPos = w.some(x => x > 0);
      const wSum = anyPos ? w.reduce((s, x) => s + x, 0) : ranks.length;
      return ranks.map((n, i) => {
        const share = anyPos ? (w[i] / wSum) : (1 / ranks.length);
        return [n, poolHrs * share];
      });
    };

    const bPartner = blendedCost(partnerFill);
    const bDSM = blendedCost(dsmFill);
    const bSen = blendedCost(seniorFill);
    const bAssoc = blendedCost(assocFill);
    const effSA = profile.seniorShare * bSen + profile.assocShare * bAssoc;

    // Start with locked rows held; build hrs for fillable rows.
    const hrs = {};
    rows.forEach(r => {
      hrs[r.rank] = lockedSet.has(r.rank) ? (r.b || 0) : 0;
    });

    if (anyManagerialLocked) {
      // Managerial rule skipped. Fillable managerial ranks share whatever
      // managerial pool the user implied; remainingLab flows into SA pool
      // (and any fillable managerial ranks get a proportional share by mix).
      // Simplest & most useful: give remainingLab to fillable SA ranks per
      // profile shares, and any fillable managerial ranks at zero UNLESS
      // there are no SA ranks present, in which case fillable managerial
      // absorb it all by mix.
      if (effSA > 0 && (seniorFill.length + assocFill.length) > 0) {
        const saHrs = remainingLab / effSA;
        distribute(seniorFill, saHrs * profile.seniorShare).forEach(([n, v]) => { hrs[n] = v; });
        distribute(assocFill,  saHrs * profile.assocShare ).forEach(([n, v]) => { hrs[n] = v; });
      } else {
        // No fillable SA; distribute remainingLab across fillable managerial.
        const mgrFill = [...partnerFill, ...dsmFill];
        const bMgr = blendedCost(mgrFill);
        const mgrHrs = bMgr > 0 ? remainingLab / bMgr : 0;
        distribute(mgrFill, mgrHrs).forEach(([n, v]) => { hrs[n] = v; });
      }
    } else {
      // No managerial locked → apply the 20% rule.
      // Partner: target 2 hrs if budget permits (only if Partner is fillable).
      let partnerHrs = 0;
      if (partnerFill.length > 0 && bPartner > 0) {
        if (remainingLab >= PARTNER_TARGET_HRS * bPartner + 0.2 * remainingLab) {
          partnerHrs = PARTNER_TARGET_HRS;
        } else if (remainingLab >= bPartner) {
          partnerHrs = 1;
        }
      }
      distribute(partnerFill, partnerHrs).forEach(([n, v]) => { hrs[n] = v; });
      const partnerCost = partnerHrs * bPartner;

      // Size T so that: partnerCost + bDSM*(0.2T − partnerHrs) + T*0.8*effSA = remainingLab
      let T = 0;
      if (dsmFill.length > 0 && bDSM > 0) {
        const denom = MANAGERIAL_SHARE * bDSM + (1 - MANAGERIAL_SHARE) * effSA;
        if (denom > 0) T = (remainingLab - partnerCost + bDSM * partnerHrs) / denom;
      } else if (effSA > 0) {
        T = (remainingLab - partnerCost) / ((1 - MANAGERIAL_SHARE) * effSA);
      } else {
        T = partnerHrs > 0 ? partnerHrs / MANAGERIAL_SHARE : 0;
      }
      if (!isFinite(T) || T <= 0) {
        const bAll = blendedCost([...partnerFill, ...dsmFill, ...seniorFill, ...assocFill]);
        T = bAll > 0 ? remainingLab / bAll : 0;
      }
      const dsmHrs = dsmFill.length > 0 ? Math.max(0, MANAGERIAL_SHARE * T - partnerHrs) : 0;
      const saHrs = (1 - MANAGERIAL_SHARE) * T;
      distribute(dsmFill, dsmHrs).forEach(([n, v]) => { hrs[n] = v; });
      distribute(seniorFill, saHrs * profile.seniorShare).forEach(([n, v]) => { hrs[n] = v; });
      distribute(assocFill,  saHrs * profile.assocShare ).forEach(([n, v]) => { hrs[n] = v; });
    }

    // Orphan fillable ranks (e.g. Intern) — if they're ALL that's fillable,
    // distribute remainingLab evenly.
    const grouped = new Set([...partnerFill, ...dsmFill, ...seniorFill, ...assocFill]);
    const orphans = fillable.filter(n => !grouped.has(n));
    if (orphans.length === fillable.length && orphans.length > 0) {
      const cOrphan = blendedCost(orphans);
      const oT = cOrphan > 0 ? remainingLab / cOrphan : 0;
      distribute(orphans, oT).forEach(([n, v]) => { hrs[n] = v; });
    }

    // Final rescale — pin locked rows, scale fillable rows so total labour
    // cost = labAllowance.
    const currentLab = rows.reduce(
      (s, r) => s + (hrs[r.rank] || 0) * (rates[r.rank]?.cost || 0), 0);
    if (currentLab > 0 && fillable.length > 0) {
      const flexLab = currentLab - lockedLabCost;
      const flexTarget = Math.max(0, labAllowance - lockedLabCost);
      if (flexLab > 0) {
        const flexScale = flexTarget / flexLab;
        fillable.forEach(n => { hrs[n] = (hrs[n] || 0) * flexScale; });
      }
    }

    const newRows = rows.map(r => ({
      ...r,
      b: Math.max(0, Math.round(hrs[r.rank] || 0)),
      e: 0, a: 0,
    }));
    setRows(newRows);
  };

  // ─── Save to history ───
  const doSave = () => {
    if (!engName.trim()) { alert('Enter name.'); return; }
    const tag = ed ? 'ETC' : 'Bgt';
    const lastEtc = etcLog.length > 0 ? etcLog[etcLog.length - 1] : '';
    const entry = {
      id: Date.now(),
      d: new Date().toLocaleString(),
      nm: engName, tag, etcDate: lastEtc, etcCount: etcLog.length,
      aH: calc.aH, h: calc.tH,
      nsr: calc.nsr, fee: calc.feeN, ter: calc.feeN + calc.bxpN,
      eaf: calc.eaf, cost: calc.cost,
      mgn: calc.bM, mp: calc.bMP, nui: calc.nui,
      // Weekly-booking inputs (new; older entries may lack these)
      rows: rows.map(r => ({ rank: r.rank, b: r.b, e: r.e, a: r.a })),
      startWeek,
    };
    setHistory(p => [entry, ...p]);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1000);
  };

  const exportCsv = () => {
    if (!history.length) return;
    const hdr = 'Date,Engagement,Status,ETC Count,Last ETC,Actual Hrs,Proj Hrs,Fee,Cost,Margin,Margin%,NUI';
    const lines = history.map(s =>
      [`"${s.d}"`, `"${s.nm.replace(/"/g, '""')}"`, s.tag, s.etcCount, `"${s.etcDate || ''}"`,
       s.aH, s.h, s.fee.toFixed(2), s.cost.toFixed(2), s.mgn.toFixed(2),
       `${(s.mp * 100).toFixed(2)}%`, s.nui.toFixed(2)].join(','));

    // Build per-engagement weekly booking sections. Uses saved rows+startWeek
    // when present; older history entries without these are skipped.
    const csvQuote = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const addDaysISO = (iso, days) => {
      const d = new Date(iso + 'T00:00:00');
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };
    const hoursToBlocks = h => {
      // 40h = 100%; partial weeks round to nearest 10% (min 10%)
      if (!h || h <= 0) return [];
      const full = Math.floor(h / HPW);
      const partial = h % HPW;
      const out = [];
      for (let i = 0; i < full; i++) out.push(100);
      if (partial > 0) {
        let p = Math.round((partial / HPW) * 100);
        p = Math.round(p / 10) * 10;
        if (p === 0) p = 10;
        out.push(p);
      }
      return out;
    };

    const gridSections = [];
    history.forEach(s => {
      if (!Array.isArray(s.rows) || !s.startWeek) return;
      const activeRows = s.rows.filter(r => (r.b || 0) > 0 || (r.e || 0) > 0);
      if (!activeRows.length) return;

      // Build per-row weekly % array (budget blocks + optional ETC blocks)
      const perRow = activeRows.map(r => {
        const blocks = hoursToBlocks(r.b);
        const etcBlocks = hoursToBlocks(r.e);
        etcBlocks.forEach(p => blocks.push(p));
        // Delay Associate/Staff by one week (onboarding)
        if (r.rank === 'Associate / Staff' && blocks.length > 0) {
          blocks.unshift(null);
        }
        return { rank: r.rank, blocks };
      });

      const maxLen = Math.max(0, ...perRow.map(r => r.blocks.length));
      if (maxLen === 0) return;

      const weekDates = Array.from({ length: maxLen },
        (_, i) => addDaysISO(s.startWeek, i * 7));

      gridSections.push('');
      gridSections.push(`Weekly booking: ${csvQuote(s.nm)} (starts ${s.startWeek})`);
      gridSections.push(['Rank', ...weekDates].join(','));
      perRow.forEach(r => {
        const cells = Array.from({ length: maxLen }, (_, i) => {
          const v = r.blocks[i];
          return v == null ? '' : `${v}%`;
        });
        gridSections.push([csvQuote(r.rank), ...cells].join(','));
      });
    });

    const body = [hdr, ...lines, ...gridSections].join('\r\n');
    const blob = new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'engagement_economics.csv';
    a.click();
  };

  // ─── Rate CSV import/export ───
  const downloadRateTemplate = () => {
    const rows = ['Rank,NSR_per_hr,Cost_per_hr,Mix_pct'];
    rankNames.forEach(n => rows.push(`"${n}",${rates[n].nsr},${rates[n].cost},${rates[n].mix || 0}`));
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rate_template.csv';
    a.click();
  };
  const fileRef = useRef();
  const importRates = e => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { alert('CSV needs header + data.'); return; }
      const newRates = {};
      for (let i = 1; i < lines.length; i++) {
        const parts = [], line = lines[i]; let cur = '', inQ = false;
        for (let j = 0; j < line.length; j++) {
          const ch = line[j];
          if (ch === '"') inQ = !inQ;
          else if (ch === ',' && !inQ) { parts.push(cur.trim()); cur = ''; }
          else cur += ch;
        }
        parts.push(cur.trim());
        if (parts.length < 3) continue;
        const rk = parts[0].replace(/^"|"$/g, ''), nsr = +parts[1], cost = +parts[2];
        const mix = parts.length >= 4 ? (+parts[3] || 0) : 0;
        if (!rk || isNaN(nsr) || isNaN(cost)) continue;
        const abbr = DEFAULT_RATES[rk]?.abbr || rk.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 3);
        const name = DEFAULT_RATES[rk]?.name || rk;
        newRates[rk] = { name, nsr, cost, mix, abbr };
      }
      const keys = Object.keys(newRates);
      if (!keys.length) { alert('No valid rates found.'); return; }
      setRates(newRates);
      // reset rows to the new set
      setRows([
        { rank: keys[0], b: 0, e: 0, a: 0 },
        { rank: keys[Math.min(2, keys.length - 1)], b: 0, e: 0, a: 0 },
        { rank: keys[Math.min(3, keys.length - 1)], b: 0, e: 0, a: 0 },
      ]);
      doClear();
      alert(`Rates updated: ${keys.length} ranks loaded.`);
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  // ─── Pre-fill from Portfolio Monitor ───
  const prefillFromPM = d => {
    doClear();
    setEngName(d.name);
    if (d.terBud) setFee(Math.round(d.terBud).toLocaleString('en-US'));
    if (d.hours && d.hours > 0) {
      const totalW = rows.reduce((s, r) => s + (rates[r.rank]?.mix || 0), 0);
      if (totalW > 0) {
        setRows(p => p.map(r => ({
          ...r, b: Math.round(d.hours * (rates[r.rank]?.mix || 0) / totalW),
        })));
      }
    }
    if (d.billing != null && !isNaN(d.billing) && d.billing > 0) setBf(Math.round(d.billing).toLocaleString('en-US'));
    if (d.expense != null && !isNaN(d.expense) && d.expense > 0) setCxp(Math.round(d.expense).toLocaleString('en-US'));
    // switch to calc view
    setView('calc');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // simulate Set Budget shortly after state settles
    setTimeout(() => doSetBudget(), 0);
  };

  // ─── Render ───
  if (view === 'pm') {
    return (
      <ToolShell
        title="Engagement Economics"
        subtitle="v8.0 · Portfolio monitor"
        actions={
          <button onClick={() => setView('calc')} style={btnPrimary()}>← Calculator</button>
        }
      >
        <PortfolioMonitor onOpenEngagement={prefillFromPM} />
      </ToolShell>
    );
  }

  const badge = !lk ? 'Budget'
    : etcOpen ? 'Budget set'
    : ed ? 'ETC done'
    : 'Budget set';

  return (
    <ToolShell
      title="Engagement Economics"
      subtitle="v8.0 · Portfolio monitor"
      actions={
        <button onClick={() => setView('pm')} style={btnPrimary()}>
          Portfolio monitor
        </button>
      }
    >
      {/* ─── Engagement name bar ─── */}
      <div className="px-engbar">
        <input
          type="text" value={engName} onChange={e => setEngName(e.target.value)}
          placeholder="Engagement name (e.g. IMDA SGNIC — E-69733072)"
          style={nameInput()}
          onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
          onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
        />
        <span style={statusBadge(badge, ed)}>{badge}</span>
        <button onClick={doSave} style={{
          ...btnPrimary(),
          background: savedFlash ? T.green : T.accent,
          borderColor: savedFlash ? T.green : T.accent,
        }}>
          {savedFlash ? 'Saved!' : 'Save to history'}
        </button>
      </div>

      {/* ─── Two-column card grid ─── */}
      <div className="px-grid-2col" style={{ marginBottom: 24 }}>
        {/* ═════════ LEFT CARD ═════════ */}
        <div className="px-card" style={cardStyle()}>
          <CardTitle title="Resources & hours" sub="Plan budget hours, set budget, then track with ETC and actual hours." />

          {/* Header row */}
          <div className="px-rank-row px-rank-header" style={{
            padding: '0 0 8px', marginBottom: 6,
            borderBottom: `1px solid ${T.border}`,
          }}>
            <ColHdr>Rank</ColHdr>
            <ColHdr align="right">BGT</ColHdr>
            <ColHdr align="right" color={lk ? T.amberVal : T.border2}>ETC(+)</ColHdr>
            <ColHdr align="right" color={lk ? T.blueSec  : T.border2}>Total</ColHdr>
            <ColHdr align="right" color={lk ? T.green    : T.border2}>Actual</ColHdr>
            <span />
          </div>

          {/* Data rows */}
          {rows.map((r, i) => {
            const total = lk ? (etcOpen ? r.b + r.e : r.b + r.e) : 0;
            return (
              <div key={i} className="px-rank-row" style={{ marginBottom: 6 }}>
                <RankSelect
                  value={r.rank} disabled={lk}
                  onChange={v => updateRow(i, { rank: v })}
                  rates={rates}
                  rankNames={rankOrder}
                />
                <NumCell
                  value={r.b} locked={lk}
                  onChange={v => updateRow(i, { b: +v || 0, e: 0, a: 0 })}
                  variant="plain"
                />
                <NumCell
                  value={r.e} locked={!etcOpen}
                  dim={!lk}
                  onChange={v => updateRow(i, { e: +v || 0 })}
                  variant="amber"
                />
                <NumCell
                  value={lk ? total : 0} locked dim={!lk}
                  variant="blueReadonly"
                />
                <NumCell
                  value={r.a} locked={!lk}
                  dim={!lk}
                  onChange={v => updateRow(i, { a: +v || 0 })}
                  variant="green"
                />
                {rows.length > 1 && !lk ? (
                  <button onClick={() => delRow(i)} aria-label="remove" style={xBtn()}>×</button>
                ) : <div style={{ width: 18 }} />}
              </div>
            );
          })}

          {/* Total row */}
          <div className="px-rank-row px-rank-total" style={{
            paddingTop: 10, marginTop: 4,
            borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: T.text2 }}>
              Total <span style={{ color: T.text4, fontWeight: 400, fontSize: 11 }}>(hrs)</span>
            </div>
            <TotCell value={calc.bH} tone="plain" />
            <TotCell value={calc.eH} tone={lk ? 'amber' : 'dim'} />
            <TotCell value={lk ? calc.tH : 0} tone={lk ? 'blue' : 'dim'} />
            <TotCell value={lk ? calc.aH : 0} tone={lk ? 'green' : 'dim'} />
            <span />
          </div>

          {/* Add / auto-allocate */}
          {!lk && (
            <div style={{ marginTop: 14 }}>
              <button onClick={addRow} style={dashedBtn()}>+ Add resource</button>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'stretch' }}>
                <button onClick={doAutoAlloc} style={{
                  ...dashedBtn(), margin: 0, flex: 1,
                  borderStyle: 'solid', borderColor: T.accent, color: T.accent,
                }}>Auto-allocate from cost allowance</button>
                <select
                  value={mixType}
                  onChange={e => setMixType(e.target.value)}
                  title="Senior/Associate split profile"
                  style={{
                    fontSize: 12, padding: '0 8px',
                    borderRadius: T.radiusSm,
                    border: `1px solid ${T.border}`,
                    background: T.white, color: T.text,
                    cursor: 'pointer',
                  }}
                >
                  {MIX_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Starting week — used when exporting weekly booking grid */}
          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 12, color: T.text2, flexWrap: 'wrap',
          }}>
            <label htmlFor="px-start-week" style={{ color: T.text3, fontWeight: 600 }}>
              Starting week (Mon)
            </label>
            <input
              id="px-start-week"
              type="date"
              value={startWeek}
              onChange={e => setStartWeek(snapToMonday(e.target.value))}
              style={{
                fontSize: 12, padding: '4px 8px', borderRadius: 6,
                border: `1px solid ${T.border}`, background: T.white, color: T.text,
              }}
            />
          </div>

          {/* Action tabs */}
          <div className="px-tab-row">
            <button onClick={doSetBudget} disabled={lk}
              style={tabStyle(!lk ? 'active' : 'off')}>
              Set budget
            </button>
            <button
              onClick={etcOpen ? doTransferEtc : doRunEtc}
              disabled={!lk}
              style={tabStyle(
                !lk ? 'off'
                : etcOpen ? 'active-blue'
                : ed ? 'ready'
                : 'ready'
              )}
            >
              {etcOpen ? 'Transfer ETC' : 'Run ETC'}
            </button>
            <button onClick={doClear} style={tabStyle('ghost-red')}>Clear</button>
          </div>

          {/* Booking Estimate — shown after budget set */}
          {lk && <BookingEstimate rows={rows} rates={rates} ed={ed} etcOpen={etcOpen} />}

          {/* Performance — shown after budget set */}
          {lk && calc.active && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: T.text3,
                textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
              }}>Performance</div>
              <div className="px-grid-2eq" style={{ marginBottom: 8 }}>
                <MetricCard
                  label="Actual margin"
                  value={calc.aH > 0 ? fa0(Math.round(calc.actMgn)) : '—'}
                  color={calc.aH > 0 && calc.actMgn < 0 ? T.red : T.text}
                />
                <MetricCard
                  label="Margin change"
                  value={calc.marginDelta != null
                    ? `${calc.marginDelta >= 0 ? '▲' : '▼'} ${(Math.abs(calc.marginDelta) * 100).toFixed(1)}%`
                    : '—'}
                  color={calc.marginDelta == null ? T.text : calc.marginDelta >= 0 ? T.green : T.red}
                />
              </div>
              <div className="px-kpi-strip-4" style={{ gap: 6 }}>
                <SmallKpi label="NSR"  value={fa0(calc.nsr)} />
                <SmallKpi label="ANSR" value={fa0(Math.round(calc.dispANSR))} />
                <SmallKpi label="TER"  value={fa0(Math.round(calc.dispANSR + calc.bxpN))} />
                <SmallKpi label="EAF"  value={pc(calc.eaf)} />
              </div>
            </div>
          )}
        </div>

        {/* ═════════ RIGHT CARD — Budget, Cost & Billing ═════════ */}
        <div className="px-card" style={cardStyle()}>
          <CardTitle title="Budget, cost & billing" sub="Set fee and target margin, then track cost and billing." />

          <SectionLabel>Budget</SectionLabel>
          <StatRow label="Agreed fees"
            input={<MoneyInput value={fee} onChange={setFee} />}
          />
          <StatRow label={
            <>Target margin <PctInputBadge value={tgt} onChange={setTgt} /></>
          } value={calc.feeN > 0 ? fa(calc.ter * calc.tgtP) : '—'} />
          <StatRow label="Cost allowance"
            value={calc.active && calc.feeN > 0 ? fa(calc.bca) : '—'} />
          <StatRow label={<strong>Budgeted cost</strong>}
            value={calc.active && calc.feeN > 0 ? fa(calc.bC) : '—'}
            valueColor={calc.bC > calc.bca && calc.feeN > 0 ? T.red : undefined}
            emphasis />
          <StatRow
            label={<>
              <strong>Budgeted margin</strong>{' '}
              <InlinePctBadge value={calc.bMP} color={calc.bMP < 0 ? T.red : calc.bMP >= 0.3 ? T.green : T.text2} />
            </>}
            value={calc.active && calc.feeN > 0 ? fa(calc.bM) : '—'}
            valueColor={calc.bM < 0 ? T.red : undefined}
            emphasis />

          {/* Mercury pre-flight — projected-based. Pre-lock, projected == budget. */}
          {calc.projH > 0 && calc.feeN > 0 && (() => {
            const planned = calc.projH;
            const maxHrs = Math.floor(calc.maxHrsAtTarget);
            const headroom = maxHrs - planned;
            const overBudget = headroom < 0;
            const headroomColor = overBudget ? T.red : headroom < 10 ? T.amber : T.green;
            const hoursLabel = 'Planned hours';
            const subtitle = 'budget sanity check';
            return (
              <div style={{
                marginTop: 14, padding: '12px 14px',
                background: '#F8FAFC',
                border: `1px solid ${T.border}`,
                borderRadius: T.radius, fontSize: 13, color: T.text2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <strong style={{ color: T.text, fontSize: 13 }}>Mercury pre-flight</strong>
                  <span style={{ color: T.text3, fontSize: 12 }}>{subtitle}</span>
                </div>

                {/* Primary: hours-based capacity against target margin */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6, columnGap: 16 }}>
                  <span><strong style={{ color: T.text }}>Max bookable hours</strong> <span style={{ color: T.text3 }}>at {(calc.tgtP * 100).toFixed(0)}% margin, current mix</span></span>
                  <strong style={{ color: T.text, fontFamily: mono, fontSize: 14 }}>{fmtN(maxHrs)} hrs</strong>
                  <span>{hoursLabel}</span>
                  <span style={{ color: T.text, fontFamily: mono }}>{fmtN(planned)} hrs</span>
                  <span><strong style={{ color: T.text }}>Headroom</strong> <span style={{ color: T.text3 }}>{overBudget ? '(over budget)' : '(hours available)'}</span></span>
                  <strong style={{ color: headroomColor, fontFamily: mono, fontSize: 14 }}>
                    {overBudget ? '−' : '+'}{fmtN(Math.abs(headroom))} hrs
                  </strong>
                </div>

                {/* Secondary: Mercury reference values */}
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.border}`,
                  display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 3, columnGap: 16,
                  fontSize: 12, color: T.text3,
                }}>
                  <span>Estimated Budget NSR <span style={{ fontSize: 11 }}>(enter in Mercury)</span></span>
                  <span style={{ color: T.text2, fontFamily: mono }}>{fa(calc.bgtNsrEst)}</span>
                  <span>Implied Budget EAF <span style={{ fontSize: 11 }}>(informational)</span></span>
                  <span style={{ color: T.text2, fontFamily: mono }}>{(calc.bgtEafEst * 100).toFixed(2)}%</span>
                </div>
              </div>
            );
          })()}

          <Divider />

          <SectionLabel color={T.blueSec}>Project cost</SectionLabel>
          <StatRow tone="blue" label="Labour cost" value={calc.active ? fa(calc.lab) : '—'} />
          <StatRow tone="blue" label={<>Tech fee <PctInputBadge value={techP} onChange={setTechP} tone="blue" /></>}
            value={calc.active ? fa(calc.tech) : '—'} />
          <StatRow tone="blue" label="Billable expenses"
            input={<MoneyInput value={bxp} onChange={setBxp} tone="blue" />} />
          <StatRow tone="blue" label={<strong>Projected cost</strong>}
            value={calc.active ? fa(calc.cost) : '—'}
            valueColor={calc.active && calc.cost > calc.bca && calc.feeN > 0 ? T.red : undefined}
            emphasis />
          <StatRow tone="blue"
            label={<>
              <strong>Projected margin</strong>{' '}
              <InlinePctBadge value={calc.mp} tone="blue" color={calc.mp < 0 ? T.red : calc.mp >= 0.3 ? T.green : T.blueSec} />
            </>}
            value={calc.active && calc.feeN > 0 ? fa(calc.mgn) : '—'}
            valueColor={calc.mgn < 0 ? T.red : undefined}
            emphasis />

          <Divider />

          <SectionLabel color={T.green}>Unbilled inventory</SectionLabel>
          <StatRow tone="green" label="ANSR"
            value={calc.active ? fa(Math.round(calc.dispANSR * 100) / 100) : '—'} />
          <StatRow tone="green" label="Charged expenses"
            input={<MoneyInput value={cxp} onChange={setCxp} tone="green" />} />
          <StatRow tone="green" label="Billed fees"
            input={<MoneyInput value={bf} onChange={setBf} tone="green" />} />
          <StatRow tone="green" label="Billed expenses"
            input={<MoneyInput value={bbx} onChange={setBbx} tone="green" />} />
          <StatRow tone="green" label={<strong>NUI</strong>}
            value={calc.active && (calc.aH > 0 || calc.cxpN > 0 || calc.bfN > 0 || calc.bbxN > 0) ? fa(calc.nui) : '—'}
            valueColor={calc.nui > 0 ? T.red : calc.nui < 0 ? T.green : undefined}
            emphasis />
          {calc.active && (calc.aH > 0 || calc.cxpN > 0 || calc.bfN > 0 || calc.bbxN > 0) && (
            <div style={{
              textAlign: 'right', fontSize: 11, fontWeight: 600,
              marginTop: 4, paddingRight: 12,
              color: calc.nui > 0 ? T.red : calc.nui < 0 ? T.green : T.text3,
            }}>
              {calc.nui > 0 && calc.aH > calc.tH ? 'Overrun — Unbilled' : calc.nui > 0 ? 'Unbilled' : calc.nui < 0 ? 'Overbilled' : 'fully billed'}
            </div>
          )}
        </div>
      </div>

      {/* ─── History ─── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: T.text }}>History</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={exportCsv} style={btnSecondary()}>Export CSV</button>
            <button onClick={() => { if (history.length && confirm('Clear?')) setHistory([]); }} style={btnDanger()}>Clear all</button>
          </div>
        </div>
        {history.length === 0 ? (
          <div style={{
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: T.radius, padding: 24, textAlign: 'center',
            fontSize: 13, color: T.text3,
          }}>No saved entries yet.</div>
        ) : (
          <div className="px-table-scroll" style={{
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: T.radius,
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 780 }}>
              <thead>
                <tr>
                  {['', 'Date', 'Engagement', 'Status', 'Actual', 'Proj', 'Fee', 'Cost', 'Margin', 'Mgn%', 'NUI'].map((h, i) => (
                    <th key={i} style={{
                      background: T.surface2, color: T.text3,
                      padding: '10px 12px', textAlign: i >= 4 ? 'right' : 'left',
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: 0.5, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(s => (
                  <tr key={s.id}>
                    <td style={td()}>
                      <button onClick={() => setHistory(p => p.filter(x => x.id !== s.id))}
                        style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', fontSize: 14 }}>×</button>
                    </td>
                    <td style={{ ...td(), fontSize: 11, whiteSpace: 'nowrap' }}>{s.d}</td>
                    <td style={{ ...td(), fontWeight: 600 }}>{s.nm}</td>
                    <td style={td()}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 3,
                        background: s.tag === 'ETC' ? T.accent : T.surface2,
                        color: s.tag === 'ETC' ? '#fff' : T.text3,
                      }}>{s.tag === 'ETC' ? `ETC #${s.etcCount}` : 'BGT'}</span>
                    </td>
                    <td style={td('right', true)}>{s.aH}</td>
                    <td style={td('right', true)}>{s.h}</td>
                    <td style={td('right', true)}>{fa0(s.fee)}</td>
                    <td style={td('right', true)}>{fa(s.cost)}</td>
                    <td style={{ ...td('right', true), color: s.mgn < 0 ? T.red : T.text }}>{fa(s.mgn)}</td>
                    <td style={{ ...td('right', true), color: s.mgn < 0 ? T.red : T.text }}>{pc(s.mp)}</td>
                    <td style={{ ...td('right', true), color: s.nui > 0 ? T.red : T.text }}>{fa0(s.nui)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Glossary ─── */}
      <details style={{ marginTop: 8 }}>
        <summary style={{
          fontSize: 14, fontWeight: 600, color: T.text, padding: '10px 0',
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
          <p style={{ marginTop: 10 }}><strong>Margin %</strong> = Margin ÷ TER. Uses TER as denominator to match Reporting Hub.</p>
          <p style={{ marginTop: 10 }}><strong>NUI</strong> (Net Unbilled Inventory) = (Recognized ANSR + Charged Expenses) − (Billed Fees + Billed Expenses).</p>
          <ul style={{ marginTop: 6, paddingLeft: 22, color: T.text3 }}>
            <li>NUI &gt; 0 → work done but not yet billed</li>
            <li>NUI = 0 → billed exactly what has been recognized</li>
            <li>NUI &lt; 0 → billed ahead of work performed</li>
          </ul>
          <p style={{ marginTop: 10 }}><strong>Cost allowance</strong> = TER × (1 − Target Margin%).</p>
          <p style={{ marginTop: 14, color: T.text }}><strong>Mercury pre-flight</strong></p>
          <p style={{ marginTop: 6 }}><strong>Max bookable hours</strong> = largest hour pool (scaling current mix) that keeps Cost ≤ TER × (1 − Target Margin%). Reflects the <em>Total</em> column (Budget + ETC): pre-lock ETC is zero so it equals Budget; post-lock with ETC added it reflects the updated plan.</p>
          <p style={{ marginTop: 10 }}><strong>Headroom</strong> = Max bookable − Planned (Total). Green if &gt;10 hrs, amber if tight, red if already over budget.</p>
          <p style={{ marginTop: 10 }}><strong>Estimated Budget NSR</strong> = Σ (Total Hours × NSR Rate). The NSR to enter/update in Mercury — tracks Bgt+ETC.</p>
          <p style={{ marginTop: 10 }}><strong>Implied Budget EAF</strong> = (Fee ÷ Estimated Budget NSR) − 1. Informational. Negative EAF is normal when the rate card's NSR rates exceed market fee.</p>
        </div>

        <div style={{
          marginTop: 10, background: T.white, border: `1px solid ${T.border}`,
          borderRadius: T.radius, padding: '14px 16px', fontSize: 13, color: T.text2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <strong style={{ color: T.text }}>Current rates</strong>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text2 }}>
              Rate year:
              <select
                value={rateYear}
                onChange={e => changeRateYear(e.target.value)}
                style={{
                  fontSize: 12, padding: '4px 8px', borderRadius: 6,
                  border: `1px solid ${T.border}`, background: T.white, color: T.text,
                }}
              >
                {RATE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button onClick={downloadRateTemplate} style={btnSecondary()}>Download template</button>
            <button onClick={() => fileRef.current?.click()} style={btnSecondary()}>Import rates</button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importRates} />
          </div>
          <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse', fontSize: 11, fontFamily: mono }}>
            <thead>
              <tr>
                {['Rank', 'NSR/hr', 'Cost/hr', 'Mix %'].map((h, i) => (
                  <th key={i} style={{
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '6px 8px', color: T.text3, fontWeight: 600,
                    borderBottom: `1px solid ${T.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankNames.map(n => (
                <tr key={n}>
                  <td style={{ padding: '5px 8px', color: T.text2 }}>{rates[n].abbr} — {rates[n].name || n}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>${rates[n].nsr}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>${rates[n].cost}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right' }}>{rates[n].mix || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </ToolShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Booking Estimate — weekly rank grid, coloured blocks
   ═══════════════════════════════════════════════════════════════ */
function BookingEstimate({ rows, rates, ed, etcOpen }) {
  const staff = [];
  let ci = 0;
  rows.forEach(r => {
    if (STAFF_EXCLUDE.indexOf(r.rank) !== -1) return;
    if (r.b === 0 && r.e === 0) return;
    const col = RANK_COLORS[ci % RANK_COLORS.length];
    ci++;
    const blocks = [];
    const bF = Math.floor(r.b / HPW), bP = r.b % HPW;
    for (let i = 0; i < bF; i++) blocks.push({ bg: col.bg, fg: col.fg, pct: '100%' });
    if (bP > 0) {
      let p = Math.round(bP / HPW * 100);
      p = Math.round(p / 10) * 10; if (!p) p = 10;
      blocks.push({ bg: col.bgL, fg: col.fgL, pct: p + '%' });
    }
    if (ed && r.e > 0) {
      const eF = Math.floor(r.e / HPW), eP = r.e % HPW;
      for (let j = 0; j < eF; j++) blocks.push({ bg: ETC_COLOR.bg, fg: '#fff', pct: '100%' });
      if (eP > 0) {
        let ep = Math.round(eP / HPW * 100);
        ep = Math.round(ep / 10) * 10; if (!ep) ep = 10;
        blocks.push({ bg: ETC_COLOR.bgL, fg: '#fff', pct: ep + '%' });
      }
    }
    // Associates are not staffed in week 1 — seniors handle client onboarding
    // and workpaper setup before handing work to associates.
    if (r.rank === 'Associate / Staff' && blocks.length > 0) {
      blocks.unshift(null);
    }
    staff.push({ name: rates[r.rank]?.abbr || r.rank, blocks });
  });
  if (!staff.length) return null;

  const maxBlocks = Math.max(1, ...staff.map(s => s.blocks.length));
  const numTables = Math.max(1, Math.ceil(maxBlocks / COLS));
  const cols = `50px repeat(${COLS}, 1fr)`;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: T.text3,
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
      }}>Booking estimate</div>
      <div className="px-booking-wrap">
      {Array.from({ length: numTables }).map((_, t) => (
        <div key={t} className="px-booking-grid" style={{
          marginTop: t > 0 ? 8 : 0,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: cols,
            background: T.surface2, borderBottom: `1px solid ${T.border}`,
          }}>
            <span style={bkHdr(true)}>Rank</span>
            {Array.from({ length: COLS }).map((_, w) => (
              <span key={w} style={bkHdr()}>W{t * COLS + w + 1}</span>
            ))}
          </div>
          {staff.map((s, idx) => (
            <div key={idx} style={{
              display: 'grid', gridTemplateColumns: cols, alignItems: 'center',
              padding: '6px 0', borderBottom: idx === staff.length - 1 ? 'none' : `1px solid ${T.border}`,
            }}>
              <div style={{ padding: '3px 8px', fontSize: 11, color: T.text2 }}>{s.name}</div>
              {Array.from({ length: COLS }).map((_, c) => {
                const bi = t * COLS + c;
                const blk = s.blocks[bi];
                return (
                  <div key={c} style={{ padding: '1px 3px', textAlign: 'center' }}>
                    {blk ? (
                      <span style={{
                        display: 'inline-block', width: '100%', maxWidth: 48, height: 22,
                        borderRadius: 4, fontSize: 9, fontWeight: 600,
                        lineHeight: '22px', background: blk.bg, color: blk.fg,
                      }}>{blk.pct}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: T.text3, flexWrap: 'wrap' }}>
        <span>Each block = 1 week (40 hrs)</span>
        {ed && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, background: ETC_COLOR.bg, borderRadius: 2, display: 'inline-block' }} />
            ETC additional
          </span>
        )}
      </div>
    </div>
  );
}
function bkHdr(first) {
  return {
    padding: '7px 4px', fontSize: 10, fontWeight: 600,
    color: T.text3, textTransform: 'uppercase',
    textAlign: first ? 'left' : 'center',
    paddingLeft: first ? 10 : undefined,
  };
}

/* ═══════════════════════════════════════════════════════════════
   Subcomponents
   ═══════════════════════════════════════════════════════════════ */
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

function ColHdr({ children, align = 'left', color }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color: color || T.text3,
      textTransform: 'uppercase', letterSpacing: 0.5, textAlign: align,
    }}>{children}</span>
  );
}

function RankSelect({ value, disabled, onChange, rates, rankNames }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const abbr = rates[value]?.abbr || value;
  const displayName = rates[value]?.name || value;
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        title={rates[value] ? `${abbr} — ${displayName}` : value}
        style={{
          ...rowSelect(),
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'default' : 'pointer',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{abbr}</span>
        <span style={{ color: T.text4, fontSize: 10, marginLeft: 4 }}>▾</span>
      </button>
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 2,
          minWidth: '100%', width: 'max-content', maxHeight: 320,
          overflowY: 'auto', zIndex: 20,
          background: T.white, border: `1px solid ${T.border}`,
          borderRadius: T.radiusSm,
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          fontSize: 12,
        }}>
          {rankNames.map(n => {
            const rk = rates[n];
            if (rk?._divider) {
              return <div key={n} style={{ height: 1, background: T.border, margin: '4px 0' }} />;
            }
            const selected = n === value;
            return (
              <div
                key={n}
                onClick={() => { onChange(n); setOpen(false); }}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  background: selected ? '#F1F5F9' : T.white,
                  color: T.text,
                  display: 'flex', gap: 8, alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = T.white; }}
              >
                <span style={{
                  display: 'inline-block', minWidth: 32,
                  color: T.text3, fontFamily: mono, fontSize: 11,
                }}>{rk?.abbr || ''}</span>
                <span>{rk?.name || n}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NumCell({ value, locked, dim, onChange, variant }) {
  const variants = {
    plain:        { bg: T.white,       color: T.text,     border: T.border },
    amber:        { bg: T.amberSoft,   color: T.amberVal, border: T.amberBdr },
    green:        { bg: T.greenSoft,   color: T.greenDk,  border: T.greenBdr },
    blueReadonly: { bg: T.blueSecSoft, color: T.blueSec,  border: T.blueSecBdr },
  };
  const v = variants[variant] || variants.plain;
  const isDim = dim && (variant === 'amber' || variant === 'green' || variant === 'blueReadonly');
  return (
    <input
      type="number" value={value || 0} disabled={locked}
      onChange={e => onChange && onChange(e.target.value)}
      style={{
        width: '100%', height: 32, borderRadius: T.radiusSm,
        border: `1px solid ${isDim ? 'transparent' : v.border}`,
        padding: '0 8px', fontSize: 12, fontFamily: mono, textAlign: 'right',
        color: isDim ? T.border2 : v.color,
        background: isDim ? T.surface2 : v.bg,
        outline: 'none',
        opacity: isDim ? 0.5 : (locked && variant !== 'blueReadonly' ? 0.7 : 1),
        cursor: locked ? 'not-allowed' : 'text',
      }}
      onFocus={e => { if (!locked) { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 2px ${T.accentSoft}`; } }}
      onBlur={e => { e.target.style.borderColor = isDim ? 'transparent' : v.border; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function TotCell({ value, tone }) {
  const tones = {
    plain: { bg: T.surface2,     color: T.text },
    amber: { bg: T.amberSoft,    color: T.amberVal },
    blue:  { bg: T.blueSecSoft,  color: T.blueSec },
    green: { bg: T.greenSoft,    color: T.greenDk },
    dim:   { bg: T.surface2,     color: T.border2 },
  };
  const t = tones[tone] || tones.plain;
  return (
    <div style={{
      background: t.bg, borderRadius: T.radiusSm,
      padding: '7px 8px', fontSize: 12, fontFamily: mono,
      textAlign: 'right', fontWeight: 600, color: t.color,
    }}>{fmtN(value)}</div>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: color || T.text3,
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
    }}>{children}</div>
  );
}

function StatRow({ label, value, input, tone, emphasis, valueColor }) {
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
      <span style={{ color: t.labelCol, display: 'flex', alignItems: 'center', gap: 4 }}>{label}</span>
      {input ? input : (
        <span className="px-stat-value" style={{
          fontFamily: mono, color: valueColor || t.valCol,
          fontWeight: emphasis ? 600 : 500, fontSize: 13,
          width: 130, padding: '0 10px', textAlign: 'right',
          flexShrink: 0,
        }}>{value}</span>
      )}
    </div>
  );
}

function MoneyInput({ value, onChange, tone }) {
  const tones = {
    blue:  { color: T.blueSec, bg: 'rgba(255,255,255,0.65)' },
    green: { color: T.greenDk, bg: 'rgba(255,255,255,0.65)' },
  };
  const t = tone ? tones[tone] : { color: T.text, bg: T.white };
  return (
    <input
      type="text" inputMode="decimal" placeholder="—"
      className="px-stat-money"
      value={value}
      onInput={e => { formatMoneyInput(e.target); onChange(e.target.value); }}
      onChange={e => onChange(e.target.value)}
      style={{
        width: 130, height: 30, borderRadius: T.radiusSm,
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

function InlinePctBadge({ value, tone, color }) {
  const border = tone === 'blue' ? T.blueSecBdr : T.border;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 7px',
      background: tone === 'blue' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.03)',
      borderRadius: 4, border: `1px solid ${border}`,
      fontSize: 11, fontWeight: 600, color: color || T.text2,
      marginLeft: 6, fontFamily: mono,
    }}>{value == null || isNaN(value) ? '—' : `${(value * 100).toFixed(1)}%`}</span>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: `1px solid ${T.border}`, margin: '14px 0 12px' }} />;
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{ padding: '11px 12px', background: T.surface2, borderRadius: T.radiusSm, textAlign: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || T.text, fontFamily: mono }}>{value}</div>
    </div>
  );
}
function SmallKpi({ label, value }) {
  return (
    <div style={{ padding: '8px 10px', background: T.surface2, borderRadius: T.radiusSm, textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: mono }}>{value}</div>
    </div>
  );
}

/* ─── Style helpers ─── */
function cardStyle() { return { background: T.white, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, padding: '20px 22px' }; }
function nameInput() {
  return {
    flex: 1, height: 38, borderRadius: T.radiusSm,
    border: `1px solid ${T.border}`, padding: '0 14px',
    fontSize: 14, color: T.text, outline: 'none',
    fontFamily: 'inherit', background: T.white, transition: T.transition,
  };
}
function statusBadge(label, isEtc) {
  return {
    fontSize: 10, fontWeight: 600,
    color: isEtc ? '#fff' : T.accent,
    background: isEtc ? T.accent : T.accentSoft,
    padding: '4px 10px', borderRadius: 12, letterSpacing: 0.5,
    textTransform: 'uppercase', whiteSpace: 'nowrap',
  };
}
function rowSelect() {
  return {
    width: '100%', height: 32, borderRadius: T.radiusSm,
    border: `1px solid ${T.border}`, padding: '0 8px',
    fontSize: 12, color: T.text, fontFamily: 'inherit',
    outline: 'none', background: T.white,
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
    'active':      { bg: T.text,      color: '#fff',  border: T.text,     cursor: 'pointer', opacity: 1 },
    'active-blue': { bg: T.accent,    color: '#fff',  border: T.accent,   cursor: 'pointer', opacity: 1 },
    'ready':       { bg: T.white,     color: T.text,  border: T.border2,  cursor: 'pointer', opacity: 1 },
    'off':         { bg: T.surface2,  color: T.text3, border: T.border,   cursor: 'default', opacity: 0.7 },
    'ghost-red':   { bg: T.white,     color: T.red,   border: T.border,   cursor: 'pointer', opacity: 1 },
  };
  const s = styles[variant] || styles.off;
  return {
    padding: '9px 12px', border: `1px solid ${s.border}`,
    borderRadius: T.radiusSm, background: s.bg, color: s.color,
    fontSize: 12, fontWeight: 600, cursor: s.cursor,
    fontFamily: 'inherit', transition: T.transition, opacity: s.opacity,
  };
}
function btnPrimary() {
  return {
    padding: '8px 16px', borderRadius: T.radiusSm, border: `1px solid ${T.accent}`,
    background: T.accent, color: '#fff', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: T.transition,
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
function td(align = 'left', monoFam) {
  return {
    padding: '9px 12px', borderBottom: `1px solid ${T.border}`,
    textAlign: align, fontSize: 12, color: T.text,
    fontFamily: monoFam ? mono : 'inherit',
  };
}
