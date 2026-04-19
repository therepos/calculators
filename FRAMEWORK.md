# Design Framework

A living document capturing the essence of good UI design as practiced across projects. Not tied to any single codebase. Refine over time.

The purpose: stop repeating the same mistakes.

---

## 1. Core principles

**Flat and clean.** No gradients, drop shadows, glows, or neon. Borders over shadows. Solid flat fills. A subtle 1px border does the job of a fancy shadow without the visual noise.

**Readable type.** Body text lives at 13–15px, never below 11px. Section titles at 14–16px, page titles at 18–22px. Line-height 1.5–1.7 for body. Two font weights max (regular 400, medium 500 or 600). Avoid 700+ — it looks heavy against clean UI.

**Sentence case everywhere.** "Engagement economics", not "Engagement Economics". The only exception is small uppercase eyebrow labels (10–11px, letter-spacing +0.5px, colour: muted text). Never ALL CAPS in body copy or buttons.

**Semantic colour.** Colour encodes meaning, never decoration.
- Blue = primary action, "informational" sections
- Green = success, completed, unbilled/recognized
- Amber = warning, in-progress, needs attention
- Red = danger, overrun, overdue
- Neutral gray = structural, inert, default

Don't cycle through colours like a rainbow. A screen with gray + blue + green reads cleaner than one using six hues.

**Persistent navigation.** If the app has multiple views/tools, navigation should persist — a fixed sidebar or topbar that doesn't unmount when switching. Switching views should feel instant, not like a page reload.

**Full-width content by default.** Resist the urge to cap content at 720px/960px/1200px. Tools and dashboards use the whole viewport. Editorial content (articles, prose) is the exception where narrow columns help readability.

**Generous whitespace, consistent rhythm.** Pad cards 20–24px. Gap between cards 16–20px. Vertical rhythm in rem (1rem, 1.5rem, 2rem), internal gaps in px (8, 12, 16).

---

## 2. Visual hierarchy

Rank information by importance, then express that rank consistently:

| Rank | Size | Weight | Colour | Use |
|------|------|--------|--------|-----|
| Page title | 18–22px | 600 | text | One per page |
| Section title | 14–16px | 600 | text | Major regions within a page |
| Card title | 13–14px | 600 | text | Inside a card |
| Eyebrow label | 10–11px | 600 | text3, UPPERCASE | Above stat rows, table headers |
| Body | 13–14px | 400 | text | Default reading text |
| Secondary body | 12–13px | 400 | text3 | Descriptions, captions |
| Hint / placeholder | 11–12px | 400 | text4 | Least important |
| Numeric values | 13–24px | 500–600 | context | Always in mono font |

Two rules:
1. **Numbers are always in monospace.** Tabular alignment matters. Use a mono stack (JetBrains Mono, SF Mono, Menlo) for any displayed number — KPIs, table cells, input values with $ or %.
2. **Bold is for hierarchy, not emphasis.** Never mid-sentence bold in prose. Bold goes on headings and section labels only.

---

## 3. Spacing & shape

**Radii.**
- 6–8px on inputs, small buttons, pills, table cells
- 10–12px on cards, panels, modals
- 16px+ only for large hero elements
- Pills (full-height rounded): `border-radius: 999px` or `height/2`
- **Never use partial-side border-radius with single-side borders.** If you use `border-left: 3px solid`, set `border-radius: 0` — rounded corners require all four sides.

**Borders.** `1px solid` is the default. Use the same border colour everywhere (a single "border" token). Reserve thicker borders (2px) for focus rings or highlighted/featured items — one exception per screen, not everywhere.

**Shadows.** Used sparingly and functionally only:
- Focus ring: `0 0 0 3px accent-soft`
- Card hover lift: `0 4px 12px rgba(black, 0.06)`
- Never decorative shadows on static elements.

---

## 4. Component primitives

Every tool-style app needs these primitives. Build once, reuse everywhere. If you find yourself reimplementing one, stop and import.

- **Input** — labelled, 36–38px tall, with focus ring. Left-aligned text, right-aligned numbers (mono).
- **Select** — same height/style as Input.
- **Button** — primary (filled accent), secondary (outline), danger (outline red), ghost (no border). Never mix primary and danger visual styles on the same button.
- **Segment control** — pill-shaped toggle for 2–4 mutually exclusive options (e.g. "Both / IFRS 16 / ASC 842"). Preferred over radio groups.
- **Section** — vertical grouping with an eyebrow label.
- **Card** — white bg, 1px border, 10–12px radius, 20–24px padding.
- **KpiCard** — label (eyebrow) + large mono value + optional delta pill. Used in grids of 3–5.
- **StatRow** — label on left, value on right, inside a tinted row. Used for stacked metric readouts (like a receipt).
- **DataTable** — header row with eyebrow labels, mono numeric columns right-aligned, subtle row hover.
- **InfoBox** — tinted banner for inline hints, warnings, results. Four variants (info/success/warn/danger), same shape.

