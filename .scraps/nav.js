// ════════════════════════════════════════════════════════════
//  nav.js — Shared navigation for FinanceTools
//  Loaded by every page in /apps via <script src="../scripts/nav.js">
//
//  ✏️  TO ADD A NEW TOOL:
//  1. Add one object to the TOOLS array below
//  2. Drop your .html file in /apps
//  3. Add <script src="../scripts/nav.js"></script> and
//     <script>buildNav("your-file.html")</script> to the page
//  That's it — the menu updates everywhere automatically.
// ════════════════════════════════════════════════════════════

const TOOLS = [

  // ── Revenue ─────────────────────────────────────────────
  { group: "Revenue",    name: "SaaS Scenario Planner",       href: "saas.html"    },
  // { group: "Revenue", name: "Pricing Calculator",          href: "pricing.html" },

  // ── Accounting ──────────────────────────────────────────
  { group: "Accounting", name: "Lease Accounting Calculator", href: "leases.html"  },
  // { group: "Accounting", name: "Deferred Revenue Tracker", href: "deferred-revenue.html"          },

  // ── Planning ────────────────────────────────────────────
  // { group: "Planning",  name: "Budget Variance Tracker",   href: "budget-variance.html"           },

];

// ── Shared styles injected once into the page ────────────────
const NAV_CSS = `
  #nav-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 1000;
    border-bottom: 1px solid var(--nav-border, rgba(255,255,255,0.1));
    background: var(--nav-bg, rgba(20,20,20,0.95));
    backdrop-filter: blur(10px);
    font-family: var(--nav-font, sans-serif);
  }

  #nav-wordmark {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--nav-muted, #888);
    text-decoration: none;
  }
  #nav-wordmark b { color: var(--nav-accent, #aaa); font-weight: 700; }

  #nav-hamburger {
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background 0.15s;
  }
  #nav-hamburger:hover { background: var(--nav-hover, rgba(255,255,255,0.06)); }
  #nav-hamburger span {
    display: block;
    width: 18px; height: 1.5px;
    background: var(--nav-text, #ccc);
    border-radius: 2px;
    transition: transform 0.22s, opacity 0.22s;
    transform-origin: center;
  }
  #nav-hamburger.open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
  #nav-hamburger.open span:nth-child(2) { opacity: 0; }
  #nav-hamburger.open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

  #nav-drawer {
    position: fixed;
    top: 48px; right: 0;
    width: 240px;
    background: var(--nav-drawer-bg, #1c1c1c);
    border-left: 1px solid var(--nav-border, rgba(255,255,255,0.1));
    border-bottom: 1px solid var(--nav-border, rgba(255,255,255,0.1));
    border-bottom-left-radius: 8px;
    box-shadow: -8px 8px 32px rgba(0,0,0,0.4);
    transform: translateX(100%);
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    z-index: 999;
  }
  #nav-drawer.open { transform: translateX(0); }

  .nav-group-label {
    font-size: 0.58rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--nav-muted, #666);
    padding: 12px 16px 5px;
  }

  .nav-link {
    display: block;
    padding: 9px 16px;
    font-size: 0.8rem;
    color: var(--nav-text, #ccc);
    text-decoration: none;
    transition: background 0.1s, color 0.1s;
    border-left: 2px solid transparent;
  }
  .nav-link:hover { background: var(--nav-hover, rgba(255,255,255,0.05)); }
  .nav-link.nav-current {
    color: var(--nav-accent, #fff);
    border-left-color: var(--nav-accent, #fff);
    background: var(--nav-current-bg, rgba(255,255,255,0.07));
    font-weight: 600;
  }

  .nav-divider { height: 1px; background: var(--nav-border, rgba(255,255,255,0.08)); margin: 4px 0; }

  #nav-overlay {
    display: none;
    position: fixed; inset: 0;
    z-index: 998;
  }
  #nav-overlay.open { display: block; }
`;

// ── Main builder — called by each page ───────────────────────
function buildNav(currentHref) {
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = NAV_CSS;
  document.head.appendChild(style);

  // Build drawer HTML
  const groups = {};
  TOOLS.forEach(t => (groups[t.group] = groups[t.group] || []).push(t));

  let drawerHTML = '';
  Object.entries(groups).forEach(([g, tools], i) => {
    if (i > 0) drawerHTML += '<div class="nav-divider"></div>';
    drawerHTML += `<div class="nav-group-label">${g}</div>`;
    tools.forEach(t => {
      const isCurrent = t.href === currentHref;
      drawerHTML += `<a class="nav-link${isCurrent ? ' nav-current' : ''}" href="${t.href}">${t.name}</a>`;
    });
  });

  // Inject nav bar + drawer into page
  const navHTML = `
    <div id="nav-overlay" onclick="navClose()"></div>
    <nav id="nav-bar">
      <a id="nav-wordmark" href="../index.html">Finance<b>Tools</b></a>
      <div id="nav-hamburger" onclick="navToggle()">
        <span></span><span></span><span></span>
      </div>
    </nav>
    <div id="nav-drawer">${drawerHTML}</div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = navHTML;
  document.body.insertBefore(wrapper, document.body.firstChild);

  // Push page content below nav bar
  document.body.style.paddingTop = '48px';
}

function navToggle() {
  const open = document.getElementById('nav-drawer').classList.toggle('open');
  document.getElementById('nav-hamburger').classList.toggle('open', open);
  document.getElementById('nav-overlay').classList.toggle('open', open);
}

function navClose() {
  ['nav-drawer','nav-hamburger','nav-overlay'].forEach(id =>
    document.getElementById(id).classList.remove('open')
  );
}
