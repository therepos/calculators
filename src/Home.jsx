import { useState } from 'react';
import { T, TOOLS, SearchIcon } from './shared';

const catColors = {
  Finance:    { bg: T.accentSoft,  text: T.accent    },
  Operations: { bg: T.greenSoft,   text: T.greenDk   },
  Utilities:  { bg: T.surface2,    text: T.text3     },
};

export default function Home({ onNavigate }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);

  const cats = ['all', ...new Set(TOOLS.map(t => t.cat))];
  const filtered = TOOLS.filter(t => {
    if (filter !== 'all' && t.cat !== filter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>
      {/* Top bar — matches ToolShell header style */}
      <header style={{
        background: T.white, borderBottom: `1px solid ${T.border}`,
        padding: '16px 32px', display: 'flex', alignItems: 'center',
        gap: 16, minHeight: 68,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: T.text, letterSpacing: -0.3 }}>Home</h1>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 3 }}>
            Financial calculators and utilities — fast, private, no login.
          </div>
        </div>
        <div style={{
          width: 300, height: 38, borderRadius: T.radiusSm,
          background: T.surface2, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
        }}>
          <SearchIcon color={T.text4} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools…" style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, color: T.text, flex: 1, fontFamily: 'inherit',
          }} />
        </div>
      </header>

      <main style={{ padding: '28px 32px 56px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          {cats.map(c => {
            const active = filter === c;
            return (
              <div key={c} onClick={() => setFilter(c)} style={{
                padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', transition: T.transition,
                background: active ? T.text : T.white,
                color: active ? '#fff' : T.text3,
                border: `1px solid ${active ? T.text : T.border}`,
              }}>{c === 'all' ? 'All' : c}</div>
            );
          })}
        </div>

        {/* Card grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 14,
        }}>
          {filtered.map(t => {
            const cc = catColors[t.cat] || catColors.Utilities;
            const isHovered = hovered === t.id;
            const Icon = t.icon;
            return (
              <div key={t.id}
                onClick={() => onNavigate(t.id)}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: T.white, borderRadius: T.radiusLg, padding: '20px 22px',
                  border: `1px solid ${isHovered ? T.border2 : T.border}`,
                  boxShadow: isHovered ? T.shadowHover : 'none',
                  cursor: 'pointer', transition: T.transition,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: T.radius, background: cc.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cc.text,
                  }}>
                    <Icon size={20} color={cc.text} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: cc.text, letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    background: cc.bg, padding: '3px 9px', borderRadius: 12,
                  }}>{t.cat}</span>
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 5,
                  letterSpacing: -0.2,
                }}>{t.title}</div>
                <div style={{
                  fontSize: 13, color: T.text3, lineHeight: 1.55, marginBottom: 14,
                }}>{t.desc}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 500, color: T.accent,
                }}>
                  <span>Open tool</span>
                  <span style={{
                    transition: T.transition,
                    transform: isHovered ? 'translateX(3px)' : 'none',
                    display: 'inline-block',
                  }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
