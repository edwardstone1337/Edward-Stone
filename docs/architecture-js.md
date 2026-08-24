# JavaScript Architecture

## Two Component Systems

This project has two JS component directories with different conventions. **New work goes in `assets/js/dev-projects/`** — mostly ES6 modules, with a handful of self-initialising IIFEs (30 files).

## `assets/js/dev-projects/` — Active Development (ES6 Modules)

| File | Type | Purpose |
|------|------|---------|
| `nav-component.js` | ES6 module | Shared site nav — brand, dropdown links, mobile drawer. See `docs/architecture-nav.md` |
| `banner-ticker.js` | ES6 module | Slim scrolling text bar above nav — `initBannerTicker({ text, separator })`. Used on index, resume, gallery, 404, project pages, case studies |
| `theme-toggle.js` | ES6 module | Light/dark toggle button — `initThemeToggle()`. Injects sun/moon into `#dp-nav-actions`, persists to `localStorage('dp-theme')`, broadcasts to iframes via `postMessage`. **Dev-only** — loaded on `dev/design-system.html`, not on public pages |
| `snackbar.js` | ES6 module | Toast notification — `showSnackbar(message, duration)`. Auto-dismiss, `role="status"` |
| `resume-lightbox.js` | ES6 module | Full-size resume viewer — `initResumeLightbox()`. Focus trap, download menu. `printResume()` is a plain `window.print()` — the static `.dp-resume-section` markup in `resume.html` is what prints, styled by the `@media print` rules in `dev-styles.css`; no DOM clone is built (works even if this module never loads) |
| `resume-download.js` | ES6 module | Download widget dropdown — PDF link, copy-to-clipboard |
| `gallery.js` | ES6 module | Gallery page masonry grid — fetches `gallery.json`, renders items, integrates with effects.js scroll-reveal |
| `about-lightbox.js` | ES6 module | **Orphaned — no loader found.** Original about-page lightbox (`initAboutLightbox()`); its own header comment says it is superseded by the parameterised `image-lightbox.js`. `about.html` now loads `image-lightbox.js` instead. Only remaining trace is `dev/design-system.html`, which statically transcribes the `.dp-about-lightbox__*` markup/CSS for reference — it does not import this file. Do not build on it. |
| `image-lightbox.js` | ES6 module | Parameterised lightbox — header comment describes it as a "refactor of about-lightbox.js", pointed at any item set via `config.selector` + extractor functions (`getImageSrc`/`getDescription`/etc.), with a `dedupe` option for ticker-style duplicated DOM. `initImageLightbox(config)` / `destroyImageLightbox()`. Reuses `.dp-lightbox`/`.dp-about-lightbox` CSS classes. Imports `escapeHTML` from `./utils.js` and applies it to interpolated `src`/`alt`/description text. Loaded on `about.html`, `gallery.html`, `index.html` |
| `image-ticker.js` | ES6 module | Replaces the homepage image ticker's CSS `@keyframes` with a `requestAnimationFrame` loop (`initImageTicker()` / `destroyImageTicker()`) so left/right rows can scroll at independently derived speeds. Reads base speed from the `--dp-ticker-speed` custom property via `getComputedStyle(ticker).getPropertyValue(...)` at init time — not a plain CSS `var()` reference. Never starts the rAF loop when `prefers-reduced-motion` is set, and listens for live changes to that media query. Loaded on `index.html` only |
| `product-strip.js` | ES6 module | Featured project strips with orb backgrounds and action buttons |
| `project-card.js` | ES6 module | Glass-style project cards with image/iframe media |
| `projects-grid.js` | ES6 module | Fetches `projects.json`, renders cards via `project-card.js` |
| `strip-effects.js` | ES6 module | Cursor-reactive orb drift on `.dp-strip` elements |
| `bears-creator.js` | ES6 module | Renderer-only engine for the "Build my bear" character creator — composites SVG parts into a live canvas via `initBearsCreator(selector)`, plus `setPart()`/`setColor()`/`getColors()`/`getCurrentParts()`/`getManifest()`/`exportBearPNG()`. Fetches `assets/images/bears/bears-manifest.json`. No UI controls of its own. Imported by `bears-modal.js` |
| `bears-controls.js` | ES6 module | Builds the bear creator's UI controls — prev/next stepper rows per part category, colour swatches, randomise button — wired to the `bears-creator.js` API object passed into `initBearsControls(selector, creatorAPI)`. Imported by `bears-modal.js` only |
| `bears-modal.js` | ES6 module | Opens the bear creator in a lightbox modal (`initBearsModal()`), following the `dp-lightbox` pattern (dialog role, scroll lock, focus trap, Escape-to-close, focus restore). Imports `bears-creator.js` and `bears-controls.js`. Loaded on `index.html` (triggered by `#bears-modal-trigger`) |
| `case-study-data.js` | ES6 module | Data-only module — exports a `CASE_STUDIES` array (text + href for each of the 4 case studies). No exported functions. Imported by `case-study-read-more.js` and `nav-component.js` |
| `case-study-read-more.js` | ES6 module | Builds the "Read another case study" section (`initReadMore()`) into `#read-more-container`, filtering the current page out of `CASE_STUDIES` (from `case-study-data.js`) by pathname. Loaded on `projects/prang-out.html` and all 4 `case-studies/*.html` pages. `dev/design-system.html` transcribes its output statically for reference rather than importing it |
| `contact-cta.js` | ES6 module | Builds the "Let's talk" contact section (`initContactCta()`) into `#contact-cta-container` — email + LinkedIn buttons. Loaded on `resume.html`, `projects/prang-out.html`, and all 4 `case-studies/*.html` pages. `index.html` has equivalent markup hardcoded inline (same classes/copy) rather than importing this module — no loader found there |
| `cursor-chat.js` | ES6 module | Desktop-only speech-bubble that follows the cursor, triggered by hover or scroll position (`initCursorChat(config)` with a `triggers` array). Header comment states it bails on prod and on touch/keyboard devices, but the file itself has **no `is-prod` gate** — it is intentionally live on production. Loaded on `index.html` (dynamic `import()`, ten triggers including the Kaomoji strip's), `personal.html` (dynamic `import()`, one trigger — the Kaomoji strip's), and `resume.html` (static `import`). Reads `trigger.message` at hover-fire time rather than at init, which is what lets `kaomoji-strip.js` (below) swap a trigger's message after the fact just by mutating the object it handed back |
| `kaomoji-strip.js` | ES6 module | Owns the kaomoji.click product strip's markup **and** behaviour in one place — `initKaomojiStrip(mountSelector)` finds the placeholder element, replaces it (not fills it, so no wrapper `<div>` enters the layout) with the rendered `<section class="dp-strip dp-strip--flipped dp-strip--kaomoji">`, and wires the strip's own behaviour: the codebase's first `window.addEventListener('message', ...)` receiver, validating `event.origin` and `event.data.type === 'kaomoji-copy'` before swapping the returned `cursorTrigger.message` (held by reference) from "Try clicking one" to "Great choice"; and a `mouseenter`/`mouseleave` bridge on the preview `<iframe>` that fakes section-level `mouseleave`/`mouseenter`, since pointer events inside the iframe never reach the parent document and would otherwise leave the cursor-chat bubble hanging at the iframe boundary. Returns `{ section, cursorTrigger }`, or `null` if the mount selector matches nothing. Deliberately does not call `initCursorChat` itself — the caller composes `cursorTrigger` into its own `initCursorChat()` call, and must mount the strip *before* that call, since `cursor-chat.js` resolves trigger selectors once at init and silently skips ones matching nothing. Styles: `.dp-strip`/`.dp-strip--kaomoji` in `dev-styles.css`, tokens in `dev-tokens.css`; also needs `cursor-chat.css` loaded on the page for the bubble. Loaded on `index.html` and `personal.html`. Full API and the ordering requirement: `docs/strip-branding-spec.md` §7 |
| `page-counter.js` | ES6 module | Mechanical odometer footer visit counter (`initPageCounter()`), inserted into `.dp-footer-inner`. **Calls a live Supabase RPC (`POST {SUPABASE_URL}/rest/v1/rpc/increment_visit`) unconditionally on every init — this increments the real production visit count as a side effect, not just reads it.** Animates the digits in on scroll via a one-shot `IntersectionObserver`; skips animation and applies the fetched count instantly when `prefers-reduced-motion` is set. Loaded on `about.html`, `index.html`, `resume.html`, `gallery.html`, `projects/scp-reader.html`, `projects/prang-out.html`, and all 4 `case-studies/*.html` pages |
| `effects.js` | IIFE | SVG noise overlay, cursor-tracking glow, scroll-reveal with IntersectionObserver |
| `back-to-top.js` | IIFE | Floating button, appears after scrolling 1vh, smooth-scroll to top. Used on index, resume, gallery, project pages, and all case study pages (`planner`, `design-systems`, `product-discovery`). Case studies use manifest comment `CASE-STUDY-SCRIPTS: effects.js, back-to-top.js, module(nav-component, banner-ticker)`. |
| `avatar-easter-egg.js` | IIFE | Physics-based avatar spin with confetti burst |
| `snake-game.js` | IIFE | Full-screen canvas snake game easter egg. No `<script>` tag or `import` references it anywhere — `nav-component.js` loads it dynamically via `new URL('snake-game.js', import.meta.url)` injected as a `<script>` element, so every page with the nav gets it without its own tag. Not orphaned |
| `growth-chart.js` | IIFE | **Orphaned — no loader found.** Superseded by `growth-chart-light.js`; `case-studies/fair-share.html` (the only page with a growth chart) loads `growth-chart-light.js` via `<script src="...">`, not this file. Note the page's `CASE-STUDY-SCRIPTS` manifest comment still says `growth-chart` (stale) rather than `growth-chart-light` |
| `growth-chart-light.js` | IIFE | Chart.js line chart for Fair Share project page — light theme only, reads colours from CSS vars; used on `case-studies/fair-share.html` |
| `utils.js` | ES6 module | `escapeHTML()` and `sanitizeUrl()` — ES6 version for module imports |

