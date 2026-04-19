import { useState } from 'react';
import { T, mono, TOOLS, SearchIcon } from './shared';

const catColors = {
  Finance: { bg: 'rgba(59,91,219,0.08)', text: '#3B5BDB' },
  Operations: { bg: 'rgba(43,147,72,0.08)', text: '#2B9348' },
  Utilities: { bg: 'rgba(107,112,128,0.08)', text: '#6B7080' },
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
      {/* ── Navbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 32px', height: 56,
        background: T.sidebar, position: 'sticky', top: 0, zIndex: 100, gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(59,91,219,0.3)',
          }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>P</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#FFFFFF', letterSpacing: -0.3 }}>Praxis</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          width: 260, height: 38, borderRadius: 8, background: T.sidebarHover,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
          transition: T.transition,
        }}>
          <SearchIcon color="rgba(255,255,255,0.35)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools…" style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, color: '#fff', flex: 1, fontFamily: 'inherit',
          }} />
          {!search && (
            <span style={{
              fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4,
              fontFamily: mono, fontWeight: 500,
            }}>⌘K</span>
          )}
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 44px 0' }}>
        <div style={{
          fontSize: 34, fontWeight: 700, color: T.text, letterSpacing: -1.2,
          lineHeight: 1.15, marginBottom: 10,
        }}>Quick tools</div>
        <div style={{
          fontSize: 15, color: T.text3, marginBottom: 32, letterSpacing: -0.1,
          lineHeight: 1.6, maxWidth: 440,
        }}>
          Financial calculators and utilities.<br />Fast, private, no login required.
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {cats.map(c => {
            const active = filter === c;
            return (
              <div key={c} onClick={() => setFilter(c)} style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', letterSpacing: -0.1, transition: T.transition,
                background: active ? T.text : 'transparent',
                color: active ? '#fff' : T.text3,
                border: active ? 'none' : `1px solid ${T.border}`,
              }}>{c === 'all' ? 'All' : c}</div>
            );
          })}
        </div>

        {/* ── Card grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingBottom: 60 }}>
          {filtered.map(t => {
            const cc = catColors[t.cat] || catColors.Utilities;
            const isHovered = hovered === t.id;
            return (
              <div key={t.id}
                onClick={() => onNavigate(t.id)}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: T.white, borderRadius: T.radiusLg, padding: '24px 26px',
                  border: `1px solid ${isHovered ? T.border2 : T.border}`,
                  boxShadow: isHovered ? T.shadowHover : T.shadow,
                  cursor: 'pointer',
                  transition: T.transition,
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: cc.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{t.icon}</div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: cc.text, letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    background: cc.bg, padding: '4px 10px', borderRadius: 20,
                  }}>{t.cat}</span>
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 6,
                  letterSpacing: -0.3,
                }}>{t.title}</div>
                <div style={{
                  fontSize: 13, color: T.text3, lineHeight: 1.6, marginBottom: 18,
                }}>{t.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: T.accent,
                    transition: T.transition,
                  }}>Open tool</span>
                  <span style={{
                    color: T.accent, fontSize: 14, transition: T.transition,
                    transform: isHovered ? 'translateX(3px)' : 'none',
                    display: 'inline-block',
                  }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: `1px solid ${T.border}`, background: T.white,
        padding: '18px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', fontSize: 12, color: T.text4,
      }}>
        <span>Built for practitioners.</span>
        <span style={{ fontFamily: mono, fontSize: 11 }}>MIT License</span>
      </div>
    </div>
  );
}
