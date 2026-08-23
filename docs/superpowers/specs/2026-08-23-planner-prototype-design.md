# Planner Prototype — Repo Mapping Design

Date: 2026-08-23
Spec source: "The Class Planner" handover brief (Claude artifact `2f067d7f-4717-4e8c-b081-bab62c0e4c36`) — the brief is the product spec; this doc only maps it onto this repo's rules.

## Decisions (approved by Edward)

1. **Tech**: Vanilla ES6 modules — no React/@dnd-kit (repo rule: no frameworks/npm). The brief's §5 dnd-kit settings are treated as a *behavioral* spec and reimplemented with Pointer Events. Built as a reusable "prototype kit" so future case-study prototypes can reuse board/card/row/drawer.
2. **Embed**: Inline compact mount into `case-studies/planner.html` using a compact token variant (~200–220px columns). Never `transform: scale()` (brief §9 gotcha). Full-size page: `projects/planner.html` (already scaffolded, prod-gated).
3. **Palette**: Inquisitive palette from the brief (accent `#5646ad`, paper/ink neutrals, five subject tints) as values in `assets/css/project-planner.css` scoped to `[data-project="planner"]`, feeding a widget token sheet.
4. **Milestones**: M1 board (All Terms Kanban: fixture, drag between/within terms, kebab remove, empty states, reset) → M2 Add Units drawer → M3 case-study compact embed. Term tabs deferred.

## File map

- `assets/js/dev-projects/planner/planner-data.js` — fixture + drawer catalogue (brief §7)
- `assets/js/dev-projects/planner/planner-state.js` — store: `move(id, term, index)` (idempotent), `remove(id)`, `add(unit, term)`, `reset()`, subscribe. Session-only; no localStorage.
- `assets/js/dev-projects/planner/board.js` — generic kanban renderer (columns + cards + move callback), decoupled from planner semantics (brief §9)
- `assets/js/dev-projects/planner/drag.js` — pointer + keyboard drag core (behavioral spec below)
- `assets/js/dev-projects/planner/planner.js` — `initPlanner(root, { compact })` composition
- `assets/css/project-planner.css` — widget token sheet (`--pl-*`) + widget structure, all scoped under `[data-project="planner"]`; `.pl-planner--compact` size-token overrides
- Escape any dynamic strings via `assets/js/dev-projects/utils.js` even though fixture data is static (repo XSS rule).

## Drag behavioral spec (from brief §5, reimplemented)

- Whole card is the drag target; no handle. 8px pointer activation distance (below = click).
- Cross-column moves commit live during drag-over; within-column reorders commit on drop.
- Drag preview: cloned card follows pointer; source card at `opacity: 0.4`; `cursor: grab/grabbing`; `touch-action: none` on draggables.
- Empty columns are valid drop targets (≥44px zone).
- Keyboard: card focusable, visible ring, accessible name "Move {title}"; Enter/Space pick up, arrows move, Enter/Space drop, Escape cancels; `aria-live` announcements.
- `prefers-reduced-motion` disables drop/enter animations and progress transitions.

## Token strategy

Widget consumes only `--pl-*` semantic tokens (surface, ground, border, 3 text tones, accent, success, radius, subject tint bg+ink ×5, size tokens). Values live in `project-planner.css` under `[data-theme]`-independent `[data-project="planner"]` scope (page is light-locked like other public pages). A future prototype re-skins by supplying its own `--pl-*` values in its own project file — components never fork.

## Revisions (Edward's review rounds)

- Product UI lives inside a simulated 1440×1024 product window (`.pl-frame`): titlebar, white product surface (was paper off-white), drawer opens *within* the frame (non-modal dialog, in-frame scrim, inert background, manual focus trap). Edward wants the window reusable for other embedded prototypes later — keep frame CSS/JS separable; extract when a second consumer exists.
- Demo chrome (Filled/Empty scenario toggle + Reset) sits on the portfolio page above the window, dp-styled. Reset is always enabled and re-seeds the selected scenario.
- Brand accent is `#531DAB` (supersedes the brief's `#5646ad`).
- Term tabs are IN scope: All Terms · Term 1–4, active tab in accent; term tabs show unit rows (brief §4) from shared live state; drawer adds target the active term tab (All Terms → fewest-units rule).
- Unit row redesign (Edward's reference mock, Jira-epic-like): grab pad → small rounded-square tinted thumbnail → unit name → subject/year stack → lessons/assessments count stack → segmented progress bar (one segment per lesson + distinct assessment segment, filled = done) → meatballs menu. No chevron (mock artifact from an abandoned expand pattern).
- Data: drawer catalogue is the single source of truth; units carry lessons[] and optional assessment with done flags; progress is derived completion (completed/total), not an abstract %. Units: 4-8 lessons, 0-1 assessments.
- Clicking a unit (row main area, card body, or menu "Open") opens a unit-detail drawer — same in-frame drawer shell as Add Units. Mental model: unit = epic, lessons/assessments = stories.
- Round 8: the unit-detail template is extracted into a shared renderer (one template, state-aware in-planner vs not) consumed by both the standalone unit drawer and a new third step of the Add Units drawer — unit rows in the drawer's list step are clickable and drill into the detail (← back preserves subject/scroll). Copy stays in the "Add" family ("Add to planner" / "Added to planner", bookmark fill-toggle).
- Round 6: rows lose their shadow (border-only, per the real system). Row grid spacing evens out (no dead gap between progress bar and card edge). Recommendations differ per term, live in a bordered section pinned to the bottom of the term panel (divider removed), and get a hide/show link whose preference applies across all term tabs (in-memory). All units stay within Years 3-4. The term empty state gains the design system's zero-state illustration. "Remove unit" menu items get the system's red danger hover. Unit drawer: title moves out of the header into a body section (name + subject/year beneath; tint hero removed) and becomes state-dependent — in-planner: toggle lesson/assessment completion, Download (demo toast), Remove from planner; not-in-planner: Save to planner. Bookmark icon = unfilled when saveable, filled when in planner.

## Out of scope (per brief / decisions)

Print button, per-column counts, unit thumbnails on cards, region/framework drawer steps, persistence, real curriculum data.