## `assets/js/dev-projects/planner/` — Planner Prototype (ES6 Modules)

A self-contained "prototype kit" (14 files) built for the Planner prototype — `projects/planner.html` (full page, still prod-gated) and the homepage's compact `.dp-case-promo__widget` embed (live on **all** environments, prod included, since the embed mounts this module directly rather than iframing the gated page) — but designed so a future case-study prototype can reuse the board/card/row/drawer machinery without forking it. Full design/decision log: `docs/superpowers/specs/2026-08-23-planner-prototype-design.md`.

| File | Type | Purpose |
|------|------|---------|
| `planner.js` | ES6 module | Entry point / composition root — `initPlanner(rootEl, { chrome = true })`. `{ chrome: false }` (used by the homepage embed) omits the demo-only Reset row entirely; `projects/planner.html` calls it with chrome on. Wires the store, board, term view, drag core, and both drawers together; owns delegated card/kebab click handling and per-term recommendation rotation |
| `planner-data.js` | ES6 module | The drawer catalogue (`drawerCatalogue` / `flatCatalogue`) is the single source of truth for unit content — lessons, assessment, subject, year. `boardSeed` is just `{ id, term }` placements referencing catalogue ids. Exports `findCatalogueUnit()`, `toggleLessonDone()` / `toggleAssessmentDone()` / `resetCatalogueCompletion()`, and `unitProgress(unit)` (derives `{ completed, total, fraction }` — progress is never stored as a number) |
| `planner-state.js` | ES6 module | Session-only placements store (no localStorage) — resolves each placement against the catalogue on every `getUnits()` call. Exports `move(id, term, index)` (idempotent), `remove(id)`, `add(unit, term)`, `reset()`, `toggleLesson()` / `toggleAssessment()`, `subscribe()` |
| `board.js` | ES6 module | Generic kanban renderer (`createBoard()`) — no planner semantics baked in (columns + items + a render-card callback + a move callback), reusable by any future board. Plays a FLIP settle (via `flip.js`) on every render for cards that moved position |
| `drag.js` | ES6 module | Pointer + keyboard drag core (`attachDragging()`), fully generic over "columns"/"cards". Reimplements a dnd-kit-style behavioural spec by hand (8px activation distance, live cross-column commit, on-drop within-column commit, keyboard pick-up/move/drop, `aria-live` announcements) since the repo has no frameworks/npm. **`beginDrag()` temporarily stamps `data-project="planner"` onto `<html>`** for the gesture's duration (restored in `cleanupPointerDrag()`, only if this gesture is the one that added it) — the floating drag clone and the `body.pl-board-dragging` cursor/selection guard are styled by `[data-project="planner"] …` selectors in `project-planner.css`, which only resolve when that attribute is an ancestor of `<body>`. `projects/planner.html` has the attribute permanently on `<html>`, but the homepage's compact embed scopes it to a nested mount div instead — without this hoist, those styles silently never applied there (this was a real shipped bug, see CHANGELOG) |
| `flip.js` | ES6 module | Board-agnostic FLIP animation helper (`captureRects` / `playFlip` / `playEnter` / `settleClone`) — used by `board.js` and `drag.js` so re-renders and drops settle instead of jumping. Fully disabled under `prefers-reduced-motion: reduce` |
| `card.js` | ES6 module | Kanban card renderer (`renderCard(unit)`) — fixed field order (meta line, title, progress bar, kebab), no image/counts/badges/dates. Interaction (kebab, body click, drag pick-up) is wired externally via delegated listeners in `planner.js` |
| `row.js` | ES6 module | Term-view unit row renderer (`renderRow(unit, options)`) — horizontal counterpart to `card.js`; the same function also renders the `variant: 'recommendation'` row (thumbnail/name/subject-year/progress, no grab pad or kebab, trailing Add button) used by the "Recommended this term" tray |
| `kebab.js` | ES6 module | Shared kebab/meatballs menu builder (`buildKebab(options)`) — one Open / — / Remove unit menu used by both `card.js` (vertical ⋮) and `row.js` (horizontal ⋯ via `orientation: 'horizontal'`); actual interaction wiring lives in `planner.js` |
| `drawer-shell.js` | ES6 module | Shared in-frame drawer shell (`createDrawerShell()`) — slide-from-right within `.pl-frame`, in-frame scrim, `inert` on the frame's other content, manual Tab focus trap, Escape/scrim-click close, focus return. Owns only the shell; `drawer.js` and `unit-drawer.js` each build their own header/body content on top of it |
| `drawer.js` | ES6 module | Add Units drawer (`createAddUnitsDrawer()`) — three steps: (1) subject list, (2) a subject's units grouped by year, each a two-target row (a drill-in hit button plus a separate Add shortcut button), (3) the shared unit-detail view (via `unit-detail.js`) reached by drilling into a step-2 row. Also exports `termWithFewestUnits()` and `tintClass()`, reused elsewhere |
| `unit-detail.js` | ES6 module | Shared unit-detail content renderer. `buildUnitDetail(unit, opts)` is the pure content builder (title block, state-aware actions row, progress summary, Lessons/Assessment sections); `createUnitDetailController(config)` is the stateful engine (tracks which unit is showing, derives in-planner state LIVE from the store on every render — never cached — and owns re-render-in-place + refocus after an Add/toggle/Remove). Consumed by both `unit-drawer.js` and `drawer.js`'s step 3 — one template, two hosts, never forked |
| `unit-drawer.js` | ES6 module | Standalone unit-detail drawer host (`createUnitDrawer()`) — a thin shell (header with only ✕, body container) around `createUnitDetailController()`. Opened from a term row, Kanban card, or recommendation row's main area |
| `term-view.js` | ES6 module | Single-term panel renderer (`createTermView()`) — a term tab is structurally a board with exactly one column, so it reuses `drag.js`'s column abstraction unmodified for vertical reorder-within-term. Renders the tab list, the active term's row list, and (when supplied) up to 3 "Recommended this term" rows pinned to the bottom of the panel with a Hide/Show toggle shared across every term tab for the session |