---

## 5. Layout patterns

**The shell pattern** (for multi-tool apps, dashboards):
- Dark fixed sidebar (200–240px) with brand at top, nav items, footer at bottom
- Content area fills remaining width
- Each page in the content area has a top bar: title + subtitle on the left, actions on the right
- Top bar is ~68px tall, white background, single border below

**The two-card pattern** (for calculator-style tools with inputs + outputs):
- Left card: inputs, controls, action buttons
- Right card: derived metrics, stat rows, readouts
- Aspect ratio roughly 1.15:1 (inputs slightly wider)
- On mobile: stack vertically

**The sticky input panel pattern** (for tools with many inputs + tables):
- Main content flows on the left (tables, charts)
- Sticky input card on the right (~320px, alignSelf: start, position: sticky, top: 24px)
- Inputs stay visible as user scrolls through output

**The landing card grid** (for tool selectors, dashboards):
- `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`
- Gap 14–16px
- Each card: icon + category pill, title, description, CTA row

---

## 6. Input & interaction

**Number formatting.** Money fields should format as the user types (`30000` → `30,000`), with cursor position preserved. Don't wait for blur.

**Validation.** Inline, next to the field, small red text. No modal alerts for validation errors.

**Focus states.** Every interactive element needs a visible focus ring. 3px soft-colour outline is the standard.

**Hover states.** Subtle. Background shifts to `surface2`, border darkens to `border2`. Never scale or translate on simple hover.

**Disabled states.** Reduce opacity to 0.5, `cursor: not-allowed`. Don't grey out the border — let the reduced opacity carry the message.

**Click targets.** 36px minimum height for anything tappable. Even on desktop.

---

## 7. Data display

**Tables.**
- Header row: `surface2` background, eyebrow-style labels (uppercase 11px 600)
- Body rows: white, 1px border bottom
- Right-align all numeric columns
- Monospace font for numeric cells
- Row hover: subtle `surface2` tint
- Horizontal scroll on overflow (never crush columns)

**KPI strips.**
- 3–5 cards in a row, equal width
- `gap: 12–14px`
- Small label (uppercase eyebrow) above, large mono value below
- Optional delta badge (green/red pill) below value

**Stat rows** (for cost/margin/NUI-style breakdowns).
- Stack vertically, each row in a tinted background
- Label left, value right
- Section dividers between major groups
- Colour the whole row family when the group has a semantic meaning (e.g. all "project cost" rows get the blue-50 fill)

---

## 8. Colour usage rules

**On tinted backgrounds**, text uses the darkest stop of the same colour family — never plain black or neutral gray. Blue-50 fill → blue-800 text. Green-50 fill → green-800 text. This is the rule that separates cheap-looking UI from polished UI.

**Two-or-three colours per screen.** A dashboard using gray + blue + green looks professional. One using every hue looks like a child's toy.

**Reserve strong colours for meaning.** Green/red/amber carry UI conventions (success/danger/warning). Don't use red as a decorative accent — users will read it as "error".

**Dark mode.** If supporting it: use CSS custom properties for every colour so one token swap handles the whole theme. Never hardcode hex inside components.

---

## 9. Mobile & responsive

**Design desktop-first for tool-style apps**, but don't leave mobile broken.

- Sidebar: collapses behind a hamburger below ~900px
- Two-column card grids: stack at ~768px
- Wide data tables: horizontal scroll in a bordered wrapper (not crushed columns)
- Rank/matrix grids (like hour inputs per rank): the label row becomes one row, number inputs wrap to a 2–4 column grid below
- Top bar: title stays, subtitle hides, actions collapse into a dropdown or wrap to a second row

**Never use `position: fixed` elements that would cover more than 30% of mobile viewport width** without a toggle.

---

## 10. Architectural patterns (React / Vite projects)

```
src/
├── App.jsx                   Routing + AppShell wrapper
├── [Home].jsx                Landing page
├── shared.jsx                Tokens (T object), icons, formatters, manifest
├── styles.css                Matching CSS custom properties
├── components/               Generic, app-agnostic primitives
│   ├── AppShell.jsx          Persistent sidebar + content area
│   ├── Sidebar.jsx           Navigation rail
│   ├── ToolShell.jsx         Per-page top bar + content
│   ├── Form controls         Input, Select, Segment, Section, Btn, InfoBox
│   ├── KpiCard.jsx
│   └── DataTable.jsx
└── tools/                    One file per feature/tool
    └── MyTool.jsx
```

