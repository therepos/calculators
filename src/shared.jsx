/* ═══════════════════════════════════════════════════════════════
   shared.jsx — Constants, tokens (JS), icons, formatting utils.
   ═══════════════════════════════════════════════════════════════ */

export const T = {
  bg: '#F0F1F5',
  white: '#FFFFFF',
  surface2: '#F6F7FA',
  border: '#E2E4EA',
  border2: '#D0D3DB',
  text: '#111318',
  text2: '#3B3F4A',
  text3: '#6B7080',
  text4: '#9CA1AE',
  accent: '#3B5BDB',
  accentHover: '#364FC7',
  accentSoft: 'rgba(59,91,219,0.07)',
  green: '#2B9348',
  greenDk: '#1E6B33',
  greenSoft: 'rgba(43,147,72,0.08)',
  red: '#E03131',
  redSoft: 'rgba(224,49,49,0.07)',
  orange: '#E67700',
  orangeSoft: 'rgba(230,119,0,0.07)',
  purple: '#7048E8',
  purpleSoft: 'rgba(112,72,232,0.07)',
  sidebar: '#1A1D24',
  sidebarHover: '#252830',
  sidebarText: '#C1C5CF',
  sidebarActive: '#FFFFFF',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  shadowHover: '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
  radius: 10,
  radiusSm: 6,
  radiusLg: 14,
  transition: '0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};

export const font = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
export const mono = `'JetBrains Mono', 'SF Mono', 'Menlo', monospace`;

// ─── Formatting ───
export const fmt = n => n == null || isNaN(n) ? '—' : '$' + Math.round(n).toLocaleString('en-US');
export const fmt2 = n => n == null || isNaN(n) ? '—' : '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = n => n == null || isNaN(n) ? '—' : (n * 100).toFixed(1) + '%';
export const pct0 = n => n == null || isNaN(n) ? '—' : Math.round(n * 100) + '%';
export const fmtN = n => n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('en-US');

// ─── Icons (inline SVG) ───
export const ChevronLeft = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || T.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

export const SearchIcon = ({ size = 15, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || T.text4} strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

// ─── Tool manifest ───
export const TOOLS = [
  { id: 'dcf', icon: '📊', title: 'DCF Modeler', desc: 'Multi-scenario discounted cash flow valuation with sensitivity tables.', cat: 'Finance', color: T.accent },
  { id: 'eng', icon: '📐', title: 'Engagement Economics', desc: 'Budget planning, ETC tracking, NSR, ANSR, margin monitoring.', cat: 'Operations', color: T.green },
  { id: 'lease', icon: '📋', title: 'Lease Accounting', desc: 'IFRS 16 and ASC 842 lease liability and ROU asset schedules.', cat: 'Finance', color: T.accent },
  { id: 'saas', icon: '📈', title: 'SaaS Planner', desc: 'ARR, MRR, churn, LTV, CAC — model unit economics across scenarios.', cat: 'Finance', color: T.purple },
  { id: 'vault', icon: '🔐', title: 'VaultMerge', desc: 'Merge Brave browser passwords into a Vaultwarden export.', cat: 'Utilities', color: T.text3 },
];
