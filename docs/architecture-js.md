# JavaScript Architecture

## Two Component Systems

This project has two JS component directories with different conventions. **New work goes in `assets/js/dev-projects/`** using ES6 modules.

## `assets/js/dev-projects/` — Active Development (ES6 Modules)

| File | Type | Purpose |
|------|------|---------|
| `nav-component.js` | ES6 module | Shared site nav — brand, dropdown links, mobile drawer. See `docs/architecture-nav.md` |
| `theme-toggle.js` | IIFE | Light/dark toggle button, injects into `#dp-nav-actions`, persists to `localStorage` |
| `snackbar.js` | ES6 module | Toast notification — `showSnackbar(message, duration)`. Auto-dismiss, `role="status"` |
| `resume-lightbox.js` | ES6 module | Full-size resume viewer — `initResumeLightbox()`. Focus trap, download menu, print mode |
| `resume-download.js` | ES6 module | Download widget dropdown — PDF link, copy-to-clipboard |
| `gallery.js` | ES6 module | Gallery page masonry grid — fetches `gallery.json`, renders items, integrates with effects.js scroll-reveal |
| `product-strip.js` | ES6 module | Featured project strips with orb backgrounds and action buttons |
| `project-card.js` | ES6 module | Glass-style project cards with image/iframe media |
| `projects-grid.js` | ES6 module | Fetches `projects.json`, renders cards via `project-card.js` |
| `strip-effects.js` | ES6 module | Cursor-reactive orb drift on `.dp-strip` elements |
| `effects.js` | IIFE | SVG noise overlay, cursor-tracking glow, scroll-reveal with IntersectionObserver |
| `back-to-top.js` | IIFE | Floating button, appears after scrolling 1vh, smooth-scroll to top |
| `magnetic-tilt.js` | IIFE | 3D tilt on hover for `.dp-magnetic-tilt` elements |
| `avatar-easter-egg.js` | IIFE | Physics-based avatar spin with confetti burst |
| `snake-game.js` | IIFE | Full-screen canvas snake game easter egg |
| `growth-chart.js` | IIFE | Chart.js line chart for Fair Share project |
| `utils.js` | ES6 module | `escapeHTML()` and `sanitizeUrl()` — ES6 version for module imports |

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
- IIFEs in this directory (theme-toggle, effects, back-to-top, etc.) self-initialise on DOMContentLoaded

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