**Three-layer discipline:**

| Layer | Files | What changes |
|-------|-------|-------------|
| Tokens | `shared.jsx`, `styles.css` | Colours, fonts, spacing, radii |
| Components | `components/` | Reusable UI blocks |
| Features | `tools/` (or similar) | Business logic + layout only |

Rules:
1. **Tokens are defined twice** (JS + CSS) but must stay in sync. A colour change touches both files.
2. **Components never import business logic.** `KpiCard` knows nothing about finance or the specific data it displays.
3. **Feature files never declare hex colours or raw pixel values for theme-able things.** They import tokens. This is the rule that lets a 10-minute retheming touch 5 files instead of 500.
4. **shared.jsx is the single source for cross-cutting concerns** — tokens, icons, formatters, the feature manifest. Don't create new utility files; add to shared.jsx.

**Adding a new feature:**
1. Create `tools/MyTool.jsx`, import `ToolShell` + primitives
2. Define state, calculations in `useMemo`, return JSX wrapped in `<ToolShell title=… actions=…>`
3. Add a case to routing in App.jsx
4. Add an entry to the manifest in shared.jsx

**State management.** Start with `useState` + `useMemo`. Add Zustand/Redux only when state needs to cross more than two component boundaries. Context is fine for theme; avoid it for business state.

---

## 11. Consistency is discipline

The architecture makes consistency possible. Discipline makes it real.

Things that rot a design system:
- Copy-pasting a component instead of extracting it
- Inline `style={{ color: '#3B5BDB' }}` inside a feature file
- "Just this once" exceptions that become permanent
- New features that bring their own font or colour

If a primitive doesn't fit the new need, extend the primitive or add a variant — don't work around it. The short-term cost of doing it right is always less than the long-term cost of the workaround.

---

## 12. What not to include in a design system

- Live component playground (Storybook) — overkill below ~50 components
- Per-component API documentation — read the code, it's small
- Animation libraries / elaborate motion design — 150ms ease transitions on hover/focus is enough
- Icon libraries as dependencies — use inline SVG for the 10–20 icons you actually need
- Utility CSS framework (Tailwind etc.) alongside custom tokens — pick one

Keep the system small enough that a new developer (or future-you) can read every file in an hour.

---

## 13. Red flags

If you see these in a codebase, the design system is eroding:

- More than 3 button styles across the app
- More than 2 card styles
- Hex colours hardcoded inside feature files
- Multiple components named `StyledButton`, `ButtonV2`, `NewButton`
- `!important` anywhere in CSS
- Inconsistent spacing (6px here, 8px there, 10px elsewhere — pick one)
- Section headers that mix UPPERCASE, Title Case, and sentence case within the same app
- Font weights 300, 400, 500, 600, 700 all in use — trim to two

When you see these, stop adding features and refactor. The cost compounds.

---

## 14. Starter checklist for a new project

1. Create a `shared.jsx` with the token object `T`, font stacks, formatter utilities, icon components, and a feature manifest.
2. Create `styles.css` with matching CSS custom properties (`--px-*` or similar prefix).
3. Build the 10 primitives (Input, Select, Segment, Section, Btn, InfoBox, Card, KpiCard, DataTable, StatRow).
4. Build the 3 shells (AppShell, Sidebar, ToolShell).
5. Build one feature to validate the patterns.
6. Ship. Add more features following the same pattern.

Don't design the whole system upfront. Start with the primitives above, and extend when a real feature needs something new.

---

## 15. Responsive patterns

Tool-style apps are desktop-first but must not be broken on mobile. The rules below keep responsive behavior predictable and centrally managed.

### Breakpoints

Three breakpoints cover almost everything:

| Breakpoint | Name | What changes |
|-----------|------|-------------|
| `900px` | tablet | Sidebar collapses to a slide-in drawer. Sticky right-side input panels move above content and lose sticky behavior. |
| `640px` | mobile | Two-column card grids stack. Grid rows with many cells reflow (see rank-row pattern). Top bar paddings shrink. KPI strips reduce column count. |
| `480px` | narrow mobile | Tab rows of 3+ wrap. Inline money inputs shrink. Optional — only where content genuinely fails below 480px. |

Pick a breakpoint by content needs, not device categories. If a grid is still readable at 500px, don't add a rule for it.

### Rule: responsive logic lives in CSS, not JS

Every responsive behavior — stacking, hiding, reflowing, column-count changes — is expressed as a CSS class with `@media` rules, not as inline style conditionals or JS media query hooks. The component attaches a class; the CSS decides what happens at which width.