**Conventions**: ES6 modules throughout (`export function`), same as the rest of `dev-projects/`. All dynamic content renders via `textContent`/DOM APIs — the only `innerHTML` assignments are static, hand-authored icon markup with no interpolation, same pattern as elsewhere in the repo. State is module-singleton: the placements store (`planner-state.js`), the completion snapshot (`planner-data.js`), and the Hide/Show closure (`term-view.js`) all assume **one `initPlanner()` instance per page** — there's no per-instance isolation, so two mounts on the same page would share state. Session-only throughout: nothing persists to `localStorage`; `reset()` re-seeds from the fixture.

## `assets/js/components/` — Legacy IIFEs

All 8 files follow the same pattern: IIFE wrapper, config object input, global `Utils` dependency. They require `assets/js/utils.js` to be loaded first via `<script>` tag.

| File | Purpose |
|------|---------|
| `button.js` | Reusable button with primary/secondary/tertiary variants, icons, loading/disabled states |
| `case-study-card.js` | Case study preview card with title, description, image, metrics |
| `contact-section.js` | Contact info section — email, phone, LinkedIn, location |
| `project-card.js` | Individual project card for side-quests grid |
| `reading-section.js` | Book covers image section |
| `side-quests-section.js` | Side quests section wrapper |
| `skills-section.js` | Skills, tools, principles, personality display |
| `testimonials-section.js` | Testimonial quote cards with author photos |

