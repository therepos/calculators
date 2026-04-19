/* ═══════════════════════════════════════════════════════════════
   shared.jsx — Design tokens (JS), icons, formatting, tool manifest.
   Palette: Vaultwarden-inspired (blue primary, dark left rail,
   clean white surfaces, readable typography).
   ═══════════════════════════════════════════════════════════════ */

export const T = {
  // Surfaces
  bg: '#F6F7FB',
  white: '#FFFFFF',
  surface2: '#F1F3F8',
  border: '#E4E6ED',
  border2: '#CFD3DC',

  // Text
  text: '#0F172A',
  text2: '#334155',
  text3: '#64748B',
  text4: '#94A3B8',

  // Primary accent (Vaultwarden blue)
  accent: '#175DDC',
  accentHover: '#124FB8',
  accentSoft: '#E8EFFB',
  accentSoft2: '#D8E3F7',

  // Semantic
  green: '#0F7B3F',
  greenDk: '#0A5A2D',
  greenSoft: '#E1F5EE',
  greenBdr: '#5DCAA5',
  red: '#D6293E',
  redSoft: '#FCEBEB',
  redBdr: '#F09595',
  amber: '#B45309',
  amberVal: '#854F0B',
  amberSoft: '#FAEEDA',
  amberBdr: '#EF9F27',
  blueSec: '#185FA5',
  blueSecText: '#0C447C',
  blueSecSoft: '#E6F1FB',
  blueSecBdr: '#85B7EB',

  // Sidebar (dark rail)
  sidebar: '#0F172A',
  sidebarHover: '#1E293B',
  sidebarActive: '#175DDC',
  sidebarText: '#CBD5E1',
  sidebarTextMuted: '#64748B',
  sidebarTextActive: '#FFFFFF',
  sidebarBorder: '#1E293B',

  // Shadows
  shadow: '0 1px 2px rgba(15,23,42,0.04)',
  shadowHover: '0 4px 12px rgba(15,23,42,0.08)',
  shadowSm: '0 1px 2px rgba(15,23,42,0.04)',

  // Shape
  radius: 8,
  radiusSm: 6,
  radiusLg: 12,
  transition: '0.15s ease',

  // Layout
  sidebarWidth: 220,
};

export const font = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
export const mono = `'JetBrains Mono', 'SF Mono', 'Menlo', monospace`;

// ─── Formatting ───
export const fmt = n => n == null || isNaN(n) ? '—' : '$' + Math.round(n).toLocaleString('en-US');
export const fmt2 = n => n == null || isNaN(n) ? '—' : '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = n => n == null || isNaN(n) ? '—' : (n * 100).toFixed(1) + '%';
export const pct0 = n => n == null || isNaN(n) ? '—' : Math.round(n * 100) + '%';
export const fmtN = n => n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('en-US');

// ─── Icons (inline SVG, stroke-based) ───
const iconBase = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

export const ChevronLeft = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="2" {...iconBase}>
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

export const SearchIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="2" {...iconBase}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

export const HomeIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="1.8" {...iconBase}>
    <path d="M3 12L12 4l9 8" /><path d="M5 10v10h5v-6h4v6h5V10" />
  </svg>
);

export const ChartIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="1.8" {...iconBase}>
    <path d="M3 3v18h18" /><path d="M7 15l4-4 4 4 5-5" />
  </svg>
);

export const RulerIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="1.8" {...iconBase}>
    <rect x="3" y="8" width="18" height="8" rx="1" />
    <path d="M7 8v3M10 8v4M13 8v3M16 8v4" />
  </svg>
);

export const FileIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="1.8" {...iconBase}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

export const TrendingIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="1.8" {...iconBase}>
    <path d="M22 7l-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" />
  </svg>
);

export const LockIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="1.8" {...iconBase}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const PlusIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="2" {...iconBase}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const XIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" stroke={color || 'currentColor'} strokeWidth="2" {...iconBase}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── Tool manifest ───
export const TOOLS = [
  { id: 'dcf',   icon: ChartIcon,    title: 'DCF Modeler',          desc: 'Multi-scenario discounted cash flow valuation with sensitivity tables.', cat: 'Finance' },
  { id: 'eng',   icon: RulerIcon,    title: 'Engagement Economics', desc: 'Budget planning, ETC tracking, NSR, ANSR, margin monitoring.',          cat: 'Operations' },
  { id: 'lease', icon: FileIcon,     title: 'Lease Accounting',     desc: 'IFRS 16 and ASC 842 lease liability and ROU asset schedules.',          cat: 'Finance' },
  { id: 'saas',  icon: TrendingIcon, title: 'SaaS Planner',         desc: 'ARR, MRR, churn, LTV, CAC — model unit economics across scenarios.',    cat: 'Finance' },
  { id: 'vault', icon: LockIcon,     title: 'VaultMerge',           desc: 'Merge Brave browser passwords into a Vaultwarden export.',              cat: 'Utilities' },
];
