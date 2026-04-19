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
