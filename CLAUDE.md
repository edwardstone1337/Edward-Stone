# Edward Stone — Portfolio Site

## Overview

Static HTML/CSS/JS portfolio for Edward Stone (UX Designer). No frameworks, build tools, or npm. Vanilla code served via GitHub Pages at `edwardstone.design`. Accessibility target: **WCAG AAA**.

## Page Inventory

| Path | Purpose | Public | CSS System |
|------|---------|:------:|------------|
| `index.html` | Homepage — split hero + case-study card, image ticker (`.dp-ticker`), project strips, side quests, skills, contact (several strips/toolbox/testimonials behind `PROD-HIDE` on main) | Yes | dev |
| `resume.html` | Resume with lightbox viewer and download widget | Yes | dev |
| `gallery.html` | Design gallery — masonry grid of UI/branding/illustration work | Yes | dev + `gallery.css` |
| `404.html` | Custom error page | Yes | dev |
| `projects/fair-share.html` | Fair Share case study | Yes | dev + `case-study-theme.css` |
| `projects/scp-reader.html` | SCP Reader case study | Yes | dev + `project-scp-reader.css` |
| `case-studies/design-systems.html` | Design Systems case study | Yes | dev + `case-study-theme.css` |
| `case-studies/planner.html` | Planner case study | Yes | dev + `case-study-theme.css` |
| `case-studies/product-discovery.html` | Product Discovery case study | Yes | dev + `case-study-theme.css` |
| `dev/design-system.html` | Living design system reference | No | dev |
| `dev/component-preview.html` | Component preview tool (legacy) | No | legacy |
| `dev/old-index.html` | Archived old homepage | No | legacy |
| `assets/previews/*/index.html` | 4 iframe preview widgets | No | inline |

**CSS systems**: "dev" = `dev-tokens.css` + `dev-styles.css` (`dp-` prefix, primary). "legacy" = `tokens.css` + `style.css` (no prefix, being phased out). Never mix them.

## Architecture

### Design Systems

Two CSS systems that must not cross-contaminate. The **dev system** (`assets/css/dev-tokens.css` + `assets/css/dev-styles.css`) uses `dp-` prefixed tokens — used on all public pages and `dev/design-system.html`. The **legacy system** (`assets/css/tokens.css` + `assets/css/style.css`) is only used by `dev/old-index.html` and `dev/component-preview.html`. Token architecture: `docs/architecture-tokens.md`.

### JavaScript

Two JS directories with different patterns:
- **`assets/js/dev-projects/`** — 18 files, mostly ES6 modules (`export function`). Active development. New work goes here.
- **`assets/js/components/`** — 8 legacy IIFEs. All require global `Utils` from `assets/js/utils.js` loaded first.

ES6 modules import sanitisation from `assets/js/dev-projects/utils.js` when needed. Full inventory: `docs/architecture-js.md`.

### Navigation

Shared nav component (`assets/js/dev-projects/nav-component.js`) injected via `<div id="nav-container">`. Desktop: brand left, dropdown links centre. Mobile (≤768px): hamburger opens right-side drawer with focus trap and scroll lock. Details: `docs/architecture-nav.md`.

### Theming

Light theme tokens live exclusively in `dev-tokens.css` under `[data-theme="light"]` — single source of truth.

**Public pages today:** `index.html`, `resume.html`, `gallery.html`, `404.html`, `projects/*.html`, and `case-studies/*.html` set `data-theme="light"` with a one-line inline script in `<head>`. They do not load the theme toggle. Case studies (and similar) also load `case-study-theme.css` for component overrides (prose, pullquote, hero line); light tokens still resolve from `dev-tokens.css`.

**`dev/design-system.html`** uses the full pre-init pattern: `localStorage('dp-theme')` → `prefers-color-scheme` fallback, `dp-no-transition` on `<html>`, double-`requestAnimationFrame` at end of `<body>` to re-enable transitions. Pattern reference: `docs/theme-init-pattern.md`.

**Theme toggle** (`assets/js/dev-projects/theme-toggle.js`) is **dev-only** — loaded on `dev/design-system.html`. Injects sun/moon into `#dp-nav-actions`, persists to `localStorage`.

**Strips** (`.dp-strip`) are always dark via `color-scheme: dark` regardless of page theme. Preview iframes receive theme via `postMessage`.

## Key Patterns

### GA4 Analytics

**Measurement ID: `G-6MPMYG36LE`** — required on all public pages (9/9 currently tagged). Not on `dev/*` or `assets/previews/*`. Check coverage: `./scripts/check-ga-coverage.sh`. CI enforced via `.github/workflows/ga-coverage.yml`. Canonical snippet: `docs/analytics-tagging.md`.

### XSS Protection

All dynamic content must be sanitised. Legacy IIFE components use global `Utils.escapeHTML()` / `Utils.sanitizeUrl()`. ES6 modules import from `assets/js/dev-projects/utils.js`. Review: `docs/code-review.md`.

### Accessibility

WCAG AAA target. Skip links, `aria-labels`, `prefers-reduced-motion` respected in all animations, `focus-visible` rings on interactive elements, `noscript` fallbacks, `aria-current="page"` on nav links. All overlays (drawer, lightbox) implement focus trapping.

## Development

No build tools. Test locally: `python3 -m http.server 5500`. Changes committed directly. Run `./scripts/check-ga-coverage.sh` before pushing. Track changes in `CHANGELOG.md` (Keep a Changelog format).

For adding a new page, follow: `docs/new-page-checklist.md`.

## Reference Docs

- `docs/architecture-js.md` — JS file inventory, IIFE vs ES6 conventions, load order
- `docs/architecture-nav.md` — Nav component, drawer, dropdown, focus management
- `docs/architecture-tokens.md` — Token layers, glass/nav/paper/strip tokens, shared CSS classes
- `docs/new-page-checklist.md` — Step-by-step for adding a new public page
- `docs/component-methodology.md` — Legacy IIFE component patterns and best practices
- `docs/component-template.js` — Template for new legacy IIFE components
- `docs/analytics-tagging.md` — GA4 canonical snippet and coverage rules
- `docs/theme-init-pattern.md` — Theme pre-init script pattern
- `docs/code-review.md` — Security review (XSS, architecture validation)
- `docs/strip-branding-spec.md` — Product strip token contract
- `docs/gallery-workflow.md` — Adding images to gallery (script usage, metadata format)
- `docs/release-playbook.md` — Pre-release checklist

## Rules

- No frameworks, no build tools, no npm
- `dp-` prefix tokens belong to dev system only — never use in legacy pages
- Sanitise all dynamic content (`escapeHTML` + `sanitizeUrl`)
- Light tokens: single source of truth in `dev-tokens.css [data-theme="light"]`; case studies stay permanently light
- Theme toggle is dev-only (`dev/design-system.html`); public pages default dark
- Run GA coverage check before pushing
- Accessibility is not optional — WCAG AAA target