## `assets/js/` — Root Level

| File | Type | Purpose |
|------|------|---------|
| `utils.js` | IIFE | Global `Utils.escapeHTML()` and `Utils.sanitizeUrl()` — required by legacy components |
| `analytics.js` | IIFE | GA4 event tracking — project clicks, snake game, resume downloads, theme toggles |

## `dev/` — Development Utilities

| File | Type | Purpose |
|------|------|---------|
| `contrast-audit-calc.js` | Node.js | WCAG contrast calculation (sRGB compositing, relative luminance) |
| `flip7-contrast.js` | Node.js | Flip 7 strip gradient contrast validation (LCh to sRGB to WCAG) |

## Conventions

### ES6 Modules (dev-projects)
- Use `export function` for public API
- Import with `<script type="module">` in HTML
- Import sanitisation from `./utils.js` when handling user-provided or config-driven content
- Modules are deferred by default — no load-order concerns with other modules
- IIFEs in this directory (effects, back-to-top, etc.) self-initialise on DOMContentLoaded

### Legacy IIFEs (components)
- Wrapped in `(function() { ... })();`
- Depend on global `Utils` object — `assets/js/utils.js` must load first
- Pattern: `const escapeHTML = Utils.escapeHTML;` at top of IIFE
- Config-driven: accept a config object, return rendered HTML string
- Template: `docs/component-template.js`

### Load Order (for pages using legacy components)

1. CSS tokens (`dev-tokens.css` or `tokens.css`)
2. CSS styles (`dev-styles.css` or `style.css`)
3. `assets/js/utils.js`
4. Legacy component scripts
5. ES6 module scripts (deferred, order doesn't matter)

### XSS Protection

Both systems provide `escapeHTML()` and `sanitizeUrl()`. Use `escapeHTML()` for text content. Use `sanitizeUrl()` for `href`/`src` attributes (strips `javascript:` URLs). Components that only render hardcoded strings (nav, snackbar) don't need sanitisation.
