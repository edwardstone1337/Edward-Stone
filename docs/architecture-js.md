# JavaScript Architecture

## Two Component Systems

This project has two JS component directories with different conventions. **New work goes in `assets/js/dev-projects/`** — mostly ES6 modules, with a handful of self-initialising IIFEs (29 files).

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
| `cursor-chat.js` | ES6 module | Desktop-only speech-bubble that follows the cursor, triggered by hover or scroll position (`initCursorChat(config)` with a `triggers` array). Header comment states it bails on prod and on touch/keyboard devices, but the file itself has **no `is-prod` gate** — it is intentionally live on production. Loaded on `index.html` (dynamic `import()`) and `resume.html` (static `import`). `index.html`'s init callback also holds the codebase's first `window.addEventListener('message', ...)` receiver: it validates `event.origin` and `event.data.type === 'kaomoji-copy'`, then swaps the Kaomoji hover trigger's `message` string (held by reference, read by the hover handler at fire time, not at init) from "Try clicking one" to "Great choice" — sent once by the Kaomoji preview iframe after a successful clipboard copy |
| `page-counter.js` | ES6 module | Mechanical odometer footer visit counter (`initPageCounter()`), inserted into `.dp-footer-inner`. **Calls a live Supabase RPC (`POST {SUPABASE_URL}/rest/v1/rpc/increment_visit`) unconditionally on every init — this increments the real production visit count as a side effect, not just reads it.** Animates the digits in on scroll via a one-shot `IntersectionObserver`; skips animation and applies the fetched count instantly when `prefers-reduced-motion` is set. Loaded on `about.html`, `index.html`, `resume.html`, `gallery.html`, `projects/scp-reader.html`, `projects/prang-out.html`, and all 4 `case-studies/*.html` pages |
| `effects.js` | IIFE | SVG noise overlay, cursor-tracking glow, scroll-reveal with IntersectionObserver |
| `back-to-top.js` | IIFE | Floating button, appears after scrolling 1vh, smooth-scroll to top. Used on index, resume, gallery, project pages, and all case study pages (`planner`, `design-systems`, `product-discovery`). Case studies use manifest comment `CASE-STUDY-SCRIPTS: effects.js, back-to-top.js, module(nav-component, banner-ticker)`. |
| `avatar-easter-egg.js` | IIFE | Physics-based avatar spin with confetti burst |
| `snake-game.js` | IIFE | Full-screen canvas snake game easter egg. No `<script>` tag or `import` references it anywhere — `nav-component.js` loads it dynamically via `new URL('snake-game.js', import.meta.url)` injected as a `<script>` element, so every page with the nav gets it without its own tag. Not orphaned |
| `growth-chart.js` | IIFE | **Orphaned — no loader found.** Superseded by `growth-chart-light.js`; `case-studies/fair-share.html` (the only page with a growth chart) loads `growth-chart-light.js` via `<script src="...">`, not this file. Note the page's `CASE-STUDY-SCRIPTS` manifest comment still says `growth-chart` (stale) rather than `growth-chart-light` |
| `growth-chart-light.js` | IIFE | Chart.js line chart for Fair Share project page — light theme only, reads colours from CSS vars; used on `case-studies/fair-share.html` |
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
