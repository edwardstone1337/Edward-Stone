# Edward Stone — Portfolio Site

## Overview

Static HTML/CSS/JS portfolio for Edward Stone (UX Designer). No frameworks, build tools, or npm. Vanilla code served via GitHub Pages at `edwardstone.design`. Accessibility target: **WCAG AAA**.

## Page Inventory

Public pages are the HTML files at the repo root, `projects/`, and `case-studies/`. Which CSS system a page uses is in its own `<link>` tags.

**Not public** — the part you can't infer from the tree:
- `dev/*` — design system reference, legacy component preview, archived homepage
- `assets/previews/*` — iframe preview widgets
- `projects/prang-out.html` — redirects to `/404.html` on prod via an inline gate
- `about.html` — live and indexable, but deliberately **not** linked from the prod nav
- On `index.html`, several strips/toolbox/testimonials carry `data-prod-hide` and are hidden on prod by the `env.js` feature gate

**CSS systems**: "dev" = `dev-tokens.css` + `dev-styles.css` (`dp-` prefix, primary). "legacy" = `tokens.css` + `style.css` (no prefix, being phased out). Never mix them.

## Architecture

### Design Systems

Two CSS systems that must not cross-contaminate. The **dev system** (`assets/css/dev-tokens.css` + `assets/css/dev-styles.css`) uses `dp-` prefixed tokens — used on all public pages and `dev/design-system.html`. The **legacy system** (`assets/css/tokens.css` + `assets/css/style.css`) is only used by `dev/old-index.html` and `dev/component-preview.html`. Token architecture: `docs/architecture-tokens.md`.

### JavaScript

Two JS directories with different patterns:
- **`assets/js/dev-projects/`** — ES6 modules (`export function`). Active development. New work goes here.
- **`assets/js/components/`** — legacy IIFEs. All require global `Utils` from `assets/js/utils.js` loaded first.

ES6 modules import sanitisation from `assets/js/dev-projects/utils.js` when needed. Full inventory: `docs/architecture-js.md`.

### Navigation

Shared nav component (`assets/js/dev-projects/nav-component.js`) injected via `<div id="nav-container">`. Details: `docs/architecture-nav.md`.

### Theming

Light theme tokens live exclusively in `dev-tokens.css` under `[data-theme="light"]` — single source of truth.

**Public pages** set `data-theme="light"` with a one-line inline script in `<head>` and do not load the theme toggle. Case studies (and similar) also load `case-study-theme.css` for component overrides (prose, pullquote, hero line); light tokens still resolve from `dev-tokens.css`.

**`dev/design-system.html`** uses the full pre-init pattern: `localStorage('dp-theme')` → `prefers-color-scheme` fallback, `dp-no-transition` on `<html>`, double-`requestAnimationFrame` at end of `<body>` to re-enable transitions. Pattern reference: `docs/theme-init-pattern.md`.

**Theme toggle** (`assets/js/dev-projects/theme-toggle.js`) is **dev-only** — loaded on `dev/design-system.html`. Injects sun/moon into `#dp-nav-actions`, persists to `localStorage`.

**Strips** (`.dp-strip`) default to dark via `color-scheme: dark` regardless of page theme. **Exception:** `.dp-strip--kaomoji` opts back to `color-scheme: light` and carries kaomoji.click's light palette, so the section and its embedded preview read as one product surface. Any other strip going light needs the same opt-out plus light values for every `--dp-strip-*` token it maps. `theme-toggle.js` broadcasts `{ type: 'theme-change' }` to preview iframes via `postMessage`, but no preview iframe has ever listened for it — a broadcast with no consumer. The one exception is unrelated to theming: the Kaomoji preview posts `{ type: 'kaomoji-copy' }` (no display text) to its parent after a successful clipboard copy; `index.html` validates `event.origin` before swapping its own cursor-chat wording — the iframe never supplies the text that gets rendered.

## Key Patterns

### GA4 Analytics

