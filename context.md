# Praxis — Context

## What is this?
A collection of browser-based financial calculators and utilities. No backend, no auth, no database. Everything runs client-side.

## Tech stack
- React 18 + Vite
- No CSS framework — custom design system in `styles.css` + `shared.jsx`
- No routing library — simple state-based routing in `App.jsx`

## Design system
Vaultwarden-inspired clean UI:
- Persistent dark sidebar (`#0F172A`) with tool navigation on the left
- Full-width white content area with a top bar per tool
- Blue primary accent (`#175DDC`), soft neutrals, Inter for body, JetBrains Mono for numbers
- Colour-coded semantic sections (blue = project cost, green = unbilled inventory, amber = ETC)
- Readable type scale (13–15px body, 20px title), generous padding, 8–12px radii

Tokens are defined in two places:
- `src/styles.css` — CSS custom properties (used by global styles)
- `src/shared.jsx` — JS object `T` (used by inline styles in components)

These must stay in sync. If you change a color in one, change it in the other.

## Architecture rules
1. **Tool files own their own layout.** Because tools have heterogenous UI (EngEconomics is a two-column card grid, DCF has a sticky right-side input panel, VaultMerge is an upload card), each tool composes its own layout using shared primitives. No mandatory per-tool sidebar pattern anymore.
2. **Components are generic.** `KpiCard`, `DataTable`, `ToolShell`, `Sidebar`, `AppShell` etc. know nothing about DCF or leases. They accept data and render it.
3. **shared.jsx is the single import.** Tokens, formatters, icons, and the tool manifest all live here. Don't create new utility files — add to `shared.jsx`.
4. **Sidebar is navigation, not inputs.** The global `Sidebar` is for switching between tools. Tool inputs live inside the tool's own layout.

## Adding a new tool
1. Create `src/tools/MyTool.jsx`
2. Import `ToolShell` + whatever shared primitives you need (`KpiCard`, `DataTable`, `Input`, `Section`, etc.)
3. Define your state, calculations (in `useMemo`), and return JSX wrapped in `<ToolShell title=… subtitle=… actions=…>`
4. Add a case to `App.jsx` switch
5. Add an entry to `TOOLS` array in `shared.jsx` (with an SVG icon component)

## Key components
- `AppShell` — outermost layout, persistent dark Sidebar + content area
- `Sidebar` — dark left rail, 220px fixed, tool navigation
- `ToolShell` — every tool page wrapper. Provides top bar (title + subtitle + actions) and full-width content area
- `KpiCard` — headline metric with optional delta badge (green/red)
- `DataTable` — financial table with header row, right-aligned numeric columns, monospace numbers
- `FormControls` — `Input`, `Select`, `Segment`, `Section`, `Btn`, `InfoBox`
- `Navbar` — exports `NavBtn`, a small outline/primary/danger button for the top-bar actions slot

## Engagement Economics (EngEconomics.jsx) — domain notes

Tool purpose: plan engagement budget hours by rank, compute cost / margin / NSR, and produce a Mercury (EY's SAP) pre-flight summary so the user can replicate the numbers in Mercury. Complements Mercury — does not replace it.

### Terminology
- **Fee** — contract value billable to the client (fixed).
- **NSR** — Net Service Revenue = Σ (hours × standard NSR rate). A *time-value* metric, not GAAP revenue. Used for utilisation and productivity reporting.
- **EAF** — Engagement Adjustment Factor = Fee / NSR − 1. A *derived* value (despite Mercury's UI wording). Negative EAF is normal when the firm's standard NSR rates exceed the market fee.
- **ANSR** — Adjusted NSR = NSR × (1 + EAF). Time-value adjusted for the engagement's pricing reality. Lets firms compare per-person contribution across engagements with different fee economics.
- **TER** — Total Engagement Revenue = Fee + billable expenses. Used as the margin denominator (matches Reporting Hub's "Margin %").
- **Cost allowance** — TER × (1 − target margin %). The budget-envelope cost must stay under for target margin.
- **Writedowns** are a period-end reconciliation: Mercury books NSR eagerly as time is charged (for operational visibility), then trues up at close against the fee cap. A writedown reducing booked revenue below fee = the system pulling back over-recognition; actual collectable revenue still equals Fee.

### Rate card (FY2025-26)
Internal rank keys are stable (saved history depends on them — don't rename). Display labels live in `name` field. Dropdown order is preserved + uses a `__divider__` entry to separate primary grades from less-common ones (Supervising Associate, Senior Associate, Associate, Interns).

Rate rates came from a Mercury extraction session on cost centre SG06-StdR-3-Risk-PrNCn-Singapore (SG300023). Rates can drift engagement-by-engagement in Mercury (observed +3.6% uplift on some ranks in some engagements; A2 was once seen at 60.72 vs card 64). The drift is engagement-specific, not systematic — app uses card rates and accepts small variance with Mercury's numbers.

### Auto-allocate rules (current)
Given a list of rank rows, fill budget hours so total labour cost ≈ cost allowance:

1. **User-locked rows** — any row with BGT > 0 is preserved as-is. Auto-allocate only fills rows at 0.
2. **Mix profile** (user-selected via dropdown next to the Auto-allocate button):
   - **Standard**: 55/45 seniors/associates split on the 80% SA pool.
   - **Senior**: 60/40.
   - **Associate**: 40/60.
3. **Managerial 20% rule**: Partner + DSM (Director / Exec Director / Asso Director / Asst Director / Senior Manager / Manager) = 20% of total hours. Distributed pyramid-style by rate-card mix %.
4. **If any managerial rank is user-locked**, the 20% rule is skipped entirely — remaining labour flows to fillable seniors/associates by profile share.
5. **Partner floor**: target 2 hrs (if cost allowance permits), else 1, else 0.
6. **Post-distribution rescale**: flex ranks (non-locked, non-pinned) scale proportionally to pin total labour cost to the allowance.

### Mercury pre-flight panel
Primary check is **hours headroom** against target margin: Max bookable hours (= cost allowance / current blended cost/hr) − Planned hours. Planned hours uses the **Total** column (Budget + ETC), so pre-lock it equals budget and post-lock reflects the updated plan. Secondary (informational only): Estimated Budget NSR to enter in Mercury and Implied Budget EAF.

No writedown logic. Negative EAF is not treated as a problem — only real overrun check is Cost > TER × (1 − target%).
