# Praxis

Financial calculators and utilities. Fast, private, no login required.

## Tools

- **DCF Modeler** — Discounted cash flow valuation with multi-scenario analysis and sensitivity tables
- **Engagement Economics** — Budget planning, ETC tracking, NSR, ANSR, EAF, margin, and NUI monitoring
- **Lease Accounting** — IFRS 16 and ASC 842 lease liability and right-of-use asset schedules
- **SaaS Scenario Planner** — ARR, MRR, churn, LTV, CAC — model unit economics across scenarios
- **VaultMerge** — Merge Brave browser passwords into a Vaultwarden export (runs entirely in-browser)

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview production build
```

## Architecture

```
src/
├── App.jsx                   # Route state + AppShell wrapper
├── Home.jsx                  # Tool landing (card grid)
├── shared.jsx                # Tokens, icons, formatters, tool manifest
├── styles.css                # Design system (single source of truth)
├── components/
│   ├── AppShell.jsx          # Persistent sidebar + content area
│   ├── Sidebar.jsx           # Dark left rail with tool navigation
│   ├── ToolShell.jsx         # Per-tool top bar + full-width content
│   ├── Navbar.jsx            # NavBtn (action button in top bar)
│   ├── KpiCard.jsx           # Metric display with delta badge
│   ├── DataTable.jsx         # Financial data table
│   └── FormControls.jsx      # Input, Select, Segment, Section, Btn, InfoBox
└── tools/                    # One file per tool — logic + layout
    ├── DcfModeler.jsx
    ├── EngEconomics.jsx
    ├── LeaseCalc.jsx
    ├── SaasPlanner.jsx
    └── VaultMerge.jsx
```

### Layout

- `AppShell` is the outermost layout — a fixed dark `Sidebar` on the left (tool navigation) and a full-width content area on the right.
- Each tool renders a `ToolShell` inside that content area, which provides a top bar (title + subtitle + actions) and a full-width content zone.
- Tool-specific inputs live inline (settings card, sticky right panel, or section of the tool itself) — the global sidebar is for navigation only.

### Design change layers

| Layer | Files | What changes |
|-------|-------|-------------|
| **Tokens** | `styles.css`, `shared.jsx` | Colors, fonts, spacing, radii |
| **Shell** | `AppShell.jsx`, `Sidebar.jsx`, `ToolShell.jsx` | Global layout chrome |
| **Components** | `components/*.jsx` | Reusable UI blocks |
| **Tools** | `tools/*.jsx` | Tool-specific layout + business logic |

## License

MIT