**Measurement ID: `G-6MPMYG36LE`** — required on all public pages. Not on `dev/*` or `assets/previews/*`. Check coverage: `./scripts/check-ga-coverage.sh`. CI enforced via `.github/workflows/ga-coverage.yml`. Canonical snippet: `docs/analytics-tagging.md`.

### XSS Protection

All dynamic content must be sanitised. Legacy IIFE components use global `Utils.escapeHTML()` / `Utils.sanitizeUrl()`. ES6 modules import from `assets/js/dev-projects/utils.js`. Review: `docs/code-review.md`.

### Accessibility

WCAG AAA target. Skip links, `aria-labels`, `prefers-reduced-motion` respected in all animations, `focus-visible` rings on interactive elements, `noscript` fallbacks, `aria-current="page"` on nav links. All overlays (drawer, lightbox) implement focus trapping.

## Development

No build tools. Test locally: `python3 -m http.server 5500`. Changes committed directly. Track changes in `CHANGELOG.md` (Keep a Changelog format).

Before pushing, run the three checks CI enforces (`.github/workflows/ga-coverage.yml`, "Site Checks"):

```
./scripts/check-ga-coverage.sh      # GA4 tag on every public page
./scripts/update-sitemap.sh --check # sitemap lastmod + URL health
./scripts/check-token-hygiene.sh    # tokens defined outside dev-tokens.css
```

For adding a new page, follow: `docs/new-page-checklist.md`.

## Reference Docs

- `docs/architecture-js.md` — JS file inventory, IIFE vs ES6 conventions, load order
- `docs/architecture-nav.md` — Nav component, drawer, dropdown, focus management
- `docs/architecture-tokens.md` — Token layers, glass/nav/paper/strip tokens, shared CSS classes
- `docs/new-page-checklist.md` — Step-by-step for adding a new public page
- `docs/analytics-tagging.md` — GA4 canonical snippet and coverage rules
- `docs/theme-init-pattern.md` — Theme pre-init script pattern
- `docs/code-review.md` — Security review (XSS, architecture validation)
- `docs/strip-branding-spec.md` — Product strip token contract
- `docs/gallery-workflow.md` — Adding images to gallery (script usage, metadata format)
- `docs/release-playbook.md` — Pre-release checklist
- `docs/resume-docx.md` — Word resume companion: how files/Edward Stone Resume.docx is generated, when to regenerate

## Rules

- No frameworks, no build tools, no npm
- `dp-` prefix tokens belong to dev system only — never use in legacy pages
- Sanitise all dynamic content (`escapeHTML` + `sanitizeUrl`)
- Tokens carrying **values** live in `dev-tokens.css` (light overrides under `[data-theme="light"]`, print under `@media print`, everything else in `:root`) or in a per-project theme file (`assets/css/project-*.css`, scoped to `[data-project="…"]`). `dev-styles.css` is the shared component layer and must **never** carry a raw value: it may define scoped tokens, but only ones that reference existing tokens. `.dp-counter` and `.dp-strip--scp` are the reference examples. Enforced by `./scripts/check-token-hygiene.sh`. Case studies stay permanently light
- Before writing new CSS, check the Shared CSS Components table in `docs/architecture-tokens.md` and grep `dev-styles.css` for an existing class — extend it instead of adding a duplicate
- No new raw hex or `rgba()` literals as CSS *values* — use an existing `--dp-*` token or add one to `dev-tokens.css`. Fallbacks inside `var()` and mask/gradient mechanics are fine
- Prefer a modifier class over an inline `style=` attribute; one-off styling belongs in `dev-styles.css` as a class
- Theme toggle is dev-only (`dev/design-system.html`); public pages default dark
- A new shared `.dp-*` component that qualifies for the Shared CSS Components table also gets a `dev/design-system.html` Organisms entry in the same change — see `docs/architecture-tokens.md`
- Run all three check scripts before pushing (see Development above)
- Accessibility is not optional — WCAG AAA target