```jsx
// Right
<div className="px-grid-2col">...</div>

// Wrong — conditionals in JS scatter the layout logic
const isMobile = useMediaQuery('(max-width: 640px)');
<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
```

Exception: genuinely dynamic interactive behavior (drawer open/close state, mobile menu toggle) uses React state. Layout reflow does not.

Benefits: one file owns all breakpoints. Changing `640px → 700px` is a CSS edit, not 40 JS edits. No hydration mismatches. No unnecessary re-renders on window resize.

### The reusable class set

Every tool-style app needs roughly these classes. Define once in `styles.css`, use everywhere:

- `px-grid-2col` — two-column card grid, stacks at 640px
- `px-grid-sidebar-right` — main content + 320px sticky panel, panel moves above at 900px
- `px-grid-2eq` — two equal columns, stack at 640px
- `px-kpi-strip-5`, `px-kpi-strip-4`, `px-kpi-auto` — KPI strips with sensible column-count drops
- `px-topbar`, `px-main` — page-level chrome with mobile paddings
- `px-engbar` (or similar named bar) — flex-wrap input bars
- `px-table-scroll` — horizontal scroll wrapper for wide tables, with `min-width` on the inner `<table>` to prevent crushing
- `px-tab-row` — action tab group with degradation below 480px

Tools don't invent their own grid templates inline. If a new layout need arises, add a new shared class.

### Pattern: wide tables scroll, never crush

Tables with 6+ columns should never compress. Wrap in a container with `overflow-x: auto` and set an explicit `min-width` on the `<table>` — usually 700–1000px depending on column count. This preserves column readability and makes horizontal scroll an obvious, expected behavior below the breakpoint.

```jsx
<div className="px-table-scroll">
  <table style={{ width: '100%', minWidth: 900 }}>
```

```css
.px-table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
```

### Pattern: complex input grid reflows on mobile

When a grid row has many cells (e.g. rank + 4 number inputs + delete button), don't stack everything into one narrow column — that makes a 6-row form into 42 tiny rows. Instead, reflow:

- The label / primary control spans the full first row
- The numeric inputs occupy a 4-column row below
- The remove / action button floats to the top-right of row 1

CSS-grid handles this with `grid-column` and `grid-row` overrides inside the media query. The number inputs remain in one horizontal line (easier to compare), while the select and delete button use the width they actually need.

### Pattern: sidebar becomes drawer

Below 900px, `position: fixed` + `transform: translateX(-100%)` hides the sidebar. An `.open` class removes the transform to slide it in. A separate `.px-sidebar-overlay` absorbs clicks outside the drawer and closes it. Component state manages `open`; CSS handles the animation.

The mobile top bar shows a hamburger button and the active tool name (so the user always knows where they are without opening the drawer).

### Pattern: sticky input panel un-stickies on mobile

When a tool puts inputs in a 320px sticky right-side panel (DCF, Lease, SaaS), below 900px the panel moves above the content (`order: -1`) and loses its sticky positioning. On narrow screens, users fill inputs then scroll to see results — the reversed flow is more natural than fighting for horizontal space.

### Never-do list

- Never use `position: fixed` for elements that would cover more than 30% of a mobile viewport width without a user-triggerable toggle.
- Never crush table columns to avoid horizontal scroll. Scroll is fine; crushed text is not.
- Never compute layout dimensions in JS from `window.innerWidth`. CSS media queries are cheaper, more reliable, and SSR-safe.
- Never add a media query for a breakpoint no content actually needs. Every breakpoint adds complexity and must earn its place.
- Never let responsive behavior ship unverified. Test at 375px (iPhone SE), 768px (iPad portrait), and desktop before shipping any layout change.
- **Never use bare `1fr` in `grid-template-columns`.** Always use `minmax(0, 1fr)`. Grid tracks default to `min-width: auto`, which means any intrinsically-wide descendant (a wide table, a min-width scroll container, a long unbroken string) can stretch the track past its container. This silently breaks `overflow-x: auto` on inner wrappers because the parent is already overflowing *upward*. `minmax(0, 1fr)` clamps the track at the container width regardless of content, letting inner scroll regions actually scroll. This bug is invisible until you test on mobile with real content.

### Minimal viewport checklist

Before shipping any new tool, verify at 375px:

1. No horizontal page scroll (only explicit scroll wrappers)
2. All interactive elements ≥ 36px tap height
3. No text smaller than 11px
4. Primary actions visible without horizontal scroll
5. Tables scroll cleanly with visible scroll affordance
6. Sidebar drawer opens / closes smoothly
7. No content cropped behind the mobile top bar
