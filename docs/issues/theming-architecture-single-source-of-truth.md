# Theming architecture — single source of truth and dev toggle

**Type:** improvement  
**Priority:** normal  
**Effort:** large  

---

## TL;DR

Reconcile the archived light theme with `case-study-theme.css`, decide on a single source of truth for light token overrides, rebuild the theme toggle, and restore it on dev (e.g. design-system.html) as a testing tool. By then we’ll have three light-themed pages (two case studies + Prang Out) giving real data on what the light theme actually needs.

---

## Current state

- **Light theme lives in two places:** `assets/css/_archive/dev-tokens-with-light-theme.css` and `assets/css/_archive/light-theme-tokens-reference.css` contain full `[data-theme="light"]` blocks; `assets/css/case-study-theme.css` holds the *active* light overrides used by case study pages (planner, product-discovery, design-systems). No single source of truth.
- **Case study pages** set `data-theme="light"` inline in `<head>` and load `case-study-theme.css` after dev-tokens + dev-styles. Light tokens are maintained only in case-study-theme.css; archived files are stale reference.
- **Theme toggle removed.** Site is dark-only; `theme-init-pattern.md` documents a single inline `setAttribute('data-theme', 'dark')` in `<head>`. Docs (architecture-js, architecture-nav, new-page-checklist) still reference `theme-toggle.js`, which no longer exists. No way to flip to light on dev for testing.
- **Nav/dropdown/drawer** on light pages have known gaps (see `docs/issues/nav-light-theme-blast-radius.md`); some fixes may land before this ticket, but the overall light palette and token set should be defined in one place.

---

## Expected outcome

- **Single source of truth** for light theme: either (a) one `[data-theme="light"]` block in `dev-tokens.css` and case-study-theme.css only adds case-study-specific overrides, or (b) one dedicated light-theme file (e.g. `light-theme.css`) loaded after dev-tokens and used by all light pages. No duplication between archive and live.
- **Archived light theme reconciled:** Decide what to keep from `_archive/dev-tokens-with-light-theme.css` and `_archive/light-theme-tokens-reference.css` (e.g. merge into the chosen source of truth, or delete and rely on case-study-theme as the canonical light set).
- **Theme toggle rebuilt and restored on dev:** A script (e.g. `theme-toggle.js` in `assets/js/dev-projects/`) that sets `data-theme` on `<html>`, injects a control into `#dp-nav-actions`, and optionally persists choice (e.g. localStorage). Loaded only on dev pages (e.g. `dev/design-system.html`) so public pages stay dark-only. Enables testing light theme and nav/dropdown/drawer without deploying a case study.
- **Docs updated:** theme-init-pattern.md, architecture-js.md, architecture-nav.md, new-page-checklist.md, and CLAUDE.md reflect the chosen architecture and where the toggle lives (dev-only).

---

## Relevant files

- `assets/css/dev-tokens.css` — if light block moves here, add `[data-theme="light"]` with canonical token set.
- `assets/css/case-study-theme.css` — either reduced to case-study-only overrides or replaced as the single light-theme file; ensure nav/dropdown/drawer tokens are covered (see nav-light-theme-blast-radius.md).
- `assets/css/_archive/dev-tokens-with-light-theme.css`, `assets/css/_archive/light-theme-tokens-reference.css` — reconcile then archive or remove.
- `assets/js/dev-projects/theme-toggle.js` — recreate (or add new script) for dev-only toggle; inject into `#dp-nav-actions`, set `data-theme`, optional localStorage.
- `dev/design-system.html` — load theme-toggle script and ensure light theme applies when toggled (design system as testing surface).
- `docs/theme-init-pattern.md`, `docs/architecture-js.md`, `docs/architecture-nav.md`, `docs/new-page-checklist.md`, `CLAUDE.md` — update for single source of truth and dev-only toggle.

---

## Notes / risks

- **Prang Out:** Third light page (Prang Out) may not exist yet; this ticket can proceed once the source of truth is decided and the dev toggle is in place. The “three light-themed pages” provide real usage to validate token coverage.
- **Scope creep:** Keep this ticket to architecture + dev toggle. Component-level light fixes (e.g. dropdown hardcoded values) can be done in separate tickets; this one ensures whatever fixes land use the same token source.
- **Preview iframes:** If theme toggle is restored, consider whether it should broadcast theme to `.dp-card-media-iframe` (and strip iframes) so preview widgets stay in sync when testing on dev.
