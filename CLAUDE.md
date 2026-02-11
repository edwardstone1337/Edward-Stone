# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static portfolio website for Edward Stone (UX Designer) with a custom component-based design system. The site uses vanilla JavaScript (no build process), custom CSS design tokens, and follows strict patterns for theming, analytics, and XSS protection.

**Hosted via GitHub Pages** at edwardstone.design (CNAME configured).

**IMPORTANT: No frameworks, build tools, or npm dependencies. This is a static site served from GitHub Pages — vanilla HTML/CSS/JS only.**

**Accessibility target: WCAG AAA** (skip links, aria-labels, prefers-reduced-motion, focus-visible rings, noscript fallbacks)

## Architecture

### Design System

- **Design tokens**: CSS custom properties in `assets/css/dev-tokens.css` (primary/evolved system) and `assets/css/tokens.css` (legacy subset being phased out)
- **Two design systems** (must not cross-contaminate):
  - `dev-tokens.css` + `dev-styles.css` (primary system with `dp-` prefix, used on index.html and project pages)
  - `tokens.css` + `style.css` (legacy subset, no `dp-` prefix)
  - **Critical**: `dp-` prefixed tokens belong to the dev system only — never mix systems
- **Theme support**: Light/dark themes via `data-theme` attribute on `<html>`
- **Load order matters**: Tokens must load before styles

### Component Architecture

Components are vanilla JS IIFE modules in `assets/js/components/`:
- Self-contained (manage own HTML structure and behavior)
- Configuration-driven (accept config objects)
- Auto-initialize or manual init via exported function
- **Critical dependency**: All components require `assets/js/utils.js` to load FIRST
- Follow the pattern in `docs/component-template.js`
- See `docs/component-methodology.md` for complete patterns and best practices

## Critical Patterns

### 1. Theme Initialization (Prevents Flash)

All public pages must use the canonical theme pre-init pattern to prevent flash of unstyled content:
- **Head**: Inline script sets `data-theme` attribute based on localStorage or `prefers-color-scheme`
- **Body end**: Double rAF removes `dp-no-transition` class after first paint

Pattern documented in `docs/theme-init-pattern.md`. Used by: `index.html`, `404.html`, project pages.

**Exception**: Preview iframes (`assets/previews/*`) receive theme via postMessage instead.

### 2. Google Analytics (Required on Public Pages)

**GA4 Measurement ID**: `G-6MPMYG36LE`

- Required on all public HTML pages (index, 404, projects/*, case-studies/*)
- NOT on internal pages (dev/*, assets/previews/*)
- Canonical snippet documented in `docs/analytics-tagging.md`
- **CI enforced**: `.github/workflows/ga-coverage.yml` runs `./scripts/check-ga-coverage.sh` on all PRs and pushes to main
- Check coverage locally: `./scripts/check-ga-coverage.sh`

### 3. XSS Protection (All Components)

All dynamic content must be sanitized before inserting into HTML:
- Use `Utils.escapeHTML()` for text content
- Use `Utils.sanitizeUrl()` for href/src attributes (strips `javascript:` URLs)
- Pattern: `escapeHTML(sanitizeUrl(url))` for links/images from config

Reviewed in `docs/code-review.md` - all components follow this pattern.

### 4. Script Load Order

**Critical**: The following load order must be maintained:

1. CSS design tokens (`dev-tokens.css` or `tokens.css`)
2. CSS styles (`dev-styles.css` or `style.css`)
3. `assets/js/utils.js` (provides `Utils.escapeHTML`, `Utils.sanitizeUrl`)
4. Component scripts (depend on `Utils`)

Components will throw errors if `Utils` is not available.

## Development Workflow

### No Build Process

This is a static site with no build step. Changes to HTML/CSS/JS are directly committed.

### Testing Locally

Open `index.html` directly in a browser, or use a local web server:
```sh
python3 -m http.server 5500
```

### Creating a New Component

Follow `docs/component-methodology.md` and `docs/component-template.js`. Ensure `utils.js` loads first, use `Utils.escapeHTML()`/`sanitizeUrl()` for all dynamic content.

### Creating a New Page

When adding a new HTML page:

1. **If public** (user-facing):
   - Add GA4 snippet in `<head>` (see `docs/analytics-tagging.md`)
   - Add theme pre-init script in `<head>` (see `docs/theme-init-pattern.md`)
   - Add theme transition removal at end of `<body>`
   - Verify with `./scripts/check-ga-coverage.sh`

2. **If internal/dev** (dev tools, iframes):
   - Omit GA snippet
   - May omit theme init if iframe (receives theme via postMessage)

## Common Commands

### Check GA Coverage (before pushing)
```sh
./scripts/check-ga-coverage.sh
```
Expected: `GA coverage check passed.`

CI runs on all PRs and pushes to main (GA coverage check).

## Documentation

Key documentation in `docs/`:
- **`component-methodology.md`**: Complete component architecture guide
- **`component-template.js`**: Template for new components
- **`analytics-tagging.md`**: GA4 canonical pattern and coverage rules
- **`theme-init-pattern.md`**: Theme initialization pattern
- **`code-review.md`**: Security review (XSS, architecture validation)
- **`strip-branding-spec.md`**: Spec for featured project strips

## Project-Specific Notes

### Changelog

All changes are tracked in `CHANGELOG.md` following Keep a Changelog format. Update when making significant changes.

### Case Studies vs Projects

- **`projects/`**: Full case study pages (fair-share.html, scp-reader.html)
- **`case-studies/`**: Additional case study content
- Both are linked from homepage via project cards/strips

### Dev Tools

- **`dev/design-system.html`**: Living design system reference (tokens, components, utilities)
- **`dev/component-preview.html`**: Component preview tool
- **`assets/previews/`**: Self-contained iframe preview widgets for specific projects

## Remember

- **Always** use `Utils.escapeHTML()` and `Utils.sanitizeUrl()` for dynamic content
- **Always** add GA4 to new public pages and verify with script
- **Always** use theme pre-init pattern on new public pages
- **Never** commit without testing GA coverage check passes
- **Never** introduce frameworks, build tools, or npm dependencies
- **Never** mix `dp-` prefixed tokens with legacy token system
- **Load order**: tokens → styles → utils.js → components
