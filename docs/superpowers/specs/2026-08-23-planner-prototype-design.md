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

## Out of scope (per brief / decisions)

Print button, per-column counts, unit thumbnails on cards, region/framework drawer steps, term tabs (deferred), persistence, real curriculum data.
